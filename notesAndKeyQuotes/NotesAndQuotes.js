import { removeNumbers } from "./utilities.js";
let highlightedText = [];
export function initialiseEventHandlers(checkboxes, textsToHighlight, color) {
    checkboxes.forEach((checkbox, index) => {
        checkbox.onclick = (event) => highlightNote(event, textsToHighlight[index], color, checkboxes);
    });
}
export function addNotes(elmentToInsertInto, arrNotes, checkboxes) {
    arrNotes.forEach((noteText) => {
        insertNoteOrQuote(elmentToInsertInto, noteText, noteText, checkboxes);
    });
}
export function addQuotes(elmentToInsertInto, arrQuotes, checkboxes) {
    arrQuotes.forEach((quote) => {
        const reducedQuote = quote.reduce((acc, curr) => acc + curr);
        insertNoteOrQuote(elmentToInsertInto, reducedQuote, removeNumbers(quote.join(' ')), checkboxes);
    });
}
function insertNoteOrQuote(elmentToInsertInto, idText, displayText, checkboxes) {
    const toggleSwitch = `<div class="switch_container" id="__${idText}_container__"><label class="switch"><input id="__${idText}_checkbox__" class="slider_checkbox" type="checkbox"><span class="slider round"></span></label></div>`;
    const textId = `__${idText}__`;
    const elementAsStr = `<div class="inline_container">${toggleSwitch}<p id="${textId}" class="note_or_quote_text">${displayText}</p></div>`;
    elmentToInsertInto.insertAdjacentHTML('beforeend', elementAsStr);
    const elementAsElement = document.getElementById(textId);
    initialiseToggleSwitch(elementAsElement, checkboxes);
}
function initialiseToggleSwitch(paragraphElement, checkboxes) {
    const { toggleSwitchInputCheckbox } = getToggleSwitchFromParagraphElement(paragraphElement);
    toggleSwitchInputCheckbox.style.opacity = '0';
    toggleSwitchInputCheckbox.style.width = '0';
    toggleSwitchInputCheckbox.style.height = '0';
    const parent = toggleSwitchInputCheckbox.parentElement;
    parent.style.marginRight = '1vh';
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
