import { exportPKCS8, generateKeyPair } from 'jose';

const { privateKey } = await generateKeyPair('ES256', { extractable: true });
const pkcs8 = await exportPKCS8(privateKey);

console.log('Add this line to apps/identity/.env:\n');
console.log(
  `IDENTITY_JWT_PRIVATE_KEY=${Buffer.from(pkcs8).toString('base64')}`,
);
