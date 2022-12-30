const fs = require('fs')

const convertedPoemsJSON = fs.readFileSync('./convertedPoems.json', {encoding: 'utf8'});
const convertedPoem = JSON.parse(convertedPoemsJSON);

const notesAndQuotesJSON = fs.readFileSync('./notesAndKeyQuotes.json', {encoding: 'utf8'});
const notesAndQuotes = JSON.parse(notesAndQuotesJSON);
const { quotes, notes } = notesAndQuotes;

Object.keys(quotes).forEach((poemName) => {
    convertedPoem[poemName]['quotes'] = quotes[poemName];
});

Object.keys(notes).forEach((poemName) => {
    convertedPoem[poemName]['notes'] = notes[poemName];
});

fs.writeFile('./convertedPoems.json', JSON.stringify(convertedPoem), (err) => {
    if (err) throw err;
    console.log('Notes and quotes integrated sucessfully');
});