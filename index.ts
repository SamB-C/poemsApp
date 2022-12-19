const POEM: string = `I met a traveller from an antique land,
Who said—"Two vast and trunkless legs of stone
Stand in the desert. . . . Near them, on the sand,
Half sunk a shattered visage lies, whose frown,
And wrinkled lip, and sneer of cold command,
Tell that its sculptor well those passions read
Which yet survive, stamped on these lifeless things,
The hand that mocked them, and the heart that fed;
And on the pedestal, these words appear:
My name is Ozymandias, King of Kings;
Look on my Works, ye Mighty, and despair!
Nothing beside remains. Round the decay
Of that colossal Wreck, boundless and bare
The lone and level sands stretch far away."`
const NUMBER_OF_WORDS_TO_REPLACE = 500;
const POEM_ID = '1poem_id1';
let numberOfWordsInPoem = 0;

// ============================================================================
// ================= Event handler (Assigned in replaceWord) =================
// ============================================================================

// =========================== Main event handler function ===========================


// Event handler for each individual letter input
function onInputEventHandler(word: string, event: Event) {
    // Check if letter is incorrect
    const targetInput: HTMLInputElement = event.target!;
    if (!compareInputToLetterId(targetInput.value, targetInput.id)) {
        targetInput.style.color = 'red';
        
        // Destroy handler and replace after 1s
        targetInput.oninput = () => {};
        setTimeout(() => {
            revertWordToEmpty(word);
            targetInput.oninput = (event) => onInputEventHandler(word, event);
            targetInput.style.color = 'black';
        }, 1000)
    } else {
        focusNextLetter(event.target);
    }
}

// --------------------------- Compare letter ---------------------------

// Compares the input to the correct answer
function compareInputToLetterId(input: string, id: string): boolean {
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
    const arrayOfChildren: Array<HTMLInputElement> = Array.from(wordElement.children);
    // Resets word
    for (let i: number = 0; i < arrayOfChildren.length; i++) {
        arrayOfChildren[i].value = '';
        focusFirstLetterOfWord(word);
    }
}


// --------------------------- Letter Right ---------------------------

// Focuses on the next/missing letter in the word, or if it is complete, move to next word
function focusNextLetter(currentLetter) {
    // Check if this letter is full
    if (currentLetter.value.length > 0) {
        // Focuses on the next letter
        const nextLetter: HTMLInputElement | null = currentLetter.nextSibling;
        if (nextLetter === null || nextLetter.value !== '') {
            focusMissingLetter(currentLetter)
        } else {
            nextLetter.focus()
        }
    }
}


// Check if word is full, completes if so, else focuses on missing letter
function focusMissingLetter(letterToCheckUsing: HTMLInputElement): void {
    const missingLetter: HTMLInputElement | null = checkAllLettersFull(letterToCheckUsing);
    if (missingLetter === null) {
        completeWord();
    } else {
        missingLetter.focus()
    }
}


// Checks if all the letters in a word are full - returns the letter that isn't if there is one
function checkAllLettersFull(singleLetter: HTMLInputElement): HTMLInputElement | null {
    // Retrieves all the letters in the word
    const parentSpan: HTMLElement = singleLetter.parentElement!;
    const allLetterInputs: Array<HTMLInputElement> = Array.from(parentSpan.children);
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
function completeWord():void {
    // Get the input values and combine into guessed word
    const focusedWordElement: HTMLSpanElement = getElementOfWord(focusedWord);
    const arrayOfChildren: Array<HTMLInputElement> = Array.from(focusedWordElement.children);
    let userInput: string = '';
    for (let i: number = 0; i < arrayOfChildren.length; i++) {
        userInput = userInput + arrayOfChildren[i].value;
    }
    // Marks as complete
    revertToTextAsComplete(focusedWord);
    wordsNotCompleted.splice(wordsNotCompleted.indexOf(focusedWord), 1);
    // Changes the word that is focused
    focusedWord = wordsNotCompleted[0]
    focusFirstLetterOfWord(focusedWord);
}

// Marks a word as complete by converting back to text and cahnging colour to green
function revertToTextAsComplete(wordToRevert: string): void {
    const wordToRevertElement: HTMLSpanElement = getElementOfWord(wordToRevert);
    wordToRevertElement.innerHTML = removeNumberFromWord(wordToRevert);
    wordToRevertElement.style.color = 'green';
}










// ============================================================================
// ============================== Initialisation ==============================
// ============================================================================

// --------------------------- Replace words in the poem ---------------------------

// Removes a certain number of words from the poem, and returns the words that were removed
// in order of appearance
function replaceWords(poem: string, numberOfWords: number): Array<string> {
    numberOfWords = rangeValidationForNumberOfWordsToReplace(numberOfWords, poem);
    const wordsReplaced: Array<string> = [];
    while (wordsReplaced.length < numberOfWords) {
        const potentialWord: string = selectRandomWordFromPoem(poem);
        if (!wordsReplaced.includes(potentialWord)) {
            wordsReplaced.push(potentialWord);
        }
    }
    insertionSortIntoOrderInPoem(poem, wordsReplaced)
    wordsReplaced.forEach((word: string): void => replaceWord(word));
    return wordsReplaced;
}


// Checks if number of words is greater than number of words in poem
// If yes, return number of words in poem, else return original number
function rangeValidationForNumberOfWordsToReplace(numberOfWordsToReplace: number, poem: string): number {
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
    const nonEmptyLines: Array<string> = lines.filter((line:string) => line !== '');
    const randomLine: string = nonEmptyLines[Math.floor(Math.random() * nonEmptyLines.length)];
    // Select random word
    const words: Array<string> = randomLine.split(/ /);
    const nonEmptyWords: Array<string> = words.filter((word:string) => word !== '');
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
function replaceWord(word: string):void {
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
    wordToHide.oninput = (event) => onInputEventHandler(word, event)
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
    return split_line.map((word: string):string => {
        numberOfWordsInPoem++;
        const wordId = getIdForWord(word);
        return `<span id="${wordId}">` + removeNumberFromWord(word) + "</span>";
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
            return word + wordsAlreadyInPoem[word];
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
function initialise(poem: string): Array<string> {
    const poemElement: HTMLElement = getPoemElement();
    poemElement.innerHTML = splitPoemToNewLines(poem);
    const wordsThatHaveBeenReplaced = replaceWords(poem, NUMBER_OF_WORDS_TO_REPLACE);
    const firstWord: string = wordsThatHaveBeenReplaced[0];
    focusFirstLetterOfWord(firstWord);
    return wordsThatHaveBeenReplaced;
}

const convertedPoem = addInstanceNumbersToWords(POEM)
const wordsNotCompleted: Array<string> = initialise(convertedPoem);
let focusedWord = wordsNotCompleted[0];




// HELPER FUNCTIONS

// Gets the poem element
function getPoemElement():HTMLElement {
    return document.getElementById(POEM_ID)!;
}

// Finds the element for the first letter of a missing word
function focusFirstLetterOfWord(word: string) {
    const inputToFocusId: string = `${getIdForLetter(word, word[0])}`;
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

// Gets the HTML element of a specific word
function getElementOfWord(word: string): HTMLSpanElement {
    const wordElement: HTMLSpanElement = document.getElementById(getIdForWord(word))!;
    return wordElement;
}

