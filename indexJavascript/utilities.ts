import { FAKE_SPACE, POEM_CONTAINER_DOM_TYPE, POEM_ID, POEM_SELECT_ID, POEM_SELECT_TYPE, RADIO_BUTTONS_TYPE, RANGEBAR_ID, RANGEBAR_RESULT_ID, RANGEBAR_RESULT_TYPE, RANGEBAR_TYPE, REPLACE_QUOTES_RADIO_BUTTON_ID, REPLACE_WORDS_RADIO_BUTTON_ID } from "./constantsAndTypes.js";


export const WORD_FUNCS = {
    getWordSectionsFromWord(word: string): Array<string> {
        return word.split(FAKE_SPACE).filter((wordSection: string) => {
            return wordSection !== '';
        })
    },
    removeNumberFromWord(word: string): string {
        return word.split('').filter(letter => !isIlleagalLetter(letter)).join('');
    }
}

export const GET_ID = {
    getBinaryFromLetter(letter:string): string {
        return letter.charCodeAt(0).toString(2);
    },
    getIdForWord(word: string): string {
        if (word.includes('"')) {
            return word.replace(/"/, "'");
        } else {
            return word
        }
    },
    getIdForLetter(word: string, letter: string): string {
        return `${this.getIdForWord(word)}_${this.getBinaryFromLetter(letter)}`
    },
}

export const GET_ELEMENT = {
    getElementOfWord(word: string): HTMLSpanElement {
        const wordElement: HTMLSpanElement = document.getElementById(GET_ID.getIdForWord(word))!;
        return wordElement;
    },
    getPoemElement(): POEM_CONTAINER_DOM_TYPE {
        return document.getElementById(POEM_ID) as POEM_CONTAINER_DOM_TYPE;
    },
    getRangeBar(): RANGEBAR_TYPE {
        return document.getElementById(RANGEBAR_ID) as RANGEBAR_TYPE;
    },
    getPoemSelect(): POEM_SELECT_TYPE {
        return document.getElementById(POEM_SELECT_ID) as POEM_SELECT_TYPE;
    },
    getRangeBarResult(): RANGEBAR_RESULT_TYPE {
        return document.getElementById(RANGEBAR_RESULT_ID) as RANGEBAR_RESULT_TYPE;
    },
    getRadioButtons(): {wordsRadioButton: RADIO_BUTTONS_TYPE, quotesRadioButton: RADIO_BUTTONS_TYPE} {
        const wordsRadioButton = document.getElementById(REPLACE_WORDS_RADIO_BUTTON_ID) as RADIO_BUTTONS_TYPE;
        const quotesRadioButton = document.getElementById(REPLACE_QUOTES_RADIO_BUTTON_ID) as RADIO_BUTTONS_TYPE;
        return {wordsRadioButton, quotesRadioButton};
    }
}

export function isIlleagalLetter(letter: string): boolean {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(letter);
}

export function getArrayOfChildrenThatAreInputs(element: HTMLSpanElement): Array<HTMLInputElement> {
    const arrayOfChildren = Array.from(element.children) as Array<HTMLInputElement>;
    return arrayOfChildren;
}