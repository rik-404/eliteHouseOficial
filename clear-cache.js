const fs = require('fs');
const path = require('path');

const cacheDir = path.join(__dirname, '.vite');

if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('Cache limpo com sucesso!');
} else {
  console.log('Nenhum cache encontrado para limpar.');
}
