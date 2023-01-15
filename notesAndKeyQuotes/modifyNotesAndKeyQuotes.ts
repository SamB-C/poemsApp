import { addNotes, addQuotes, highlightedText, highlightText, initialiseEventHandlers, unHighlightText } from './NotesAndQuotes.js';
import { ConvertedPoems, Notes, Quotes, removeNumbers } from './utilities.js';

// Constants for ids
const POEM_DISPLAY_ID: string = '__poem_id__';
const POEM_AUTHOR_DISPLAY_ID: string = '__poem_author__';
const POEM_SELECT_DISPLAY_ID: string = '__poem_selection__';
const POEM_NOTES_DISPLAY_ID: string = '__notes__';
const POEM_QUOTES_DISPLAY_ID: string = '__quotes__';
const ADD_NEW_QUOTE_DISPLAY_ID: string = '__add_new_quote__';
const ADD_NEW_NOTE_DISPLAY_ID: string = '__add_new_note__';

// Other constants
export const serverAddress = 'http://localhost:8080/';
const color = 'purple';

export let currentPoemName: string = '';

// Initialisation
fetch(`${serverAddress}convertedPoems.json`)
    .then(response => response.json())
    .then((data: ConvertedPoems) => main(data, Object.keys(data)[0]));


export function main(data: ConvertedPoems, initialPoemName: string): void {
    const allPoemNames: Array<string> = Object.keys(data);
    currentPoemName = initialPoemName;
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

    poemLines.forEach(line => addEventListenerToWords(line));

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
    poemSelectElement.oninput = (event) => changePoem(event, poemData);
}

function renderNotes(notesForPoem: Notes, quotesForPoem: Quotes) {
    const notesElement = document.getElementById(POEM_NOTES_DISPLAY_ID) as HTMLDivElement;
    const quotesElement = document.getElementById(POEM_QUOTES_DISPLAY_ID) as HTMLDivElement;
    const checkboxes: Array<HTMLInputElement> = [];
    let textsToHighlight: Array<Array<string>> = [];

    quotesElement.innerHTML = '<h1>Quotes:</h1>';
    if (quotesForPoem) {
        addQuotes(quotesElement, quotesForPoem, checkboxes, currentPoemName);
        textsToHighlight = textsToHighlight.concat(quotesForPoem)
    } else {
        quotesElement.insertAdjacentHTML('beforeend', '<p><i>None</i></p>');
    }
    quotesElement.insertAdjacentHTML('beforeend', `<button id="${ADD_NEW_QUOTE_DISPLAY_ID}">&plus;</button>`);
    const addNewQuoteButton = document.getElementById(ADD_NEW_QUOTE_DISPLAY_ID) as HTMLButtonElement;
    addNewQuoteButton.onclick = () => {
        const newQuotes: Quotes = [...quotesForPoem, []];
        renderNotes(notesForPoem, newQuotes);
    }

    
    notesElement.innerHTML = '<h1>Notes:</h1>';
    if (notesForPoem) {
        const notesKeys = Object.keys(notesForPoem);
        const notesValues = notesKeys.map(key => notesForPoem[key]);
        addNotes(notesElement, notesKeys, checkboxes, currentPoemName);
        textsToHighlight = textsToHighlight.concat(notesValues)
    } else {
        notesElement.insertAdjacentHTML('beforeend', '<p><i>None</i></p>')
    }
    notesElement.insertAdjacentHTML('beforeend', `<button id="${ADD_NEW_NOTE_DISPLAY_ID}">&plus;</button>`);
    const addNewNoteButton = document.getElementById(ADD_NEW_NOTE_DISPLAY_ID) as HTMLButtonElement;
    addNewNoteButton.onclick = () => {
        const newNotes: Notes = {
            ...notesForPoem,
            '<i>New Note</i>': []
        }
        renderNotes(newNotes, quotesForPoem)
    }
    
    initialiseEventHandlers(checkboxes, textsToHighlight, color);
}


function changePoem(event: Event, poemData: ConvertedPoems): void {
    const target = event.target as HTMLSelectElement
    const newPoemName = target.value;
    const poemContent = poemData[newPoemName].convertedPoem;
    const poemAuthor = poemData[newPoemName].author;
    const isCentered = poemData[newPoemName].centered;
    const poemNotes = poemData[newPoemName].notes;
    const poemQuotes = poemData[newPoemName].quotes;
    currentPoemName = newPoemName;
    renderPoem(poemContent, poemAuthor, isCentered, poemNotes, poemQuotes);
}

function splitToWords(line: string): string {
    const wordSections = getWordSections(line);
    const firstWord = wordSections.filter(word => !word.match(/^[0-9]+$/))[0];
    return wordSections.map((word: string) => {
        const isfirstWord = firstWord === word
        return makeElementForWord(word, isfirstWord);
    }).join('');
    
}

function getWordSections(line: string): Array<string> {
    // Split at space of fake space
    const words: Array<string> = line.split(/ /);
    // Accumulator for reduce needs to start as '' so first word gets split as well.
    words.unshift('')
    const wordSectionsString: string = words.reduce((acc: string, word: string) => {
        const wordSections: Array<string> = word.split('|+|');
        return acc + ' ' + wordSections.join(' ')
    })
    return wordSectionsString.split(' ');
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

function addEventListenerToWords(line: string): void {
    const wordSections = getWordSections(line);
    const validWords = wordSections
                            .filter(word => !word.match(/^[0-9]+$/))
                            .filter(word => word !== '');
    validWords.forEach(word => {
        const wordElement = document.getElementById(word) as HTMLSpanElement;
        wordElement.onclick = () => {
            if (wordElement.style.color === 'purple') {
                unHighlightText([word]);
                const index = highlightedText.indexOf(word);
                highlightedText.splice(index, 1);
            } else {
                highlightText([word], 'purple');
                highlightedText.push(word);
            }
        }
        wordElement.style.cursor = 'pointer';
    })
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

