import { convertedPoemsJSON, FAKE_SPACE_HTML_ELEMENT, GET_ELEMENT, NUMBER_ONLY_REGEX, POEM_AUTHOR_ID, POEM_SELECT_ID, State, WORDS } from "./constantsAndTypes.js";
import { initialisePoemOptions, initialiseRangebar, initialiseWordsOrQuotesRadioButtons } from "./inputs.js";
import { initialiseTryAgainLink } from "./letterInputEventHandler.js";
import { initialiseNotesForPoem } from "./renderNotes.js";
import { replaceQuotes, replaceWords } from "./replaceWordsOrQuotes.js";
import { FOCUS, GET_ID, WORD_FUNCS } from "./utilities.js";

export let state: State;


let poems: convertedPoemsJSON = {}
fetch("convertedPoems.json")
    .then(response => response.json())
    .then(data => {
        poems = data
        initialiseState(poems);
        initialiseWordsOrQuotesRadioButtons()
        initialisePoemOptions();
        initialise();
        addPoemAuthor();
        initialiseTryAgainLink();
        initialiseRangebar();
    });


export const clearups: Array<() => void> = [];

function initialiseState(poems: convertedPoemsJSON) {
    state = {
        currentPoemName: 'The Manhunt',
        poemData: poems,
        percentageWordsToRemove: 5,
        removalType: WORDS,
        focusedWord: '',
        wordsNotCompleted: [],
        wordsNotCompletedPreserved: [],
        userAid: {
            letterIndexOfLatestIncorrectLetter: 0,
            letterIndex: 0,
            numberOfIncorrectAttempts: 0
        }
    }
}

// ============================================================================
// ============================== Initialisation ==============================
// ============================================================================

// --------------------------- Render the poem author ---------------------------

export function addPoemAuthor() {
    const poemName: string = state.currentPoemName;
    const poemAuthor: string = state.poemData[poemName].author;
    const poemAuthorElement = document.getElementById(POEM_AUTHOR_ID) as HTMLParagraphElement;
    poemAuthorElement.innerHTML = poemAuthor.toUpperCase();
}

// Align the text of poems either to side or center
function centerPoem(poemElement: HTMLElement) {
    const currentPoemName = state.currentPoemName;
    const poemSelect = document.getElementById(POEM_SELECT_ID) as HTMLSelectElement;
    const poemAuthor = document.getElementById(POEM_AUTHOR_ID) as HTMLParagraphElement;
    if (poems[currentPoemName]['centered']) {
        poemElement.style.textAlign = 'center';
        poemSelect.style.textAlign = 'center';
        poemAuthor.style.textAlign = 'center';
    } else {
        poemElement.style.textAlign = 'left';
        poemSelect.style.textAlign = 'left';
        poemAuthor.style.textAlign = 'left';
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
        const sectionsToMakeSpanFor = WORD_FUNCS.getWordSectionsFromWord(word);
        if (sectionsToMakeSpanFor.length === 1) {
            return makeSpanForWord(word);
        } else {
            return sectionsToMakeSpanFor.map((word: string) => {
                return makeSpanForWord(word)
            }).join(FAKE_SPACE_HTML_ELEMENT);
        }
    }).join(' ');
}


function makeSpanForWord(word: string): string {
    if (!word.match(NUMBER_ONLY_REGEX)) {
        const wordId = GET_ID.getIdForWord(word);
        return `<span id="${wordId}" class="wordSection">` + WORD_FUNCS.removeNumberFromWord(word) + "</span>";
    } else {
        // Code for a space
        return '&nbsp'
    }
}

// =========================== Intitalise poem ===========================

// Initialises the poem, by rendering it in
export function initialise() {
    reset();
    // Render the correct poem
    const poemElement: HTMLElement = GET_ELEMENT.getPoemElement();
    const currentPoemContent = state.poemData[state.currentPoemName].convertedPoem;
    poemElement.innerHTML = splitPoemToNewLines(currentPoemContent);
    centerPoem(poemElement);
    // Replace words
    let wordsThatHaveBeenReplaced: Array<string> = getWordsThatHaveBeenReplaced(currentPoemContent);
    initialiseNotesForPoem();
    
    focusFirstWord(wordsThatHaveBeenReplaced);
    updateStateINITIALISE(wordsThatHaveBeenReplaced);
    fixWidth();
}


function getWordsThatHaveBeenReplaced(currentPoemContent: string): Array<string> {
    if (state.removalType === WORDS) {
        return replaceWords(currentPoemContent);
    } else  {
        return replaceQuotes(state.poemData[state.currentPoemName].quotes);
    }
}

function focusFirstWord(wordsThatHaveBeenReplaced: Array<string>) {
    const firstWord: string = wordsThatHaveBeenReplaced[0];
    FOCUS.focusFirstLetterOfWord(firstWord);
}

function updateStateINITIALISE(wordsThatHaveBeenReplaced: Array<string>) {
    state.wordsNotCompleted = wordsThatHaveBeenReplaced;
    state.wordsNotCompletedPreserved = [...wordsThatHaveBeenReplaced];
    state.focusedWord = wordsThatHaveBeenReplaced[0];
}

function reset() {
    clearups.forEach(clearup => clearup());
}

function unfixWidth() {
    const html = GET_ELEMENT.getHtmlElement();
    html.style.setProperty('--main-content-container-width', 'fit-content');
}

function fixWidth() {
    const html = GET_ELEMENT.getHtmlElement();
    const poemContainer = GET_ELEMENT.getPoemContainer();
    const fixedWidth = poemContainer.clientWidth;
    const fixedWidthInPixels = fixedWidth.toString()+'px'
    html.style.setProperty('--main-content-container-width', fixedWidthInPixels);
    clearups.push(unfixWidth);
}