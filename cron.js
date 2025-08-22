const dotenv = require('dotenv');
dotenv.config();

const mysql = require('mysql2/promise');
const fetch = require('node-fetch');

  const _DB = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  async function _query(conn, query, params = []) {
      const [rows] = await conn.execute(query, params);
      return rows;
  }
  
  async function _findOne(conn, table, where) {
      const keys = Object.keys(where);
      const conditions = keys.map(k => `${k} = ?`).join(" AND ");
      const sql = `SELECT * FROM ${table} WHERE ${conditions} LIMIT 1`;
      const [rows] = await conn.execute(sql, Object.values(where));
      return rows.length ? rows[0] : null;
  }
  
  async function _findMany(conn, table, where = {}) {
      let sql = `SELECT * FROM ${table}`;
      let values = [];
      if (Object.keys(where).length > 0) {
          const keys = Object.keys(where);
          const conditions = keys.map(k => `${k} = ?`).join(" AND ");
          sql += ` WHERE ${conditions}`;
          values = Object.values(where);
      }
      const [rows] = await conn.execute(sql, values);
      return rows;
  }
  
  async function _insertOne(conn, table, data) {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => "?").join(", ");
      const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
      const [result] = await conn.execute(sql, values);
      return { insertId: result.insertId };
  }
  
  async function _updateOne(conn, table, where, data) {
      const setKeys = Object.keys(data).map(k => `${k} = ?`).join(", ");
      const setValues = Object.values(data);
  
      const whereKeys = Object.keys(where).map(k => `${k} = ?`).join(" AND ");
      const whereValues = Object.values(where);
  
      const sql = `UPDATE ${table} SET ${setKeys} WHERE ${whereKeys} LIMIT 1`;
      const [result] = await conn.execute(sql, [...setValues, ...whereValues]);
      return { affectedRows: result.affectedRows };
  }
  
  async function _deleteOne(conn, table, where) {
      const whereKeys = Object.keys(where).map(k => `${k} = ?`).join(" AND ");
      const whereValues = Object.values(where);
      const sql = `DELETE FROM ${table} WHERE ${whereKeys} LIMIT 1`;
      const [result] = await conn.execute(sql, whereValues);
      return { affectedRows: result.affectedRows };
  }
  
  /**
   * Wrapper to support auto connection or manual transaction connection
   */
  function wrap(fn) {
      return async (table, ...args) => {
          const lastArg = args[args.length - 1];
          const manualConn = lastArg && lastArg.__isConnection;
  
          if (manualConn) {
              return await fn(lastArg, table, ...args.slice(0, -1));
          }
  
          const conn = await _DB.getConnection();
          conn.__isConnection = true;
          try {
              return await fn(conn, table, ...args);
          } finally {
              conn.release();
          }
      };
  }
  
  /**
   * Main exported db object
   */const db = {
      query: wrap(_query),
      findOne: wrap(_findOne),
      findMany: wrap(_findMany),
      insertOne: wrap(_insertOne),
      updateOne: wrap(_updateOne),
      deleteOne: wrap(_deleteOne),
  
      /**
       * Transaction helper
       * Automatically injects the transaction connection
       */
      async transaction(fn) {
          const conn = await _DB.getConnection();
          conn.__isConnection = true;
  
          try {
              await conn.beginTransaction();
  
              // wrap helpers to automatically use the transaction connection
              const txHelpers = {
                  query: (...args) => _query(conn, ...args),
                  findOne: (...args) => _findOne(conn, ...args),
                  findMany: (...args) => _findMany(conn, ...args),
                  insertOne: (...args) => _insertOne(conn, ...args),
                  updateOne: (...args) => _updateOne(conn, ...args),
                  deleteOne: (...args) => _deleteOne(conn, ...args),
              };
  
              const result = await fn(txHelpers, conn);
  
              await conn.commit();
              return result;
          } catch (err) {
              await conn.rollback();
              throw err;
          } finally {
              conn.release();
          }
      },
  };


const SCRIPT_RUN_TIME_MS = 55000; // Worker duration
const BASE_CHECK_INTERVAL_MS = 1000;
const MIN_USER_DELAY_MS = 2000;

const lastRunPerUser = new Map(); // email -> last timestamp

async function processJob(job) {
  try {
    const res = await fetch(job.url);
    const success = res.ok;

    if (success) {
      // Find user
      const googleUser = await db.findOne("google_user", { email: job.email });
      if (googleUser && googleUser.token_id) {
        const token = await db.findOne("token", { token_id: googleUser.token_id });
        if (token) {
          await db.updateOne("token", { token_id: token.token_id }, {
            token_count: token.token_count - 1,
            last_updated: new Date()
          });
        }
      }
    }
    // Update job status
    await db.updateOne("job", { id: job.id }, {
      status: success ? "done" : "failed",
      last_tried_at: new Date()
    });

    console.log(`Processed job ${job.id} (${success ? "SUCCESS" : "FAIL"})`);

    // Check if user has pending jobs
    const pendingJobs = await db.findMany("job", { email: job.email, status: "pending" });
    if (pendingJobs.length === 0) {
      await db.updateOne("google_user", { email: job.email }, {
        has_pending_job: false
      });
      console.log(`Marked ${job.email} as has_pending_job = false`);
    }

  } catch (err) {
    console.error(`Job ${job.id} failed:`, err.message);
    await db.updateOne("job", { id: job.id }, {
      status: "failed",
      last_tried_at: new Date()
    });
  }
}

(async () => {
  const start = Date.now();
  console.log(`Worker started at ${new Date().toISOString()}`);

  while (Date.now() - start < SCRIPT_RUN_TIME_MS) {
    const now = Date.now();

    // Fetch pending jobs
    const jobs = await db.findMany("job", { status: "pending" });
    jobs.sort((a, b) => new Date(a.run_at) - new Date(b.run_at));

    if (jobs.length === 0) {
      console.log("No pending jobs");
    }

    for (const job of jobs) {
      const jobRunAt = new Date(job.run_at).getTime();

      if (jobRunAt > now) {
        // Skip, not yet time
        continue;
      }

      const lastRun = lastRunPerUser.get(job.email) || 0;
      const timeSinceLastRun = now - lastRun;

      if (timeSinceLastRun >= MIN_USER_DELAY_MS) {
        lastRunPerUser.set(job.email, Date.now());
        processJob(job); // still not awaited, so multiple users run in parallel
      }
    }


    await new Promise(r => setTimeout(r, BASE_CHECK_INTERVAL_MS));
  }

  console.log("Worker exiting");
  process.exit(0);
})();
