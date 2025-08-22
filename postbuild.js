const fs = require('fs-extra');

(async () => {
  try {
    await fs.copy('public', '.next/standalone/public');
    await fs.copy('.next/static', '.next/standalone/.next/static');
    await fs.copy('test-db.js', '.next/standalone/test-db.js');
    await fs.copy('cron.js', '.next/standalone/cron.js');
    console.log('Files copied successfully!');
  } catch (err) {
    console.error('Error copying files:', err);
    process.exit(1);
  }
})();