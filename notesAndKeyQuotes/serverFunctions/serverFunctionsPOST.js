const fs = require('fs');
const { getAllWordsInPoem } = require('../../checkNotesAndQuotes')

const FAKE_SPACE = '|+|'

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

function isNew(oldIdentifier) {
    return oldIdentifier === '__NEW__';
}

function editNote(existingNotes, oldIdentifier, newVersion, convertedPoem) {
    // Setup
    const alteredNotes = {}
    
    if (existingNotes) {
        // Keep all notes that are not the note in question
        Object.keys(existingNotes).forEach(identifier => {
            if (identifier !== oldIdentifier) {
                alteredNotes[identifier] = existingNotes[identifier];
            } else {
                // Add the changed note in its new form
                alteredNotes[newVersion.key] = insertionSortIntoOrderInPoem(convertedPoem, newVersion.value);
            }
        });
    }

    if (isNew(oldIdentifier)) {
        alteredNotes[newVersion.key] = insertionSortIntoOrderInPoem(convertedPoem, newVersion.value);
    }

    return alteredNotes;
}

function removeNumbers(word) {
    return word.split('').filter(letter => !letter.match(/[0-9]/)).join('')
}

function checkAllWordsConsecutive(words, quoteToCheck) {
    const wordsNoSpaces = words.filter(word => removeNumbers(word) !== '')
    const indexOfFirstWord = wordsNoSpaces.indexOf(quoteToCheck[0]);
    const errors = quoteToCheck.map((word, index) => {
        const nextWordInPoem = wordsNoSpaces[indexOfFirstWord + index];
        if (word !== nextWordInPoem) {
            const incorrectSequence = [quoteToCheck[index - 1], word];
            const correctSequence = [quoteToCheck[index - 1] ,nextWordInPoem];
            return {
                incorrectSequence,
                correctSequence,
            }
        }
    });
    return errors.filter(err => err !== undefined)[0];
}

function checkNoOverlaps(allQuotes, quoteToCheck) {
    let overlap = undefined
    allQuotes.forEach(quote => {
        const quoteIdentifier = quote.join(' ');
        const quoteToCheckIdentifier = quoteToCheck.join(' ');
        if (quoteIdentifier !== quoteToCheckIdentifier) {
            quote.forEach(word => {
                if (quoteToCheck.includes(word)) {
                    overlap = word
                }
            })
        }
    })
    return overlap;
}

function checkQuoteIsValid(quoteToCheck, poemContent, allQuotes) {
    const words = getAllWordsInPoem(poemContent);
    const errNotConsecutive = checkAllWordsConsecutive(words, quoteToCheck);
    if (errNotConsecutive) {
        return {
            errorType: 'Words not consecutive',
            error: errNotConsecutive
        }
    }
    const errOverlap = checkNoOverlaps(allQuotes, quoteToCheck);
    if (errOverlap !== undefined) {
        return {
            errorType: 'Quote overlap',
            error: errOverlap
        }
    }
    return undefined
}

function orderQuotes(quotes, poemContent) {
    const firstWords = quotes.map(quote => quote[0]);
    const orderedFirstWords = insertionSortIntoOrderInPoem(poemContent, firstWords);
    const orderedQuotes = [];
    orderedFirstWords.forEach(firstWord => {
        quotes.forEach(quote => {
            if (quote[0] === firstWord) {
                orderedQuotes.push(quote);
            }
        })
    });
    return orderedQuotes;
}

function editQuote(existingQuotes, oldIdentifier, newVersion, poemContent) {
    if (existingQuotes) {
        const alteredQuotes = existingQuotes.map(existingQuote => {
            const identifier = existingQuote.join(' ');
            if (identifier === oldIdentifier) {
                return newVersion;
            }
            return existingQuote;
        });

        if (isNew(oldIdentifier)) {
            alteredQuotes.push(newVersion);
        }

        const orderedAlteredQuotes = orderQuotes(alteredQuotes, poemContent)

        return orderedAlteredQuotes;
    }
    return [newVersion]
}

function logQuoteErrorMessage(err, newVersion) {
    console.log(`'${newVersion.join(' ')}' is not a valid quote - ${err.errorType}:`);
    if (err.errorType === 'Words not consecutive') {
        const { incorrectSequence, correctSequence } = err.error;
        console.log(`Incorrect sequence = ${incorrectSequence}`);
        console.log(`Correct sequence = ${correctSequence}\n`)
    } else {
        const overlap = err.error;
        console.log(`Word '${overlap}' in multiple quotes.\n`)
    }
    console.log('Update not complete\n')
}

function editNoteOrQuote(noteType, oldIdentifier, newVersion, poemName) {
    // Gets the converted Poems object from file
    const convertedPoemsJSON = fs.readFileSync('./convertedPoems.json', {encoding: 'utf-8'});
    const convertedPoems = JSON.parse(convertedPoemsJSON);

    const poemContent = convertedPoems[poemName].convertedPoem

    // Edit notes or quotes accordingly
    if (noteType === 'Note') {
        const existingNotes = convertedPoems[poemName].notes;
        const alteredNotes = editNote(existingNotes, oldIdentifier, newVersion, poemContent);
        convertedPoems[poemName].notes = alteredNotes
    } else if (noteType === 'Quote') {
        const existingQuotes = convertedPoems[poemName].quotes;
        const quoteNotValidErrorMessage = checkQuoteIsValid(newVersion, poemContent, existingQuotes);
        if (quoteNotValidErrorMessage !==  undefined) {
            logQuoteErrorMessage(quoteNotValidErrorMessage, newVersion)
            return quoteNotValidErrorMessage
        } else {
            const alteredQuotes = editQuote(existingQuotes, oldIdentifier, newVersion, poemContent);
            convertedPoems[poemName].quotes = alteredQuotes;
        }
    }

    // Write the converted poems object back to file
    fs.writeFile('./convertedPoems.json', JSON.stringify(convertedPoems), (err) => {if (err) {throw err;} else {console.log('\nUpdate complete')}});
    return {errorType: 'No error', error: null}
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
        const err = editNoteOrQuote(body.noteType, body.oldIdentifier, body.newVersion, body.poemName)
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(JSON.stringify(err));
        res.end();
    });
}

module.exports = handlePost;