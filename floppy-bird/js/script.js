/**
 * Data object
 */
var data = {
    states: Object.freeze({
        SplashScreen: 0,
        GameScreen: 1,
        ScoreScreen: 2
    }),

    currentstate: undefined,

    gravity: 0.25,
    velocity: 0,
    position: 180,
    rotation: 0,
    jump: -4.6,
    flyAreaHeight: 420,
    score: 0,
    highscore: 0,
    pipeHeight: 150,
    pipeWidth: 52,
    pipepadding: 80,
    pipes: [],

    replayclickable: false,

    //loops
    loopGameloop: undefined,
    loopPipeloop: undefined,

    // selector
    splash: undefined,
    player: undefined,
    land: undefined,
    ceiling: undefined,
    animated: undefined,
    replay: undefined,
    flyarea: undefined,
    medal: undefined,
    scoreboard: undefined
};

/**
 * Initialises the game upon starting
 */
document.addEventListener('DOMContentLoaded', function () {
    initialiseSelectors();
    initialiseListeners();
    showSplash();
});

/**
 * Initialises the selectors
 */
function initialiseSelectors() {
    data.splash = document.getElementById("splash");
    data.player = document.getElementById("player");
    data.land = document.getElementById("land");
    data.ceiling = document.getElementById("ceiling");
    data.animated = document.getElementsByClassName("animated");
    data.replay = document.getElementById("replay");
    data.flyarea = document.getElementById("flyarea");
    data.medal = document.getElementById("medal");
    data.scoreboard = document.getElementById("scoreboard");
}

/**
 * Initialises the listeners
 */
function initialiseListeners() {
    document.getElementById("gamecontainer").addEventListener("click", screenClick);
    data.replay.addEventListener("click", function () {
        //make sure we can only click once
        if (!data.replayclickable)
            return;
        else
            data.replayclickable = false;

        data.scoreboard.style.opacity = '0';
        data.scoreboard.style.display = 'none';
        showSplash();
    });
}

/**
 * Shows the splash screen
 */
function showSplash() {
    data.currentstate = data.states.SplashScreen;

    //set the defaults (again)
    data.velocity = 0;
    data.position = 180;
    data.rotation = 0;
    data.score = 0;

    //update the player in preparation for the next game
    data.player.style.right = '0';
    data.player.style.top = '0';
    updatePlayer(data.player);

    //clear out all the pipes if there are any
    loopHTMLCollection(data.pipes, function (item) {
        item.parentNode.removeChild(item);
    });
    data.pipes = [];

    //make everything animated again
    loopHTMLCollection(data.animated, function (element) {
        element.style['animation-play-state'] = 'running';
        element.style['-webkit-animation-play-state'] = 'running';
    });

    //fade in the splash
    data.splash.style.opacity = '1';
}

/**
 * Starts the game
 */
function startGame() {
    data.currentstate = data.states.GameScreen;

    //fade out the splash
    // splash.stop();
    data.splash.style.opacity = '0';

    //update the big score
    setBigScore();

    //start up our loops
    data.loopGameloop = setInterval(gameloop, 100 / 6);
    data.loopPipeloop = setInterval(updatePipes, 1400);

    //jump from the start!
    playerJump();
}

/**
 * Updates the player rotation and position
 */
function updatePlayer(player) {
    //rotation
    data.rotation = Math.min((data.velocity / 10) * 90, 90);

    //apply rotation and position
    player.style.transform = "rotate(" + data.rotation + "deg)";
    player.style.top = data.position + "px";
}

/**
 * BoxDimensions class
 * @param origWidth width of the origin
 * @param origHeight height of the origin
 * @param box bounding box of the player
 * @constructor
 */
function BoxDimensions(origWidth, origHeight, box) {
    this.width = origWidth - (Math.sin(Math.abs(data.rotation) / 90) * 8);
    this.height = (origHeight + box.height) / 2;
    this.left = ((box.width - this.width) / 2) + box.left;
    this.top = ((box.height - this.height) / 2) + box.top;
    this.right = this.left + this.width;
    this.bottom = this.top + this.height;
}

/**
 * Pipe Class
 * @param nextPipe nextPipe object
 * @constructor
 */
function Pipe(nextPipe) {
    var boundingBox = nextPipe.getBoundingClientRect();
    this.top = boundingBox.top + getHeight(nextPipe);
    this.left = boundingBox.left;
    this.right = this.left + data.pipeWidth;
    this.bottom = this.top + data.pipeHeight;
}

/**
 * Loops the game
 *  - Updates the scores
 *  - Checks the player position and pipes
 */
function gameloop() {
    //update the player speed/position
    data.velocity += data.gravity;
    data.position = Math.max(0, data.position + data.velocity);

    //update the player
    updatePlayer(data.player);

    //create the bounding box
    var box = data.player.getBoundingClientRect();
    var boxdim = new BoxDimensions(34.0, 24.0, box);

    //did we hit the ground?
    if (box.bottom >= data.land.getBoundingClientRect().top) {
        playerDead();
        return;
    }

    //we can't go any further without a pipe
    if (data.pipes.length > 0) {
        var nextPipeUpper = data.pipes[0].children[0];
        var pipe = new Pipe(nextPipeUpper);

        //have we gotten inside the pipe yet?
        if (boxdim.right > pipe.left && (boxdim.top <= pipe.top || boxdim.bottom >= pipe.bottom)) {
            playerDead();
        } else if (boxdim.left > pipe.right) {
            data.pipes.splice(0, 1);
            playerScore();
        }
    }
}

