const fs = require('fs-extra');
const archiver = require('archiver');

(async () => {
  try {
    // Copy files (your existing code)
    await fs.copy('public', '.next/standalone/public');
    await fs.copy('.next/static', '.next/standalone/.next/static');
    await fs.copy('test-db.js', '.next/standalone/test-db.js');
    await fs.copy('cron.js', '.next/standalone/cron.js');
    console.log('Files copied successfully!');

    // Create zip archive with proper exclusion
    console.log('Creating zip archive...');
    const output = fs.createWriteStream('.next/standalone.zip');
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    const archivePromise = new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
    });

    archive.pipe(output);

    // Use glob pattern to include all files but exclude node_modules
    archive.glob('**/*', {
      cwd: '.next/standalone',
      ignore: ['node_modules/**', 'node_modules'], // Exclude node_modules
      dot: true // Include hidden files/directories like .next
    });
    
    await archive.finalize();
    await archivePromise;
    
    console.log(`Zip created successfully: .next/standalone.zip`);

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();