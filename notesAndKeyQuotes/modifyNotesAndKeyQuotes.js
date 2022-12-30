"use strict";
const POEM_DISPLAY_ID = '__poem_id__';
const POEM_AUTHOR_DISPLAY_ID = '__poem_author__';
fetch('../convertedPoems.json')
    .then(response => response.json())
    .then((data) => main(data));
function main(data) {
    let currentPoem = Object.keys(data)[0];
    const currentPoemContent = data[currentPoem].convertedPoem;
    const currentPoemAuthor = data[currentPoem].author;
    const isCurrentPoemCentered = data[currentPoem].centered;
    renderPoem(currentPoemContent, currentPoemAuthor, isCurrentPoemCentered);
}
function renderPoem(poemContent, author, centered) {
    const poemLines = poemContent.split(/\n/);
    const toRender = poemLines.map((line) => {
        return splitToWords(line) + '</br>';
    }).join('');
    const poemElement = getPoemElementFromDOM();
    poemElement.innerHTML = toRender;
    renderPoemAuthor(author);
    centerThePoem(centered);
}
function splitToWords(line) {
    // Split at space of fake space
    const words = line.split(/ /);
    const wordSectionsString = words.reduce((acc, word) => {
        const wordSections = word.split('|+|');
        return acc + ' ' + wordSections.join(' ');
    });
    const wordSections = wordSectionsString.split(' ');
    const firstWord = wordSections.filter(word => !word.match(/^[0-9]+$/))[0];
    return wordSections.map((word) => {
        const isfirstWord = firstWord === word;
        return makeElementForWord(word, isfirstWord);
    }).join('');
}
function makeElementForWord(word, isfirstWord) {
    if (word.match(/^[0-9]+$/)) {
        return '&nbsp&nbsp';
    }
    else {
        let prefix = '&nbsp';
        if (isfirstWord || word.match(/[.,:;]/)) {
            prefix = '';
        }
        return prefix + `<span id="${word}">${removeNumbers(word)}</span>`;
    }
}
function removeNumbers(word) {
    return word.split('').filter(letter => !letter.match(/[0-9]/)).join('');
}
function renderPoemAuthor(author) {
    const poemAuthorElement = document.getElementById(POEM_AUTHOR_DISPLAY_ID);
    poemAuthorElement.innerHTML = author.toUpperCase();
}
function centerThePoem(centered) {
    const poemAuthor = document.getElementById(POEM_AUTHOR_DISPLAY_ID);
    const poemElement = getPoemElementFromDOM();
    if (centered) {
        poemElement.style.textAlign = 'center';
        poemAuthor.style.textAlign = 'center';
    }
    else {
        poemElement.style.textAlign = 'left';
        poemAuthor.style.textAlign = 'left';
    }
}
function getPoemElementFromDOM() {
    return document.getElementById(POEM_DISPLAY_ID);
}
