import { DB } from "./db.js";

/**
 * Core helpers that require a connection
 */
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

        const conn = await DB.getConnection();
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
 */
export const db = {
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
        const conn = await DB.getConnection();
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
