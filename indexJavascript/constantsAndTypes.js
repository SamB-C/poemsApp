import { FAKE_SPACE, GET_ID } from "./utilities.js";
export const POEM_ID = '__poem_id__';
export const POEM_CONTAINER = '__main_content_container__';
export const RANGEBAR_ID = '__range_bar__';
export const RANGEBAR_RESULT_ID = '__range_bar_result__';
export const POEM_SELECT_ID = '__poem_selection__';
export const NOTES_ID = '__notes__';
export const NOTES_INFO_ID = '__notes_info__';
export const NOTE_REMOVAL_DELAY = 1000;
export const UNDERLINE_COLORS = ['red', 'blue', 'green'];
export const TRY_AGAIN_LINK_ID = '__try_again__';
export const COMPLETION_TEXT_ID = '__completion_text__';
export const POEM_AUTHOR_ID = "__poem_author__";
export const NUMBER_ONLY_REGEX = /^[0-9]+$/;
export const SPECIAL_CHARACTER_REGEX = /[.,:;]/;
export const FAKE_SPACE_HTML_ELEMENT = `<p class="fakeSpace">${FAKE_SPACE}</p>`;
export const ANIMATION_SPEED = 20;
export const COVER_OVER_COMPLETED_WORDS = true;
export const INPUT_OPTIONS = 'placeholder="_" size="1" maxlength="1" autocapitalize="off" class="letter_input"';
export const NUMBER_OF_INCORRECT_ATTEMPTS_FOR_AID = 4;
export const LETTER_INPUT_DEFAULT_COLOR = 'orange';
export const REPLACE_WORDS_RADIO_BUTTON_ID = '__words__';
export const REPLACE_QUOTES_RADIO_BUTTON_ID = '__quotes__';
export const WORDS = 'words';
export const QUOTES = 'quotes';
export const GET_ELEMENT = {
    /**
     * @param word - The word whose element is to be found in the DOM
     * @returns The element of the word in DOM
     */
    getElementOfWord(word) {
        return document.getElementById(GET_ID.getIdForWord(word));
    },
    getPoemElement() {
        return document.getElementById(POEM_ID);
    },
    getRangeBar() {
        return document.getElementById(RANGEBAR_ID);
    },
    getPoemSelect() {
        return document.getElementById(POEM_SELECT_ID);
    },
    getRangeBarResult() {
        return document.getElementById(RANGEBAR_RESULT_ID);
    },
    getRadioButtons() {
        const wordsRadioButton = document.getElementById(REPLACE_WORDS_RADIO_BUTTON_ID);
        const quotesRadioButton = document.getElementById(REPLACE_QUOTES_RADIO_BUTTON_ID);
        return { wordsRadioButton, quotesRadioButton };
    },
    getTryAgainLink() {
        return document.getElementById(TRY_AGAIN_LINK_ID);
    },
    getNotes() {
        return document.getElementById(NOTES_ID);
    },
    getPoemContainer() {
        return document.getElementById(POEM_CONTAINER);
    },
    getCompletionText() {
        return document.getElementById(COMPLETION_TEXT_ID);
    },
    getNotesInfo() {
        return document.getElementById(NOTES_INFO_ID);
    },
    getHtmlElement() {
        return document.getElementsByTagName('html')[0];
    }
};
