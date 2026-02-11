
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

try {
    const key = fs.readFileSync('jwt_key.txt', 'utf8');
    console.log('Read key length:', key.length);

    const convexCli = path.join('node_modules', 'convex', 'bin', 'main.js');

    // Use '--' to stop option parsing, so the key (starting with -) is treated as a value
    const child = spawn('node', [convexCli, 'env', 'set', 'JWT_PRIVATE_KEY', '--', key], {
        stdio: 'inherit',
        shell: false
    });

    child.on('error', (err) => {
        console.error('Failed to start subprocess:', err);
    });

    child.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
        process.exit(code);
    });
} catch (err) {
    console.error(err);
    process.exit(1);
}
