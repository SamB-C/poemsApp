"use strict";
let number_of_words_to_replace = 3;
const POEM_ID = '__poem_id__';
const RANGEBAR_ID = '__range_bar__';
const RANGEBAR_RESULT_ID = '__range_bar_result__';
const POEM_SELECT_ID = '__poem_selection__';
const TRY_AGAIN_LINK_ID = '__try_again__';
const NUMBER_ONLY_REGEX = /^[0-9]+$/;
const SPECIAL_CHARACTER_REGEX = /[.,:;]/;
const FAKE_SPACE = '|+|';
const FAKE_SPACE_HTML_ELEMENT = `<p class="fakeSpace">${FAKE_SPACE}</p>`;
const ANIMATION_SPEED = 20;
const COVER_OVER_COMPLETED_WORDS = false;
const INPUT_OPTIONS = 'placeholder="_" size="1" maxlength="1" autocapitalize="off" class="letter_input"';
let numberOfWordsInPoem = 0;
let wordsNotCompleted = [];
let wordsNotCompletedCopy = [...wordsNotCompleted];
let focusedWord = wordsNotCompleted[0];
let currentPoem;
let poems = {};
fetch("convertedPoems.json")
    .then(response => response.json())
    .then(data => {
    poems = data;
    currentPoem = poems['The Manhunt']['convertedPoem'];
    initialisePoemOptions(poems);
    initialise(currentPoem, number_of_words_to_replace);
    initialiseRangebar(poems);
});
// =========================== Intitalise poem select bar ===========================
function initialisePoemOptions(poems) {
    const poemSelect = document.getElementById(POEM_SELECT_ID);
    for (let pomeName in poems) {
        let newOption = `<option value="${pomeName}">${pomeName}</option>`;
        if (poems[pomeName].convertedPoem === currentPoem) {
            newOption = `<option value="${pomeName}" selected="seleted">${pomeName}</option>`;
        }
        poemSelect.innerHTML = poemSelect.innerHTML + newOption;
    }
    poemSelect.oninput = () => onPoemSelectInput(poems, poemSelect);
}
function onPoemSelectInput(poems, poemSelect) {
    const poemSelected = poemSelect.value;
    currentPoem = poems[poemSelected].convertedPoem;
    initialise(currentPoem, number_of_words_to_replace);
    initialiseRangebar(poems);
}
// =========================== Intitalise range bar ===========================
// Initisalisation for the rangebar slider
function initialiseRangebar(poems) {
    const rangeBar = document.getElementById(RANGEBAR_ID);
    // Sets min/max values for rangebar
    rangeBar.value = `${number_of_words_to_replace}`;
    rangeBar.min = "1";
    numberOfWordsInPoem = getNumberOfWordsInCurrentPoem(poems);
    rangeBar.max = `${numberOfWordsInPoem}`;
    // Sets up the element that displays the value of the rangebar
    const rangeBarResult = document.getElementById(RANGEBAR_RESULT_ID);
    rangeBarResult.innerHTML = rangeBar.value;
    addRangebarEvents(rangeBar, rangeBarResult);
}
function getNumberOfWordsInCurrentPoem(poems) {
    const currentPoemName = getCurrentPoemName(poems);
    return poems[currentPoemName].wordCount;
}
function getCurrentPoemName(poems) {
    for (let poemName in poems) {
        if (poems[poemName].convertedPoem === currentPoem) {
            return poemName;
        }
    }
    console.error('Name of currentPoem can not be found in poems');
    return '';
}
function addRangebarEvents(rangeBar, rangeBarResult) {
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
    const completionColor = '#00FF00';
    const allWordsInPoem = getAllWordSectionsInPoem(poem);
    // Disable the inputs that re-render the poem
    const rangeBar = document.getElementById(RANGEBAR_ID);
    const poemSelectInput = document.getElementById(POEM_SELECT_ID);
    const rangeBarIntitialValue = rangeBar.value;
    disableInputs(rangeBar, poemSelectInput);
    // Do animation
    changeAllWordsToColor(allWordsInPoem, wordsNotCompletedCopy, completionColor, ANIMATION_SPEED, () => changeAllWordsToColourAnimationCleanup(rangeBar, poemSelectInput, rangeBarIntitialValue));
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
        return getWordSectionsFromWord(word);
    }).reduce((accumulator, wordSections) => {
        return accumulator.concat(wordSections);
    });
    return allWordSectionsInPoem;
}
// Disables inputs that re-render the poem, so it is not re-rendered mid-animation (opposite to resetInputs)
function disableInputs(rangeBar, poemSelectInput) {
    rangeBar.onpointerup = () => { };
    poemSelectInput.disabled = true;
}
// Resets event handler once the animation is complete (opposite to disableInputs)
function resetInputs(rangeBar, poemSelectInput) {
    // Reset the inputs' event handlers
    const rangeBarResult = document.getElementById(RANGEBAR_RESULT_ID);
    addRangebarEvents(rangeBar, rangeBarResult);
    poemSelectInput.disabled = false;
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
        const wordElement = getElementOfWord(wordToChange);
        wordElement.style.color = color;
    }
    // Recursive call with setTimeout so words don't all change colour at once
    return setTimeout(() => changeAllWordsToColor(wordsToChange, wordsNotToChange, color, timeBetweenConversion, callbackOption), timeBetweenConversion);
}
// Cleanup function for after animation
function changeAllWordsToColourAnimationCleanup(rangeBar, poemSelectInput, rangeBarIntitialValue) {
    // Tells the user they completed the poem
    const poemElement = getPoemElement();
    poemElement.innerHTML = poemElement.innerHTML + `</br>Complete! <span id="${TRY_AGAIN_LINK_ID}">Try again</span>`;
    // Add try again selection
    const try_again = document.getElementById(TRY_AGAIN_LINK_ID);
    try_again.onclick = onTryAgainClick;
    // Resets the disabled inputs
    resetInputs(rangeBar, poemSelectInput);
    setTimeout(() => updateRangeBar(rangeBar, rangeBarIntitialValue), 500);
}
// Event handler for try again link
function onTryAgainClick() {
    initialise(currentPoem, number_of_words_to_replace);
    initialiseRangebar(poems);
}
// Updates range bar in case it has been changed
function updateRangeBar(rangeBar, initialValue) {
    if (initialValue !== rangeBar.value) {
        onRangebarInput(rangeBar);
    }
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
    const wordSectionsReplaced = wordsReplaced.map((word) => replaceWord(word, poem));
    return wordSectionsReplaced.reduce((accumulator, wordSections) => {
        return accumulator.concat(wordSections);
    });
}
// Checks if number of words is greater than number of words in poem
// If yes, return number of words in poem, else return original number
function rangeValidationForNumberOfWordsToReplace(numberOfWordsToReplace) {
    numberOfWordsInPoem = getNumberOfWordsInCurrentPoem(poems);
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
    const nonEmptyLines = lines.filter((line) => !line.match(NUMBER_ONLY_REGEX));
    const randomLine = nonEmptyLines[Math.floor(Math.random() * nonEmptyLines.length)];
    // Select random word
    const words = randomLine.split(/ /);
    const nonEmptyWords = words.filter((word) => !word.match(NUMBER_ONLY_REGEX));
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
    const wordSectionsToHide = getWordSectionsFromWord(word);
    wordSectionsToHide.forEach((wordSection) => {
        const wordToHide = getElementOfWord(wordSection);
        const wordInUnderScores = wordSection.split('').map((letter) => {
            if (!isIlleagalLetter(letter)) {
                const htmlForLetter = `<input ${INPUT_OPTIONS} id="${getIdForLetter(wordSection, letter)}"></input>`;
                return htmlForLetter;
            }
        }).join('');
        wordToHide.innerHTML = wordInUnderScores;
        // Adds the event handlers for the input
        wordToHide.oninput = (event) => onInputEventHandler(wordSection, event, poem);
        wordToHide.onclick = () => {
            focusedWord = wordSection;
        };
        const childrenToAddOnInputTo = getArrayOfChildrenThatAreInputs(wordToHide);
        childrenToAddOnInputTo.forEach((input) => {
            input.oninput = ensureMaxLengthNotExceeded;
        });
    });
    return wordSectionsToHide;
}
function ensureMaxLengthNotExceeded(event) {
    const targetInput = event.target;
    const firstLetter = targetInput.value.charAt(0);
    targetInput.value = firstLetter;
}
// Align the text of poems either to side or center
function centerPoem(poemElement) {
    const currentPoemName = getCurrentPoemName(poems);
    if (poems[currentPoemName]['centered']) {
        console.log('center');
        poemElement.style.textAlign = 'center';
    }
    else {
        poemElement.style.textAlign = 'left';
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
        const sectionsToMakeSpanFor = getWordSectionsFromWord(word);
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
        const wordId = getIdForWord(word);
        return `<span id="${wordId}">` + removeNumberFromWord(word) + "</span>";
    }
    else {
        // Code for a space
        return '&nbsp';
    }
}
// --------------------------- Convert poem to remove duplicates ---------------------------
function addInstanceNumbersToWords(poem) {
    const wordsAlreadyInPoem = {};
    const convertedPoem = poem.split(/\n/).map((line) => {
        return line.split(' ').map((word) => {
            if (word.match(SPECIAL_CHARACTER_REGEX)) {
                const newWord = word.split('').map((letter) => {
                    if (letter.match(SPECIAL_CHARACTER_REGEX)) {
                        return FAKE_SPACE + letter;
                    }
                    else {
                        return letter;
                    }
                }).join('');
                return newWord.split(FAKE_SPACE).map((sectionOfWord) => {
                    return giveWordInstanceNumber(sectionOfWord, wordsAlreadyInPoem);
                }).join(FAKE_SPACE);
            }
            else {
                return giveWordInstanceNumber(word, wordsAlreadyInPoem);
            }
        }).join(' ');
    }).join('\n');
    return convertedPoem;
}
function giveWordInstanceNumber(word, instances) {
    if (word in instances) {
        instances[word] = instances[word] + 1;
    }
    else {
        instances[word] = 1;
    }
    return instances[word] + word + instances[word];
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
    const poemElement = getPoemElement();
    poemElement.innerHTML = splitPoemToNewLines(poem);
    centerPoem(poemElement);
    const wordsThatHaveBeenReplaced = replaceWords(poem, numberOfWordsToRemove);
    // console.log(wordsThatHaveBeenReplaced);
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
function getWordSectionsFromWord(word) {
    return word.split(FAKE_SPACE).filter((wordSection) => {
        return wordSection !== '';
    });
}
