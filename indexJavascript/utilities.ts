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

export function getArrayOfChildrenThatAreInputs(element: HTMLSpanElement): Array<HTMLInputElement> {
    const arrayOfChildren = Array.from(element.children) as Array<HTMLInputElement>;
    return arrayOfChildren;
}