// Types for data fetched from JSON
export type Quotes = Array<Array<string>>

export type Notes = {
    [noteText: string]: Array<string>
}

export type convertedPoem = {
    convertedPoem: string,
    wordCount: number,
    author: string,
    centered: boolean,
    quotes: Quotes,
    notes: Notes
}

export type ConvertedPoems = {
    [poemName: string]: convertedPoem
}

// Functions used in more than one file
export function removeNumbers(word: string): string {
    return word.split('').filter(letter => !letter.match(/[0-9]/)).join('');
}

export function highlightText(textToHighlight: Array<string>, color: string) {
    textToHighlight.forEach((word: string) => {
        const wordSpan = document.getElementById(word) as HTMLSpanElement;
        wordSpan.style.color = color;
    });
}

export function unHighlightText(textToUnhighlight: Array<string>) {
    textToUnhighlight.forEach((word: string) => {
        const wordSpan = document.getElementById(word) as HTMLSpanElement;
        wordSpan.style.color = 'black';
    });
}