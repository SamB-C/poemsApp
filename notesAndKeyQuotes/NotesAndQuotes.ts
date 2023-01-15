import { currentPoemName, serverAddress } from "./modifyNotesAndKeyQuotes.js";
import { Quotes, removeNumbers } from "./utilities.js";

type NoteType = "Note" | "Quote";

export let highlightedText: Array<string> = [];
export let currentQuote: HTMLParagraphElement | undefined = undefined;

export function initialiseEventHandlers(checkboxes: Array<HTMLInputElement>, textsToHighlight: Array<Array<string>>, color: string): void {
    checkboxes.forEach((checkbox, index) => {
        checkbox.onclick = (event) => highlightNote(event, textsToHighlight[index], color, checkboxes);
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
        newQuoteElement.onclick = () => {
            const toggleSwitch = getToggleSwitchFromParagraphElement(newQuoteElement).toggleSwitchInputCheckbox as HTMLInputElement;
            toggleSwitch.click();
        }
        newQuoteElement.style.cursor = 'pointer';
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
        return `<div class="inline_container">${toggleSwitch}<input id="${textId}" placeholder="Add a note here" class="note_or_quote_text note_input_box", value="${displayText}"></input>${deleteButton}${modal}</div>`;
    } else {
        if (displayText === '') {
            displayText = '<i>New Quote</i>';
        }
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


function highlightNote(event: Event, textToHighlight: Array<string>, color: string, checkboxes: Array<HTMLInputElement>) {
    console.log('hi')
    const target = event.target as HTMLInputElement;
    const targetBackground = target.nextSibling as HTMLSpanElement;
    const highlightedTextCopy = [...highlightedText]
    if (target.checked) {
        unHighlightText(highlightedText);
        highlightedText = [];
        highlightText(textToHighlight, color);
        highlightedText = textToHighlight;
        uncheckOtherCheckboxes(target, checkboxes, highlightedTextCopy);
        targetBackground.style.backgroundColor = 'green';

        // Make the currentQuote be the selected quote 
        const labelElement = target.parentElement as HTMLLabelElement;
        const switchContainer = labelElement.parentElement as HTMLDivElement;
        const textSection = switchContainer.nextSibling as HTMLInputElement | HTMLParagraphElement;
        if (textSection.nodeName === 'P') {
            currentQuote = textSection
        } else {
            currentQuote = undefined
        }
    } else {
        unHighlightText(highlightedText);
        highlightedText = []
        targetBackground.style.backgroundColor = '#ccc';
        updateNoteOrQuote(target, highlightedTextCopy);
        currentQuote = undefined
    }

}

function uncheckOtherCheckboxes(checkboxToKeepChecked: HTMLInputElement, checkboxes: Array<HTMLInputElement>, associatedText: Array<string>): void {
    checkboxes.forEach(input => {
        const background = input.nextSibling as HTMLSpanElement;
        background.style.backgroundColor = '#ccc';
        if (input.id !== checkboxToKeepChecked.id && input.checked) {
            input.checked = false;
            updateNoteOrQuote(input, associatedText);
        }
    });
}

function updateNoteOrQuote(unchecked: HTMLInputElement, associatedText: Array<string>) {
    // Get the content of the quote when it was rendered
    let currentNoteOrQuote = unchecked.id.split('_').filter(el => el !== '')[0];
    let noteTextElement: HTMLParagraphElement | HTMLInputElement;

    if (unchecked.id === '___checkbox__') {
        currentNoteOrQuote = '__NEW__';
        noteTextElement = document.getElementById('____') as HTMLParagraphElement | HTMLInputElement;
    } else {
        noteTextElement = document.getElementById(`__${currentNoteOrQuote}__`) as HTMLParagraphElement | HTMLInputElement;
    }

    if (noteTextElement.nodeName === 'INPUT') {
        const noteElement = noteTextElement as HTMLInputElement;
        const newNoteText: string = noteElement.value;
        const newVersion: {key: string, value: string[]} = {
            key: newNoteText,
            value: associatedText
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
    } else {
        const body = {
            poemName: currentPoemName,
            noteType: 'Quote',
            oldIdentifier: currentNoteOrQuote,
            newVersion: associatedText
        }
        fetch(`${serverAddress}/quote`, {
            method: 'POST',
            body: JSON.stringify(body)
        }).then(res => console.log('Request Complete! response: ', res))
    }
}

export function highlightText(textToHighlight: Array<string>, color: string) {
    textToHighlight.forEach((word: string) => {
        const wordSpan = document.getElementById(word) as HTMLSpanElement;
        wordSpan.style.color = color;
    });
}

export function unHighlightText(textToUnhighlight: Array<string>) {
    textToUnhighlight.forEach((word: string) => {
        const wordSpan = document.getElementById(word) as HTMLSpanElement;
        wordSpan.style.color = 'black';
    });
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