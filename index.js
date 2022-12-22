import { poems } from "./poems.js";
let number_of_words_to_replace = 3;
const POEM_ID = '__poem_id__';
const RANGEBAR_ID = '__range_bar__';
const RANGEBAR_RESULT_ID = '__range_bar_result__';
const POEM_SELECT_ID = '__poem_selection__';
let numberOfWordsInPoem = 0;
const ANIMATION_SPEED = 20;
const COVER_OVER_COMPLETED_WORDS = false;
let currentPoem = poems['Ozymandias'];
let wordsNotCompleted = [];
let wordsNotCompletedCopy = [...wordsNotCompleted];
let focusedWord = wordsNotCompleted[0];
initialisePoemOptions(poems);
initialise(currentPoem, number_of_words_to_replace);
initialiseRangebar();
// =========================== Intitalise poem select bar ===========================
function initialisePoemOptions(poems) {
    const poemSelect = document.getElementById(POEM_SELECT_ID);
    for (let pomeName in poems) {
        let newOption = `<option value="${pomeName}">${pomeName}</option>`;
        if (poems[pomeName] === currentPoem) {
            newOption = `<option value="${pomeName}" selected="seleted">${pomeName}</option>`;
        }
        poemSelect.innerHTML = poemSelect.innerHTML + newOption;
    }
    poemSelect.oninput = () => {
        const poemSelected = poemSelect.value;
        currentPoem = poems[poemSelected];
        initialise(currentPoem, number_of_words_to_replace);
        initialiseRangebar();
    };
}
// =========================== Intitalise range bar ===========================
// Initisalisation for the rangebar slider
function initialiseRangebar() {
    const rangeBar = document.getElementById(RANGEBAR_ID);
    // Sets min/max values for rangebar
    rangeBar.value = `${number_of_words_to_replace}`;
    rangeBar.min = "1";
    rangeBar.max = `${numberOfWordsInPoem}`;
    console.log(number_of_words_to_replace, 1, numberOfWordsInPoem);
    // Sets up the element that displays the value of the rangebar
    const rangeBarResult = document.getElementById(RANGEBAR_RESULT_ID);
    rangeBarResult.innerHTML = rangeBar.value;
    // Don't re-render poem every time bar is dragged
    rangeBar.onpointerup = () => onRangebarInput(rangeBar);
    // Only update the displayed value of the input
    rangeBar.oninput = () => {
        const newValue = rangeBar.value;
        rangeBarResult.innerHTML = newValue;
    };
}
// Event handler for the rangebar input that changes the number of missing words
function onRangebarInput(rangeBar) {
    // Get new value from range
    const newValue = parseInt(rangeBar.value);
    // Restart the poem with a new number of words
    initialise(currentPoem, newValue);
    // Changes the global variable pertaining to the number of missing words
    number_of_words_to_replace = newValue;
}
// ============================================================================
// ================= Event handler (Assigned in replaceWord) =================
// ============================================================================
// =========================== Letter input onchange event handler ===========================
// Event handler for each individual letter input
function onInputEventHandler(word, event, poem) {
    // Check if letter is incorrect
    const targetInput = event.target;
    if (!compareInputToLetterId(targetInput.value, targetInput.id)) {
        targetInput.style.color = 'red';
        // Destroy handler and replace after 1s
        targetInput.oninput = () => { };
        setTimeout(() => {
            revertWordToEmpty(word);
            targetInput.oninput = (event) => onInputEventHandler(word, event, poem);
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
    const wordAndLetterList = id.split('_');
    const letterInBinary = wordAndLetterList[wordAndLetterList.length - 1];
    const letter = String.fromCharCode(parseInt(letterInBinary, 2));
    return input === letter || (letter === '—' && input === '-');
}
// --------------------------- Letter Wrong ---------------------------
// Reverts a word back to underscores after incorrect input
function revertWordToEmpty(word) {
    // Retrive all inputs
    const wordElement = getElementOfWord(word);
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
    const focusedWordElement = getElementOfWord(focusedWord);
    const arrayOfChildren = getArrayOfChildrenThatAreInputs(focusedWordElement);
    let userInput = '';
    for (let i = 0; i < arrayOfChildren.length; i++) {
        userInput = userInput + arrayOfChildren[i].value;
    }
    // Marks as complete
    revertToTextAsComplete(focusedWord);
    moveToNextWord(poem);
}
// Marks a word as complete by converting back to text and cahnging colour to green
function revertToTextAsComplete(wordToRevert) {
    const wordToRevertElement = getElementOfWord(wordToRevert);
    wordToRevertElement.innerHTML = removeNumberFromWord(wordToRevert);
    wordToRevertElement.style.color = 'green';
}
// Moves to the next word, if none left, marks poem as complete
function moveToNextWord(poem) {
    wordsNotCompleted.splice(wordsNotCompleted.indexOf(focusedWord), 1);
    if (wordsNotCompleted.length > 0) {
        focusedWord = wordsNotCompleted[0];
        focusFirstLetterOfWord(focusedWord);
    }
    else {
        completePoem(poem);
    }
}
// Uses an animation to turn all text green and add message below poem
function completePoem(poem) {
    const poemElement = getPoemElement();
    const completionColor = '#00FF00';
    const allWordsInPoem = getAllWordsInPoem(poem);
    changeAllWordsToColor(allWordsInPoem, wordsNotCompletedCopy, completionColor, ANIMATION_SPEED, () => {
        poemElement.innerHTML = poemElement.innerHTML + '</br>Complete! <span id="1try_again1">Try again</span>';
        const try_again = document.getElementById('1try_again1');
        try_again.onclick = () => {
            initialise(currentPoem, number_of_words_to_replace);
            initialiseRangebar();
        };
    });
}
// Splits the poem into a list of words
function getAllWordsInPoem(poem) {
    const allLinesInPoem = poem.split(/\n/);
    const allWordsInPoem = allLinesInPoem.map((line) => {
        return line.split(' ');
    }).reduce((accumulator, current) => {
        return accumulator.concat(current);
    });
    return allWordsInPoem;
}
// Animation to change all the words in the poem to a different color - A recursive function
function changeAllWordsToColor(wordsToChange, wordsNotToChange, color, timeBetweenConversion, callbackOption) {
    // pops off next word to change color for
    const wordToChange = wordsToChange.shift();
    // Base case - word undefined
    if (wordToChange === undefined) {
        return setTimeout(callbackOption, 200);
    }
    // Only change color if it was not on of the words completed by the user (can be overridden)
    if (!wordsNotToChange.includes(wordToChange) || COVER_OVER_COMPLETED_WORDS) {
        const wordElement = getElementOfWord(wordToChange);
        wordElement.style.color = color;
    }
    // Recursive call with setTimeout so words don't all change colour at once
    return setTimeout(() => changeAllWordsToColor(wordsToChange, wordsNotToChange, color, timeBetweenConversion, callbackOption), timeBetweenConversion);
}
// ============================================================================
// ============================== Initialisation ==============================
// ============================================================================
// --------------------------- Replace words in the poem ---------------------------
// Removes a certain number of words from the poem, and returns the words that were removed
// in order of appearance
function replaceWords(poem, numberOfWords) {
    numberOfWords = rangeValidationForNumberOfWordsToReplace(numberOfWords);
    const wordsReplaced = [];
    while (wordsReplaced.length < numberOfWords) {
        const potentialWord = selectRandomWordFromPoem(poem);
        if (!wordsReplaced.includes(potentialWord)) {
            wordsReplaced.push(potentialWord);
        }
    }
    insertionSortIntoOrderInPoem(poem, wordsReplaced);
    wordsReplaced.forEach((word) => replaceWord(word, poem));
    return wordsReplaced;
}
// Checks if number of words is greater than number of words in poem
// If yes, return number of words in poem, else return original number
function rangeValidationForNumberOfWordsToReplace(numberOfWordsToReplace) {
    if (numberOfWordsToReplace > numberOfWordsInPoem) {
        return numberOfWordsInPoem;
    }
    else {
        return numberOfWordsToReplace;
    }
}
// Selects a word at random from the poem
function selectRandomWordFromPoem(poem) {
    // Select random line
    const lines = poem.split(/\n/);
    const nonEmptyLines = lines.filter((line) => !line.match(/^[0-9]+$/));
    const randomLine = nonEmptyLines[Math.floor(Math.random() * nonEmptyLines.length)];
    // Select random word
    const words = randomLine.split(/ /);
    const nonEmptyWords = words.filter((word) => !word.match(/^[0-9]+$/));
    const randomWord = nonEmptyWords[Math.floor(Math.random() * nonEmptyWords.length)];
    return randomWord;
}
// Sorts the missing word in the poem into the order of appearance so they can be focused in order
function insertionSortIntoOrderInPoem(poem, words) {
    for (let i = 1; i < words.length; i++) {
        let currentWordIndex = i;
        let comparingWordIndex = i - 1;
        while (poem.indexOf(words[currentWordIndex]) < poem.indexOf(words[comparingWordIndex])) {
            [words[comparingWordIndex], words[currentWordIndex]] = [words[currentWordIndex], words[comparingWordIndex]];
            currentWordIndex--;
            comparingWordIndex--;
            if (currentWordIndex === 0) {
                break;
            }
        }
    }
    return words;
}
// Replaces a word from the poem in the HTML with underscores with equal length to the length of the word
function replaceWord(word, poem) {
    // Turn each word into letter inputs
    const wordToHide = getElementOfWord(word);
    const wordInUnderScores = word.split('').map((letter) => {
        if (!isIlleagalLetter(letter)) {
            const htmlForLetter = `<input placeholder="_" size="1" maxlength="1" id="${getIdForLetter(word, letter)}"></input>`;
            return htmlForLetter;
        }
    }).join('');
    wordToHide.innerHTML = wordInUnderScores;
    // Adds the event handlers for the input
    wordToHide.oninput = (event) => onInputEventHandler(word, event, poem);
    wordToHide.onclick = () => {
        focusedWord = word;
    };
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
        if (!word.match(/^[0-9]+$/)) {
            numberOfWordsInPoem++;
            const wordId = getIdForWord(word);
            return `<span id="${wordId}">` + removeNumberFromWord(word) + "</span>";
        }
    }).join(' ');
}
// --------------------------- Convert poem to remove duplicates ---------------------------
function addInstanceNumbersToWords(poem) {
    const wordsAlreadyInPoem = {};
    const convertedPoem = poem.split(/\n/).map((line) => {
        return line.split(' ').map((word) => {
            if (word in wordsAlreadyInPoem) {
                wordsAlreadyInPoem[word] = wordsAlreadyInPoem[word] + 1;
            }
            else {
                wordsAlreadyInPoem[word] = 1;
            }
            return wordsAlreadyInPoem[word] + word + wordsAlreadyInPoem[word];
        }).join(' ');
    }).join('\n');
    return convertedPoem;
}
// Utilities for feature
function removeNumberFromWord(word) {
    return word.split('').filter(letter => !isIlleagalLetter(letter)).join('');
}
function isIlleagalLetter(letter) {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(letter);
}
// =========================== Intitalise poem ===========================
// Initialises the poem, by rendering it in
function initialise(poem, numberOfWordsToRemove) {
    poem = addInstanceNumbersToWords(poem);
    const poemElement = getPoemElement();
    numberOfWordsInPoem = 0;
    poemElement.innerHTML = splitPoemToNewLines(poem);
    const wordsThatHaveBeenReplaced = replaceWords(poem, numberOfWordsToRemove);
    const firstWord = wordsThatHaveBeenReplaced[0];
    focusFirstLetterOfWord(firstWord);
    wordsNotCompleted = wordsThatHaveBeenReplaced;
    wordsNotCompletedCopy = [...wordsNotCompleted];
    focusedWord = wordsNotCompleted[0];
}
// HELPER FUNCTIONS
function getArrayOfChildrenThatAreInputs(element) {
    const arrayOfChildren = Array.from(element.children);
    return arrayOfChildren;
}
// Gets the poem element
function getPoemElement() {
    return document.getElementById(POEM_ID);
}
// Gets the HTML element of a specific word
function getElementOfWord(word) {
    const wordElement = document.getElementById(getIdForWord(word));
    return wordElement;
}
// Finds the element for the first letter of a missing word
function focusFirstLetterOfWord(word) {
    const inputToFocusId = `${getIdForLetter(word, word[1])}`;
    const firstInputElement = document.getElementById(inputToFocusId);
    firstInputElement.focus();
}
// Sorting IDs
// Get a letter in the form of its binary code
function getBinaryFromLetter(letter) {
    return letter.charCodeAt(0).toString(2);
}
// Abstraction for getting the id for a specific letter
function getIdForLetter(word, letter) {
    return `${getIdForWord(word)}_${getBinaryFromLetter(letter)}`;
}
// Abstraction for getting the id of a specific word
function getIdForWord(word) {
    if (word.includes('"')) {
        return word.replace(/"/, "'");
    }
    else {
        return word;
    }
}
