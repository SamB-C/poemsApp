import { addNotes, addQuotes, currentQuote, highlightedText, highlightText, initialiseEventHandlers, unHighlightText } from './NotesAndQuotes.js';
import { removeNumbers } from './utilities.js';
// Constants for ids
const POEM_DISPLAY_ID = '__poem_id__';
const POEM_AUTHOR_DISPLAY_ID = '__poem_author__';
const POEM_SELECT_DISPLAY_ID = '__poem_selection__';
const POEM_NOTES_DISPLAY_ID = '__notes__';
const POEM_QUOTES_DISPLAY_ID = '__quotes__';
const ADD_NEW_QUOTE_DISPLAY_ID = '__add_new_quote__';
const ADD_NEW_NOTE_DISPLAY_ID = '__add_new_note__';
// Other constants
export const serverAddress = 'http://localhost:8080/';
const color = 'purple';
export let currentPoemName = '';
// Initialisation
fetch(`${serverAddress}convertedPoems.json`)
    .then(response => response.json())
    .then((data) => main(data, Object.keys(data)[0]));
export function main(data, initialPoemName) {
    const allPoemNames = Object.keys(data);
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
function renderPoem(poemContent, author, centered, notes, quotes) {
    const poemLines = poemContent.split(/\n/);
    const toRender = poemLines.map((line) => {
        return splitToWords(line) + '</br>';
    }).join('');
    const poemElement = getPoemElementFromDOM();
    poemElement.innerHTML = toRender;
    poemLines.forEach(line => addEventListenerToWords(poemContent, line));
    renderPoemAuthor(author);
    centerThePoem(centered);
    renderNotes(notes, quotes);
}
function renderPoemSelect(poemNames, currentPoemName, poemData) {
    const selectionOptions = poemNames.map((poemName) => {
        if (poemName === currentPoemName) {
            return `<option value="${poemName}" selected="seleted">${poemName}</option>`;
        }
        else {
            return `<option value="${poemName}">${poemName}</option>`;
        }
    });
    const poemSelectElement = document.getElementById(POEM_SELECT_DISPLAY_ID);
    poemSelectElement.innerHTML = selectionOptions.reduce((acc, current) => acc + current);
    poemSelectElement.oninput = (event) => changePoem(event, poemData);
}
function renderNotes(notesForPoem, quotesForPoem) {
    const notesElement = document.getElementById(POEM_NOTES_DISPLAY_ID);
    const quotesElement = document.getElementById(POEM_QUOTES_DISPLAY_ID);
    const checkboxes = [];
    let textsToHighlight = [];
    quotesElement.innerHTML = '<h1>Quotes:</h1>';
    if (quotesForPoem) {
        addQuotes(quotesElement, quotesForPoem, checkboxes, currentPoemName);
        textsToHighlight = textsToHighlight.concat(quotesForPoem);
    }
    else {
        quotesElement.insertAdjacentHTML('beforeend', '<p><i>None</i></p>');
    }
    quotesElement.insertAdjacentHTML('beforeend', `<button id="${ADD_NEW_QUOTE_DISPLAY_ID}">&plus;</button>`);
    const addNewQuoteButton = document.getElementById(ADD_NEW_QUOTE_DISPLAY_ID);
    addNewQuoteButton.onclick = () => {
        const newQuotes = [...quotesForPoem, []];
        renderNotes(notesForPoem, newQuotes);
    };
    notesElement.innerHTML = '<h1>Notes:</h1>';
    if (notesForPoem) {
        const notesKeys = Object.keys(notesForPoem);
        const notesValues = notesKeys.map(key => notesForPoem[key]);
        addNotes(notesElement, notesKeys, checkboxes, currentPoemName);
        textsToHighlight = textsToHighlight.concat(notesValues);
    }
    else {
        notesElement.insertAdjacentHTML('beforeend', '<p><i>None</i></p>');
    }
    notesElement.insertAdjacentHTML('beforeend', `<button id="${ADD_NEW_NOTE_DISPLAY_ID}">&plus;</button>`);
    const addNewNoteButton = document.getElementById(ADD_NEW_NOTE_DISPLAY_ID);
    addNewNoteButton.onclick = () => {
        const newNotes = Object.assign(Object.assign({}, notesForPoem), { '<i>New Note</i>': [] });
        renderNotes(newNotes, quotesForPoem);
    };
    initialiseEventHandlers(checkboxes, textsToHighlight, color);
}
function changePoem(event, poemData) {
    const target = event.target;
    const newPoemName = target.value;
    const poemContent = poemData[newPoemName].convertedPoem;
    const poemAuthor = poemData[newPoemName].author;
    const isCentered = poemData[newPoemName].centered;
    const poemNotes = poemData[newPoemName].notes;
    const poemQuotes = poemData[newPoemName].quotes;
    currentPoemName = newPoemName;
    renderPoem(poemContent, poemAuthor, isCentered, poemNotes, poemQuotes);
}
function splitToWords(line) {
    const wordSections = getWordSections(line);
    const firstWord = wordSections.filter(word => !word.match(/^[0-9]+$/))[0];
    return wordSections.map((word) => {
        const isfirstWord = firstWord === word;
        return makeElementForWord(word, isfirstWord);
    }).join('');
}
function getWordSections(line) {
    // Split at space of fake space
    const words = line.split(/ /);
    // Accumulator for reduce needs to start as '' so first word gets split as well.
    words.unshift('');
    const wordSectionsString = words.reduce((acc, word) => {
        const wordSections = word.split('|+|');
        return acc + ' ' + wordSections.join(' ');
    });
    return wordSectionsString.split(' ');
}
function makeElementForWord(word, isfirstWord) {
    if (word.match(/^[0-9]+$/)) {
        return '&nbsp&nbsp';
    }
    else {
        let prefix = '&nbsp';
        if (isfirstWord || word.match(/[.,:;]/)) {
            prefix = '';
        }
        return prefix + `<span id="${word}">${removeNumbers(word)}</span>`;
    }
}
// Sorts the missing word in the poem into the order of appearance so they can be focused in order
function insertionSortIntoOrderInPoem(poem, words) {
    for (let i = 1; i < words.length; i++) {
        let currentWordIndex = i;
        let comparingWordIndex = i - 1;
        while (poem.indexOf(words[currentWordIndex]) < poem.indexOf(words[comparingWordIndex])) {
            [words[comparingWordIndex], words[currentWordIndex]] = [words[currentWordIndex], words[comparingWordIndex]];
            currentWordIndex--;
            comparingWordIndex--;
            if (currentWordIndex === 0) {
                break;
            }
        }
    }
    return words;
}
function addEventListenerToWords(poem, line) {
    const wordSections = getWordSections(line);
    const validWords = wordSections
        .filter(word => !word.match(/^[0-9]+$/))
        .filter(word => word !== '');
    validWords.forEach(word => {
        const wordElement = document.getElementById(word);
        wordElement.onclick = () => wordEventListener(wordElement, word, poem);
        wordElement.style.cursor = 'pointer';
    });
}
function wordEventListener(wordElement, word, poem) {
    if (wordElement.style.color === 'purple') {
        unHighlightText([word]);
        const index = highlightedText.indexOf(word);
        highlightedText.splice(index, 1);
    }
    else {
        highlightText([word], 'purple');
        highlightedText.push(word);
    }
    if (currentQuote !== undefined) {
        changeQuoteText(poem, currentQuote);
    }
}
function changeQuoteText(poem, quoteParagraphElement) {
    const content = insertionSortIntoOrderInPoem(poem, highlightedText);
    let result = '';
    content.forEach(word => {
        const noNumbers = removeNumbers(word);
        let prefix = ' ';
        if (noNumbers.match(/[.,:;]/)) {
            prefix = '';
        }
        result = result + prefix + noNumbers;
    });
    quoteParagraphElement.innerHTML = result;
}
function renderPoemAuthor(author) {
    const poemAuthorElement = document.getElementById(POEM_AUTHOR_DISPLAY_ID);
    poemAuthorElement.innerHTML = author.toUpperCase();
}
function centerThePoem(centered) {
    const poemSelectElement = document.getElementById(POEM_SELECT_DISPLAY_ID);
    const poemElement = getPoemElementFromDOM();
    const poemAuthor = document.getElementById(POEM_AUTHOR_DISPLAY_ID);
    if (centered) {
        poemSelectElement.style.textAlign = 'center';
        poemElement.style.textAlign = 'center';
        poemAuthor.style.textAlign = 'center';
    }
    else {
        poemSelectElement.style.textAlign = 'left';
        poemElement.style.textAlign = 'left';
        poemAuthor.style.textAlign = 'left';
    }
}
function getPoemElementFromDOM() {
    return document.getElementById(POEM_DISPLAY_ID);
}
