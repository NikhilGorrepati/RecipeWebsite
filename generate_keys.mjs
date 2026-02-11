import { generateKeyPair, exportPKCS8, exportJWK } from 'jose';
import { writeFileSync } from 'fs';

const keys = await generateKeyPair('RS256');
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: 'sig', ...publicKey }] });

// Save the private key with newlines replaced by spaces (as the CLI does)
const formattedPrivateKey = privateKey.trimEnd().replace(/\n/g, ' ');

writeFileSync('generated_private_key.txt', formattedPrivateKey);
writeFileSync('generated_jwks.txt', jwks);

console.log('Keys generated successfully!');
console.log('Private key saved to: generated_private_key.txt');
console.log('JWKS saved to: generated_jwks.txt');
