export function replaceQuotes(quotes, numberOfQuotes) {
    numberOfQuotes = rangeValidationForNumberOfQuotesToReplace(quotes, numberOfQuotes);
}
function rangeValidationForNumberOfQuotesToReplace(allQuotes, numberOfQuotes) {
    if (allQuotes.length > numberOfQuotes) {
        return allQuotes.length;
    }
    else {
        return numberOfQuotes;
    }
}
