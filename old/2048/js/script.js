document.addEventListener("DOMContentLoaded", function () {
    // Wait till the browser is ready to render the game (avoids glitches)
    window.requestAnimationFrame(function () {
        var manager = new GameManager(4, KeyboardInputManager, HTMLActuator);
    });
});

/**
 * Game manager class
 * @param size size of the grid
 * @param InputManager KeyboardInputManager to manage the keyboard inputs
 * @param Actuator HTMLActuator updates the html
 * @constructor
 */
function GameManager(size, InputManager, Actuator) {
    this.size = size; // Size of the grid
    this.inputManager = new InputManager;
    this.actuator = new Actuator;

    this.startTiles = 1;

    this.inputManager.on("move", this.move.bind(this));
    this.inputManager.on("restart", this.restart.bind(this));

    this.setup();
}

/**
 * Restart the game
 */
GameManager.prototype.restart = function () {
    this.actuator.restart();
    this.setup();
};

/**
 * Sets up the game
 */
GameManager.prototype.setup = function () {
    this.grid = new Grid(this.size);

    this.score = 0;
    this.over = false;
    this.won = false;

    // Add the initial tiles
    this.addStartTiles();

    // Update the actuator
    this.actuate();
};

/**
 * Sets up the initial tiles to start the game with
 */
GameManager.prototype.addStartTiles = function () {
    for (var i = 0; i < this.startTiles; i++) {
        this.addRandomTile();
    }
};

/**
 * Adds a tile in a random position
 */
GameManager.prototype.addRandomTile = function () {
    if (this.grid.cellsAvailable()) {
        var value = Math.random() < 0.9 ? 2 : 4;
        var tile = new Tile(this.grid.randomAvailableCell(), value);

        this.grid.insertTile(tile);
    }
};

/**
 * Sends the updated grid to the actuator
 */
GameManager.prototype.actuate = function () {
    this.actuator.actuate(this.grid, {
        score: this.score,
        over: this.over,
        won: this.won
    });
};

/**
 * Saves all tile positions and remove merger info
 */
GameManager.prototype.prepareTiles = function () {
    this.grid.eachCell(function (x, y, tile) {
        if (tile) {
            tile.mergedFrom = null;
            tile.savePosition();
        }
    });
};

/**
 * Moves a tile and its representation
 * @param tile the tile to move
 * @param cell the cell to move to
 */
GameManager.prototype.moveTile = function (tile, cell) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
};

/**
 * Moves tiles on the grid in the specified direction
 * @param direction direction to move to
 */
GameManager.prototype.move = function (direction) {
    // 0: up, 1: right, 2:down, 3: left
    var self = this;

    if (this.over || this.won) return; // Don't do anything if the game's over

    var cell, tile;

    var vector = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var moved = false;

    // Save the current tile positions and remove merger information
    this.prepareTiles();

    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach(function (x) {
        traversals.y.forEach(function (y) {
            cell = {x: x, y: y};
            tile = self.grid.cellContent(cell);

            if (tile) {
                var positions = self.findFarthestPosition(cell, vector);
                var next = self.grid.cellContent(positions.next);

                // Only one merger per row traversal?
                if (next && next.value === tile.value && !next.mergedFrom) {
                    var merged = new Tile(positions.next, tile.value * 2);
                    merged.mergedFrom = [tile, next];

                    self.grid.insertTile(merged);
                    self.grid.removeTile(tile);

                    // Converge the two tiles' positions
                    tile.updatePosition(positions.next);

                    // Update the score
                    self.score += merged.value;

                    // The mighty 2048 tile
                    if (merged.value === 2048) self.won = true;
                } else {
                    self.moveTile(tile, positions.farthest);
                }

                if (!self.positionsEqual(cell, tile)) {
                    moved = true; // The tile moved from its original cell!
                }
            }
        });
    });

    if (moved) {
        this.addRandomTile();

        if (!this.movesAvailable()) {
            this.over = true; // Game over!
        }

        this.actuate();
    }
};

/**
 * Gets the vector representing the chosen direction
 * @param direction direction to map to
 * @return {{x, y}|*} corresponding x and y coordinates
 */
