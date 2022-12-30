"use strict";
const POEM_DISPLAY_ID = '__poem_id__';
const POEM_AUTHOR_DISPLAY_ID = '__poem_author__';
const POEM_SELECT_DISPLAY_ID = '__poem_selection__';
fetch('../convertedPoems.json')
    .then(response => response.json())
    .then((data) => main(data));
function main(data) {
    const allPoemNames = Object.keys(data);
    let currentPoemName = allPoemNames[0];
    renderPoemSelect(allPoemNames, currentPoemName, data);
    const currentPoemContent = data[currentPoemName].convertedPoem;
    const currentPoemAuthor = data[currentPoemName].author;
    const isCurrentPoemCentered = data[currentPoemName].centered;
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
function renderPoemSelect(poemNames, currentPoemName, poemData) {
    const selectionOptions = poemNames.map((poemName) => {
        if (poemName === currentPoemName) {
            return `<option value="${poemName}" selected="seleted">${poemName}</option>`;
        }
        else {
            return `<option value="${poemName}">${poemName}</option>`;
        }
    });
    const poemSelectElement = document.getElementById(POEM_SELECT_DISPLAY_ID);
    poemSelectElement.innerHTML = selectionOptions.reduce((acc, current) => acc + current);
    poemSelectElement.oninput = (event) => changePoem(event, currentPoemName, poemData);
}
function changePoem(event, currentPoemName, poemData) {
    const target = event.target;
    const newPoemName = target.value;
    const poemContent = poemData[newPoemName].convertedPoem;
    const poemAuthor = poemData[newPoemName].author;
    const isCentered = poemData[newPoemName].centered;
    renderPoem(poemContent, poemAuthor, isCentered);
    currentPoemName = newPoemName;
}
function splitToWords(line) {
    // Split at space of fake space
    const words = line.split(/ /);
    // Accumulator for reduce needs to start as '' so first word gets split as well.
    words.unshift('');
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
    const poemSelectElement = document.getElementById(POEM_SELECT_DISPLAY_ID);
    const poemElement = getPoemElementFromDOM();
    const poemAuthor = document.getElementById(POEM_AUTHOR_DISPLAY_ID);
    if (centered) {
        poemSelectElement.style.textAlign = 'center';
        poemElement.style.textAlign = 'center';
        poemAuthor.style.textAlign = 'center';
    }
    else {
        poemSelectElement.style.textAlign = 'left';
        poemElement.style.textAlign = 'left';
        poemAuthor.style.textAlign = 'left';
    }
}
function getPoemElementFromDOM() {
    return document.getElementById(POEM_DISPLAY_ID);
}
