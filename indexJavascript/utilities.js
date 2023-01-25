import { FAKE_SPACE, POEM_ID } from "./constantsAndTypes.js";
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
export const GET_ELEMENT = {
    getElementOfWord(word) {
        const wordElement = document.getElementById(GET_ID.getIdForWord(word));
        return wordElement;
    },
    getPoemElement() {
        return document.getElementById(POEM_ID);
    }
};
export function isIlleagalLetter(letter) {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(letter);
}
export function getArrayOfChildrenThatAreInputs(element) {
    const arrayOfChildren = Array.from(element.children);
    return arrayOfChildren;
}
