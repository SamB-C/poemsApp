"use strict";
// Types for data fetched from JSON
// Constants for ids
const POEM_DISPLAY_ID = '__poem_id__';
const POEM_AUTHOR_DISPLAY_ID = '__poem_author__';
const POEM_SELECT_DISPLAY_ID = '__poem_selection__';
const POEM_NOTAIONS_DISPLAY_ID = '__notations__';
const POEM_NOTES_DISPLAY_ID = '__notes__';
const POEM_QUOTES_DISPLAY_ID = '__quotes__';
const color = 'purple';
let highlightedText = [];
// Initialisation
fetch('../convertedPoems.json')
    .then(response => response.json())
    .then((data) => main(data));
function main(data) {
    const allPoemNames = Object.keys(data);
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
function renderPoem(poemContent, author, centered, notes, quotes) {
    const poemLines = poemContent.split(/\n/);
    const toRender = poemLines.map((line) => {
        return splitToWords(line) + '</br>';
    }).join('');
    const poemElement = getPoemElementFromDOM();
    poemElement.innerHTML = toRender;
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
    poemSelectElement.oninput = (event) => changePoem(event, currentPoemName, poemData);
}
function renderNotes(notesForPoem, quotesForPoem) {
    const notesElement = document.getElementById(POEM_NOTES_DISPLAY_ID);
    const quotesElement = document.getElementById(POEM_QUOTES_DISPLAY_ID);
    const checkboxes = [];
    addNotes(notesElement, Object.keys(notesForPoem), checkboxes);
    addQuotes(quotesElement, quotesForPoem, checkboxes);
    const textsToHighlight = quotesForPoem.concat(Object.keys(notesForPoem).map(key => notesForPoem[key]));
    initialiseEventHandlers(checkboxes, textsToHighlight, color);
}
function initialiseEventHandlers(checkboxes, textsToHighlight, color) {
    checkboxes.forEach((checkbox, index) => {
        checkbox.onclick = (event) => highlightNote(event, textsToHighlight[index], color, checkboxes);
    });
}
function addNotes(elmentToInsertInto, arrNotes, checkboxes) {
    arrNotes.forEach((noteText) => {
        insertNoteOrQuote(elmentToInsertInto, noteText, noteText, checkboxes);
    });
}
function addQuotes(elmentToInsertInto, arrQuotes, checkboxes) {
    arrQuotes.forEach((quote) => {
        const reducedQuote = quote.reduce((acc, curr) => acc + curr);
        insertNoteOrQuote(elmentToInsertInto, reducedQuote, removeNumbers(quote.join(' ')), checkboxes);
    });
}
function insertNoteOrQuote(elmentToInsertInto, idText, displayText, checkboxes) {
    const toggleSwitch = `<div class="switch_container" id="__${idText}_container__"><label class="switch"><input id="__${idText}_checkbox__" class="slider_checkbox" type="checkbox"><span class="slider round"></span></label></div>`;
    const textId = `__${idText}__`;
    const elementAsStr = `<div class="inline_container">${toggleSwitch}<p id="${textId}">${displayText}</p></div>`;
    elmentToInsertInto.insertAdjacentHTML('beforeend', elementAsStr);
    const elementAsElement = document.getElementById(textId);
    initialiseToggleSwitch(elementAsElement, checkboxes);
}
function initialiseToggleSwitch(paragraphElement, checkboxes) {
    const { toggleSwitchInputCheckbox } = getToggleSwitchFromParagraphElement(paragraphElement);
    checkboxes.push(toggleSwitchInputCheckbox);
}
function getToggleSwitchFromParagraphElement(paragraphElement) {
    const paragraphElementContainer = paragraphElement.parentElement;
    const toggleSwitchContainer = paragraphElementContainer.firstChild;
    const toggleSwitchLabel = toggleSwitchContainer.firstChild;
    const toggleSwitchInputCheckbox = toggleSwitchLabel.firstChild;
    const toggleSwitchBackground = toggleSwitchInputCheckbox.nextSibling;
    return { toggleSwitchInputCheckbox, toggleSwitchBackground, };
}
function highlightNote(event, textToHighlight, color, checkboxes) {
    const target = event.target;
    const targetBackground = target.nextSibling;
    if (target.checked) {
        unHighlightText();
        highlightText(textToHighlight, color);
        uncheckOtherCheckboxes(target, checkboxes);
        targetBackground.style.backgroundColor = 'green';
    }
    else {
        unHighlightText();
        targetBackground.style.backgroundColor = '#ccc';
    }
}
function uncheckOtherCheckboxes(checkboxToKeepChecked, checkboxes) {
    checkboxes.forEach(input => {
        const background = input.nextSibling;
        background.style.backgroundColor = '#ccc';
        if (input.id !== checkboxToKeepChecked.id) {
            input.checked = false;
        }
    });
}
function highlightText(textToHighlight, color) {
    textToHighlight.forEach((word) => {
        const wordSpan = document.getElementById(word);
        wordSpan.style.color = color;
    });
    highlightedText = textToHighlight;
}
function unHighlightText() {
    highlightedText.forEach((word) => {
        const wordSpan = document.getElementById(word);
        wordSpan.style.color = 'black';
    });
    highlightedText = [];
}
function changePoem(event, currentPoemName, poemData) {
    const target = event.target;
    const newPoemName = target.value;
    const poemContent = poemData[newPoemName].convertedPoem;
    const poemAuthor = poemData[newPoemName].author;
    const isCentered = poemData[newPoemName].centered;
    const poemNotes = poemData[newPoemName].notes;
    const poemQuotes = poemData[newPoemName].quotes;
    renderPoem(poemContent, poemAuthor, isCentered, poemNotes, poemQuotes);
    currentPoemName = newPoemName;
}
function splitToWords(line) {
    // Split at space of fake space
    const words = line.split(/ /);
    // Accumulator for reduce needs to start as '' so first word gets split as well.
    words.unshift('');
    const wordSectionsString = words.reduce((acc, word) => {
        const wordSections = word.split('|+|');
        return acc + ' ' + wordSections.join(' ');
    });
    const wordSections = wordSectionsString.split(' ');
    const firstWord = wordSections.filter(word => !word.match(/^[0-9]+$/))[0];
    return wordSections.map((word) => {
        const isfirstWord = firstWord === word;
        return makeElementForWord(word, isfirstWord);
    }).join('');
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
function removeNumbers(word) {
    return word.split('').filter(letter => !letter.match(/[0-9]/)).join('');
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
