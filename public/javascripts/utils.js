/**
 * Checks if the input string follows th
 * @param input
 */
function checkFieldInput(input) {
    if (!input.matches('^[A-H][1-8]$')) {
        console.log('Invalid input. Has to be of schema <A-H><1-8>')
        return false
    }

    return true
}

