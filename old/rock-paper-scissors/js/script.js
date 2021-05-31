var data = {
    stats: {
        wins: 0,
        ties: 0,
        losses: 0,
        currentBg: ""
    },
    moves: [
        "steen",
        "papier",
        "schaar"
    ],
    resultText: [
        {
            name: "Gewonnen!",
            bg: "bg-win"
        },
        {
            name: "Gelijkspel!",
            bg: "bg-tie"
        },
        {
            name: "Verloren!",
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
        if (typeof ALTabletBinding !== 'undefined') ALTabletBinding.raiseEvent('rock-paper-scissors_win_' + choice + "_" + computerChoice);
        ++data.stats.wins;
        displayResult(0);
    } else if (choice === computerChoice) {
        if (typeof ALTabletBinding !== 'undefined') ALTabletBinding.raiseEvent('rock-paper-scissors_tie_' + choice + "_" + computerChoice);
        ++data.stats.ties;
        displayResult(1);
    } else {
        if (typeof ALTabletBinding !== 'undefined') ALTabletBinding.raiseEvent('rock-paper-scissors_lose_' + choice + "_" + computerChoice);
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

/**
 * Adds the click listener to a given choice
 * @param choice choice to add the click listener to
 */
function addClickListener(choice) {
    var move = data.moves[choice];
    var temp = function () {
        clickHandler(choice);
    };
    document.getElementById("button-" + move).addEventListener('click', temp, false);
}

/**
 * Adds all click listeners
 */
function addClickListeners() {
    for (var i = 0; i < data.moves.length; ++i) {
        addClickListener(i);
    }
    data.selectors.overlay.addEventListener('click', function () {
        this.classList.add("invisible");
        this.classList.remove(data.stats.currentBg);
    });
}

/**
 * Initialises the selectors
 */
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
