// IMPORTANT
// The server must be run from inside the notesAndKeyQuotes directory as doesn't use full filepath.

const http = require('http');
const handleGet = require('./serverFunctions/serverFunctionsGET');
const handlePost = require('./serverFunctions/serverFunctionsPOST');
const handleDelete = require('./serverFunctions/serverFunctionsDELETE');


http.createServer((req, res) => {
    if (req.method === 'DELETE') {
        handleDelete(req, res);
    } else if (req.method === 'POST'){
        handlePost(req, res)
    } else {
        handleGet(req, res);
    }
}).listen(8080);