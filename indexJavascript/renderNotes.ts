import { AssociatedNotesType, GET_ELEMENT, NOTE_TYPE, UNDERLINE_COLORS, WORD_SECTION_TYPE } from "./constantsAndTypes.js";
import { state } from "./index.js";
import { getAllWordSectionsInPoem } from "./utilities.js";

export function initialiseNotesForPoem() {
    const currentPoemContent: string = state.poemData[state.currentPoemName].convertedPoem;
    const allWordSectionsInPoem: Array<string> = getAllWordSectionsInPoem(currentPoemContent);
    allWordSectionsInPoem.forEach(wordSection => {
        addWordSectionEventListener(wordSection);
    })
}

function addWordSectionEventListener(wordSection: string) {
    const wordAsElement = GET_ELEMENT.getElementOfWord(wordSection);
    wordAsElement.style.cursor = 'default';
    const associatedNotes = getAssociatedNotes(wordSection)
    // Underline note
    wordAsElement.onpointerover = () => underlineNotes(associatedNotes, wordAsElement);
    // Remove underline
    wordAsElement.onpointerout = () => unUnderlineNotes(associatedNotes, wordAsElement);
}

function underlineNotes(notesToUnderline: AssociatedNotesType, wordSectionElement: WORD_SECTION_TYPE) {
    const firstElement = wordSectionElement.firstChild as HTMLElement
    if (firstElement.nodeName === "INPUT") {
        return
    }
    Object.keys(notesToUnderline).forEach((noteText) => {
        const color = notesToUnderline[noteText].color;
        const colorNumber = UNDERLINE_COLORS.indexOf(color) + 1;
        notesToUnderline[noteText].noteValue.forEach(word => {
            const wordElement = GET_ELEMENT.getElementOfWord(word);
            let noUnderlineClass = true;
            wordElement.classList.forEach((className: string) => {
                if (className.match(/underline/)) {
                    noUnderlineClass = false;
                    const underlineClass = getNewUnderlineClass(className, colorNumber);
                    addUnderlineClass(underlineClass, wordElement)
                }
            });
            if (noUnderlineClass) {
                addUnderlineClass(`underline${colorNumber}`, wordElement)
            }
        })
        const notesElement = GET_ELEMENT.getNotes();
        notesElement.insertAdjacentHTML('beforeend', `<p id="${noteText}" class="underline${colorNumber} ${color}">${noteText}</p>`);
    })
}

function addUnderlineClass(className: string, wordElement: WORD_SECTION_TYPE) {
    const firstElement = wordElement.firstChild as HTMLElement
    if (firstElement.nodeName !== "INPUT") {
        wordElement.classList.add(className)
    }
}

function getNewUnderlineClass(className: string, colorNumberToAdd: number): string {
    const classNameAsList = className.split('');
    const originalColorNumberStr = classNameAsList[classNameAsList.length - 1];
    const originalColorNumber = Number(originalColorNumberStr);
    const newColorNumber = originalColorNumber + colorNumberToAdd + 1
    return `underline${newColorNumber}`;
}

function unUnderlineNotes(notesToUnderline: AssociatedNotesType, wordSectionElement: WORD_SECTION_TYPE) {
    const firstElement = wordSectionElement.firstChild as HTMLElement
    if (firstElement.nodeName === "INPUT") {
        return
    }
    Object.keys(notesToUnderline).forEach((noteText) => {
        notesToUnderline[noteText].noteValue.forEach(word => {
            const wordElement = GET_ELEMENT.getElementOfWord(word);
            wordElement.classList.forEach((className: string) => {
                if (className.match(/underline/)) {
                    wordElement.classList.remove(className);
                }
            })
        });
        const noteTextElement = document.getElementById(noteText) as NOTE_TYPE;
        noteTextElement.remove();
    });
}

function getAssociatedNotes(wordSection: string): AssociatedNotesType {
    const currentPoemNotes: {[key: string]: Array<string>} = state.poemData[state.currentPoemName].notes;
    const associatedNotes: AssociatedNotesType = {};
    let numberOfAssociatedNotes: number = 0;
    Object.keys(currentPoemNotes).forEach((noteText: string) => {
        const noteValue = currentPoemNotes[noteText];
        if (noteValue.includes(wordSection)) {
            numberOfAssociatedNotes++;
            associatedNotes[noteText] = {noteValue, color: UNDERLINE_COLORS[numberOfAssociatedNotes - 1]};
        }
    })
    return associatedNotes
}