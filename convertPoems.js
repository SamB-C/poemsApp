const fs = require('fs');

const SPECIAL_CHARACTER_REGEX = /[.,:;]/;
const FAKE_SPACE = '|+|';

fs.readFile('./rawPoems.json', 'utf8', (err, data) => {
    if (err) throw err;
    const result = {};
    const poems = JSON.parse(data);
    const poemSettings = getPoemSettings();
    Object.entries(poems).map((keyValuePair) => {
        const poemName = keyValuePair[0];
        const poemFileContent = keyValuePair[1];
        const { poemContent, poemAuthor } = getPoemNameContentAuthor(poemFileContent);
        const poemInfo = addInstanceNumbersToWords(poemName, poemContent);
        result[poemName] = poemInfo;
        result[poemName]["author"] = poemAuthor;
        addSettings(poemSettings, poemName, result)
        console.log(poemName, `by ${poemAuthor}` , poemInfo['wordCount']);
    })
    fs.writeFile('./convertedPoems.json', JSON.stringify(result), (err) => {if (err) {throw err;} else {console.log('\nAll poems complete!')}});
});

function getPoemNameContentAuthor(poemFileContent) {
    const listOfLines = poemFileContent.split('\n');
    const poemName = listOfLines.splice(0, 2)[0];
    const poemAuthor = listOfLines.splice(listOfLines.length - 2, 2)[1];
    const poemContent = listOfLines.join('\n');
    return {
        poemName,
        poemContent,
        poemAuthor
    }
}

function getPoemSettings() {
    const poemSettingsJSON = fs.readFileSync('./poems/poemSettings.json', {encoding: 'utf8'});
    const poemSettings = JSON.parse(poemSettingsJSON)
    return poemSettings
}

function addSettings(poemSettings, poemName, result) {
    const centeredPoems = poemSettings["centered"];
    if (centeredPoems.includes(poemName)) {
        result[poemName]['centered'] = true;
    } else {
        result[poemName]['centered'] = false;
    }
}

// Gets add the instance numbers to the words in the poem, and gets the poem's word count
function addInstanceNumbersToWords(poemName, poemContent) {
    const wordsAlreadyInPoem = {"__words__": 0};
    return {
        'convertedPoem': mapOverLines(poemContent, wordsAlreadyInPoem), 
        'wordCount': wordsAlreadyInPoem['__words__'],
    };
}


// Maps over all the lines in the poem
function mapOverLines(poem, wordsAlreadyInPoem) {
    const returnValue =  poem.split(/\n/)
                .map((line) => lineMapFunction(line, wordsAlreadyInPoem))
                .join('\n');
    return returnValue
}

// Maps over all the words in the poem
function lineMapFunction(line, wordsAlreadyInPoem) {
    const returnValue = line.split(' ')
                .map((word) => {
                    increaseWordCount(word, wordsAlreadyInPoem)
                    return wordMapFunction(word, wordsAlreadyInPoem)
                })
                .join(' ');
    return returnValue;
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