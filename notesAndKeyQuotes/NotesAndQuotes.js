var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { currentPoemName, main, renderNotes, serverAddress } from "./modifyNotesAndKeyQuotes.js";
import { highlightText, removeNumbers, unHighlightText } from "./utilities.js";
const NOTE_NODE_TYPE = 'SPAN';
const QUOTE_NODE_TYPE = 'P';
export let highlightedText = [];
export let currentQuote = undefined;
export function initialiseEventHandlers(checkboxes, textsToHighlight, color) {
    checkboxes.forEach((checkbox, index) => {
        checkbox.onclick = (event) => highlightNote(event, textsToHighlight[index], color, checkboxes);
    });
}
export function addNotes(elmentToInsertInto, arrNotes, checkboxes, poemName) {
    arrNotes.forEach((noteText) => {
        const newNoteElement = insertNoteOrQuote(elmentToInsertInto, noteText, noteText, "Note");
        initialiseToggleSwitch(newNoteElement, checkboxes);
        initialiseDeleteButton(newNoteElement, noteText, 'Note', poemName);
        newNoteElement.onclick = () => {
            const toggleSwitch = getToggleSwitchFromParagraphElement(newNoteElement).toggleSwitchInputCheckbox;
            if (toggleSwitch.checked === false) {
                toggleSwitch.click();
            }
        };
    });
}
export function addQuotes(elmentToInsertInto, arrQuotes, checkboxes, poemName) {
    arrQuotes.forEach((quote) => {
        const reducedQuote = quote.join(' ');
        const newQuoteElement = insertNoteOrQuote(elmentToInsertInto, reducedQuote, removeNumbers(quote.join(' ')), "Quote");
        initialiseToggleSwitch(newQuoteElement, checkboxes);
        initialiseDeleteButton(newQuoteElement, reducedQuote, "Quote", poemName);
        newQuoteElement.onclick = () => {
            const toggleSwitch = getToggleSwitchFromParagraphElement(newQuoteElement).toggleSwitchInputCheckbox;
            toggleSwitch.click();
        };
        newQuoteElement.style.cursor = 'pointer';
    });
}
function insertNoteOrQuote(elmentToInsertInto, idText, displayText, noteType) {
    const toggleSwitch = `<div class="switch_container" id="__${idText}_container__"><label class="switch"><input id="__${idText}_checkbox__" class="slider_checkbox" type="checkbox"><span class="slider round"></span></label></div>`;
    const deleteButton = `<div class="vertical_center delete_button_container"><span class="cross_button">&times;</span></div>`;
    const modal_options = '<div class="inline_container"><div class="modal_options"><button>Yes</button><button>No</button></div></div>';
    const modal = `<div class="modal"><div class="modal-content"><span class="cross_button">&times;</span><p>Are you sure you want to delete:</p><p id="__modal_quote__">"${displayText}"</p>${modal_options}</div></div>`;
    const textId = `__${idText}__`;
    const elementAsStr = getElementAsStr(toggleSwitch, textId, displayText, deleteButton, modal, noteType);
    elmentToInsertInto.insertAdjacentHTML('beforeend', elementAsStr);
    const elementAsElement = document.getElementById(textId);
    return elementAsElement;
}
function getElementAsStr(toggleSwitch, textId, displayText, deleteButton, modal, noteType) {
    if (noteType === "Note") {
        return `<div class="inline_container">${toggleSwitch}<span role="textbox" contenteditable id="${textId}" placeholder="Add a note here" class="note_or_quote_text note_input_box">${displayText}</span>${deleteButton}${modal}</div>`;
    }
    else {
        if (displayText === '') {
            displayText = '<i>New Quote</i>';
        }
        return `<div class="inline_container">${toggleSwitch}<p id="${textId}" class="note_or_quote_text">${displayText}</p>${deleteButton}${modal}</div>`;
    }
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
    const highlightedTextCopy = [...highlightedText];
    if (target.checked) {
        // Deal with highlighting text
        unHighlightText(highlightedText);
        highlightedText = [];
        highlightText(textToHighlight, color);
        highlightedText = textToHighlight;
        uncheckOtherCheckboxes(target, checkboxes, highlightedTextCopy);
        targetBackground.style.backgroundColor = 'green';
        // Make the currentQuote be the selected quote
        const labelElement = target.parentElement;
        const switchContainer = labelElement.parentElement;
        const notationSection = switchContainer.nextSibling;
        if (notationSection.nodeName === QUOTE_NODE_TYPE) {
            const textSection = notationSection;
            currentQuote = textSection;
        }
        else {
            currentQuote = undefined;
        }
    }
    else {
        unHighlightText(highlightedText);
        highlightedText = [];
        targetBackground.style.backgroundColor = '#ccc';
        updateNoteOrQuote(target, highlightedTextCopy);
        currentQuote = undefined;
    }
}
function uncheckOtherCheckboxes(checkboxToKeepChecked, checkboxes, associatedText) {
    checkboxes.forEach(input => {
        const background = input.nextSibling;
        background.style.backgroundColor = '#ccc';
        if (input.id !== checkboxToKeepChecked.id && input.checked) {
            input.checked = false;
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield updateNoteOrQuote(input, associatedText);
                const checkboxToKeepCheckedElement = document.getElementById(checkboxToKeepChecked.id);
                checkboxToKeepCheckedElement.click();
            }), 400);
        }
    });
}
function updateNoteOrQuote(unchecked, associatedText) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the content of the quote when it was rendered
        let currentNoteOrQuote = unchecked.id.split('_').filter(el => el !== '')[0];
        let noteTextElement;
        if (unchecked.id === '___checkbox__') {
            currentNoteOrQuote = '__NEW__';
            noteTextElement = document.getElementById('____');
        }
        else {
            noteTextElement = document.getElementById(`__${currentNoteOrQuote}__`);
        }
        if (noteTextElement.nodeName === NOTE_NODE_TYPE) {
            const noteElement = noteTextElement;
            const newNoteText = noteElement.innerText;
            const newVersion = {
                key: newNoteText,
                value: associatedText
            };
            const body = {
                poemName: currentPoemName,
                noteType: 'Note',
                oldIdentifier: currentNoteOrQuote,
                newVersion,
            };
            yield fetch(`${serverAddress}/note`, {
                method: 'POST',
                body: JSON.stringify(body)
            }).then((res) => displayResposnseError(res, "Note", body.newVersion));
        }
        else {
            const body = {
                poemName: currentPoemName,
                noteType: 'Quote',
                oldIdentifier: currentNoteOrQuote,
                newVersion: associatedText
            };
            yield fetch(`${serverAddress}/quote`, {
                method: 'POST',
                body: JSON.stringify(body)
            }).then((res) => displayResposnseError(res, "Quote", body.newVersion));
        }
        yield fetch(`${serverAddress}convertedPoems.json`)
            .then(response => response.json())
            .then((data) => {
            renderNotes(data[currentPoemName].notes, data[currentPoemName].quotes);
        });
    });
}
function displayResposnseError(res, NotationType, badQuoteOrNote) {
    return __awaiter(this, void 0, void 0, function* () {
        const err = yield res.json();
        console.log(err);
        if (err.errorType !== 'No error') {
            let errorMessage = '';
            if (NotationType === "Quote") {
                const badQuote = badQuoteOrNote;
                const erroneousQuote = badQuote.map(word => removeNumbers(word)).join(' ');
                if (err.errorType === 'Quote overlap') {
                    const incorrectWord = removeNumbers(err.error);
                    errorMessage = `Quote: "${erroneousQuote}" is invalid because word "${incorrectWord}" overlaps with another quote.`;
                }
                else if (err.errorType === 'Words not consecutive') {
                    const incorrectSequence = err.error.incorrectSequence.map(word => removeNumbers(word));
                    const correctSequence = err.error.correctSequence.map(word => removeNumbers(word));
                    errorMessage = `Quote: "${erroneousQuote}" is invalid because words "${incorrectSequence.join(' ')}" are not consecutive.</br>Word "${correctSequence[0]}" should be followed by "${correctSequence[1]}".`;
                }
            }
            else {
                if (err.errorType === 'Note overlap four times') {
                    const badNote = badQuoteOrNote;
                    const erroneousNoteText = badNote.key;
                    const erroneousNoteValue = badNote.value.map(word => removeNumbers(word)).join(' ');
                    const badWord = removeNumbers(err.error);
                    errorMessage = `Note: "${erroneousNoteText}" with words "${erroneousNoteValue}" is invalid becauseword "${badWord}" overlaps with three other notes.`;
                }
            }
            // Alert the user
            const errorMessageModal = document.getElementById('__error_message_modal__');
            const close = document.getElementById('__error_message__exit__');
            const errorMessageText = document.getElementById('__error_message__');
            close.onclick = () => errorMessageModal.style.display = 'none';
            window.onclick = (event) => {
                if (event.target == errorMessageModal) {
                    errorMessageModal.style.display = 'none';
                }
            };
            errorMessageText.innerHTML = errorMessage;
            errorMessageModal.style.display = 'block';
        }
    });
}
function initialiseDeleteButton(paragraphElement, jsonRepresentation, noteOrQuote, poemName) {
    const deleteButtonElementContainer = paragraphElement.nextSibling;
    const deleteButtonElement = deleteButtonElementContainer.firstChild;
    const modal = deleteButtonElementContainer.nextSibling;
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
        var _a, _b;
        modal.style.display = 'block';
        const modalQuote = (_b = (_a = modalContent.firstChild) === null || _a === void 0 ? void 0 : _a.nextSibling) === null || _b === void 0 ? void 0 : _b.nextSibling;
        if (paragraphElement.nodeName === 'INPUT') {
            const displayTextElement = paragraphElement;
            modalQuote.innerText = `"${displayTextElement.value}"`;
        }
        else {
            modalQuote.innerText = `"${paragraphElement.innerHTML.trim()}"`;
        }
    };
    const modalOptionsContainer = modalContent.lastChild;
    const modalOptions = modalOptionsContainer.firstChild;
    const optionYes = modalOptions.firstChild;
    const optionNo = modalOptions.lastChild;
    optionNo.onclick = () => {
        modal.style.display = 'none';
    };
    optionYes.onclick = () => {
        fetch(`${serverAddress}/post`, {
            method: "DELETE",
            body: JSON.stringify({ identifierFor: noteOrQuote, identifier: jsonRepresentation, poemName, }),
        }).then(res => console.log('Request Complete! response: ', res));
        fetch(`${serverAddress}convertedPoems.json`)
            .then(response => response.json())
            .then((data) => main(data, currentPoemName));
    };
}
