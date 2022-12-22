import { poems } from "./poems.js";

let number_of_words_to_replace = 3;
const POEM_ID = '__poem_id__';
const RANGEBAR_ID = '__range_bar__';
const RANGEBAR_RESULT_ID = '__range_bar_result__';
const POEM_SELECT_ID = '__poem_selection__'
const NUMBER_ONLY_REGEX = /^[0-9]+$/
let numberOfWordsInPoem = 0;
const ANIMATION_SPEED: number = 20
const COVER_OVER_COMPLETED_WORDS = false;
let currentPoem = poems['Ozymandias'];

let wordsNotCompleted: Array<string> = [];
let wordsNotCompletedCopy: Array<string> = [...wordsNotCompleted];
let focusedWord = wordsNotCompleted[0];
initialisePoemOptions(poems);
initialise(currentPoem, number_of_words_to_replace);
initialiseRangebar();


// =========================== Intitalise poem select bar ===========================

function initialisePoemOptions(poems: {[key: string]: string}): void {
    const poemSelect = document.getElementById(POEM_SELECT_ID) as HTMLInputElement;
    for (let pomeName in poems) {
        let newOption: string = `<option value="${pomeName}">${pomeName}</option>`
        if (poems[pomeName] === currentPoem) {
            newOption = `<option value="${pomeName}" selected="seleted">${pomeName}</option>`
        }
        poemSelect.innerHTML = poemSelect.innerHTML + newOption
    }
    poemSelect.oninput = () => {
        const poemSelected = poemSelect.value;
        currentPoem = poems[poemSelected];
        initialise(currentPoem, number_of_words_to_replace);
        initialiseRangebar();
    }
}


// =========================== Intitalise range bar ===========================

// Initisalisation for the rangebar slider
function initialiseRangebar() {
    const rangeBar = document.getElementById(RANGEBAR_ID) as HTMLInputElement;
    // Sets min/max values for rangebar
    rangeBar.value = `${number_of_words_to_replace}`;
    rangeBar.min = "1";
    rangeBar.max = `${numberOfWordsInPoem}`;
    // Sets up the element that displays the value of the rangebar
    const rangeBarResult: HTMLElement = document.getElementById(RANGEBAR_RESULT_ID)!;
    rangeBarResult.innerHTML = rangeBar.value;
    // Don't re-render poem every time bar is dragged
    rangeBar.onpointerup = () => onRangebarInput(rangeBar)
    // Only update the displayed value of the input
    rangeBar.oninput = () => {
        const newValue = rangeBar.value;
        rangeBarResult.innerHTML = newValue;
    }
}