GameManager.prototype.getVector = function (direction) {
    // Vectors representing tile movement
    var map = [
        {x: 0, y: -1}, // up
        {x: 1, y: 0},  // right
        {x: 0, y: 1},  // down
        {x: -1, y: 0}   // left
    ];

    return map[direction];
};

/**
 * Builds a list of positions to traverse in the right order
 * @param vector chosen direction
 * @return {{x: Array, y: Array}} x and y coordinates of the traversal
 */
GameManager.prototype.buildTraversals = function (vector) {
    var traversals = {x: [], y: []};

    for (var pos = 0; pos < this.size; pos++) {
        traversals.x.push(pos);
        traversals.y.push(pos);
    }

    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
};

/**
 * Finds the farthest position given a cell and vector
 * @param cell given cell
 * @param vector given direction vector
 * @return {{farthest: *, next: *}} farthest position and next tile
 */
GameManager.prototype.findFarthestPosition = function (cell, vector) {
    var previous;

    // Progress towards the vector direction until an obstacle is found
    do {
        previous = cell;
        cell = {x: previous.x + vector.x, y: previous.y + vector.y};
    } while (this.grid.withinBounds(cell) &&
    this.grid.cellAvailable(cell));

    return {
        farthest: previous,
        next: cell // Used to check if a merge is required
    };
};

/**
 * Checks the available moves
 * @return {*|boolean} whether there are moves available
 */
GameManager.prototype.movesAvailable = function () {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

/**
 * Checks for available matches between tiles (more expensive check)
 * @return {boolean} if tiles can be merged
 */
GameManager.prototype.tileMatchesAvailable = function () {
    var self = this;

    var tile;

    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            tile = this.grid.cellContent({x: x, y: y});

            if (tile) {
                for (var direction = 0; direction < 4; direction++) {
                    var vector = self.getVector(direction);
                    var cell = {x: x + vector.x, y: y + vector.y};

                    var other = self.grid.cellContent(cell);

                    if (other && other.value === tile.value) {
                        return true; // These two tiles can be merged
                    }
                }
            }
        }
    }

    return false;
};

/**
 * Checks if two positions are equal
 * @param first position
 * @param second position
 * @return {boolean} whether the two positions are equal
 */
GameManager.prototype.positionsEqual = function (first, second) {
    return first.x === second.x && first.y === second.y;
};

/**
 * Grid class
 * @param size given size of the grid
 * @constructor
 */
function Grid(size) {
    this.size = size;

    this.cells = [];

    this.build();
}

/**
 * Builds a grid of the specified size
 */
Grid.prototype.build = function () {
    for (var x = 0; x < this.size; x++) {
        var row = this.cells[x] = [];

        for (var y = 0; y < this.size; y++) {
            row.push(null);
        }
    }
};

/**
 * Finds the first available random position
 * @return {Array} containing available random positions
 */
Grid.prototype.randomAvailableCell = function () {
    var cells = this.availableCells();

    if (cells.length) {
        return cells[Math.floor(Math.random() * cells.length)];
    }
};

/**
 * Finds the available empty cells
 * @return {Array} containing available empty cells
 */
Grid.prototype.availableCells = function () {
    var cells = [];

    this.eachCell(function (x, y, tile) {
        if (!tile) {
            cells.push({x: x, y: y});
        }
    });

    return cells;
};

/**
 * Call callback for every cell
 * @param callback callback function to execute
 */
Grid.prototype.eachCell = function (callback) {
    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            callback(x, y, this.cells[x][y]);
        }
    }
};

/**
 * Checks if there are any cells available
 * @return {boolean} whether there are any cells available
 */
Grid.prototype.cellsAvailable = function () {
    return !!this.availableCells().length;
};

/**
 * Check if the specified cell is available
 * @param cell cell to check
 * @return {boolean} whether the specified cell is available
 */
Grid.prototype.cellAvailable = function (cell) {
    return !this.cellOccupied(cell);
};

/**
 * Check if the specified cell is occupied
 * @param cell cell to check
 * @return {boolean} whether the specified cell is taken
 */
