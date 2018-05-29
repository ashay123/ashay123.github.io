var data = {
    stats: {
        wins: 0,
        ties: 0,
        losses: 0,
        currentBg: ""
    },
    moves: [
        "rock",
        "paper",
        "scissors"
    ],
    resultText: [
        {
            name: "Win!",
            bg: "bg-win"
        },
        {
            name: "Tie!",
            bg: "bg-tie"
        },
        {
            name: "Loss!",
            bg: "bg-loss"
        }
    ],
    selectors: {
        computerChoice: undefined,
        overlay: undefined,
        winsWrapper: undefined,
        tiesWrapper: undefined,
        lossesWrapper: undefined,
        overlayText: undefined
    }
};

/**
 * Handles the click event
 * @param choice, 0: rock, 1: paper, 2: scissors
 */
function clickHandler(choice) {
    var computerChoice = Math.floor(Math.random() * 3);
    data.selectors.computerChoice.textContent = data.moves[computerChoice];
    if ((choice - computerChoice + 3) % 3 === 1) {
        ++data.stats.wins;
        displayResult(0);
    } else if (choice === computerChoice) {
        ++data.stats.ties;
        displayResult(1);
    } else {
        ++data.stats.losses;
        displayResult(2);
    }
    updateStatus();
    data.selectors.overlay.classList.remove("invisible");
}

/**
 * Updates the status text
 */
function updateStatus() {
    data.selectors.winsWrapper.textContent = data.stats.wins;
    data.selectors.tiesWrapper.textContent = data.stats.ties;
    data.selectors.lossesWrapper.textContent = data.stats.losses;
}

/**
 * Displays the result
 * @param result, 0: win, 1: tie, 2: loss
 */
function displayResult(result) {
    var temp = data.resultText[result];
    data.selectors.overlayText.textContent = temp.name;
    data.selectors.overlay.classList.add(temp.bg);
    data.stats.currentBg = temp.bg;
}

function addClickListener(choice) {
    var move = data.moves[choice];
    var temp = function () {
        clickHandler(choice);
    };
    document.getElementById("button-" + move).addEventListener('click', temp, false);
}

function addClickListeners() {
    for (var i = 0; i < data.moves.length; ++i) {
        addClickListener(i);
    }
    data.selectors.overlay.addEventListener('click', function () {
        this.classList.add("invisible");
        this.classList.remove(data.stats.currentBg);
    });
}

function initialiseSelectors() {
    data.selectors.computerChoice = document.getElementById("computer-choice");
    data.selectors.overlay = document.getElementById("overlay");
    data.selectors.winsWrapper = document.getElementById("wins-wrapper");
    data.selectors.tiesWrapper = document.getElementById("ties-wrapper");
    data.selectors.lossesWrapper = document.getElementById("losses-wrapper");
    data.selectors.overlayText = document.getElementById("overlay-text");
}

document.addEventListener('DOMContentLoaded', function () {
    initialiseSelectors();
    addClickListeners();
}, false);