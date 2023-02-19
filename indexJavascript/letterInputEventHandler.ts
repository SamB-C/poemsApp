import { ANIMATION_SPEED, COVER_OVER_COMPLETED_WORDS, GET_ELEMENT, LETTER_INPUT_DEFAULT_COLOR, NUMBER_ONLY_REGEX } from "./constantsAndTypes.js";
import { initialise, state } from "./index.js";
import { disableInputs, resetInputs, updateRangeBar } from "./inputs.js";
import { FOCUS, getAllWordSectionsInPoem, getArrayOfChildrenThatAreInputs, WORD_FUNCS } from "./utilities.js";

// =========================== Letter input onchange event handler ===========================


// Event handler for each individual letter input
export function onInputEventHandler(word: string, event: Event, poem: string) {
    // Check if letter is incorrect
    const targetInput = event.target as HTMLInputElement;
    if (targetInput.value.length === 0) {
        return;
    }
    targetInput.style.textAlign = 'center';
    if (!compareInputToLetterId(targetInput.value, targetInput.id)) {
        targetInput.style.color = 'red';
        const parent = targetInput.parentElement as HTMLSpanElement;

        // Destroy handler and replace after 1s
        parent.oninput = () => {};
        setTimeout(() => {
            revertWordToEmpty(word);
            parent.oninput = (event) => onInputEventHandler(word, event, poem);
            targetInput.style.color = LETTER_INPUT_DEFAULT_COLOR;
            targetInput.style.textAlign = 'start';
        }, 1000)
    } else {
        focusNextLetter(targetInput, poem);
    }
}

// --------------------------- Compare letter ---------------------------

// Compares the input to the correct answer
function compareInputToLetterId(input: string, id: string): boolean {
    // Splits the id into a list [word, letterInBinary]
    const wordAndLetterList: Array<string> = id.split('_');
    const letterInBinary: string = wordAndLetterList[wordAndLetterList.length - 1];
    const letter: string = String.fromCharCode(parseInt(letterInBinary, 2));
    return input === letter || (letter === '—' && input === '-')
}

// --------------------------- Letter Wrong ---------------------------

// Reverts a word back to underscores after incorrect input
function revertWordToEmpty(word: string):void {
    // Retrive all inputs
    const wordElement: HTMLSpanElement = GET_ELEMENT.getElementOfWord(word);
    const arrayOfChildren: Array<HTMLInputElement> = getArrayOfChildrenThatAreInputs(wordElement);
    // Resets word
    for (let i: number = 0; i < arrayOfChildren.length; i++) {
        arrayOfChildren[i].value = '';
        arrayOfChildren[i].style.textAlign = 'start';
        FOCUS.focusFirstLetterOfWord(word);
    }
}

// --------------------------- Letter Right ---------------------------

// Focuses on the next/missing letter in the word, or if it is complete, move to next word
function focusNextLetter(currentLetter: HTMLInputElement, poem: string) {
    // Check if this letter is full
    if (currentLetter.value.length > 0) {
        // Focuses on the next letter
        const nextLetter = currentLetter.nextSibling as HTMLInputElement | null;
        if (nextLetter === null || nextLetter.value !== '') {
            focusMissingLetter(currentLetter, poem);
        } else {
            nextLetter.focus();
        }
    }
}

// Check if word is full, completes if so, else focuses on missing letter
function focusMissingLetter(letterToCheckUsing: HTMLInputElement, poem: string): void {
    const missingLetter: HTMLInputElement | null = checkAllLettersFull(letterToCheckUsing);
    if (missingLetter === null) {
        completeWord(poem);
    } else {
        missingLetter.focus()
    }
}

// Checks if all the letters in a word are full - returns the letter that isn't if there is one
function checkAllLettersFull(singleLetter: HTMLInputElement): HTMLInputElement | null {
    // Retrieves all the letters in the word
    const parentSpan = singleLetter.parentElement as HTMLSpanElement;
    const allLetterInputs: Array<HTMLInputElement> = getArrayOfChildrenThatAreInputs(parentSpan);
    // Tries to find an empty letter
    for (let i: number = 0; i < allLetterInputs.length; i++) {
        if (allLetterInputs[i].value === '') {
            return allLetterInputs[i]
        }
    }
    // All full
    return null
}


