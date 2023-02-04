export const FAKE_SPACE = '|+|';
export const WORD_FUNCS = {
    getWordSectionsFromWord(word) {
        return word.split(FAKE_SPACE).filter((wordSection) => {
            return wordSection !== '';
        });
    },
    removeNumberFromWord(word) {
        return word.split('').filter(letter => !isIlleagalLetter(letter)).join('');
    }
};
export const GET_ID = {
    getBinaryFromLetter(letter) {
        return letter.charCodeAt(0).toString(2);
    },
    getIdForWord(word) {
        if (word.includes('"')) {
            return word.replace(/"/, "'");
        }
        else {
            return word;
        }
    },
    getIdForLetter(word, letter) {
        return `${this.getIdForWord(word)}_${this.getBinaryFromLetter(letter)}`;
    },
};
export function isIlleagalLetter(letter) {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(letter);
}
export const FOCUS = {
    // Finds the element for the first letter of a missing word
    focusFirstLetterOfWord(word) {
        const firstLetter = WORD_FUNCS.removeNumberFromWord(word)[0];
        const inputToFocusId = `${GET_ID.getIdForLetter(word, firstLetter)}`;
        const firstInputElement = document.getElementById(inputToFocusId);
        firstInputElement.focus();
    }
};
export function getArrayOfChildrenThatAreInputs(element) {
    const arrayOfChildren = Array.from(element.children);
    return arrayOfChildren;
}
// Splits the poem into a list of words
export function getAllWordSectionsInPoem(poem) {
    const allLinesInPoem = poem.split(/\n/);
    const allWordsInPoem = allLinesInPoem.map((line) => {
        return line.split(' ');
    }).reduce((accumulator, current) => {
        return accumulator.concat(current);
    });
    const allWordSectionsInPoem = allWordsInPoem.map((word) => {
        return WORD_FUNCS.getWordSectionsFromWord(word);
    }).reduce((accumulator, wordSections) => {
        return accumulator.concat(wordSections);
    });
    return allWordSectionsInPoem.filter(wordSection => removeNumbers(wordSection) !== '');
}
export function removeNumbers(word) {
    return word.split('').filter(letter => !letter.match(/[0-9]/)).join('');
}
