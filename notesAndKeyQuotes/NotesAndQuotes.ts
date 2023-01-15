import { currentPoemName, main, serverAddress } from "./modifyNotesAndKeyQuotes.js";
import { Notes, Quotes, removeNumbers } from "./utilities.js";

type NoteType = "Note" | "Quote";

let highlightedText: Array<string> = [];

export function initialiseEventHandlers(checkboxes: Array<HTMLInputElement>, textsToHighlight: Array<Array<string>>, color: string, allNotes: Notes): void {
    checkboxes.forEach((checkbox, index) => {
        checkbox.onclick = (event) => highlightNote(event, textsToHighlight[index], color, checkboxes, allNotes);
    })
}

export function addNotes(elmentToInsertInto: HTMLDivElement, arrNotes: Array<string>, checkboxes: Array<HTMLInputElement>, poemName: string): void {
    arrNotes.forEach((noteText) => {
        const newNoteElement = insertNoteOrQuote(elmentToInsertInto, noteText, noteText, "Note") as HTMLInputElement;
        initialiseToggleSwitch(newNoteElement, checkboxes);
        initialiseDeleteButton(newNoteElement, noteText, 'Note', poemName);
        newNoteElement.onclick = () => {
            const toggleSwitch = getToggleSwitchFromParagraphElement(newNoteElement).toggleSwitchInputCheckbox as HTMLInputElement;
            toggleSwitch.click();
        }
    });
}

export function addQuotes(elmentToInsertInto: HTMLDivElement, arrQuotes: Quotes, checkboxes: Array<HTMLInputElement>, poemName: string) {
    arrQuotes.forEach((quote: Array<string>) => {
        const reducedQuote: string = quote.join(' ');
        const newQuoteElement: HTMLParagraphElement = insertNoteOrQuote(elmentToInsertInto, reducedQuote, removeNumbers(quote.join(' ')), "Quote");
        initialiseToggleSwitch(newQuoteElement, checkboxes);
        initialiseDeleteButton(newQuoteElement, reducedQuote, "Quote", poemName);
    });
}

function insertNoteOrQuote(elmentToInsertInto: HTMLDivElement, idText: string, displayText: string, noteType: NoteType): HTMLParagraphElement | HTMLInputElement {
    const toggleSwitch = `<div class="switch_container" id="__${idText}_container__"><label class="switch"><input id="__${idText}_checkbox__" class="slider_checkbox" type="checkbox"><span class="slider round"></span></label></div>`;
    const deleteButton = `<div class="vertical_center delete_button_container"><span class="cross_button">&times;</span></div>`;
    const modal_options = '<div class="inline_container"><div class="modal_options"><button>Yes</button><button>No</button></div></div>'
    const modal = `<div class="modal"><div class="modal-content"><span class="cross_button">&times;</span><p>Are you sure you want to delete:</p><p>"${displayText}"</p>${modal_options}</div></div>`
    const textId = `__${idText}__`
    const elementAsStr = getElementAsStr(toggleSwitch, textId, displayText, deleteButton, modal, noteType);
    elmentToInsertInto.insertAdjacentHTML('beforeend', elementAsStr);
    const elementAsElement = document.getElementById(textId) as HTMLParagraphElement;
    return elementAsElement
}

function getElementAsStr(toggleSwitch: string, textId: string, displayText: string, deleteButton: string, modal: string, noteType: NoteType): string {
    if (noteType === "Note") {
        return `<div class="inline_container">${toggleSwitch}<input id="${textId}" class="note_or_quote_text note_input_box", value="${displayText}"></input>${deleteButton}${modal}</div>`;
    } else {
        return `<div class="inline_container">${toggleSwitch}<p id="${textId}" class="note_or_quote_text">${displayText}</p>${deleteButton}${modal}</div>`;
    }
}

function initialiseToggleSwitch(paragraphElement: HTMLParagraphElement, checkboxes: Array<HTMLInputElement>): void {
    const { toggleSwitchInputCheckbox } = getToggleSwitchFromParagraphElement(paragraphElement);
    toggleSwitchInputCheckbox.style.opacity = '0';
    toggleSwitchInputCheckbox.style.width = '0';
    toggleSwitchInputCheckbox.style.height = '0';
    const parent = toggleSwitchInputCheckbox.parentElement as HTMLLabelElement;
    parent.style.marginRight = '1vh';
    checkboxes.push(toggleSwitchInputCheckbox);
}

