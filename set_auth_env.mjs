import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const privateKey = readFileSync('generated_private_key.txt', 'utf8');
const jwks = readFileSync('generated_jwks.txt', 'utf8');

console.log('Setting JWT_PRIVATE_KEY...');
execSync(`npx convex env set -- JWT_PRIVATE_KEY "${privateKey}"`, { stdio: 'inherit' });

console.log('Setting JWKS...');
execSync(`npx convex env set -- JWKS "${jwks.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });

console.log('Setting SITE_URL...');
execSync('npx convex env set SITE_URL "http://localhost:5173"', { stdio: 'inherit' });

console.log('All environment variables set successfully!');
