import fs from 'fs';
import path from 'path';

const dir = 'src/components/animations';
const files = fs.readdirSync(dir);

files.forEach(file => {
    if (file.endsWith('.tsx')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Add "use client"; if not present
        if (!content.startsWith('"use client"')) {
            content = '"use client";\n' + content;
        }

        // Fix imports if any (though these seem to only import from motion/react)
        // content = content.replace(/@\/app\/components\//g, '@/components/animations/');

        fs.writeFileSync(filePath, content);
    }
});
