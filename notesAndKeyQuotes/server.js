// IMPORTANT
// The server can be run using the command 'npm run server'
// Or 'notesAndKeyQuotes/server.js' from the root directory of the project

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