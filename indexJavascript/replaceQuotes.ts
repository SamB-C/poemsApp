import { Quotes } from "../notesAndKeyQuotes/utilities.js";

export function replaceQuotes(quotes: Quotes, numberOfQuotes: number) {
    numberOfQuotes = rangeValidationForNumberOfQuotesToReplace(quotes, numberOfQuotes);
}

function rangeValidationForNumberOfQuotesToReplace(allQuotes: Quotes, numberOfQuotes: number) {
    if (allQuotes.length > numberOfQuotes) {
        return allQuotes.length
    } else {
        return numberOfQuotes
    }
}