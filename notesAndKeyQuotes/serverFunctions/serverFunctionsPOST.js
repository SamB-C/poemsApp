const fs = require('fs');

function insertionSortIntoOrderInPoem(poem, words) {
    for (let i = 1; i < words.length; i++) {
        let currentWordIndex = i;
        let comparingWordIndex = i - 1;
        while (poem.indexOf(words[currentWordIndex]) < poem.indexOf(words[comparingWordIndex])) {
            [words[comparingWordIndex], words[currentWordIndex]] = [words[currentWordIndex], words[comparingWordIndex]];
            currentWordIndex--;
            comparingWordIndex--;
            if (currentWordIndex === 0) {
                break;
            }
        }
    }
    return words;
}

function editNoteOrQuote(noteType, oldIdentifier, newVersion, poemName) {
    // Gets the converted Poems object from file
    const convertedPoemsJSON = fs.readFileSync('./convertedPoems.json', {encoding: 'utf-8'});
    const convertedPoems = JSON.parse(convertedPoemsJSON);

    // Only if the type is a note
    if (noteType === 'Note') {
        // Setup
        const existingNotes = convertedPoems[poemName].notes;
        const remainingNotes = {}
        
        if (existingNotes) {
            // Keep all notes that are not the note in question
            Object.keys(existingNotes).forEach(noteText => {
                if (noteText !== oldIdentifier) {
                    remainingNotes[noteText] = existingNotes[noteText];
                } else {
                    // Add the changed note in its new form
                    remainingNotes[newVersion.key] = insertionSortIntoOrderInPoem(convertedPoems[poemName].convertedPoem, newVersion.value);
                }
            });
        }

        if (oldIdentifier === '__NEW__') {
            remainingNotes[newVersion.key] = insertionSortIntoOrderInPoem(convertedPoems[poemName].convertedPoem, newVersion.value);
        }

        // Alter converted poems
        convertedPoems[poemName].notes = remainingNotes;

    } else if (noteType === 'Quote' && convertedPoems[poemName].quotes) {
        const existingQuotes = convertedPoems[poemName].quotes;
        const remainingQuotes = existingQuotes.map(existingQuote => {
            if (existingQuote.join(' ') !== oldIdentifier) {
                return existingQuote;
            } else {
                return newVersion;
            }
        });

        if (oldIdentifier === '__NEW__') {
            remainingQuotes.push(newVersion);
        }

        convertedPoems[poemName].quotes = remainingQuotes;
    } else if (noteType === 'Quote') {
        convertedPoems[poemName].quotes = [newVersion]
    }

    // Write the converted poems object back to file
    fs.writeFile('./convertedPoems.json', JSON.stringify(convertedPoems), (err) => {if (err) {throw err;} else {console.log('\nUpdate complete')}})
}

function handlePost(req, res) {
    console.log('POST request:');
    let body = '';
    req.on('data', (data) => {
        body += data;
        console.log('Partial data ->', body);
    });
    req.on('end', () => {
        body = JSON.parse(body);
        console.log('Body ->', body);
        editNoteOrQuote(body.noteType, body.oldIdentifier, body.newVersion, body.poemName)
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('post recivied');
    });
}

module.exports = handlePost;