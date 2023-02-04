import { currentPoemName, main, renderNotes, serverAddress } from "./modifyNotesAndKeyQuotes.js";
import { ConvertedPoems, highlightText, Quotes, removeNumbers, unHighlightText } from "./utilities.js";

type NoteType = "Note" | "Quote";
type WordsNotConsecutiveError = {
    errorType: 'Words not consecutive',
    error: {incorrectSequence: Array<string>, correctSequence: Array<string>}
}
type QuoteOverlapError = {
    errorType: 'Quote overlap',
    error: string
}
type NoteOverlapFourTimes = {
    errorType: 'Note overlap four times',
    error: string
}
type NoError = {
    errorType: 'No error',
    error: null
}
type PostErrorResponse = WordsNotConsecutiveError | QuoteOverlapError | NoteOverlapFourTimes | NoError

type NoteNodeType = HTMLSpanElement
type QuoteNodeType = HTMLParagraphElement
type NotationNodeType = NoteNodeType | QuoteNodeType

const NOTE_NODE_TYPE = 'SPAN';
const QUOTE_NODE_TYPE = 'P';

export let highlightedText: Array<string> = [];
export let currentQuote: HTMLParagraphElement | undefined = undefined;

export function initialiseEventHandlers(checkboxes: Array<HTMLInputElement>, textsToHighlight: Array<Array<string>>, color: string): void {
    checkboxes.forEach((checkbox, index) => {
        checkbox.onclick = (event) => highlightNote(event, textsToHighlight[index], color, checkboxes);
    })
}

export function addNotes(elmentToInsertInto: HTMLDivElement, arrNotes: Array<string>, checkboxes: Array<HTMLInputElement>, poemName: string): void {
    arrNotes.forEach((noteText) => {
        const newNoteElement = insertNoteOrQuote(elmentToInsertInto, noteText, noteText, "Note") as NoteNodeType;
        initialiseToggleSwitch(newNoteElement, checkboxes);
        initialiseDeleteButton(newNoteElement, noteText, 'Note', poemName);
        newNoteElement.onclick = () => {
            const toggleSwitch = getToggleSwitchFromParagraphElement(newNoteElement).toggleSwitchInputCheckbox as HTMLInputElement;
            if (toggleSwitch.checked === false) {
                toggleSwitch.click();
            }
        }
    });
}

export function addQuotes(elmentToInsertInto: HTMLDivElement, arrQuotes: Quotes, checkboxes: Array<HTMLInputElement>, poemName: string) {
    arrQuotes.forEach((quote: Array<string>) => {
        const reducedQuote: string = quote.join(' ');
        const newQuoteElement = insertNoteOrQuote(elmentToInsertInto, reducedQuote, removeNumbers(quote.join(' ')), "Quote") as QuoteNodeType;
        initialiseToggleSwitch(newQuoteElement, checkboxes);
        initialiseDeleteButton(newQuoteElement, reducedQuote, "Quote", poemName);
        newQuoteElement.onclick = () => {
            const toggleSwitch = getToggleSwitchFromParagraphElement(newQuoteElement).toggleSwitchInputCheckbox as HTMLInputElement;
            toggleSwitch.click();
        }
        newQuoteElement.style.cursor = 'pointer';
    });
}

function insertNoteOrQuote(elmentToInsertInto: HTMLDivElement, idText: string, displayText: string, noteType: NoteType): NotationNodeType {
    const toggleSwitch = `<div class="switch_container" id="__${idText}_container__"><label class="switch"><input id="__${idText}_checkbox__" class="slider_checkbox" type="checkbox"><span class="slider round"></span></label></div>`;
    const deleteButton = `<div class="vertical_center delete_button_container"><span class="cross_button">&times;</span></div>`;
    const modal_options = '<div class="inline_container"><div class="modal_options"><button>Yes</button><button>No</button></div></div>'
    const modal = `<div class="modal"><div class="modal-content"><span class="cross_button">&times;</span><p>Are you sure you want to delete:</p><p id="__modal_quote__">"${displayText}"</p>${modal_options}</div></div>`
    const textId = `__${idText}__`
    const elementAsStr = getElementAsStr(toggleSwitch, textId, displayText, deleteButton, modal, noteType);
    elmentToInsertInto.insertAdjacentHTML('beforeend', elementAsStr);
    const elementAsElement = document.getElementById(textId) as NotationNodeType;
    return elementAsElement
}

