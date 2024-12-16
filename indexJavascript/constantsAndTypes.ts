import { Notes, Quotes } from "../notesAndKeyQuotes/utilities";
import { FAKE_SPACE, GET_ID } from "./utilities.js";

export const POEM_ID = '__poem_id__';
export type POEM_CONTAINER_DOM_TYPE = HTMLParagraphElement;
export const POEM_CONTAINER = '__main_content_container__';
export type POEM_CONTAINER_TYPE = HTMLDivElement;

export const RANGEBAR_ID = '__range_bar__';
export type RANGEBAR_TYPE = HTMLInputElement;
export const RANGEBAR_RESULT_ID = '__range_bar_result__';
export type RANGEBAR_RESULT_TYPE = HTMLParagraphElement;

export const POEM_SELECT_ID = '__poem_selection__';
export type POEM_SELECT_TYPE = HTMLSelectElement;

export const NOTES_ID = '__notes__';
export type NOTES_TYPE = HTMLDivElement;

export const NOTES_INFO_ID = '__notes_info__';
export type NOTES_INFO_TYPE = HTMLParagraphElement;

export type NOTE_TYPE = HTMLParagraphElement;

export const NOTE_REMOVAL_DELAY = 1000;

export type UnderlineColorType = 'red' | 'blue' | 'green'
export const UNDERLINE_COLORS: Array<UnderlineColorType> = ['red', 'blue', 'green'];

export type AssociatedNotesType = {
    [key: string]: {
        noteValue: Array<string>,
        color: UnderlineColorType
    }
}

export type WORD_SECTION_TYPE = HTMLSpanElement;

export const TRY_AGAIN_LINK_ID = '__try_again__'
export type TRY_AGAIN_LINK_TYPE = HTMLSpanElement;

export const COMPLETION_TEXT_ID = '__completion_text__';
export type COMPLETION_TEXT_TYPE = HTMLDivElement;

export const POEM_AUTHOR_ID = "__poem_author__";
export const NUMBER_ONLY_REGEX = /^[0-9]+$/
export const SPECIAL_CHARACTER_REGEX = /[.,:;]/
export const FAKE_SPACE_HTML_ELEMENT: string = `<p class="fakeSpace">${FAKE_SPACE}</p>`
export const ANIMATION_SPEED: number = 20
export const COVER_OVER_COMPLETED_WORDS = true;
export const INPUT_OPTIONS: string = 'placeholder="_" size="1" maxlength="1" autocapitalize="off" class="letter_input"';
export const NUMBER_OF_INCORRECT_ATTEMPTS_FOR_AID = 4;

export const LETTER_INPUT_DEFAULT_COLOR = 'orange';
export type LETTER_INPUT_TYPE = HTMLInputElement;

export const REPLACE_WORDS_RADIO_BUTTON_ID = '__words__';
export const REPLACE_QUOTES_RADIO_BUTTON_ID = '__quotes__';
export type RADIO_BUTTONS_TYPE = HTMLInputElement;

export const WORDS: WORDS_TYPE = 'words';
export const QUOTES: QUOTES_TYPE = 'quotes';
export type WORDS_TYPE = 'words';
export type QUOTES_TYPE = 'quotes';
export type WordsOrQuotesType = WORDS_TYPE | QUOTES_TYPE;

type PoemData = {
    convertedPoem: string,
    wordCount: number,
    author: string,
    centered: boolean,
    quotes: Quotes,
    notes: Notes
}
export type convertedPoemsJSON = {
    [nameOfPoem: string]: PoemData
}

export type State = {
    currentPoemName: string,
    poemData: convertedPoemsJSON,
    percentageWordsToRemove: number,
    removalType: WordsOrQuotesType,
    focusedWord: string,
    wordsNotCompleted: Array<string>,
    wordsNotCompletedPreserved: Array<string>,
    userAid: {
        letterIndexOfLatestIncorrectLetter: number,
        letterIndex: number,
        numberOfIncorrectAttempts: number
    }
}


export const GET_ELEMENT = {
    /**
     * @param word - The word whose element is to be found in the DOM
     * @returns The element of the word in DOM
     */
    getElementOfWord(word: string): WORD_SECTION_TYPE {
        return document.getElementById(GET_ID.getIdForWord(word)) as WORD_SECTION_TYPE;
    },
    getPoemElement(): POEM_CONTAINER_DOM_TYPE {
        return document.getElementById(POEM_ID) as POEM_CONTAINER_DOM_TYPE;
    },
    getRangeBar(): RANGEBAR_TYPE {
        return document.getElementById(RANGEBAR_ID) as RANGEBAR_TYPE;
    },
    getPoemSelect(): POEM_SELECT_TYPE {
        return document.getElementById(POEM_SELECT_ID) as POEM_SELECT_TYPE;
    },
    getRangeBarResult(): RANGEBAR_RESULT_TYPE {
        return document.getElementById(RANGEBAR_RESULT_ID) as RANGEBAR_RESULT_TYPE;
    },
    getRadioButtons(): {wordsRadioButton: RADIO_BUTTONS_TYPE, quotesRadioButton: RADIO_BUTTONS_TYPE} {
        const wordsRadioButton = document.getElementById(REPLACE_WORDS_RADIO_BUTTON_ID) as RADIO_BUTTONS_TYPE;
        const quotesRadioButton = document.getElementById(REPLACE_QUOTES_RADIO_BUTTON_ID) as RADIO_BUTTONS_TYPE;
        return {wordsRadioButton, quotesRadioButton};
    },
    getTryAgainLink(): TRY_AGAIN_LINK_TYPE {
        return document.getElementById(TRY_AGAIN_LINK_ID) as TRY_AGAIN_LINK_TYPE;
    },
    getNotes(): NOTES_TYPE {
        return document.getElementById(NOTES_ID) as NOTES_TYPE;
    },
    getPoemContainer(): POEM_CONTAINER_TYPE {
        return document.getElementById(POEM_CONTAINER) as POEM_CONTAINER_TYPE;
    },
    getCompletionText(): COMPLETION_TEXT_TYPE {
        return document.getElementById(COMPLETION_TEXT_ID) as COMPLETION_TEXT_TYPE;
    },
    getNotesInfo(): NOTES_INFO_TYPE {
        return document.getElementById(NOTES_INFO_ID) as NOTES_INFO_TYPE;
    },
    getHtmlElement(): HTMLHtmlElement {
        return document.getElementsByTagName('html')[0] as HTMLHtmlElement;
    }
}