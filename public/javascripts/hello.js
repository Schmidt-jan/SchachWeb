function movePiece() {
    const moveFrom = document.getElementById('moveFrom').value;
    const moveTo = document.getElementById('moveTo').value;

    var requestOptions = {
        method: 'POST',
        redirect: 'follow'
    };

    fetch(`/tui/move?from=${moveFrom}&to=${moveTo}`,
        requestOptions)
        .then(response => response.text())
        .then(result => {
            window.location.reload(true);
            console.log(result);
        })
        .catch(error => console.log('error', error));
}


let moveButton;
let safeButton;

function initButtons() {
    moveButton = document.getElementById('moveButton');
    moveButton.addEventListener('click', movePiece);

    safeButton = document.getElementById('newGameButton');
    safeButton.addEventListener('click', newGame);
}

function newGame() {

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch("/tui/new", requestOptions)
        .then(response => {
            window.location.reload(true);
            console.log(result);
        })
        .then(result => result => {
            window.location.reload(true);
            console.log(result);
        })
        .catch(error => {
            window.location.reload(true);
            console.log(result);
        });

}

window.onload = initButtons