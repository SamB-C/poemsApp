import { ANIMATION_SPEED, COVER_OVER_COMPLETED_WORDS, GET_ELEMENT, NUMBER_ONLY_REGEX, TRY_AGAIN_LINK_ELEMENT_AS_STR } from "./constantsAndTypes.js";
import { initialise, state } from "./index.js";
import { disableInputs, resetInputs, updateRangeBar } from "./inputs.js";
import { FOCUS, getAllWordSectionsInPoem, getArrayOfChildrenThatAreInputs, WORD_FUNCS } from "./utilities.js";
// =========================== Letter input onchange event handler ===========================
// Event handler for each individual letter input
export function onInputEventHandler(word, event, poem) {
    // Check if letter is incorrect
    const targetInput = event.target;
    if (targetInput.value.length === 0) {
        return;
    }
    if (!compareInputToLetterId(targetInput.value, targetInput.id)) {
        targetInput.style.color = 'red';
        const parent = targetInput.parentElement;
        // Destroy handler and replace after 1s
        parent.oninput = () => { };
        setTimeout(() => {
            revertWordToEmpty(word);
            parent.oninput = (event) => onInputEventHandler(word, event, poem);
            targetInput.style.color = 'black';
        }, 1000);
    }
    else {
        targetInput.style.textAlign = 'center';
        focusNextLetter(targetInput, poem);
    }
}
// --------------------------- Compare letter ---------------------------
// Compares the input to the correct answer
function compareInputToLetterId(input, id) {
    // Splits the id into a list [word, letterInBinary]
    const wordAndLetterList = id.split('_');
    const letterInBinary = wordAndLetterList[wordAndLetterList.length - 1];
    const letter = String.fromCharCode(parseInt(letterInBinary, 2));
    return input === letter || (letter === '—' && input === '-');
}
// --------------------------- Letter Wrong ---------------------------
// Reverts a word back to underscores after incorrect input
function revertWordToEmpty(word) {
    // Retrive all inputs
    const wordElement = GET_ELEMENT.getElementOfWord(word);
    const arrayOfChildren = getArrayOfChildrenThatAreInputs(wordElement);
    // Resets word
    for (let i = 0; i < arrayOfChildren.length; i++) {
        arrayOfChildren[i].value = '';
        arrayOfChildren[i].style.textAlign = 'start';
        FOCUS.focusFirstLetterOfWord(word);
    }
}
// --------------------------- Letter Right ---------------------------
// Focuses on the next/missing letter in the word, or if it is complete, move to next word
function focusNextLetter(currentLetter, poem) {
    // Check if this letter is full
    if (currentLetter.value.length > 0) {
        // Focuses on the next letter
        const nextLetter = currentLetter.nextSibling;
        if (nextLetter === null || nextLetter.value !== '') {
            focusMissingLetter(currentLetter, poem);
        }
        else {
            nextLetter.focus();
        }
    }
}
// Check if word is full, completes if so, else focuses on missing letter
function focusMissingLetter(letterToCheckUsing, poem) {
    const missingLetter = checkAllLettersFull(letterToCheckUsing);
    if (missingLetter === null) {
        completeWord(poem);
    }
    else {
        missingLetter.focus();
    }
}
// Checks if all the letters in a word are full - returns the letter that isn't if there is one
function checkAllLettersFull(singleLetter) {
    // Retrieves all the letters in the word
    const parentSpan = singleLetter.parentElement;
    const allLetterInputs = getArrayOfChildrenThatAreInputs(parentSpan);
    // Tries to find an empty letter
    for (let i = 0; i < allLetterInputs.length; i++) {
        if (allLetterInputs[i].value === '') {
            return allLetterInputs[i];
        }
    }
    // All full
    return null;
}
// When a word is completed, check if it is correct, if so, move onto next word
function completeWord(poem) {
    // Get the input values and combine into guessed word
    const focusedWordElement = GET_ELEMENT.getElementOfWord(state.focusedWord);
    const arrayOfChildren = getArrayOfChildrenThatAreInputs(focusedWordElement);
    let userInput = '';
    for (let i = 0; i < arrayOfChildren.length; i++) {
        userInput = userInput + arrayOfChildren[i].value;
    }
    // Marks as complete
    revertToTextAsComplete(state.focusedWord);
    moveToNextWord(poem);
}
// Marks a word as complete by converting back to text and cahnging colour to green
function revertToTextAsComplete(wordToRevert) {
    const wordToRevertElement = GET_ELEMENT.getElementOfWord(wordToRevert);
    wordToRevertElement.innerHTML = WORD_FUNCS.removeNumberFromWord(wordToRevert);
    wordToRevertElement.style.color = 'green';
}
// Moves to the next word, if none left, marks poem as complete
function moveToNextWord(poem) {
    state.wordsNotCompleted.splice(state.wordsNotCompleted.indexOf(state.focusedWord), 1);
    if (state.wordsNotCompleted.length > 0) {
        state.focusedWord = state.wordsNotCompleted[0];
        FOCUS.focusFirstLetterOfWord(state.focusedWord);
    }
    else {
        completePoem(poem);
    }
}
// Uses an animation to turn all text green and add message below poem
function completePoem(poem) {
    const completionColor = '#00FF00';
    const allWordsInPoem = getAllWordSectionsInPoem(poem);
    // Disable the inputs that re-render the poem
    const rangeBar = GET_ELEMENT.getRangeBar();
    const rangeBarIntitialValue = rangeBar.value;
    disableInputs();
    // Do animation
    changeAllWordsToColor(allWordsInPoem, state.wordsNotCompletedPreserved, completionColor, ANIMATION_SPEED, () => changeAllWordsToColourAnimationCleanup(rangeBar, rangeBarIntitialValue));
}
// Animation to change all the words in the poem to a different color - A recursive function
function changeAllWordsToColor(wordsToChange, wordsNotToChange, color, timeBetweenConversion, callbackOption) {
    // pops off next word to change color for
    const wordToChange = wordsToChange.shift();
    // Base case - word undefined
    if (wordToChange === undefined) {
        return setTimeout(callbackOption, timeBetweenConversion);
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
function changeAllWordsToColourAnimationCleanup(rangeBar, rangeBarIntitialValue) {
    // Tells the user they completed the poem
    const poemElement = GET_ELEMENT.getPoemElement();
    poemElement.innerHTML = poemElement.innerHTML + TRY_AGAIN_LINK_ELEMENT_AS_STR;
    // Add try again selection
    const try_again = GET_ELEMENT.getTryAgainLink();
    try_again.onclick = initialise;
    // Resets the disabled inputs
    resetInputs();
    setTimeout(() => updateRangeBar(rangeBar, rangeBarIntitialValue), 500);
}