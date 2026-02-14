const fs = require('fs');
const path = require('path');

const files = [
    'index.html',
    'favoritos.html',
    'mis-propiedades.html',
    'publicar-propiedad.html',
    'editar-propiedad.html',
    'propiedad-detalle.html',
    'assets/js/main.js',
    'assets/js/chatbot.js'
];

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        content = content.replace(/http:\/\/localhost:3000/g, '');
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated: ${file}`);
        }
    } else {
        console.log(`Skipped (not found): ${file}`);
    }
});
