import { currentPoemName, main, renderNotes, serverAddress } from "./modifyNotesAndKeyQuotes.js";
import { removeNumbers } from "./utilities.js";
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
            toggleSwitch.click();
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
        return `<div class="inline_container">${toggleSwitch}<input id="${textId}" placeholder="Add a note here" class="note_or_quote_text note_input_box", value="${displayText}"></input>${deleteButton}${modal}</div>`;
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
    console.log('hi');
    const target = event.target;
    const targetBackground = target.nextSibling;
    const highlightedTextCopy = [...highlightedText];
    if (target.checked) {
        unHighlightText(highlightedText);
        highlightedText = [];
        highlightText(textToHighlight, color);
        highlightedText = textToHighlight;
        uncheckOtherCheckboxes(target, checkboxes, highlightedTextCopy);
        targetBackground.style.backgroundColor = 'green';
        // Make the currentQuote be the selected quote 
        const labelElement = target.parentElement;
        const switchContainer = labelElement.parentElement;
        const textSection = switchContainer.nextSibling;
        if (textSection.nodeName === 'P') {
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
            updateNoteOrQuote(input, associatedText);
        }
    });
}
function updateNoteOrQuote(unchecked, associatedText) {
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
    if (noteTextElement.nodeName === 'INPUT') {
        const noteElement = noteTextElement;
        const newNoteText = noteElement.value;
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
        fetch(`${serverAddress}/note`, {
            method: 'POST',
            body: JSON.stringify(body)
        }).then(res => console.log('Request Complete! response: ', res));
    }
    else {
        const body = {
            poemName: currentPoemName,
            noteType: 'Quote',
            oldIdentifier: currentNoteOrQuote,
            newVersion: associatedText
        };
        fetch(`${serverAddress}/quote`, {
            method: 'POST',
            body: JSON.stringify(body)
        }).then(res => console.log('Request Complete! response: ', res));
    }
    fetch(`${serverAddress}convertedPoems.json`)
        .then(response => response.json())
        .then((data) => renderNotes(data[currentPoemName].notes, data[currentPoemName].quotes));
}
export function highlightText(textToHighlight, color) {
    textToHighlight.forEach((word) => {
        const wordSpan = document.getElementById(word);
        wordSpan.style.color = color;
    });
}
export function unHighlightText(textToUnhighlight) {
    textToUnhighlight.forEach((word) => {
        const wordSpan = document.getElementById(word);
        wordSpan.style.color = 'black';
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
        console.log(modalQuote);
        if (paragraphElement.nodeName === 'INPUT') {
            const displayTextElement = paragraphElement;
            console.log(displayTextElement.value);
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
