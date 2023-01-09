// IMPORTANT
// The server must be run from inside the notesAndKeyQuotes directory as doesn't use full filepath.

const http = require('http');
const url = require('url');
const fs = require('fs');

function getFilename(req) {
    const query = url.parse(req.url, true);
    if (query.pathname === '/convertedPoems.json') {
        return '../convertedPoems.json';
    } else {
        return '.' + query.pathname;
    }
}

function errorOccurred(err) {
    console.log(err);
    res.writeHead(404, {'Content-Type': 'text/html'});
    return res.end('404 Not Found');
}

function getFileType(path) {
    const fileNameSplit = path.split('.');
    return fileNameSplit[fileNameSplit.length - 1];
}

function getContentTypeAndData(fileType, data) {
    let dataToWrite = data;
    let contentType = `text/${fileType}`;
    if (fileType === 'json') {
        contentType = 'application/json';
        data = JSON.parse(data)
    } else if (fileType === 'js') {
        contentType = 'text/javascript';
    }
    return { dataToWrite, contentType,}
}

http.createServer((req, res) => {
    const filename = getFilename(req);
    console.log(`Request for resource: ${filename}`);
    fs.readFile(filename, (err, data) => {
        if (err) {
            errorOccurred(err);
        }
        const fileType = getFileType(filename);
        const { dataToWrite, contentType } = getContentTypeAndData(fileType, data);
        res.writeHead(200, {'Content-Type': contentType});
        res.write(dataToWrite);
        return res.end();
    })
}).listen(8080);