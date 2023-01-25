import { FAKE_SPACE } from "./constantsAndTypes.js";
export function getWordSectionsFromWord(word) {
    return word.split(FAKE_SPACE).filter((wordSection) => {
        return wordSection !== '';
    });
}
// Abstraction for getting the id of a specific word
export function getIdForWord(word) {
    if (word.includes('"')) {
        return word.replace(/"/, "'");
    }
    else {
        return word;
    }
}
// Gets the HTML element of a specific word
export function getElementOfWord(word) {
    const wordElement = document.getElementById(getIdForWord(word));
    return wordElement;
}
export function isIlleagalLetter(letter) {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(letter);
}
// Get a letter in the form of its binary code
function getBinaryFromLetter(letter) {
    return letter.charCodeAt(0).toString(2);
}
// Abstraction for getting the id for a specific letter
export function getIdForLetter(word, letter) {
    return `${getIdForWord(word)}_${getBinaryFromLetter(letter)}`;
}
export function getArrayOfChildrenThatAreInputs(element) {
    const arrayOfChildren = Array.from(element.children);
    return arrayOfChildren;
}