function getElementAsStr(toggleSwitch: string, textId: string, displayText: string, deleteButton: string, modal: string, noteType: NoteType): string {
    if (noteType === "Note") {
        return `<div class="inline_container">${toggleSwitch}<span role="textbox" contenteditable id="${textId}" placeholder="Add a note here" class="note_or_quote_text note_input_box">${displayText}</span>${deleteButton}${modal}</div>`;
    } else {
        if (displayText === '') {
            displayText = '<i>New Quote</i>';
        }
        return `<div class="inline_container">${toggleSwitch}<p id="${textId}" class="note_or_quote_text">${displayText}</p>${deleteButton}${modal}</div>`;
    }
}

function initialiseToggleSwitch(paragraphElement: NotationNodeType, checkboxes: Array<HTMLInputElement>): void {
    const { toggleSwitchInputCheckbox } = getToggleSwitchFromParagraphElement(paragraphElement);
    toggleSwitchInputCheckbox.style.opacity = '0';
    toggleSwitchInputCheckbox.style.width = '0';
    toggleSwitchInputCheckbox.style.height = '0';
    const parent = toggleSwitchInputCheckbox.parentElement as HTMLLabelElement;
    parent.style.marginRight = '1vh';
    checkboxes.push(toggleSwitchInputCheckbox);
}

function getToggleSwitchFromParagraphElement(paragraphElement: NoteNodeType): {toggleSwitchInputCheckbox: HTMLInputElement, toggleSwitchBackground: HTMLSpanElement} {
    const paragraphElementContainer = paragraphElement.parentElement as HTMLDivElement;
    const toggleSwitchContainer = paragraphElementContainer.firstChild as HTMLDivElement;
    const toggleSwitchLabel = toggleSwitchContainer.firstChild as HTMLLabelElement;
    const toggleSwitchInputCheckbox = toggleSwitchLabel.firstChild as HTMLInputElement;
    const toggleSwitchBackground = toggleSwitchInputCheckbox.nextSibling as HTMLSpanElement;
    return {toggleSwitchInputCheckbox, toggleSwitchBackground,};
}


function highlightNote(event: Event, textToHighlight: Array<string>, color: string, checkboxes: Array<HTMLInputElement>) {
    const target = event.target as HTMLInputElement;
    const targetBackground = target.nextSibling as HTMLSpanElement;
    const highlightedTextCopy = [...highlightedText]
    if (target.checked) {

        // Deal with highlighting text
        unHighlightText(highlightedText);
        highlightedText = [];
        highlightText(textToHighlight, color);
        highlightedText = textToHighlight;

        uncheckOtherCheckboxes(target, checkboxes, highlightedTextCopy);
        targetBackground.style.backgroundColor = 'green';

        // Make the currentQuote be the selected quote
        const labelElement = target.parentElement as HTMLLabelElement;
        const switchContainer = labelElement.parentElement as HTMLDivElement;
        const notationSection = switchContainer.nextSibling as NotationNodeType;
        if (notationSection.nodeName === QUOTE_NODE_TYPE) {
            const textSection = notationSection as HTMLParagraphElement
            currentQuote = textSection;
        } else {
            currentQuote = undefined;
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
            setTimeout(async () => {
                await updateNoteOrQuote(input, associatedText);
                const checkboxToKeepCheckedElement = document.getElementById(checkboxToKeepChecked.id) as HTMLInputElement;
                checkboxToKeepCheckedElement.click();
            }, 400)
        }
    });
}

async function updateNoteOrQuote(unchecked: HTMLInputElement, associatedText: Array<string>) {
    // Get the content of the quote when it was rendered
    let currentNoteOrQuote = unchecked.id.split('_').filter(el => el !== '')[0];
    let noteTextElement: NotationNodeType;

    if (unchecked.id === '___checkbox__') {
        currentNoteOrQuote = '__NEW__';
        noteTextElement = document.getElementById('____') as NotationNodeType;
    } else {
        noteTextElement = document.getElementById(`__${currentNoteOrQuote}__`) as NotationNodeType;
    }

    if (noteTextElement.nodeName === NOTE_NODE_TYPE) {
        const noteElement = noteTextElement as NoteNodeType;
        const newNoteText: string = noteElement.innerText;
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
        await fetch(`${serverAddress}/note`, {
            method: 'POST',
            body: JSON.stringify(body)
        }).then((res: Response) => displayResposnseError(res, "Note", body.newVersion))
    } else {
        const body = {
            poemName: currentPoemName,
            noteType: 'Quote',
            oldIdentifier: currentNoteOrQuote,
            newVersion: associatedText
        }
        await fetch(`${serverAddress}/quote`, {
            method: 'POST',
            body: JSON.stringify(body)
        }).then((res: Response) => displayResposnseError(res, "Quote", body.newVersion));
    }

    await fetch(`${serverAddress}convertedPoems.json`)
            .then(response => response.json())
            .then((data: ConvertedPoems) => {
                renderNotes(data[currentPoemName].notes, data[currentPoemName].quotes);
            })
}


