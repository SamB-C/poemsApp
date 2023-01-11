import { Quotes, removeNumbers } from "./utilities.js";

let highlightedText: Array<string> = [];

export function initialiseEventHandlers(checkboxes: Array<HTMLInputElement>, textsToHighlight: Array<Array<string>>, color: string): void {
    checkboxes.forEach((checkbox, index) => {
        checkbox.onclick = (event) => highlightNote(event, textsToHighlight[index], color, checkboxes);
    })
}

export function addNotes(elmentToInsertInto: HTMLDivElement, arrNotes: Array<string>, checkboxes: Array<HTMLInputElement>, poemName: string): void {
    arrNotes.forEach((noteText) => {
        const newNoteElement: HTMLParagraphElement = insertNoteOrQuote(elmentToInsertInto, noteText, noteText);
        initialiseToggleSwitch(newNoteElement, checkboxes);
        initialiseDeleteButton(newNoteElement, noteText, 'Note', poemName);
    });
}

export function addQuotes(elmentToInsertInto: HTMLDivElement, arrQuotes: Quotes, checkboxes: Array<HTMLInputElement>, poemName: string) {
    arrQuotes.forEach((quote: Array<string>) => {
        const reducedQuote: string = quote.join(' ');
        const newQuoteElement: HTMLParagraphElement = insertNoteOrQuote(elmentToInsertInto, reducedQuote, removeNumbers(quote.join(' ')));
        initialiseToggleSwitch(newQuoteElement, checkboxes);
        initialiseDeleteButton(newQuoteElement, reducedQuote, "Quote", poemName);
    });
}

function insertNoteOrQuote(elmentToInsertInto: HTMLDivElement, idText: string, displayText: string): HTMLParagraphElement {
    const toggleSwitch = `<div class="switch_container" id="__${idText}_container__"><label class="switch"><input id="__${idText}_checkbox__" class="slider_checkbox" type="checkbox"><span class="slider round"></span></label></div>`;
    const deleteButton = `<button>&times;</button>`;
    const textId = `__${idText}__`
    const elementAsStr = `<div class="inline_container">${toggleSwitch}<p id="${textId}" class="note_or_quote_text">${displayText}</p>${deleteButton}</div>`;
    elmentToInsertInto.insertAdjacentHTML('beforeend', elementAsStr);
    const elementAsElement = document.getElementById(textId) as HTMLParagraphElement;
    return elementAsElement
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
    const target = event.target as HTMLInputElement;
    const targetBackground = target.nextSibling as HTMLSpanElement;
    if (target.checked) {
        unHighlightText()
        highlightText(textToHighlight, color);
        uncheckOtherCheckboxes(target, checkboxes);
        targetBackground.style.backgroundColor = 'green';
    } else {
        unHighlightText();
        targetBackground.style.backgroundColor = '#ccc'
    }

}

function uncheckOtherCheckboxes(checkboxToKeepChecked: HTMLInputElement, checkboxes: Array<HTMLInputElement>): void {
    checkboxes.forEach(input => {
        const background = input.nextSibling as HTMLSpanElement;
        background.style.backgroundColor = '#ccc';
        if (input.id !== checkboxToKeepChecked.id) {
            input.checked = false;
        }
    });
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

function initialiseDeleteButton(paragraphElement: HTMLParagraphElement, jsonRepresentation: string, noteOrQuote: 'Note' | 'Quote', poemName: string) {
    const deleteButtonElement = paragraphElement.nextSibling as HTMLButtonElement;
    deleteButtonElement.onclick = () => {
        fetch("http://localhost:8080/post", {
            method: "DELETE",
            body: JSON.stringify({identifierFor: noteOrQuote, identifier: jsonRepresentation, poemName,}),
        }).then(res => console.log('Request Complete! response: ', res)) 
    }
}