// When a word is completed, check if it is correct, if so, move onto next word
function completeWord(poem: string):void {
    // Get the input values and combine into guessed word
    const focusedWordElement: HTMLSpanElement = GET_ELEMENT.getElementOfWord(state.focusedWord);
    const arrayOfChildren: Array<HTMLInputElement> = getArrayOfChildrenThatAreInputs(focusedWordElement)
    let userInput: string = '';
    for (let i: number = 0; i < arrayOfChildren.length; i++) {
        userInput = userInput + arrayOfChildren[i].value;
    }
    // Marks as complete
    revertToTextAsComplete(state.focusedWord);
    moveToNextWord(poem);
}

// Marks a word as complete by converting back to text and cahnging colour to green
function revertToTextAsComplete(wordToRevert: string): void {
    const wordToRevertElement: HTMLSpanElement = GET_ELEMENT.getElementOfWord(wordToRevert);
    wordToRevertElement.innerHTML = WORD_FUNCS.removeNumberFromWord(wordToRevert);
    wordToRevertElement.style.color = 'green';
}

// Moves to the next word, if none left, marks poem as complete
function moveToNextWord(poem: string): void {
    const indexOfCompleteWord = state.wordsNotCompleted.indexOf(state.focusedWord);
    state.wordsNotCompleted.splice(indexOfCompleteWord, 1);
    if (state.wordsNotCompleted.length > 0) {
        state.focusedWord = state.wordsNotCompleted[indexOfCompleteWord];
        FOCUS.focusFirstLetterOfWord(state.focusedWord);
    } else {
        completePoem(poem);
    }
}

// Uses an animation to turn all text green and add message below poem
function completePoem(poem: string): void {
    addGreenCompletionBorder();

    const completionColor: string = '#00FF00';
    const allWordsInPoem: Array<string> = getAllWordSectionsInPoem(poem);
    // Disable the inputs that re-render the poem
    const rangeBar = GET_ELEMENT.getRangeBar();
    const rangeBarIntitialValue = rangeBar.value;
    disableInputs();
    // Do animation
    changeAllWordsToColor(allWordsInPoem, state.wordsNotCompletedPreserved, completionColor, ANIMATION_SPEED, () => changeAllWordsToColourAnimationCleanup(rangeBar, rangeBarIntitialValue));
}


function addGreenCompletionBorder() {
    const poemContainer = GET_ELEMENT.getPoemContainer();
    poemContainer.style.outline = '1vh solid green';
}

export function removeGreenCompletionBorder() {
    const poemContainer = GET_ELEMENT.getPoemContainer();
    poemContainer.style.outline = 'none';
}

// Animation to change all the words in the poem to a different color - A recursive function
function changeAllWordsToColor(wordsToChange: Array<string>, wordsNotToChange: Array<string>, color: string, timeBetweenConversion: number, callbackOption: Function) {
    // pops off next word to change color for
    const wordToChange: string | undefined = wordsToChange.shift();
    // Base case - word undefined
    if (wordToChange === undefined) {
        return setTimeout(callbackOption, timeBetweenConversion)
    }
    // Only change color if it was not on of the words completed by the user and is a actual word not a number (can be overridden)
    if ((!wordsNotToChange.includes(wordToChange) || COVER_OVER_COMPLETED_WORDS) && !wordToChange.match(NUMBER_ONLY_REGEX)) {
        const wordElement = GET_ELEMENT.getElementOfWord(wordToChange);
        wordElement.style.color = color;
    }
    // Recursive call with setTimeout so words don't all change colour at once
    return setTimeout(() => changeAllWordsToColor(wordsToChange, wordsNotToChange, color, timeBetweenConversion, callbackOption), timeBetweenConversion);
}

// Cleanup function for after animation
function changeAllWordsToColourAnimationCleanup(rangeBar: HTMLInputElement, rangeBarIntitialValue: string) {
    showTryAgainButton();
    // Resets the disabled inputs
    resetInputs();
    setTimeout(() => updateRangeBar(rangeBar, rangeBarIntitialValue), 500)
}

export function initialiseTryAgainLink() {
    const tryAgainLink = GET_ELEMENT.getTryAgainLink();
    tryAgainLink.onclick = initialise;
}

function showTryAgainButton() {
    // Tells the user they completed the poem
    // Add try again selection
    const completionTextContainer = GET_ELEMENT.getCompletionText();
    completionTextContainer.style.display = 'block';
    if (state.poemData[state.currentPoemName].centered) {
        completionTextContainer.style.textAlign = 'center';
    }
}

export function hideTryAgainButton() {
    const completionTextContainer = GET_ELEMENT.getCompletionText();
    completionTextContainer.style.display = 'none';
    completionTextContainer.style.textAlign = 'left';

}