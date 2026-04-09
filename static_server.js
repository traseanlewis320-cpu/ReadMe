const http = require('http');
const fs = require('fs');
const path = require('path');

const ports = [3000, 3001, 3002, 3003];

function startServer(portIndex) {
    if (portIndex >= ports.length) {
        console.error('All alternative ports are already in use!');
        process.exit(1);
    }
    
    const PORT = ports[portIndex];
    const server = http.createServer((req, res) => {
        let filePath = '.' + req.url;
        if (filePath === './') filePath = './index.html';

        const extname = path.extname(filePath);
        let contentType = 'text/html';
        switch (extname) {
            case '.js': contentType = 'text/javascript'; break;
            case '.css': contentType = 'text/css'; break;
            case '.json': contentType = 'application/json'; break;
            case '.png': contentType = 'image/png'; break;
            case '.jpg': contentType = 'image/jpg'; break;
            case '.webp': contentType = 'image/webp'; break;
        }

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end('404 Not Found');
                } else {
                    res.writeHead(500);
                    res.end('500 Error: ' + error.code);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });

    server.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
            console.warn(`Port ${PORT} is in use, trying next...`);
            startServer(portIndex + 1);
        } else {
            console.error('Server error:', e);
            process.exit(1);
        }
    });

    server.listen(PORT, () => {
        console.log(`🚀 Modern Booking App Live!`);
        console.log(`Access Link: http://localhost:${PORT}/`);
    });
}

startServer(0);
