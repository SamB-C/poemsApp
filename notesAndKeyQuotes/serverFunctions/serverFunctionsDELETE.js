const fs = require('fs');

function deleteNoteOrQuote(poemName, noteOrQuote, identifier) {
    const convertedPoemsJSON = fs.readFileSync('./convertedPoems.json', {encoding: 'utf-8'});
    const convertedPoems = JSON.parse(convertedPoemsJSON);
    if (noteOrQuote === 'Note') {
        const existingNotes = convertedPoems[poemName].notes;
        const remainingNotes = {}
        Object.keys(existingNotes).forEach(noteText => {
            if (noteText !== identifier) {
                remainingNotes[noteText] = existingNotes[noteText];
            }
        });
        convertedPoems[poemName].notes = remainingNotes;
    } else {
        const existingQuotes = convertedPoems[poemName].quotes;
        const listToRemove = identifier.split(' ');
        const remainingQuotes = existingQuotes.filter((quote) => {
            const matches = quote.map((word, index) => word === listToRemove[index]);
            return matches.includes(false);
        });
        convertedPoems[poemName].quotes = remainingQuotes;
    }
    fs.writeFile('./convertedPoems.json', JSON.stringify(convertedPoems, null, 4), (err) => {if (err) {throw err;} else {console.log('\nDeletion complete')}});
}

function handleDelete(req, res) {
    console.log('DELETE request:');
    let body = '';
    req.on('data', (data) => {
        body += data;
        console.log('Partial data ->', body);
    });
    req.on('end', () => {
        body = JSON.parse(body);
        console.log('Body ->', body);
        deleteNoteOrQuote(body.poemName, body.identifierFor, body.identifier)
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('deleted successfuly');
    });
}

module.exports = handleDelete;