// Event handler for the rangebar input that changes the number of missing words
function onRangebarInput(rangeBar: HTMLInputElement) {
    // Get new value from range
    const newValue: number = parseInt(rangeBar.value);
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
function onInputEventHandler(word: string, event: Event, poem: string) {
    // Check if letter is incorrect
    const targetInput = event.target as HTMLInputElement;
    if (!compareInputToLetterId(targetInput.value, targetInput.id)) {
        targetInput.style.color = 'red';
        const parent = targetInput.parentElement as HTMLSpanElement;

        // Destroy handler and replace after 1s
        parent.oninput = () => {};
        setTimeout(() => {
            revertWordToEmpty(word);
            parent.oninput = (event) => onInputEventHandler(word, event, poem);
            targetInput.style.color = 'black';
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
    const wordElement: HTMLSpanElement = getElementOfWord(word);
    const arrayOfChildren: Array<HTMLInputElement> = getArrayOfChildrenThatAreInputs(wordElement);
    // Resets word
    for (let i: number = 0; i < arrayOfChildren.length; i++) {
        arrayOfChildren[i].value = '';
        focusFirstLetterOfWord(word);
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
    const focusedWordElement: HTMLSpanElement = getElementOfWord(focusedWord);
    const arrayOfChildren: Array<HTMLInputElement> = getArrayOfChildrenThatAreInputs(focusedWordElement)
    let userInput: string = '';
    for (let i: number = 0; i < arrayOfChildren.length; i++) {
        userInput = userInput + arrayOfChildren[i].value;
    }
    // Marks as complete
    revertToTextAsComplete(focusedWord);
    moveToNextWord(poem);
}

// Marks a word as complete by converting back to text and cahnging colour to green
function revertToTextAsComplete(wordToRevert: string): void {
    const wordToRevertElement: HTMLSpanElement = getElementOfWord(wordToRevert);
    wordToRevertElement.innerHTML = removeNumberFromWord(wordToRevert);
    wordToRevertElement.style.color = 'green';
}

// Moves to the next word, if none left, marks poem as complete
function moveToNextWord(poem: string): void {
    wordsNotCompleted.splice(wordsNotCompleted.indexOf(focusedWord), 1);
    if (wordsNotCompleted.length > 0) {
        focusedWord = wordsNotCompleted[0];
        focusFirstLetterOfWord(focusedWord);
    } else {
        completePoem(poem);
    }
}

// Uses an animation to turn all text green and add message below poem
function completePoem(poem: string): void {
    const poemElement: HTMLElement = getPoemElement();
    const completionColor: string = '#00FF00';
    const allWordsInPoem: Array<string> = getAllWordsInPoem(poem);
    changeAllWordsToColor(allWordsInPoem, wordsNotCompletedCopy, completionColor, ANIMATION_SPEED, () => {
        poemElement.innerHTML = poemElement.innerHTML + '</br>Complete! <span id="1try_again1">Try again</span>'
        const try_again: HTMLElement = document.getElementById('1try_again1')!;
        try_again.onclick = () => {
            initialise(currentPoem, number_of_words_to_replace);
            initialiseRangebar();
        } 
    });
}

// Splits the poem into a list of words
function getAllWordsInPoem(poem: string): Array<string> {
    const allLinesInPoem: Array<string> = poem.split(/\n/);
    const allWordsInPoem: Array<string> = allLinesInPoem.map((line: string): Array<string> => {
        return line.split(' ');
    }).reduce((accumulator: Array<string>, current: Array<string>) => {
        return accumulator.concat(current);
    })
    return allWordsInPoem;
}

// Animation to change all the words in the poem to a different color - A recursive function
function changeAllWordsToColor(wordsToChange: Array<string>, wordsNotToChange: Array<string>, color: string, timeBetweenConversion: number, callbackOption: Function) {
    // pops off next word to change color for
    const wordToChange: string | undefined = wordsToChange.shift();
    // Base case - word undefined
    if (wordToChange === undefined || wordToChange.match(NUMBER_ONLY_REGEX)) {
        return setTimeout(callbackOption, 200)
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
function replaceWords(poem: string, numberOfWords: number): Array<string> {
    numberOfWords = rangeValidationForNumberOfWordsToReplace(numberOfWords);
    const wordsReplaced: Array<string> = [];
    while (wordsReplaced.length < numberOfWords) {
        const potentialWord: string = selectRandomWordFromPoem(poem);
        if (!wordsReplaced.includes(potentialWord)) {
            wordsReplaced.push(potentialWord);
        }
    }
    insertionSortIntoOrderInPoem(poem, wordsReplaced)
    wordsReplaced.forEach((word: string): void => replaceWord(word, poem));
    return wordsReplaced;
}


// Checks if number of words is greater than number of words in poem
// If yes, return number of words in poem, else return original number
function rangeValidationForNumberOfWordsToReplace(numberOfWordsToReplace: number): number {
    if (numberOfWordsToReplace > numberOfWordsInPoem) {
        return numberOfWordsInPoem;
    } else {
        return numberOfWordsToReplace
    }
}

// Selects a word at random from the poem
function selectRandomWordFromPoem(poem: string):string {
    // Select random line
    const lines: Array<string> = poem.split(/\n/);
    const nonEmptyLines: Array<string> = lines.filter((line:string) => !line.match(NUMBER_ONLY_REGEX));
    const randomLine: string = nonEmptyLines[Math.floor(Math.random() * nonEmptyLines.length)];
    // Select random word
    const words: Array<string> = randomLine.split(/ /);
    const nonEmptyWords: Array<string> = words.filter((word:string) => !word.match(NUMBER_ONLY_REGEX));
    const randomWord: string = nonEmptyWords[Math.floor(Math.random() * nonEmptyWords.length)];
    return randomWord;
}


// Sorts the missing word in the poem into the order of appearance so they can be focused in order
function insertionSortIntoOrderInPoem(poem: string, words: Array<string>): Array<string> {
    for (let i: number = 1; i < words.length; i++) {
        let currentWordIndex: number = i
        let comparingWordIndex: number = i - 1;
        while (poem.indexOf(words[currentWordIndex]) < poem.indexOf(words[comparingWordIndex])) {
            [words[comparingWordIndex], words[currentWordIndex]] = [words[currentWordIndex], words[comparingWordIndex]];
            currentWordIndex--;
            comparingWordIndex--;
            if (currentWordIndex === 0) {
                break
            }
        }
    }
    return words
}


// Replaces a word from the poem in the HTML with underscores with equal length to the length of the word
function replaceWord(word: string, poem: string):void {
    // Turn each word into letter inputs
    const wordToHide: HTMLSpanElement = getElementOfWord(word);
    const wordInUnderScores: string = word.split('').map((letter) => {
        if (!isIlleagalLetter(letter)) {
            const htmlForLetter: string = `<input placeholder="_" size="1" maxlength="1" id="${getIdForLetter(word, letter)}"></input>`
            return htmlForLetter;
        }
    }).join('');
    wordToHide.innerHTML = wordInUnderScores;
    // Adds the event handlers for the input
    wordToHide.oninput = (event) => onInputEventHandler(word, event, poem)
    wordToHide.onclick = () => {
        focusedWord = word
    }
}


// --------------------------- Split poem and converty to HTML ---------------------------

// Splits a poem into lines, adds breaks to the end of each line (whilst also calling splitLineToWords to each line)
// Then joins all the lines back together and returns the poem
function splitPoemToNewLines(poem: string):string {
    const split_poem: Array<string> = poem.split(/\n/);
    return split_poem.map((line: string):string => {
        return splitLineToWords(line) + "</br>"
    }).join('');
}


// Splits a line into words, adds a span around it with the id equal to the word
// Then joins all the words back together and returns a line
function splitLineToWords(line: string):string {
    const split_line: Array<string> = line.split(/ /)
    return split_line.map((word: string):string | undefined => {
        if (!word.match(NUMBER_ONLY_REGEX)) {
            numberOfWordsInPoem++;
            const wordId = getIdForWord(word);
            return `<span id="${wordId}">` + removeNumberFromWord(word) + "</span>";
        }
    }).join(' ');
}



// --------------------------- Convert poem to remove duplicates ---------------------------
function addInstanceNumbersToWords(poem: string): string {
    const wordsAlreadyInPoem: {[word: string]: number} = {};
    const convertedPoem: string = poem.split(/\n/).map((line: string): string => {
        return line.split(' ').map((word): string => {
            if (word in wordsAlreadyInPoem) {
                wordsAlreadyInPoem[word] = wordsAlreadyInPoem[word] + 1;
            } else {
                wordsAlreadyInPoem[word] = 1
            }
            return wordsAlreadyInPoem[word] + word + wordsAlreadyInPoem[word];
        }).join(' ');
    }).join('\n');
    return convertedPoem
}

// Utilities for feature

function removeNumberFromWord(word: string): string {
    return word.split('').filter(letter => !isIlleagalLetter(letter)).join('');
}

function isIlleagalLetter(letter: string): boolean {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(letter);
}

// =========================== Intitalise poem ===========================

// Initialises the poem, by rendering it in
function initialise(poem: string, numberOfWordsToRemove: number) {
    poem = addInstanceNumbersToWords(poem)
    const poemElement: HTMLElement = getPoemElement();
    numberOfWordsInPoem = 0
    poemElement.innerHTML = splitPoemToNewLines(poem);
    const wordsThatHaveBeenReplaced = replaceWords(poem, numberOfWordsToRemove);
    const firstWord: string = wordsThatHaveBeenReplaced[0];
    focusFirstLetterOfWord(firstWord);
    wordsNotCompleted = wordsThatHaveBeenReplaced;
    wordsNotCompletedCopy = [...wordsNotCompleted];
    focusedWord = wordsNotCompleted[0];
}


// HELPER FUNCTIONS

function getArrayOfChildrenThatAreInputs(element: HTMLSpanElement): Array<HTMLInputElement> {
    const arrayOfChildren = Array.from(element.children) as Array<HTMLInputElement>;
    return arrayOfChildren;
}

// Gets the poem element
function getPoemElement():HTMLElement {
    return document.getElementById(POEM_ID)!;
}

// Gets the HTML element of a specific word
function getElementOfWord(word: string): HTMLSpanElement {
    const wordElement: HTMLSpanElement = document.getElementById(getIdForWord(word))!;
    return wordElement;
}


// Finds the element for the first letter of a missing word
function focusFirstLetterOfWord(word: string) {
    const inputToFocusId: string = `${getIdForLetter(word, word[1])}`;
    const firstInputElement: HTMLElement = document.getElementById(inputToFocusId)!;
    firstInputElement.focus();
}



// Sorting IDs

// Get a letter in the form of its binary code
function getBinaryFromLetter(letter:string): string {
    return letter.charCodeAt(0).toString(2);
}

// Abstraction for getting the id for a specific letter
function getIdForLetter(word: string, letter: string): string {
    return `${getIdForWord(word)}_${getBinaryFromLetter(letter)}`
}

// Abstraction for getting the id of a specific word
function getIdForWord(word: string): string {
    if (word.includes('"')) {
        return word.replace(/"/, "'");
    } else {
        return word
    }
}