async function displayResposnseError(res: Response, NotationType: NoteType, badQuoteOrNote: Array<string> | {key: string, value: Array<string>}) {
    const err = await res.json() as PostErrorResponse;
    console.log(err);
    if (err.errorType !== 'No error') {
        let errorMessage: string = '';
        if (NotationType === "Quote") {
            const badQuote = badQuoteOrNote as Array<string>;
            const erroneousQuote = badQuote.map(word => removeNumbers(word)).join(' ');
            if (err.errorType === 'Quote overlap') {
                const incorrectWord = removeNumbers(err.error);
                errorMessage = `Quote: "${erroneousQuote}" is invalid because word "${incorrectWord}" overlaps with another quote.`
            } else if (err.errorType === 'Words not consecutive') {
                const incorrectSequence = err.error.incorrectSequence.map(word => removeNumbers(word))
                const correctSequence = err.error.correctSequence.map(word => removeNumbers(word))
                errorMessage = `Quote: "${erroneousQuote}" is invalid because words "${incorrectSequence.join(' ')}" are not consecutive.</br>Word "${correctSequence[0]}" should be followed by "${correctSequence[1]}".`;
            }
        } else {
            if (err.errorType === 'Note overlap four times') {
                const badNote = badQuoteOrNote as {key: string, value: Array<string>};
                const erroneousNoteText = badNote.key;
                const erroneousNoteValue = badNote.value.map(word => removeNumbers(word)).join(' ');
                const badWord = removeNumbers(err.error);
                errorMessage = `Note: "${erroneousNoteText}" with words "${erroneousNoteValue}" is invalid becauseword "${badWord}" overlaps with three other notes.`
            }
        }

        // Alert the user
        const errorMessageModal = document.getElementById('__error_message_modal__') as HTMLDivElement;
        const close = document.getElementById('__error_message__exit__') as HTMLSpanElement;
        const errorMessageText = document.getElementById('__error_message__') as HTMLParagraphElement;
        close.onclick = () => errorMessageModal.style.display = 'none';
        window.onclick = (event) => {
            if (event.target == errorMessageModal) {
                errorMessageModal.style.display = 'none';
            }
        }
        errorMessageText.innerHTML = errorMessage;
        errorMessageModal.style.display = 'block';
    }
}


function initialiseDeleteButton(paragraphElement: NotationNodeType, jsonRepresentation: string, noteOrQuote: NoteType, poemName: string) {
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
        const modalQuote = modalContent.firstChild?.nextSibling?.nextSibling as HTMLParagraphElement;
        if (paragraphElement.nodeName === 'INPUT') {
            const displayTextElement = paragraphElement as HTMLInputElement
            modalQuote.innerText = `"${displayTextElement.value}"`;
        } else {
            modalQuote.innerText = `"${paragraphElement.innerHTML.trim()}"`
        }
    }

    const modalOptionsContainer = modalContent.lastChild as HTMLDivElement;
    const modalOptions = modalOptionsContainer.firstChild as HTMLDivElement;
    const optionYes = modalOptions.firstChild as HTMLButtonElement;
    const optionNo = modalOptions.lastChild as HTMLButtonElement;

    optionNo.onclick = () => {
        modal.style.display = 'none';
    }

    optionYes.onclick = () => {
        fetch(`${serverAddress}/post`, {
            method: "DELETE",
            body: JSON.stringify({identifierFor: noteOrQuote, identifier: jsonRepresentation, poemName,}),
        }).then(res => console.log('Request Complete! response: ', res))
        fetch(`${serverAddress}convertedPoems.json`)
            .then(response => response.json())
            .then((data: ConvertedPoems) => main(data, currentPoemName));
    }
}