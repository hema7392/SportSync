const fs = require('fs');
const path = require('path');

const targetProvider = process.argv[2] || 'sqlite';
if (!['sqlite', 'postgresql'].includes(targetProvider)) {
  console.error('Invalid provider. Use "sqlite" or "postgresql".');
  process.exit(1);
}

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

schema = schema.replace(
  /datasource db \{[\s\S]*?provider\s*=\s*["'][^"']+["'][\s\S]*?\}/,
  `datasource db {\n  provider = "${targetProvider}"\n  url      = env("DATABASE_URL")\n}`
);

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log(`Prisma datasource provider updated to: ${targetProvider}`);
