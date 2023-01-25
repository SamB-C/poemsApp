import { ANIMATION_SPEED, COVER_OVER_COMPLETED_WORDS, FAKE_SPACE_HTML_ELEMENT, GET_ELEMENT, NUMBER_ONLY_REGEX, POEM_AUTHOR_ID, POEM_SELECT_ID, QUOTES, TRY_AGAIN_LINK_ID, WORDS } from "./constantsAndTypes.js";
import { disableInputs, initialisePoemOptions, initialiseRangebar, initialiseWordsOrQuotesRadioButtons, resetInputs, updateRangeBar } from "./inputs.js";
import { replaceQuotes, replaceWords } from "./replaceWordsOrQuotes.js";
import { getArrayOfChildrenThatAreInputs, GET_ID, WORD_FUNCS } from "./utilities.js";
export let state;
let poems = {};
fetch("convertedPoems.json")
    .then(response => response.json())
    .then(data => {
    poems = data;
    initialiseState(poems);
    initialiseWordsOrQuotesRadioButtons();
    initialisePoemOptions();
    initialise();
    addPoemAuthor();
    initialiseRangebar();
});
function initialiseState(poems) {
    state = {
        currentPoemName: 'The Manhunt',
        poemData: poems,
        numWordsToRemove: 3,
        removalType: WORDS,
        focusedWord: '',
        wordsNotCompleted: [],
        wordsNotCompletedPreserved: []
    };
}
// ============================================================================
// ================= Event handler (Assigned in replaceWord) =================
// ============================================================================
// =========================== Letter input onchange event handler ===========================
// Event handler for each individual letter input
export function onInputEventHandler(word, event, poem) {
    // Check if letter is incorrect
    const targetInput = event.target;
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
        focusFirstLetterOfWord(word);
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
        focusFirstLetterOfWord(state.focusedWord);
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
// Splits the poem into a list of words
function getAllWordSectionsInPoem(poem) {
    const allLinesInPoem = poem.split(/\n/);
    const allWordsInPoem = allLinesInPoem.map((line) => {
        return line.split(' ');
    }).reduce((accumulator, current) => {
        return accumulator.concat(current);
    });
    const allWordSectionsInPoem = allWordsInPoem.map((word) => {
        return WORD_FUNCS.getWordSectionsFromWord(word);
    }).reduce((accumulator, wordSections) => {
        return accumulator.concat(wordSections);
    });
    return allWordSectionsInPoem;
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
    poemElement.innerHTML = poemElement.innerHTML + `</br>Complete! <span id="${TRY_AGAIN_LINK_ID}">Try again</span>`;
    // Add try again selection
    const try_again = document.getElementById(TRY_AGAIN_LINK_ID);
    try_again.onclick = onTryAgainClick;
    // Resets the disabled inputs
    resetInputs();
    setTimeout(() => updateRangeBar(rangeBar, rangeBarIntitialValue), 500);
}
// Event handler for try again link
function onTryAgainClick() {
    initialise();
    initialiseRangebar();
}
// ============================================================================
// ============================== Initialisation ==============================
// ============================================================================
// --------------------------- Render the poem author ---------------------------
export function addPoemAuthor() {
    const poemName = state.currentPoemName;
    const poemAuthor = state.poemData[poemName].author;
    const poemAuthorElement = document.getElementById(POEM_AUTHOR_ID);
    poemAuthorElement.innerHTML = poemAuthor.toUpperCase();
}
// Align the text of poems either to side or center
function centerPoem(poemElement) {
    const currentPoemName = state.currentPoemName;
    const poemSelect = document.getElementById(POEM_SELECT_ID);
    const poemAuthor = document.getElementById(POEM_AUTHOR_ID);
    if (poems[currentPoemName]['centered']) {
        poemElement.style.textAlign = 'center';
        poemSelect.style.textAlign = 'center';
        poemAuthor.style.textAlign = 'center';
    }
    else {
        poemElement.style.textAlign = 'left';
        poemSelect.style.textAlign = 'left';
        poemAuthor.style.textAlign = 'left';
    }
}
// --------------------------- Split poem and converty to HTML ---------------------------
// Splits a poem into lines, adds breaks to the end of each line (whilst also calling splitLineToWords to each line)
// Then joins all the lines back together and returns the poem
function splitPoemToNewLines(poem) {
    const split_poem = poem.split(/\n/);
    return split_poem.map((line) => {
        return splitLineToWords(line) + "</br>";
    }).join('');
}
// Splits a line into words, adds a span around it with the id equal to the word
// Then joins all the words back together and returns a line
function splitLineToWords(line) {
    const split_line = line.split(/ /);
    return split_line.map((word) => {
        const sectionsToMakeSpanFor = WORD_FUNCS.getWordSectionsFromWord(word);
        if (sectionsToMakeSpanFor.length === 1) {
            return makeSpanForWord(word);
        }
        else {
            return sectionsToMakeSpanFor.map((word) => {
                return makeSpanForWord(word);
            }).join(FAKE_SPACE_HTML_ELEMENT);
        }
    }).join(' ');
}
function makeSpanForWord(word) {
    if (!word.match(NUMBER_ONLY_REGEX)) {
        const wordId = GET_ID.getIdForWord(word);
        return `<span id="${wordId}">` + WORD_FUNCS.removeNumberFromWord(word) + "</span>";
    }
    else {
        // Code for a space
        return '&nbsp';
    }
}
// =========================== Intitalise poem ===========================
// Initialises the poem, by rendering it in
export function initialise() {
    const poemElement = GET_ELEMENT.getPoemElement();
    const currentPoemContent = state.poemData[state.currentPoemName].convertedPoem;
    poemElement.innerHTML = splitPoemToNewLines(currentPoemContent);
    centerPoem(poemElement);
    let wordsThatHaveBeenReplaced = [];
    if (state.removalType === WORDS) {
        wordsThatHaveBeenReplaced = replaceWords(currentPoemContent);
    }
    else if (state.removalType === QUOTES) {
        wordsThatHaveBeenReplaced = replaceQuotes(state.poemData[state.currentPoemName].quotes);
    }
    const firstWord = wordsThatHaveBeenReplaced[0];
    focusFirstLetterOfWord(firstWord);
    state.wordsNotCompleted = wordsThatHaveBeenReplaced;
    state.wordsNotCompletedPreserved = [...wordsThatHaveBeenReplaced];
    state.focusedWord = wordsThatHaveBeenReplaced[0];
}
// HELPER FUNCTIONS
// Finds the element for the first letter of a missing word
function focusFirstLetterOfWord(word) {
    const firstLetter = WORD_FUNCS.removeNumberFromWord(word)[0];
    const inputToFocusId = `${GET_ID.getIdForLetter(word, firstLetter)}`;
    const firstInputElement = document.getElementById(inputToFocusId);
    firstInputElement.focus();
}
