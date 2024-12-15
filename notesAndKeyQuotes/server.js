// IMPORTANT
// The server can be run using the command 'npm run server'
// Or 'notesAndKeyQuotes/server.js' from the root directory of the project
// Then enter 'http://localhost:8080/modifyNotesAndKeyQuotes.html' into a browser to see the app
// The changes made using the application are immediately saved to the 'convertedPoems.json' file

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