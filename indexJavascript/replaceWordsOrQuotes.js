import { GET_ELEMENT, INPUT_OPTIONS, NUMBER_ONLY_REGEX } from "./constantsAndTypes.js";
import { state } from "./index.js";
import { onInputEventHandler } from "./letterInputEventHandler.js";
import { getArrayOfChildrenThatAreInputs, GET_ID, isIlleagalLetter, WORD_FUNCS } from "./utilities.js";
// =========================== Choose words to replace ===========================
// --------------------------- Replace quotes in the poem ---------------------------
export function replaceQuotes(quotes) {
    const quotesToReplace = [];
    const numberOfQuotesToReplace = Math.ceil((state.percentageWordsToRemove / 100) * quotes.length);
    if (numberOfQuotesToReplace === 0) {
        return [];
    }
    while (quotesToReplace.length < numberOfQuotesToReplace) {
        const potentialQuote = quotes[Math.floor(Math.random() * quotes.length)];
        let wordAlreadySelected = false;
        quotesToReplace.forEach(quote => {
            if (quote.join(' ') === potentialQuote.join(' ')) {
                wordAlreadySelected = true;
            }
        });
        if (!wordAlreadySelected) {
            quotesToReplace.push(potentialQuote);
        }
    }
    let allWordsInQuotes = [];
    quotesToReplace.forEach(quote => quote.forEach(word => allWordsInQuotes.push(word)));
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
    const numberOfWordsToReplace = Math.ceil((state.percentageWordsToRemove / 100) * state.poemData[state.currentPoemName].wordCount);
    if (numberOfWordsToReplace === 0) {
        return [];
    }
    while (wordsReplaced.length < numberOfWordsToReplace) {
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
// =========================== Replacing words ===========================
// Replaces a word from the poem in the HTML with underscores with equal length to the length of the word
export function replaceWord(word, poem) {
    // Turn each word into letter inputs
    const wordSectionsToHide = WORD_FUNCS.getWordSectionsFromWord(word);
    const nonEmptySectionsToHide = wordSectionsToHide.filter(word => !word.match(NUMBER_ONLY_REGEX));
    nonEmptySectionsToHide.forEach((wordSection) => {
        const wordToHide = GET_ELEMENT.getElementOfWord(wordSection);
        const wordInUnderScores = wordSection.split('').map((letter) => {
            if (!isIlleagalLetter(letter)) {
                const htmlForLetter = `<input ${INPUT_OPTIONS} id="${GET_ID.getIdForLetter(wordSection, letter)}"></input>`;
                return htmlForLetter;
            }
        }).join('');
        wordToHide.innerHTML = wordInUnderScores;
        wordToHide.classList.add('extraSpace');
        // Adds the event handlers for the input
        wordToHide.oninput = (event) => onInputEventHandler(wordSection, event, poem);
        wordToHide.onclick = () => {
            state.focusedWord = wordSection;
        };
        const childrenToAddOnInputTo = getArrayOfChildrenThatAreInputs(wordToHide);
        childrenToAddOnInputTo.forEach((input) => {
            input.oninput = ensureMaxLengthNotExceeded;
        });
    });
    return nonEmptySectionsToHide;
}
function ensureMaxLengthNotExceeded(event) {
    const targetInput = event.target;
    const firstLetter = targetInput.value.charAt(0);
    targetInput.value = firstLetter;
}
