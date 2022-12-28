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
        const { convertedPoem, wordCount} = addInstanceNumbersToWords(poemContent);
        result[poemName] = convertedPoem;
        console.log(poemName, wordCount);
    })
    fs.writeFile('./convertedPoems.json', JSON.stringify(result), (err) => {if (err) {throw err;} else {console.log('complete')}});
});

// Gets add the instance numbers to the words in the poem, and gets the poem's word count
function addInstanceNumbersToWords(poem) {
    const wordsAlreadyInPoem = {"__words__": 0};
    return {
        'convertedPoem': mapOverLines(poem, wordsAlreadyInPoem), 
        'wordCount': wordsAlreadyInPoem['__words__']
    };
}

// Maps over all the lines in the poem
function mapOverLines(poem, wordsAlreadyInPoem) {
    return poem.split(/\n/)
                .map((line) => lineMapFunction(line, wordsAlreadyInPoem))
                .join('\n');
}

// Maps over all the words in the poem
function lineMapFunction(line, wordsAlreadyInPoem) {
    return line.split(' ')
                .map((word) => {
                    increaseWordCount(word, wordsAlreadyInPoem)
                    return wordMapFunction(word, wordsAlreadyInPoem)
                })
                .join(' ');
}

// Increases the word count (if not space)
function increaseWordCount(word, wordsAlreadyInPoem) {
    // Only increases word count for words that are not a space
    if (word) {
        wordsAlreadyInPoem['__words__'] = wordsAlreadyInPoem['__words__'] + 1
    }
}

// Sorts out whether the word has a special character and deals with it, before giving the word instance numbers
function wordMapFunction(word, wordsAlreadyInPoem) {
    if (word.match(SPECIAL_CHARACTER_REGEX)) {
        // Add the fake space between text and special character
        const newWord = specialCharacterCaseGetWordSections(word);
        // Gives each word section their instance numbers
        return newWord.split(FAKE_SPACE).map((sectionOfWord) => {
            return giveWordInstanceNumber(sectionOfWord, wordsAlreadyInPoem);
        }).join(FAKE_SPACE);
    }
    else {
        // Case for normal words (and spaces)
        return giveWordInstanceNumber(word, wordsAlreadyInPoem);
    }
}

// Add the fake space between text and special character
function specialCharacterCaseGetWordSections(word) {
    return word.split('')
    .map((letter) => {
        if (letter.match(SPECIAL_CHARACTER_REGEX)) {
            return FAKE_SPACE + letter;
        }
        return letter;
    }).join('');
}

// Adds instance numbers to word sections
function giveWordInstanceNumber(word, instances) {
    if (word in instances) {
        instances[word] = instances[word] + 1;
    }
    else {
        instances[word] = 1;
    }
    return instances[word] + word + instances[word];
}