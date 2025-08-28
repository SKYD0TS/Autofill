const fs = require('fs-extra');
const archiver = require('archiver');

(async () => {
  try {
    // Copy files
    await fs.copy('public', '.next/standalone/public');
    await fs.copy('.next/static', '.next/standalone/.next/static');
    await fs.copy('test-db.js', '.next/standalone/test-db.js');
    await fs.copy('cron.js', '.next/standalone/cron.js');
    console.log('Files copied successfully!');

    // Create zip archive
    console.log('Creating zip archive...');
    const output = fs.createWriteStream('.next/standalone.zip');
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Promise to handle archive completion
    const archivePromise = new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
    });

    archive.pipe(output);

    // Append files from standalone directory, excluding node_modules
    archive.glob('**/*', {
      cwd: '.next/standalone',
      ignore: ['node_modules/**']
    });

    await archive.finalize();
    await archivePromise;
    
    console.log(`Zip created successfully: .next/standalone.zip (${archive.pointer()} bytes)`);

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();