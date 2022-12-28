const fs = require('fs');

const SPECIAL_CHARACTER_REGEX = /[.,:;]/;
const FAKE_SPACE = '|+|';

fs.readFile('./rawPoems.json', 'utf8', (err, data) => {
    if (err) throw err;
    const result = {};
    const poems = JSON.parse(data);
    Object.entries(poems).map((keyValuePair) => {
        const poemName = keyValuePair[0];
        const poemContent = keyValuePair[1];
        const newPoemContent = addInstanceNumbersToWords(poemContent);
        result[poemName] = newPoemContent;
    })
    fs.writeFile('./convertedPoems.json', JSON.stringify(result), (err) => {if (err) {throw err;} else {console.log('complete')}});
});

function addInstanceNumbersToWords(poem) {
    const wordsAlreadyInPoem = {};
    const convertedPoem = poem.split(/\n/).map((line) => {
        return line.split(' ').map((word) => {
            if (word.match(SPECIAL_CHARACTER_REGEX)) {
                const newWord = word.split('').map((letter) => {
                    if (letter.match(SPECIAL_CHARACTER_REGEX)) {
                        return FAKE_SPACE + letter;
                    }
                    else {
                        return letter;
                    }
                }).join('');
                return newWord.split(FAKE_SPACE).map((sectionOfWord) => {
                    return giveWordInstanceNumber(sectionOfWord, wordsAlreadyInPoem);
                }).join(FAKE_SPACE);
            }
            else {
                return giveWordInstanceNumber(word, wordsAlreadyInPoem);
            }
        }).join(' ');
    }).join('\n');
    return convertedPoem;
}

function giveWordInstanceNumber(word, instances) {
    if (word in instances) {
        instances[word] = instances[word] + 1;
    }
    else {
        instances[word] = 1;
    }
    return instances[word] + word + instances[word];
}