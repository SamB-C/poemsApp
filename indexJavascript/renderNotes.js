import { GET_ELEMENT, UNDERLINE_COLORS } from "./constantsAndTypes.js";
import { state } from "./index.js";
import { getAllWordSectionsInPoem } from "./utilities.js";
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
    wordAsElement.onpointerout = () => unUnderlineNotes(associatedNotes, wordAsElement);
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
        const notesElement = GET_ELEMENT.getNotes();
        notesElement.insertAdjacentHTML('beforeend', `<p id="${noteText}" class="underline${colorNumber} ${color} noteTextIn noteText">${noteText}</p>`);
    });
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
function unUnderlineNotes(notesToUnderline, wordSectionElement) {
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
        removalNumber[0]++;
        const noteTextElement = document.getElementById(noteText);
        noteTextElement.id = removalNumber.toString();
        const numberCopy = [...removalNumber];
        noteTextElement.classList.remove('noteTextIn');
        noteTextElement.classList.add('noteTextOut');
        setTimeout(() => {
            const elementToRemove = document.getElementById(numberCopy.toString());
            console.log(window.getComputedStyle(elementToRemove).padding);
            elementToRemove.remove();
        }, 500);
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