function getToggleSwitchFromParagraphElement(paragraphElement: HTMLParagraphElement): {toggleSwitchInputCheckbox: HTMLInputElement, toggleSwitchBackground: HTMLSpanElement} {
    const paragraphElementContainer = paragraphElement.parentElement as HTMLDivElement;
    const toggleSwitchContainer = paragraphElementContainer.firstChild as HTMLDivElement;
    const toggleSwitchLabel = toggleSwitchContainer.firstChild as HTMLLabelElement;
    const toggleSwitchInputCheckbox = toggleSwitchLabel.firstChild as HTMLInputElement;
    const toggleSwitchBackground = toggleSwitchInputCheckbox.nextSibling as HTMLSpanElement;
    return {toggleSwitchInputCheckbox, toggleSwitchBackground,};
}


function highlightNote(event: Event, textToHighlight: Array<string>, color: string, checkboxes: Array<HTMLInputElement>, allNotes: Notes) {
    const target = event.target as HTMLInputElement;
    const targetBackground = target.nextSibling as HTMLSpanElement;
    if (target.checked) {
        unHighlightText()
        highlightText(textToHighlight, color);
        uncheckOtherCheckboxes(target, checkboxes, allNotes);
        targetBackground.style.backgroundColor = 'green';
    } else {
        unHighlightText();
        targetBackground.style.backgroundColor = '#ccc';
        updateNoteOrQuote(target, allNotes);
    }

}

function uncheckOtherCheckboxes(checkboxToKeepChecked: HTMLInputElement, checkboxes: Array<HTMLInputElement>, allNotes: Notes): void {
    checkboxes.forEach(input => {
        const background = input.nextSibling as HTMLSpanElement;
        background.style.backgroundColor = '#ccc';
        if (input.id !== checkboxToKeepChecked.id && input.checked) {
            input.checked = false;
            updateNoteOrQuote(input, allNotes);
        }
    });
}

function updateNoteOrQuote(unchecked: HTMLInputElement, allNotes: Notes) {
    const currentNoteOrQuote = unchecked.id.split('_').filter(el => el !== '')[0];
    const noteTextElement = document.getElementById(`__${currentNoteOrQuote}__`) as HTMLParagraphElement | HTMLInputElement;
    if (noteTextElement.nodeName === 'INPUT') {
        const noteElement = noteTextElement as HTMLInputElement;
        const newNoteText: string = noteElement.value;
        const newVersion: {key: string, value: string[]} = {
            key: newNoteText,
            value: allNotes[currentNoteOrQuote]
        };
        const body = {
            poemName: currentPoemName,
            noteType: 'Note', 
            oldIdentifier: currentNoteOrQuote, 
            newVersion,
        }
        fetch(`${serverAddress}/note`, {
            method: 'POST',
            body: JSON.stringify(body)
        }).then(res => console.log('Request Complete! response: ', res))
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

function initialiseDeleteButton(paragraphElement: HTMLParagraphElement, jsonRepresentation: string, noteOrQuote: NoteType, poemName: string) {
    const deleteButtonElementContainer = paragraphElement.nextSibling as HTMLDivElement;
    const deleteButtonElement = deleteButtonElementContainer.firstChild as HTMLSpanElement;
    const modal = deleteButtonElementContainer.nextSibling as HTMLDivElement;
    const modalContent = modal.firstChild as HTMLDivElement;
    const close = modalContent.firstChild as HTMLSpanElement;
    close.onclick = () => {
        modal.style.display = "none";
    }
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none'
        }
    }
    deleteButtonElement.onclick = () => {
        modal.style.display = 'block';
    }

    const modalOptionsContainer = modalContent.lastChild as HTMLDivElement;
    const modalOptions = modalOptionsContainer.firstChild as HTMLDivElement;
    const optionYes = modalOptions.firstChild as HTMLButtonElement;
    const optionNo = modalOptions.lastChild as HTMLButtonElement;

    optionNo.onclick = () => {
        modal.style.display = 'none';
    }

    optionYes.onclick = () => {
        fetch("http://localhost:8080/post", {
            method: "DELETE",
            body: JSON.stringify({identifierFor: noteOrQuote, identifier: jsonRepresentation, poemName,}),
        }).then(res => console.log('Request Complete! response: ', res))
    }
}