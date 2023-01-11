import { removeNumbers } from "./utilities.js";
let highlightedText = [];
export function initialiseEventHandlers(checkboxes, textsToHighlight, color) {
    checkboxes.forEach((checkbox, index) => {
        checkbox.onclick = (event) => highlightNote(event, textsToHighlight[index], color, checkboxes);
    });
}
export function addNotes(elmentToInsertInto, arrNotes, checkboxes, poemName) {
    arrNotes.forEach((noteText) => {
        const newNoteElement = insertNoteOrQuote(elmentToInsertInto, noteText, noteText);
        initialiseToggleSwitch(newNoteElement, checkboxes);
        initialiseDeleteButton(newNoteElement, noteText, 'Note', poemName);
    });
}
export function addQuotes(elmentToInsertInto, arrQuotes, checkboxes, poemName) {
    arrQuotes.forEach((quote) => {
        const reducedQuote = quote.join(' ');
        const newQuoteElement = insertNoteOrQuote(elmentToInsertInto, reducedQuote, removeNumbers(quote.join(' ')));
        initialiseToggleSwitch(newQuoteElement, checkboxes);
        initialiseDeleteButton(newQuoteElement, reducedQuote, "Quote", poemName);
    });
}
function insertNoteOrQuote(elmentToInsertInto, idText, displayText) {
    const toggleSwitch = `<div class="switch_container" id="__${idText}_container__"><label class="switch"><input id="__${idText}_checkbox__" class="slider_checkbox" type="checkbox"><span class="slider round"></span></label></div>`;
    const deleteButton = `<button>&times;</button>`;
    const modal_options = '<div class="inline_container"><div class="modal_options"><button>Yes</button><button>No</button></div></div>';
    const modal = `<div class="modal"><div class="modal-content"><span class="close">&times;</span><p>Are you sure you want to delete:</p><p>"${displayText}"</p>${modal_options}</div></div>`;
    const textId = `__${idText}__`;
    const elementAsStr = `<div class="inline_container">${toggleSwitch}<p id="${textId}" class="note_or_quote_text">${displayText}</p>${deleteButton}${modal}</div>`;
    elmentToInsertInto.insertAdjacentHTML('beforeend', elementAsStr);
    const elementAsElement = document.getElementById(textId);
    return elementAsElement;
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
function initialiseDeleteButton(paragraphElement, jsonRepresentation, noteOrQuote, poemName) {
    const deleteButtonElement = paragraphElement.nextSibling;
    const modal = deleteButtonElement.nextSibling;
    const modalContent = modal.firstChild;
    const close = modalContent.firstChild;
    close.onclick = () => {
        modal.style.display = "none";
    };
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
    deleteButtonElement.onclick = () => {
        modal.style.display = 'block';
    };
    const modalOptionsContainer = modalContent.lastChild;
    const modalOptions = modalOptionsContainer.firstChild;
    const optionYes = modalOptions.firstChild;
    const optionNo = modalOptions.lastChild;
    optionNo.onclick = () => {
        modal.style.display = 'none';
    };
    optionYes.onclick = () => {
        fetch("http://localhost:8080/post", {
            method: "DELETE",
            body: JSON.stringify({ identifierFor: noteOrQuote, identifier: jsonRepresentation, poemName, }),
        }).then(res => console.log('Request Complete! response: ', res));
    };
}