Grid.prototype.cellOccupied = function (cell) {
    return !!this.cellContent(cell);
};

/**
 * Returns the content of a cell if it is in the bounds
 * @param cell cell to check
 * @return {*} the content or null
 */
Grid.prototype.cellContent = function (cell) {
    if (this.withinBounds(cell)) {
        return this.cells[cell.x][cell.y];
    } else {
        return null;
    }
};

/**
 * Inserts a tile at its position
 * @param tile tile to insert
 */
Grid.prototype.insertTile = function (tile) {
    this.cells[tile.x][tile.y] = tile;
};

/**
 * Removes a tile at its position
 * @param tile tile to remove
 */
Grid.prototype.removeTile = function (tile) {
    this.cells[tile.x][tile.y] = null;
};

/**
 * Checks whether a position is within bounds
 * @param position position to check
 * @return {boolean} whether the position is in the bounds
 */
Grid.prototype.withinBounds = function (position) {
    return position.x >= 0 && position.x < this.size &&
        position.y >= 0 && position.y < this.size;
};


/**
 * HTMLActuator class
 * @constructor
 */
function HTMLActuator() {
    this.tileContainer = document.getElementById("tile-container");
    this.scoreContainer = document.getElementById("score-container");
    this.messageContainer = document.getElementById("game-message-container");

    this.score = 0;
}

/**
 * Updates the html according to the grid
 * @param grid grid to insert
 * @param metadata metadata to insert
 */
HTMLActuator.prototype.actuate = function (grid, metadata) {
    var self = this;

    window.requestAnimationFrame(function () {
        self.clearContainer(self.tileContainer);

        grid.cells.forEach(function (column) {
            column.forEach(function (cell) {
                if (cell) {
                    self.addTile(cell);
                }
            });
        });

        self.updateScore(metadata.score);

        if (metadata.over) self.message(false); // You lose
        if (metadata.won) self.message(true); // You win!
    });
};

/**
 * Restarts the game
 */
HTMLActuator.prototype.restart = function () {
    this.clearMessage();
};

/**
 * Clears the container
 * @param container given container to clear
 */
