import { FAKE_SPACE, GET_ID } from "./utilities.js";
export const POEM_ID = '__poem_id__';
export const RANGEBAR_ID = '__range_bar__';
export const RANGEBAR_RESULT_ID = '__range_bar_result__';
export const POEM_SELECT_ID = '__poem_selection__';
export const TRY_AGAIN_LINK_ID = '__try_again__';
export const POEM_AUTHOR_ID = "__poem_author__";
export const NUMBER_ONLY_REGEX = /^[0-9]+$/;
export const SPECIAL_CHARACTER_REGEX = /[.,:;]/;
export const FAKE_SPACE_HTML_ELEMENT = `<p class="fakeSpace">${FAKE_SPACE}</p>`;
export const ANIMATION_SPEED = 20;
export const COVER_OVER_COMPLETED_WORDS = false;
export const INPUT_OPTIONS = 'placeholder="_" size="1" maxlength="1" autocapitalize="off" class="letter_input"';
export const REPLACE_WORDS_RADIO_BUTTON_ID = '__words__';
export const REPLACE_QUOTES_RADIO_BUTTON_ID = '__quotes__';
export const WORDS = 'words';
export const QUOTES = 'quotes';
export const GET_ELEMENT = {
    getElementOfWord(word) {
        const wordElement = document.getElementById(GET_ID.getIdForWord(word));
        return wordElement;
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
    }
};
