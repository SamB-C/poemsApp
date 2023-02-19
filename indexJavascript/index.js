import { FAKE_SPACE_HTML_ELEMENT, GET_ELEMENT, NUMBER_ONLY_REGEX, POEM_AUTHOR_ID, POEM_SELECT_ID, QUOTES, WORDS } from "./constantsAndTypes.js";
import { initialisePoemOptions, initialiseRangebar, initialiseWordsOrQuotesRadioButtons } from "./inputs.js";
import { removeGreenCompletionBorder } from "./letterInputEventHandler.js";
import { initialiseNotesForPoem } from "./renderNotes.js";
import { replaceQuotes, replaceWords } from "./replaceWordsOrQuotes.js";
import { FOCUS, GET_ID, WORD_FUNCS } from "./utilities.js";
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
        return `<span id="${wordId}" class="wordSection">` + WORD_FUNCS.removeNumberFromWord(word) + "</span>";
    }
    else {
        // Code for a space
        return '&nbsp';
    }
}
// =========================== Intitalise poem ===========================
// Initialises the poem, by rendering it in
export function initialise() {
    removeGreenCompletionBorder();
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
    initialiseNotesForPoem();
    const firstWord = wordsThatHaveBeenReplaced[0];
    FOCUS.focusFirstLetterOfWord(firstWord);
    state.wordsNotCompleted = wordsThatHaveBeenReplaced;
    state.wordsNotCompletedPreserved = [...wordsThatHaveBeenReplaced];
    state.focusedWord = wordsThatHaveBeenReplaced[0];
}
