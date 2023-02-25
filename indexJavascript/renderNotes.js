import { GET_ELEMENT, NOTE_REMOVAL_DELAY, UNDERLINE_COLORS } from "./constantsAndTypes.js";
import { state } from "./index.js";
import { getAllWordSectionsInPoem } from "./utilities.js";
let numberOfDisplayedNotes = 0;
export function initialiseNotesForPoem() {
    const currentPoemContent = state.poemData[state.currentPoemName].convertedPoem;
    const allWordSectionsInPoem = getAllWordSectionsInPoem(currentPoemContent);
    allWordSectionsInPoem.forEach(wordSection => {
        addWordSectionEventListener(wordSection);
    });
}
function addWordSectionEventListener(wordSection) {
    const wordAsElement = GET_ELEMENT.getElementOfWord(wordSection);
    wordAsElement.style.cursor = 'default';
    const associatedNotes = getAssociatedNotes(wordSection);
    // Underline note
    wordAsElement.onpointerover = () => underlineNotes(associatedNotes, wordAsElement);
    // Remove underline
    wordAsElement.onpointerout = () => unUnderlineNotes(associatedNotes, wordAsElement, false, undefined);
}
function underlineNotes(notesToUnderline, wordSectionElement) {
    const firstElement = wordSectionElement.firstChild;
    if (firstElement.nodeName === "INPUT") {
        return;
    }
    Object.keys(notesToUnderline).forEach((noteText) => {
        const color = notesToUnderline[noteText].color;
        const colorNumber = UNDERLINE_COLORS.indexOf(color) + 1;
        notesToUnderline[noteText].noteValue.forEach(word => {
            const wordElement = GET_ELEMENT.getElementOfWord(word);
            let noUnderlineClass = true;
            wordElement.classList.forEach((className) => {
                if (className.match(/underline/)) {
                    noUnderlineClass = false;
                    const underlineClass = getNewUnderlineClass(className, colorNumber);
                    addUnderlineClass(underlineClass, wordElement);
                }
            });
            if (noUnderlineClass) {
                addUnderlineClass(`underline${colorNumber}`, wordElement);
            }
        });
    });
    const timout = window.setTimeout(() => {
        Object.keys(notesToUnderline).forEach((noteText) => {
            hideNotesInfo();
            const color = notesToUnderline[noteText].color;
            const colorNumber = UNDERLINE_COLORS.indexOf(color) + 1;
            const notesElement = GET_ELEMENT.getNotes();
            notesElement.insertAdjacentHTML('beforeend', `<p id="${noteText}" class="underline${colorNumber} ${color} noteTextIn noteText">${noteText}</p>`);
            numberOfDisplayedNotes++;
        });
        wordSectionElement.onpointerout = () => unUnderlineNotes(notesToUnderline, wordSectionElement, true, undefined);
    }, 500);
    wordSectionElement.onpointerout = () => unUnderlineNotes(notesToUnderline, wordSectionElement, false, timout);
}
function addUnderlineClass(className, wordElement) {
    const firstElement = wordElement.firstChild;
    if (firstElement.nodeName !== "INPUT") {
        wordElement.classList.add(className);
        wordElement.classList.add('opacity');
    }
}
function getNewUnderlineClass(className, colorNumberToAdd) {
    const classNameAsList = className.split('');
    const originalColorNumberStr = classNameAsList[classNameAsList.length - 1];
    const originalColorNumber = Number(originalColorNumberStr);
    const newColorNumber = originalColorNumber + colorNumberToAdd + 1;
    return `underline${newColorNumber}`;
}
const removalNumber = [0];
function unUnderlineNotes(notesToUnderline, wordSectionElement, removeNotes, timeoutToCear) {
    const firstElement = wordSectionElement.firstChild;
    if (firstElement.nodeName === "INPUT") {
        return;
    }
    Object.keys(notesToUnderline).forEach((noteText) => {
        notesToUnderline[noteText].noteValue.forEach(word => {
            const wordElement = GET_ELEMENT.getElementOfWord(word);
            wordElement.classList.forEach((className) => {
                if (className.match(/underline/)) {
                    wordElement.classList.remove('opacity');
                    wordElement.classList.remove(className);
                }
            });
        });
        if (removeNotes) {
            setTimeout(() => {
                if (getNumberOfDisplayedNotes() === 0) {
                    showNotesInfo();
                }
            }, NOTE_REMOVAL_DELAY + 2000);
            removalNumber[0]++;
            const noteTextElement = document.getElementById(noteText);
            noteTextElement.id = removalNumber.toString();
            const numberCopy = [...removalNumber];
            noteTextElement.classList.remove('noteTextIn');
            noteTextElement.classList.add('noteTextOut');
            setTimeout(() => {
                const elementToRemove = document.getElementById(numberCopy.toString());
                elementToRemove.remove();
                numberOfDisplayedNotes--;
            }, NOTE_REMOVAL_DELAY);
            wordSectionElement.onpointerout = () => unUnderlineNotes(notesToUnderline, wordSectionElement, false, undefined);
        }
        else if (timeoutToCear) {
            clearTimeout(timeoutToCear);
        }
    });
}
function getAssociatedNotes(wordSection) {
    const currentPoemNotes = state.poemData[state.currentPoemName].notes;
    const associatedNotes = {};
    let numberOfAssociatedNotes = 0;
    Object.keys(currentPoemNotes).forEach((noteText) => {
        const noteValue = currentPoemNotes[noteText];
        if (noteValue.includes(wordSection)) {
            numberOfAssociatedNotes++;
            associatedNotes[noteText] = { noteValue, color: UNDERLINE_COLORS[numberOfAssociatedNotes - 1] };
        }
    });
    return associatedNotes;
}
function hideNotesInfo() {
    const notesInfo = GET_ELEMENT.getNotesInfo();
    notesInfo.classList.remove('noteInfoIn');
    notesInfo.classList.add('noteInfoOut');
}
function showNotesInfo() {
    const notesInfo = GET_ELEMENT.getNotesInfo();
    notesInfo.classList.remove('noteInfoOut');
    notesInfo.classList.add('noteInfoIn');
}
function getNumberOfDisplayedNotes() {
    return numberOfDisplayedNotes;
}
