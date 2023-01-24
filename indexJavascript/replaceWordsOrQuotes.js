import { NUMBER_ONLY_REGEX, QUOTES, REPLACE_QUOTES_RADIO_BUTTON_ID, REPLACE_WORDS_RADIO_BUTTON_ID, WORDS } from "./constantsAndTypes.js";
import { initialise, replaceWord, state } from "./index.js";
// Initialise the radio buttons so that their value is represented in the state
export function initialiseWordsOrQuotesRadioButtons() {
    const wordsButton = document.getElementById(REPLACE_WORDS_RADIO_BUTTON_ID);
    const quotesButton = document.getElementById(REPLACE_QUOTES_RADIO_BUTTON_ID);
    wordsButton.checked = true;
    wordsButton.oninput = () => radioButtonOnInput(WORDS);
    quotesButton.oninput = () => radioButtonOnInput(QUOTES);
}
function radioButtonOnInput(removalType) {
    state.removalType = removalType;
    initialise();
}
// --------------------------- Replace quotes in the poem ---------------------------
export function replaceQuotes(quotes) {
    let allWordsInQuotes = [];
    quotes.forEach(quote => quote.forEach(word => allWordsInQuotes.push(word)));
    const currentPoemContent = state.poemData[state.currentPoemName].convertedPoem;
    // The words should already be in order but used as a precaution
    insertionSortIntoOrderInPoem(currentPoemContent, allWordsInQuotes);
    allWordsInQuotes.forEach(word => replaceWord(word, currentPoemContent));
    return allWordsInQuotes;
}
// --------------------------- Replace words in the poem ---------------------------
// Removes a certain number of words from the poem, and returns the words that were removed
// in order of appearance
export function replaceWords(currentPoem) {
    const wordsReplaced = [];
    while (wordsReplaced.length < state.numWordsToRemove) {
        const potentialWord = selectRandomWordFromPoem(currentPoem);
        if (!wordsReplaced.includes(potentialWord)) {
            wordsReplaced.push(potentialWord);
        }
    }
    insertionSortIntoOrderInPoem(currentPoem, wordsReplaced);
    const wordSectionsReplaced = wordsReplaced.map((word) => replaceWord(word, currentPoem));
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