/**
 * Calls the correct functions upon a screen click
 */
function screenClick() {
    if (data.currentstate === data.states.GameScreen) {
        playerJump();
    } else if (data.currentstate === data.states.SplashScreen) {
        startGame();
    }
}

/**
 * Handles the jump action
 */
function playerJump() {
    data.velocity = data.jump;
}

/**
 * Sets the scores
 * @param type, object containing selector, data object, and image
 * @param erase, boolean if big score has to be erased
 */
function setScore(type, erase) {
    var element = document.getElementById(type.selector + 'score');
    element.innerText = '';

    if (!!erase) return;

    data[type.score].toString().split('').forEach(function (value) {
        element.appendChild(createImage("assets/font_" + type.image + "_" + value + ".png", value));
    });
}

/**
 * Sets the big score
 * @param erase boolean whether the old score has to be erased
 */
function setBigScore(erase) {
    var type = {
        selector: "big",
        score: "score",
        image: "big"
    };
    setScore(type, erase);
}

/**
 * Sets the small score
 */
function setSmallScore() {
    var type = {
        selector: "current",
        score: "score",
        image: "small"
    };
    setScore(type);
}

/**
 * Sets the highscore
 */
function setHighScore() {
    var type = {
        selector: "high",
        score: "highscore",
        image: "small"
    };
    setScore(type);
}

/**
 * Sets the medal
 * @return {boolean} if a medal is rewarded
 */
function setMedal() {
    data.medal.innerText = '';

    if (data.score < 10) return false;

    var medalText;

    if (data.score >= 10)
        medalText = "bronze";
    else if (data.score >= 20)
        medalText = "silver";
    else if (data.score >= 30)
        medalText = "gold";
    else
        medalText = "platinum";

    data.medal.appendChild(createImage("assets/medal_" + medalText + ".png", medalText));

    return true;
}

/**
 * Handles the event if a player is dead
 */
function playerDead() {
    //stop animating everything!
    loopHTMLCollection(data.animated, function (item) {
        item.style["animation-play-state"] = 'paused';
        item.style["-webkit-animation-play-state"] = 'paused';
    });

    //drop the bird to the floor
    data.player.style.bottom = '0';
    data.player.style.top = 'auto';
    data.player.style.transform = 'rotate(90deg)';

    //it's time to change states. as of now we're considered ScoreScreen to disable left click/flying
    data.currentstate = data.states.ScoreScreen;

    //destroy our gameloops
    clearInterval(data.loopGameloop);
    clearInterval(data.loopPipeloop);
    data.loopGameloop = null;
    data.loopPipeloop = null;

    showScore();
}

/**
 * Shows the score div
 */
function showScore() {
    //unhide us
    data.scoreboard.style.display = 'block';

    //remove the big score
    setBigScore(true);

    if (data.score > data.highscore) {
        data.highscore = data.score;
    }

    //update the scoreboard
    setSmallScore();
    setHighScore();

    data.replay.style.opacity = '1';
    data.scoreboard.style.opacity = '1';

    if (setMedal()) {
        data.medal.style.opacity = '1';
    }

    data.replayclickable = true;
}

/**
 * Updates the player score
 */
function playerScore() {
    data.score++;
    setBigScore();
}

/**
 * Updates all the pipes by removing the old ones and adding a new one
 */
function updatePipes() {
    //Do any pipes need removal?
    loopHTMLCollection(document.getElementsByClassName("pipe"), function (item) {
        if (item.offsetLeft <= -100)
            item.parentNode.removeChild(item);
    });

    var newpipe = createAnimatedPipe();
    data.flyarea.appendChild(newpipe);
    data.pipes.push(newpipe);
}

/**
 * Creates a single pipe HTML element
 * @param height given height
 * @param className given classname
 * @return {HTMLDivElement} the new pipe div
 */
function createPipe(height, className) {
    var pipe = document.createElement("div");
    pipe.style.height = height;
    pipe.classList.add(className);
    return pipe;
}

/**
 * Creates both upper and bottom pipes
 * @return {HTMLDivElement}
 */
function createAnimatedPipe() {
    //add a new pipe (top height + bottom height  + pipeHeight == flyAreaHeight) and put it in our tracker
    var constraint = data.flyAreaHeight - data.pipeHeight - (data.pipepadding * 2); //double pipepadding (for top and bottom)
    var topheight = Math.floor((Math.random() * constraint) + data.pipepadding); //add lower padding
    var bottomheight = (data.flyAreaHeight - data.pipeHeight) - topheight;

    var pipe = document.createElement("div");
    pipe.classList.add("pipe", "animated");
    pipe.appendChild(createPipe(topheight + 'px', "pipe_upper"));
    pipe.appendChild(createPipe(bottomheight + 'px', "pipe_lower"));

    return pipe;
}

/**
 * Returns the height of an element
 * @param element element to get the height of
 * @return {number} height of the element
 */
function getHeight(element) {
    return element.clientHeight;
}

/**
 * Creates an img HTML element
 * @param src source of the image
 * @param alt alternative text of the image
 * @return {HTMLImageElement} the new image HTML element
 */
function createImage(src, alt) {
    alt = alt || '';
    var image = document.createElement("img");
    image.src = src;
    image.alt = alt;
    return image;
}

/**
 * Loops over a HTML collection
 * @param collection collection to loop over
 * @param toExecute function to execute per HTML element
 */
function loopHTMLCollection(collection, toExecute) {
    for (var i = 0; i < collection.length; i++) {
        toExecute(collection[i]);
    }
}