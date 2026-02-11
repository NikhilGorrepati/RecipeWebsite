
const fs = require('fs');
const { spawn } = require('child_process');

try {
    const key = fs.readFileSync('jwt_key.txt', 'utf8');
    console.log('Read key length:', key.length);

    const child = spawn('npx.cmd', ['convex', 'env', 'set', 'JWT_PRIVATE_KEY', key], {
        stdio: 'inherit',
        shell: true
    });

    child.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
        process.exit(code);
    });
} catch (err) {
    console.error(err);
    process.exit(1);
}
