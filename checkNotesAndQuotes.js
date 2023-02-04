const fs = require('fs');
const FAKE_SPACE = '|+|'

function checkNotesAndQuotes(prevNotes, prevQuotes, newContent) {
    const notesResult = checkNotes(prevNotes, newContent);
    const quotesResult = checkQuotes(prevQuotes, newContent);
    const invalidNotesAndQuotesJSON = fs.readFileSync('./invalidNotesAndQuotes.json');
    const invalidNotesAndQuotes = JSON.parse(invalidNotesAndQuotesJSON);
    Object.keys(notesResult["invalid"]["word-no-longer-exists"]).forEach(invalidNote => {
        invalidNotesAndQuotes["notes"]["word-no-longer-exists"][invalidNote] = notesResult["invalid"]["word-no-longer-exists"][invalidNote];
    });
    Object.keys(notesResult["invalid"]["four-overlaps"]).forEach(invalidNote => {
        invalidNotesAndQuotes["notes"]["four-overlaps"][invalidNote] = notesResult["invalid"]["four-overlaps"][invalidNote];
    });
    invalidNotesAndQuotes["quotes"]["word-no-longer-exists"] = [
        ...invalidNotesAndQuotes["quotes"]["word-no-longer-exists"],
        ...quotesResult["invalid"]["word-no-longer-exists"]
    ];
    invalidNotesAndQuotes["quotes"]["non-consecutive"] = [
        ...invalidNotesAndQuotes["quotes"]["non-consecutive"],
        ...quotesResult["invalid"]["non-consecutive"]
    ];
    invalidNotesAndQuotes["quotes"]["overlapping"] = [
        ...invalidNotesAndQuotes["quotes"]["overlapping"],
        ...quotesResult["invalid"]["overlapping"]
    ];
    fs.writeFileSync('./invalidNotesAndQuotes.json', JSON.stringify(invalidNotesAndQuotes, null, 4));
    return {
        validNotes: notesResult["valid"],
        validQuotes: quotesResult["valid"]
    }
}

function checkNotes(prevNotes, newContent) {
    const validNotes = {}
    const invalidNotes = {}
    if (prevNotes !== undefined) {
        Object.keys(prevNotes).forEach(noteText => {
            let valid = true;
            prevNotes[noteText].forEach(wordSection => {
                valid = checkWordSectionExists(wordSection, newContent)
            })
            if (valid) {
                validNotes[noteText] = prevNotes[noteText];
            } else {
                invalidNotes[noteText] = prevNotes[noteText];
            }
        })
    }
    const { overlappingNotes, nonOverlappingNotes } = checkOverlaps(validNotes)
    return {
        "invalid": {
            "word-no-longer-exists": invalidNotes,
            "four-overlaps": overlappingNotes
        },
        "valid": nonOverlappingNotes
    }
}

function checkQuotes(prevQuotes, newContent) {
    const validQuotes = [];
    const invalidQuotes = [];
    if (prevQuotes !== undefined) {
        prevQuotes.forEach(quoteToCheck => {
            let valid = true;
            quoteToCheck.forEach(wordSection => {
                valid = checkWordSectionExists(wordSection, newContent);
            });
            if (valid) {
                validQuotes.push(quoteToCheck);
            } else {
                invalidQuotes.push(quoteToCheck);
            }
        });
    }
    const { consecutiveWordsQuotes, nonConsecutiveWordsQuotes } = checkQuotesConsecutive(validQuotes, newContent);
    const { nonOverlappingQuotes, overlappingQuotes } = checkQuoteOverlaps(consecutiveWordsQuotes);
    return {
        "invalid": {
            "word-no-longer-exists": invalidQuotes,
            "non-consecutive": nonConsecutiveWordsQuotes,
            "overlapping": overlappingQuotes,
        },
        "valid": nonOverlappingQuotes
    };
}

function checkOverlaps(prevNotes) {
    const returnValue = {
        overlappingNotes: {},
        nonOverlappingNotes: {},
    };
    Object.keys(prevNotes).forEach(noteText => {
        valid = true;
        prevNotes[noteText].forEach(wordSection => {
            let numberOfQuotesWordSectionIsIn = 1;
            Object.keys(prevNotes).forEach(noteTextForNoteToCheckAgainst => {
                const noteToCheckAgainstContent = prevNotes[noteTextForNoteToCheckAgainst];
                if (noteText !== noteTextForNoteToCheckAgainst) {
                    if (noteToCheckAgainstContent.includes(wordSection)) {
                        numberOfQuotesWordSectionIsIn++;
                    }
                }
            });
            if (numberOfQuotesWordSectionIsIn > 3) {
                valid = false;
            }
        });
        if (valid) {
            returnValue.nonOverlappingNotes[noteText] = prevNotes[noteText];
        } else {
            returnValue.overlappingNotes[noteText] = prevNotes[noteText];
        }
    });
    return returnValue;
}

function checkQuoteOverlaps(quotes) {
    const returnValue = {
        overlappingQuotes: [],
        nonOverlappingQuotes: []
    };
    quotes.forEach(quote => {
        let valid = true;
        quote.forEach(word => {
            quotes.forEach(quoteToCheckAgainst => {
                if (quote.join(' ') !== quoteToCheckAgainst.join(' ')) {
                    valid = !quoteToCheckAgainst.includes(word)
                }
            });
        });
        if (valid) {
            returnValue.nonOverlappingQuotes.push(quote);
        } else {
            returnValue.overlappingQuotes.push(quote);
        }
    });
    return returnValue;
}

function removeNumbers(word) {
    return word.split('').filter(letter => !letter.match(/[0-9]/)).join('');
}

function getAllWordsInPoem(poemContent) {
    const lines = poemContent.split('\n');
    const words = [];
    lines.forEach(line => {
        const wordsInLine = line.split(' ');
        const wordSections = [];
        wordsInLine.forEach(word => {
            const wordSectionsOfSingleWord = word.split(FAKE_SPACE);
            wordSections.push(...wordSectionsOfSingleWord);
        });
        words.push(...wordSections);
    })
    return words
}

function checkQuotesConsecutive(quotes, poemContent) {
    const returnValue = {
        consecutiveWordsQuotes: [],
        nonConsecutiveWordsQuotes: []
    }
    const allWordsinPoem = getAllWordsInPoem(poemContent);
    quotes.forEach(quote => {
        const wordsNoSpaces = allWordsinPoem.filter(word => removeNumbers(word) !== '')
        const indexOfFirstWord = wordsNoSpaces.indexOf(quote[0])
        let valid = true;
        quote.forEach((word, index) => {
            const nextWordInPoem = wordsNoSpaces[indexOfFirstWord + index];
            if (word !== nextWordInPoem) {
                valid = false;
            }
        });
        if (valid) {
            returnValue.consecutiveWordsQuotes.push(quote);
        } else {
            returnValue.nonConsecutiveWordsQuotes.push(quote);
        }
    })
    return returnValue;
}

function checkWordSectionExists(wordSection, newContent) {
    return newContent.includes(wordSection);
}


module.exports = {getAllWordsInPoem, checkNotesAndQuotes}