HTMLActuator.prototype.clearContainer = function (container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

/**
 * Adds a tile to the HTML
 * @param tile to add
 */
HTMLActuator.prototype.addTile = function (tile) {
    var self = this;

    var element = document.createElement("div");
    var position = tile.previousPosition || {x: tile.x, y: tile.y};
    var positionClass = this.positionClass(position);

    // We can't use classlist because it somehow glitches when replacing classes
    var classes = ["tile", "tile-" + tile.value, positionClass];
    this.applyClasses(element, classes);

    element.textContent = tile.value;

    if (tile.previousPosition) {
        // Make sure that the tile gets rendered in the previous position first
        window.requestAnimationFrame(function () {
            classes[2] = self.positionClass({x: tile.x, y: tile.y});
            self.applyClasses(element, classes); // Update the position
        });
    } else if (tile.mergedFrom) {
        classes.push("tile-merged");
        this.applyClasses(element, classes);

        // Render the tiles that merged
        tile.mergedFrom.forEach(function (merged) {
            self.addTile(merged);
        });
    } else {
        classes.push("tile-new");
        this.applyClasses(element, classes);
    }

    // Put the tile on the board
    this.tileContainer.appendChild(element);
};

/**
 * Applies the classes to an element
 * @param element element to update
 * @param classes classes to add
 */
HTMLActuator.prototype.applyClasses = function (element, classes) {
    element.setAttribute("class", classes.join(" "));
};

/**
 * Normalizes the position by incrementing the x and y
 * @param position position to update
 * @return {{x: *, y: *}} new position
 */
HTMLActuator.prototype.normalizePosition = function (position) {
    return {x: position.x + 1, y: position.y + 1};
};

/**
 * Returns the class corresponding to the position
 * @param position position to update it to
 * @return {string} corresponding class
 */
HTMLActuator.prototype.positionClass = function (position) {
    position = this.normalizePosition(position);
    return "tile-position-" + position.x + "-" + position.y;
};

/**
 * Updates the score in the HTML
 * @param score score to update it to
 */
HTMLActuator.prototype.updateScore = function (score) {
    this.clearContainer(this.scoreContainer);

    var difference = score - this.score;
    this.score = score;

    this.scoreContainer.textContent = this.score;

    if (difference > 0) {
        var addition = document.createElement("div");
        addition.classList.add("score-addition");
        addition.textContent = "+" + difference;

        this.scoreContainer.appendChild(addition);
    }
};

/**
 * Updates the HTML message
 * @param won boolean whether you have won the game
 */
HTMLActuator.prototype.message = function (won) {
    var type = won ? "game-won" : "game-over";
    var message = won ? "You win!" : "Game over!";
    var binding = won ? "win_" : "lose_";

    var score = document.getElementById("score-container").textContent;

    if (typeof ALTabletBinding !== 'undefined') ALTabletBinding.raiseEvent('2048_' + binding + score);

    this.messageContainer.classList.add(type);
    document.getElementById("game-message").textContent = message;
    document.getElementById("score-wrapper").textContent = score;
};

/**
 * Clears the message in the HTML
 */
HTMLActuator.prototype.clearMessage = function () {
    this.messageContainer.classList.remove("game-won", "game-over");
};

/**
 * KeyboardInputManager class
 * @constructor
 */
function KeyboardInputManager() {
    this.events = {};
    this.listen();
}

/**
 * Listening Event Handler
 * @param event event to listen to
 * @param callback callback to execute
 */
KeyboardInputManager.prototype.on = function (event, callback) {
    if (!this.events[event]) {
        this.events[event] = [];
    }
    this.events[event].push(callback);
};

/**
 * Firing Event Handler
 * @param event event to listen to
 * @param data data to send
 */
KeyboardInputManager.prototype.emit = function (event, data) {
    var callbacks = this.events[event];
    if (callbacks) {
        callbacks.forEach(function (callback) {
            callback(data);
        });
    }
};

/**
 * Listens to keyboard inputs or swipes
 */
KeyboardInputManager.prototype.listen = function () {
    var self = this;

    var map = {
        38: 0, // Up
        39: 1, // Right
        40: 2, // Down
        37: 3, // Left
        75: 0, // vim keybindings
        76: 1,
        74: 2,
        72: 3
    };

    document.addEventListener("keydown", function (event) {
        var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
            event.shiftKey;
        var mapped = map[event.which];

        if (!modifiers) {
            if (mapped !== undefined) {
                event.preventDefault();
                self.emit("move", mapped);
            }

            if (event.which === 32) self.restart.bind(self)(event);
        }
    });

    var retry = document.getElementById("retry-button");
    retry.addEventListener("click", this.restart.bind(this));

    // Listen to swipe events
    var gestures = [Hammer.DIRECTION_UP, Hammer.DIRECTION_RIGHT,
        Hammer.DIRECTION_DOWN, Hammer.DIRECTION_LEFT];

    var gameContainer = document.getElementById("game-container");
    var handler = Hammer(gameContainer, {
        drag_block_horizontal: true,
        drag_block_vertical: true
    });

    handler.on("swipeleft swiperight panup pandown", function (event) {
        event.preventDefault();
        var mapped = gestures.indexOf(event.direction);

        if (mapped !== -1) self.emit("move", mapped);
    });
};

/**
 * Restarts the game
 * @param event event to prevent
 */
KeyboardInputManager.prototype.restart = function (event) {
    event.preventDefault();
    this.emit("restart");
};

/**
 * Tile class
 * @param position position to place the tile
 * @param value value to set in the tile
 * @constructor
 */
function Tile(position, value) {
    this.x = position.x;
    this.y = position.y;
    this.value = value || 2;

    this.previousPosition = null;
    this.mergedFrom = null; // Tracks tiles that merged together
}

/**
 * Saves the position of the previous tile
 */
Tile.prototype.savePosition = function () {
    this.previousPosition = {
        x: this.x,
        y: this.y
    };
};

/**
 * Updates the position of the tile
 * @param position new position of the tile
 */
Tile.prototype.updatePosition = function (position) {
    this.x = position.x;
    this.y = position.y;
};


