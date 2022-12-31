// Types for data fetched from JSON

type Quotes = Array<Array<string>>

type Notes = {
    [noteText: string]: Array<string>
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


// Constants for ids
const POEM_DISPLAY_ID: string = '__poem_id__';
const POEM_AUTHOR_DISPLAY_ID: string = '__poem_author__';
const POEM_SELECT_DISPLAY_ID: string = '__poem_selection__';
const POEM_NOTAIONS_DISPLAY_ID: string = '__notations__';
const POEM_NOTES_DISPLAY_ID: string = '__notes__';
const POEM_QUOTES_DISPLAY_ID: string = '__quotes__';

const color = 'purple';

let highlightedText: Array<string> = [];

// Initialisation
fetch('../convertedPoems.json')
    .then(response => response.json())
    .then((data: ConvertedPoems) => main(data));


function main(data: ConvertedPoems): void {
    const allPoemNames: Array<string> = Object.keys(data);
    let currentPoemName = allPoemNames[0];
    renderPoemSelect(allPoemNames, currentPoemName, data);
    
    const currentPoemContent = data[currentPoemName].convertedPoem;
    const currentPoemAuthor = data[currentPoemName].author;
    const isCurrentPoemCentered = data[currentPoemName].centered;
    const currentPoemNotes = data[currentPoemName].notes;
    const currentPoemQuotes = data[currentPoemName].quotes;
    renderPoem(currentPoemContent, currentPoemAuthor, isCurrentPoemCentered, currentPoemNotes, currentPoemQuotes);
}


// Rendering
function renderPoem(poemContent: string, author: string, centered: boolean, notes: Notes, quotes: Quotes): void {
    const poemLines: Array<string> = poemContent.split(/\n/);
    const toRender = poemLines.map((line: string): string => {
        return splitToWords(line) + '</br>';
    }).join('');
    
    const poemElement = getPoemElementFromDOM();
    poemElement.innerHTML = toRender;
    renderPoemAuthor(author);
    
    centerThePoem(centered);

    renderNotes(notes, quotes);
}

function renderPoemSelect(poemNames: Array<string>, currentPoemName: string, poemData: ConvertedPoems) {
    const selectionOptions: Array<string> = poemNames.map((poemName: string): string => {
        if (poemName === currentPoemName) {
            return `<option value="${poemName}" selected="seleted">${poemName}</option>`
        } else {
            return  `<option value="${poemName}">${poemName}</option>`
        }
    });
    const poemSelectElement = document.getElementById(POEM_SELECT_DISPLAY_ID) as HTMLSelectElement;
    poemSelectElement.innerHTML = selectionOptions.reduce((acc: string, current: string) => acc + current);
    poemSelectElement.oninput = (event) => changePoem(event, currentPoemName, poemData);
}

function renderNotes(notesForPoem: Notes, quotesForPoem: Quotes) {
    const notesElement = document.getElementById(POEM_NOTES_DISPLAY_ID) as HTMLDivElement;
    const quotesElement = document.getElementById(POEM_QUOTES_DISPLAY_ID) as HTMLDivElement;

    addNotes(notesElement, Object.keys(notesForPoem), notesForPoem, color);

    addQuotes(quotesElement, quotesForPoem, color);
}

function addNotes(elmentToInsertInto: HTMLDivElement, arrNotes: Array<string>, notesObject: Notes, color: string): void {
    arrNotes.forEach((noteText) => {
        const noteTextElementAsStr = `<p id="${noteText}">${noteText}</p>`
        elmentToInsertInto.insertAdjacentHTML('beforeend', noteTextElementAsStr);
        const noteTextElement = document.getElementById(noteText) as HTMLParagraphElement;
        noteTextElement.onclick = (event) => highlightNote(event, notesObject[noteText], color);
        noteTextElement.style.cursor = "pointer";
    });
}

function addQuotes(elmentToInsertInto: HTMLDivElement, arrQuotes: Quotes, color: string) {
    arrQuotes.forEach((quote: Array<string>) => {
        const reducedQuote: string = quote.reduce((acc: string, curr: string) => acc + curr);
        const quoteElementAsStr = `<p id="${reducedQuote}">${removeNumbers(quote.join(' '))}</p>`;
        elmentToInsertInto.insertAdjacentHTML('beforeend', quoteElementAsStr);
        const quoteElement: HTMLParagraphElement = document.getElementById(reducedQuote) as HTMLParagraphElement;
        quoteElement.onclick = (event) => highlightNote(event, quote, color);
        quoteElement.style.cursor = "pointer";
    });
}

function highlightNote(event: Event, textToHighlight: Array<string>, color: string) {
    const target = event.target as HTMLElement;
    if (target.style.color !== color) {
        unHighlightText()
        highlightText(textToHighlight.concat([target.id]), color);
    } else {
        unHighlightText();
    }

}

function highlightText(textToHighlight: Array<string>, color: string) {
    textToHighlight.forEach((word: string) => {
        const wordSpan = document.getElementById(word) as HTMLSpanElement;
        wordSpan.style.color = color;
    });
    highlightedText = textToHighlight;
}

function unHighlightText() {
    highlightedText.forEach((word: string) => {
        const wordSpan = document.getElementById(word) as HTMLSpanElement;
        wordSpan.style.color = 'black';
    });
    highlightedText = [];
}

function changePoem(event: Event, currentPoemName: string, poemData: ConvertedPoems): void {
    const target = event.target as HTMLSelectElement
    const newPoemName = target.value;
    const poemContent = poemData[newPoemName].convertedPoem;
    const poemAuthor = poemData[newPoemName].author;
    const isCentered = poemData[newPoemName].centered;
    const poemNotes = poemData[newPoemName].notes;
    const poemQuotes = poemData[newPoemName].quotes;
    renderPoem(poemContent, poemAuthor, isCentered, poemNotes, poemQuotes);
    currentPoemName = newPoemName;
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
    const poemSelectElement = document.getElementById(POEM_SELECT_DISPLAY_ID) as HTMLSelectElement
    const poemElement = getPoemElementFromDOM();
    const poemAuthor = document.getElementById(POEM_AUTHOR_DISPLAY_ID) as HTMLParagraphElement;
    if (centered) {
        poemSelectElement.style.textAlign = 'center';
        poemElement.style.textAlign = 'center';
        poemAuthor.style.textAlign = 'center';
    } else {
        poemSelectElement.style.textAlign = 'left';
        poemElement.style.textAlign = 'left';
        poemAuthor.style.textAlign = 'left';
    }
    
}

function getPoemElementFromDOM(): HTMLParagraphElement {
    return document.getElementById(POEM_DISPLAY_ID) as HTMLParagraphElement;
}

