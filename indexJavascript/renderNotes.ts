import { AssociatedNotesType, GET_ELEMENT, NOTE_REMOVAL_DELAY, NOTE_TYPE, UNDERLINE_COLORS, WORD_SECTION_TYPE } from "./constantsAndTypes.js";
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
    wordAsElement.onpointerout = () => unUnderlineNotes(associatedNotes, wordAsElement, false, undefined);
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
    })
    const timout = window.setTimeout(() => {
        Object.keys(notesToUnderline).forEach((noteText) => {
            const color = notesToUnderline[noteText].color;
            const colorNumber = UNDERLINE_COLORS.indexOf(color) + 1;
            const notesElement = GET_ELEMENT.getNotes();
            notesElement.insertAdjacentHTML('beforeend', `<p id="${noteText}" class="underline${colorNumber} ${color} noteTextIn noteText">${noteText}</p>`);
        })
        wordSectionElement.onpointerout = () => unUnderlineNotes(notesToUnderline, wordSectionElement, true, undefined)
    }, 500)
    wordSectionElement.onpointerout = () => unUnderlineNotes(notesToUnderline, wordSectionElement, false, timout);
}

function addUnderlineClass(className: string, wordElement: WORD_SECTION_TYPE) {
    const firstElement = wordElement.firstChild as HTMLElement
    if (firstElement.nodeName !== "INPUT") {
        wordElement.classList.add(className);
        wordElement.classList.add('opacity');
    }
}

function getNewUnderlineClass(className: string, colorNumberToAdd: number): string {
    const classNameAsList = className.split('');
    const originalColorNumberStr = classNameAsList[classNameAsList.length - 1];
    const originalColorNumber = Number(originalColorNumberStr);
    const newColorNumber = originalColorNumber + colorNumberToAdd + 1
    return `underline${newColorNumber}`;
}

const removalNumber: Array<number> = [0];
function unUnderlineNotes(notesToUnderline: AssociatedNotesType, wordSectionElement: WORD_SECTION_TYPE, removeNotes: boolean, timeoutToCear: undefined | number) {
    const firstElement = wordSectionElement.firstChild as HTMLElement
    if (firstElement.nodeName === "INPUT") {
        return
    }
    Object.keys(notesToUnderline).forEach((noteText) => {
        notesToUnderline[noteText].noteValue.forEach(word => {
            const wordElement = GET_ELEMENT.getElementOfWord(word);
            wordElement.classList.forEach((className: string) => {
                if (className.match(/underline/)) {
                    wordElement.classList.remove('opacity');
                    wordElement.classList.remove(className);
                }
            })
        });
        if (removeNotes) {
            removalNumber[0]++;
            const noteTextElement = document.getElementById(noteText) as NOTE_TYPE;
            noteTextElement.id = removalNumber.toString();
            const numberCopy = [...removalNumber];
            noteTextElement.classList.remove('noteTextIn')
            noteTextElement.classList.add('noteTextOut');
            setTimeout(() => {
                const elementToRemove = document.getElementById(numberCopy.toString()) as NOTE_TYPE;
                console.log(window.getComputedStyle(elementToRemove).padding);
                elementToRemove.remove();
            }, NOTE_REMOVAL_DELAY);
            wordSectionElement.onpointerout = () => unUnderlineNotes(notesToUnderline, wordSectionElement, false, undefined);
        } else if (timeoutToCear) {
            clearTimeout(timeoutToCear);
        }
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