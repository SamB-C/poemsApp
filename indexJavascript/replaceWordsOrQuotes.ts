import { Quotes } from "../notesAndKeyQuotes/utilities.js";
import { NUMBER_ONLY_REGEX, QUOTES, REPLACE_QUOTES_RADIO_BUTTON_ID, REPLACE_WORDS_RADIO_BUTTON_ID, WORDS, WordsOrQuotesType } from "./constantsAndTypes.js";
import { initialise, replaceWord, state } from "./index.js";



// --------------------------- Replace words in the poem ---------------------------

// Removes a certain number of words from the poem, and returns the words that were removed
// in order of appearance
export function replaceWords(currentPoem: string): Array<string> {
    const wordsReplaced: Array<string> = [];
    while (wordsReplaced.length < state.numWordsToRemove) {
        const potentialWord: string = selectRandomWordFromPoem(currentPoem);
        if (!wordsReplaced.includes(potentialWord)) {
            wordsReplaced.push(potentialWord);
        }
    }
    insertionSortIntoOrderInPoem(currentPoem, wordsReplaced);
    const wordSectionsReplaced: Array<Array<string>> = wordsReplaced.map((word: string): Array<string> => replaceWord(word, currentPoem));
    return wordSectionsReplaced.reduce((accumulator: Array<string>, wordSections) => {
        return accumulator.concat(wordSections);
    });
}


// Selects a word at random from the poem
function selectRandomWordFromPoem(poem: string):string {
    // Select random line
    const lines: Array<string> = poem.split(/\n/);
    const nonEmptyLines: Array<string> = lines.filter((line:string) => !line.match(NUMBER_ONLY_REGEX));
    const randomLine: string = nonEmptyLines[Math.floor(Math.random() * nonEmptyLines.length)];
    // Select random word
    const words: Array<string> = randomLine.split(/ /);
    const nonEmptyWords: Array<string> = words.filter((word:string) => !word.match(NUMBER_ONLY_REGEX));
    const randomWord: string = nonEmptyWords[Math.floor(Math.random() * nonEmptyWords.length)];
    return randomWord;
}


// Sorts the missing word in the poem into the order of appearance so they can be focused in order
function insertionSortIntoOrderInPoem(poem: string, words: Array<string>): Array<string> {
    for (let i: number = 1; i < words.length; i++) {
        let currentWordIndex: number = i
        let comparingWordIndex: number = i - 1;
        while (poem.indexOf(words[currentWordIndex]) < poem.indexOf(words[comparingWordIndex])) {
            [words[comparingWordIndex], words[currentWordIndex]] = [words[currentWordIndex], words[comparingWordIndex]];
            currentWordIndex--;
            comparingWordIndex--;
            if (currentWordIndex === 0) {
                break
            }
        }
    }
    return words
}