import { NUMBER_ONLY_REGEX } from "./constantsAndTypes.js";
import { rangeValidationForNumberOfWordsToReplace, replaceWord } from "./index.js";
// --------------------------- Replace words in the poem ---------------------------
// Removes a certain number of words from the poem, and returns the words that were removed
// in order of appearance
export function replaceWords(poem, numberOfWords) {
    numberOfWords = rangeValidationForNumberOfWordsToReplace(numberOfWords);
    const wordsReplaced = [];
    while (wordsReplaced.length < numberOfWords) {
        const potentialWord = selectRandomWordFromPoem(poem);
        if (!wordsReplaced.includes(potentialWord)) {
            wordsReplaced.push(potentialWord);
        }
    }
    insertionSortIntoOrderInPoem(poem, wordsReplaced);
    const wordSectionsReplaced = wordsReplaced.map((word) => replaceWord(word, poem));
    return wordSectionsReplaced.reduce((accumulator, wordSections) => {
        return accumulator.concat(wordSections);
    });
}
// Selects a word at random from the poem
function selectRandomWordFromPoem(poem) {
    // Select random line
    const lines = poem.split(/\n/);
    const nonEmptyLines = lines.filter((line) => !line.match(NUMBER_ONLY_REGEX));
    const randomLine = nonEmptyLines[Math.floor(Math.random() * nonEmptyLines.length)];
    // Select random word
    const words = randomLine.split(/ /);
    const nonEmptyWords = words.filter((word) => !word.match(NUMBER_ONLY_REGEX));
    const randomWord = nonEmptyWords[Math.floor(Math.random() * nonEmptyWords.length)];
    return randomWord;
}
// Sorts the missing word in the poem into the order of appearance so they can be focused in order
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
