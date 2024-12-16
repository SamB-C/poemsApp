export const FAKE_SPACE: string = '|+|';

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

export function isIlleagalLetter(letter: string): boolean {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(letter);
}

export const FOCUS = {
    /** 
     * @param word - The word to focus the first letter of
     * 
     * Finds the element for the first letter of a missing word
    */
    focusFirstLetterOfWord(word: string) {
        const firstLetter = WORD_FUNCS.removeNumberFromWord(word)[0];
        const inputToFocusId: string = `${GET_ID.getIdForLetter(word, firstLetter)}`;
        const firstInputElement: HTMLElement = document.getElementById(inputToFocusId)!;
        firstInputElement.focus();
    }
}

/**
 * @param element - The element of the word to return the children of
 * @returns An array of the children of the element
 * 
 * The element parameter must be a span element containing only input elements
 */
export function getArrayOfChildrenThatAreInputs(element: HTMLSpanElement): Array<HTMLInputElement> {
    const arrayOfChildren = Array.from(element.children) as Array<HTMLInputElement>;
    return arrayOfChildren;
}

// Splits the poem into a list of words
export function getAllWordSectionsInPoem(poem: string): Array<string> {
    const allLinesInPoem: Array<string> = poem.split(/\n/);
    const allWordsInPoem: Array<string> = allLinesInPoem.map((line: string): Array<string> => {
        return line.split(' ');
    }).reduce((accumulator: Array<string>, current: Array<string>) => {
        return accumulator.concat(current);
    })
    const allWordSectionsInPoem: Array<string> = allWordsInPoem.map((word: string) => {
        return WORD_FUNCS.getWordSectionsFromWord(word);
    }).reduce((accumulator: Array<string>, wordSections: Array<string>) => {
        return accumulator.concat(wordSections);
    })
    return allWordSectionsInPoem.filter(wordSection => removeNumbers(wordSection) !== '');
}

export function removeNumbers(word: string): string {
    return word.split('').filter(letter => !letter.match(/[0-9]/)).join('');
}