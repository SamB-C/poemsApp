type Quotes = {
    [poemName: string]: Array<string>
}

type Notes = {
    [poemName: string]: {
        [noteText: string]: Array<string>
    }
}

type convertedPoem = {
    convertedPoem: string,
    wordCount: number,
    author: string,
    centered: boolean,
    quotes: Quotes,
    notes: Notes
}

type ConvertedPoems = {
    [poemName: string]: convertedPoem
}

const POEM_DISPLAY_ID: string = '__poem_id__';
const POEM_AUTHOR_DISPLAY_ID: string = '__poem_author__';


fetch('../convertedPoems.json')
    .then(response => response.json())
    .then((data: ConvertedPoems) => main(data));


function main(data: ConvertedPoems): void {
    let currentPoem = Object.keys(data)[0];
    const currentPoemContent = data[currentPoem].convertedPoem;
    const currentPoemAuthor = data[currentPoem].author;
    const isCurrentPoemCentered = data[currentPoem].centered;
    renderPoem(currentPoemContent, currentPoemAuthor, isCurrentPoemCentered)
}

function renderPoem(poemContent: string, author: string, centered: boolean): void {
    const poemLines: Array<string> = poemContent.split(/\n/)
    const toRender = poemLines.map((line: string): string => {
        return splitToWords(line) + '</br>';
    }).join('');
    
    const poemElement = getPoemElementFromDOM()
    poemElement.innerHTML = toRender;

    renderPoemAuthor(author)

    centerThePoem(centered)
}

function splitToWords(line: string): string {
    // Split at space of fake space
    const words: Array<string> = line.split(/ /);
    // Accumulator for reduce needs to start as '' so first word gets split as well.
    words.unshift('')
    const wordSectionsString: string = words.reduce((acc: string, word: string) => {
        const wordSections: Array<string> = word.split('|+|');
        return acc + ' ' + wordSections.join(' ')
    })
    const wordSections = wordSectionsString.split(' ');
    const firstWord = wordSections.filter(word => !word.match(/^[0-9]+$/))[0];
    return wordSections.map((word: string) => {
        const isfirstWord = firstWord === word
        return makeElementForWord(word, isfirstWord);
    }).join('');
    
}

function makeElementForWord(word: string, isfirstWord: boolean): string {
    if (word.match(/^[0-9]+$/)) {
        return '&nbsp&nbsp';
    } else {
        let prefix: string = '&nbsp';
        if (isfirstWord || word.match(/[.,:;]/)) {
            prefix = ''
        }
        return prefix + `<span id="${word}">${removeNumbers(word)}</span>`
    }
}

function removeNumbers(word: string): string {
    return word.split('').filter(letter => !letter.match(/[0-9]/)).join('');
}

function renderPoemAuthor(author: string) {
    const poemAuthorElement = document.getElementById(POEM_AUTHOR_DISPLAY_ID) as HTMLParagraphElement;
    poemAuthorElement.innerHTML = author.toUpperCase();
}

function centerThePoem(centered: boolean) {
    const poemAuthor = document.getElementById(POEM_AUTHOR_DISPLAY_ID) as HTMLParagraphElement;
    const poemElement = getPoemElementFromDOM();
    if (centered) {
        poemElement.style.textAlign = 'center';
        poemAuthor.style.textAlign = 'center';
    } else {
        poemElement.style.textAlign = 'left';
        poemAuthor.style.textAlign = 'left';
    }
    
}

function getPoemElementFromDOM(): HTMLParagraphElement {
    return document.getElementById(POEM_DISPLAY_ID) as HTMLParagraphElement;
}

