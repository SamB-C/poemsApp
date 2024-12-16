import { ANIMATION_SPEED, COVER_OVER_COMPLETED_WORDS, GET_ELEMENT, LETTER_INPUT_DEFAULT_COLOR, LETTER_INPUT_TYPE, NUMBER_ONLY_REGEX, SPECIAL_CHARACTER_REGEX } from "./constantsAndTypes.js";
import { clearups, initialise, state } from "./index.js";
import { disableInputs, resetInputs, updateRangeBar } from "./inputs.js";
import { FOCUS, WORD_FUNCS, getAllWordSectionsInPoem, getArrayOfChildrenThatAreInputs } from "./utilities.js";

// =========================== Letter input onchange event handler ===========================


// Event handler for each individual letter input
export function onInputEventHandler(word: string, event: Event, poem: string) {
    // Check if letter is incorrect
    const targetInput = event.target as LETTER_INPUT_TYPE;
    if (targetInput.value.length === 0) {
        return;
    }
    if (!targetInput.value.match(SPECIAL_CHARACTER_REGEX)) {
        targetInput.style.textAlign = 'center';
    }
    if (!compareInputToLetterId(targetInput.value, targetInput.id)) {
        handleIncorrectLetter(targetInput, word, poem)
    } else {
        focusNextLetter(targetInput, poem);
    }
}


// --------------------------- Compare letter ---------------------------

// Compares the input to the correct answer
function compareInputToLetterId(input: string, id: string): boolean {
    const letter = getLetterFromId(id)
    return input === letter || (letter === '—' && input === '-')
}

/**
 * 
 * @param id - The id of the input element
 * @returns The correct letter for the input element
 * 
 * Gets the letter for an input element using the char code in the id
 * 
 */
function getLetterFromId(id: string): string {
    // Splits the id into a list [word, letterInBinary]
    const wordAndLetterList: Array<string> = id.split('_');
    // Get the letterInBinary element from the array
    const letterInBinary: string = wordAndLetterList[wordAndLetterList.length - 1];
    // Convert the letter from binary to character
    const letter: string = String.fromCharCode(parseInt(letterInBinary, 2));
    return letter
}

// --------------------------- Letter Wrong ---------------------------

/**
 * @param targetInput - The input element containing the incorrect letter
 * @param word - The word that the incorrect letter is in
 * @param poem - The poem that the word is in
 * 
 * If the user has made 3 incorrect attempts on the same letter, the letter is revealed and the user is moved onto the next letter.
 * Otherwise, the word is reset to empty and the user can try again.
 * 
 */
function handleIncorrectLetter(targetInput: LETTER_INPUT_TYPE, word: string, poem: string): void {
    targetInput.style.color = 'red';
    updateUserAid();

    // Destroy handler and replace after 1s
    const parent = targetInput.parentElement as HTMLSpanElement;
    parent.oninput = () => {};
    if (state.userAid.numberOfIncorrectAttempts === 3) {
        // Reveal the letter
        setTimeout(() => {
            targetInput.value = getLetterFromId(targetInput.id);
            parent.oninput = (event) => onInputEventHandler(word, event, poem);
            focusNextLetter(targetInput, poem);
            targetInput.style.color = LETTER_INPUT_DEFAULT_COLOR;
        }, 1000)
    } else {
        setTimeout(() => {
            resetLetterIndex();
            parent.oninput = (event) => onInputEventHandler(word, event, poem);
            targetInput.value = '';
            targetInput.style.color = LETTER_INPUT_DEFAULT_COLOR;
            targetInput.style.textAlign = 'start';
        }, 1000)
    }
}

/**
* Updates the number of consecutive incorrect attempts on a letter
*/
function updateUserAid() {
    if (state.userAid.letterIndex === state.userAid.letterIndexOfLatestIncorrectLetter) {
        state.userAid.numberOfIncorrectAttempts++;
    } else {
        state.userAid.letterIndexOfLatestIncorrectLetter = state.userAid.letterIndex;
        state.userAid.numberOfIncorrectAttempts = 1;
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
            incrementLetterIndex();
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
        incrementLetterIndex();
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
    resetUserAid();
    revertToTextAsComplete(state.focusedWord);
    moveToNextWord(poem);
}

// Marks a word as complete by converting back to text and cahnging colour to green
function revertToTextAsComplete(wordToRevert: string): void {
    const wordToRevertElement: HTMLSpanElement = GET_ELEMENT.getElementOfWord(wordToRevert);
    wordToRevertElement.innerHTML = WORD_FUNCS.removeNumberFromWord(wordToRevert);
    wordToRevertElement.style.color = 'green';
    wordToRevertElement.classList.remove('extraSpace');
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
    poemContainer.style.border = '1vh solid green';
    clearups.push(removeGreenCompletionBorder)
}

function removeGreenCompletionBorder() {
    const poemContainer = GET_ELEMENT.getPoemContainer();
    poemContainer.style.border = 'none';
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
    clearups.push(hideTryAgainButton);
}

function hideTryAgainButton() {
    const completionTextContainer = GET_ELEMENT.getCompletionText();
    completionTextContainer.style.display = 'none';
    completionTextContainer.style.textAlign = 'left';
}


function resetUserAid() {
    state.userAid.letterIndex = 0;
    state.userAid.numberOfIncorrectAttempts = 0;
}

/**
 * Resets the index of the last incorrect letter to 0 in the userAid object
 */
function resetLetterIndex() {
    state.userAid.letterIndex = 0;
}

function incrementLetterIndex() {
    state.userAid.letterIndex++;
}