import { FAKE_SPACE } from "./constantsAndTypes.js";

export function getWordSectionsFromWord(word: string): Array<string> {
    return word.split(FAKE_SPACE).filter((wordSection: string) => {
        return wordSection !== '';
    })
}

// Abstraction for getting the id of a specific word
export function getIdForWord(word: string): string {
    if (word.includes('"')) {
        return word.replace(/"/, "'");
    } else {
        return word
    }
}

// Gets the HTML element of a specific word
export function getElementOfWord(word: string): HTMLSpanElement {
    const wordElement: HTMLSpanElement = document.getElementById(getIdForWord(word))!;
    return wordElement;
}

export function isIlleagalLetter(letter: string): boolean {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(letter);
}


// Get a letter in the form of its binary code
function getBinaryFromLetter(letter:string): string {
    return letter.charCodeAt(0).toString(2);
}

// Abstraction for getting the id for a specific letter
export function getIdForLetter(word: string, letter: string): string {
    return `${getIdForWord(word)}_${getBinaryFromLetter(letter)}`
}

export function getArrayOfChildrenThatAreInputs(element: HTMLSpanElement): Array<HTMLInputElement> {
    const arrayOfChildren = Array.from(element.children) as Array<HTMLInputElement>;
    return arrayOfChildren;
}