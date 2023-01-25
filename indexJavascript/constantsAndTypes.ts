import { Notes, Quotes } from "../notesAndKeyQuotes/utilities";

export const POEM_ID = '__poem_id__';
export type POEM_CONTAINER_DOM_TYPE = HTMLParagraphElement;

export const RANGEBAR_ID = '__range_bar__';
export type RANGEBAR_TYPE = HTMLInputElement;
export const RANGEBAR_RESULT_ID = '__range_bar_result__';
export type RANGEBAR_RESULT_TYPE = HTMLParagraphElement;

export const POEM_SELECT_ID = '__poem_selection__';
export type POEM_SELECT_TYPE = HTMLSelectElement;

export const TRY_AGAIN_LINK_ID = '__try_again__'
export const POEM_AUTHOR_ID = "__poem_author__";
export const NUMBER_ONLY_REGEX = /^[0-9]+$/
export const SPECIAL_CHARACTER_REGEX = /[.,:;]/
export const FAKE_SPACE: string = '|+|';
export const FAKE_SPACE_HTML_ELEMENT: string = `<p class="fakeSpace">${FAKE_SPACE}</p>`
export const ANIMATION_SPEED: number = 20
export const COVER_OVER_COMPLETED_WORDS = false;
export const INPUT_OPTIONS: string = 'placeholder="_" size="1" maxlength="1" autocapitalize="off" class="letter_input"'

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
    numWordsToRemove: number,
    removalType: WordsOrQuotesType,
    focusedWord: string,
    wordsNotCompleted: Array<string>,
    wordsNotCompletedPreserved: Array<string>
}
