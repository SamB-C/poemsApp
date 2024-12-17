import { GET_ELEMENT, QUOTES, WORDS, WordsOrQuotesType } from "./constantsAndTypes.js";
import { addPoemAuthor, initialise, state } from "./index.js";


// =========================== Intitalise range bar ===========================

// Initisalisation for the rangebar slider
export function initialiseRangebar() {
    const rangeBar = GET_ELEMENT.getRangeBar();
    // Sets min/max values for rangebar
    rangeBar.value = `${state.percentageWordsToRemove}`;
    rangeBar.min = "0";
    rangeBar.max = "100";
    // Sets up the element that displays the value of the rangebar
    const rangeBarResult = GET_ELEMENT.getRangeBarResult();
    rangeBarResult.innerHTML = rangeBar.value + '%';
    addRangebarEvents(rangeBar, rangeBarResult)
}


function addRangebarEvents(rangeBar: HTMLInputElement, rangeBarResult: HTMLParagraphElement) {
    // Don't re-render poem every time bar is dragged
    rangeBar.onpointerup = () => onRangebarInput(rangeBar)
    // Only update the displayed value of the input
    rangeBar.oninput = () => {
        const newValue = rangeBar.value;
        rangeBarResult.innerHTML = newValue + '%';
    }
}

// Event handler for the rangebar input that changes the number of missing words
function onRangebarInput(rangeBar: HTMLInputElement) {
    // Get new value from range
    const newValue: number = parseInt(rangeBar.value);
    // Changes the state accordingly
    state.percentageWordsToRemove = newValue;
    // Restart the poem with a new number of words
    initialise();
}

// Updates range bar in case it has been changed
export function updateRangeBar(rangeBar: HTMLInputElement, initialValue: string) {
    if (initialValue !== rangeBar.value) {
        onRangebarInput(rangeBar);
    }
}

// =========================== Intitalise poem select bar ===========================

export function initialisePoemOptions(): void {
    const poemSelect = GET_ELEMENT.getPoemSelect();
    for (let poemName in state.poemData) {
        let newOption: string = `<option value="${poemName}">${poemName}</option>`
        if (poemName === state.currentPoemName) {
            newOption = `<option value="${poemName}" selected="seleted">${poemName}</option>`
        }
        poemSelect.innerHTML = poemSelect.innerHTML + newOption
    }
    poemSelect.oninput = () => onPoemSelectInput(poemSelect)
}

function onPoemSelectInput(poemSelect: HTMLSelectElement): void {
    const poemSelected: string = poemSelect.value;
    state.currentPoemName = poemSelected;
    initialise();
    addPoemAuthor()
    initialiseRangebar();
}


// =========================== Intitalise Radio buttons ===========================

// Initialise the radio buttons so that their value is represented in the state
export function initialiseWordsOrQuotesRadioButtons() {
    const { wordsRadioButton, quotesRadioButton } = GET_ELEMENT.getRadioButtons()
    wordsRadioButton.checked = true;
    wordsRadioButton.oninput = () => radioButtonOnInput(WORDS);
    quotesRadioButton.oninput = () => radioButtonOnInput(QUOTES);
}

function radioButtonOnInput(removalType: WordsOrQuotesType) {
    state.removalType = removalType;
    updateRangeBarTitles(removalType);
    initialise();
}

function updateRangeBarTitles(removalType: WordsOrQuotesType) {
    GET_ELEMENT.getRangeBar().title = `Drag to adjust the percentage of ${removalType} removed from the poem`;
    GET_ELEMENT.getRangeBarResult().title = `The percentage of ${removalType} removed from the poem`;
}


// =========================== Disable and enable inputs ===========================

// Disables inputs that re-render the poem, so it is not re-rendered mid-animation (opposite to resetInputs)
export function disableInputs() {
    const rangeBar = GET_ELEMENT.getRangeBar();
    rangeBar.onpointerup = () => {};

    const poemSelectInput = GET_ELEMENT.getPoemSelect();
    poemSelectInput.disabled = true;

    const { wordsRadioButton, quotesRadioButton } = GET_ELEMENT.getRadioButtons();
    wordsRadioButton.disabled = true;
    quotesRadioButton.disabled = true;
}

// Resets event handler once the animation is complete (opposite to disableInputs)
export function resetInputs() {
    const rangeBar = GET_ELEMENT.getRangeBar();
    const rangeBarResult = GET_ELEMENT.getRangeBarResult();
    addRangebarEvents(rangeBar, rangeBarResult);

    const poemSelectInput = GET_ELEMENT.getPoemSelect();
    poemSelectInput.disabled = false;

    const { wordsRadioButton, quotesRadioButton } = GET_ELEMENT.getRadioButtons();
    wordsRadioButton.disabled = false;
    quotesRadioButton.disabled = false;
}