"use strict";
exports.__esModule = true;
var game_1 = require("./game");
var ui_1 = require("./ui");
if (process.argv[2] === '--debug') {
    //the scenario to debug with
    var colony = new game_1.AntColony(16, 1, 8, 0); //testing colony
    var hive = new game_1.Hive(3, 1) //testing Hive
        .addWave(2, 1)
        .addWave(3, 1);
    var game = new game_1.AntGame(colony, hive);
    //run hard-coded commands
    game.deployAnt('Grower', '0,0'); //for example
    game.deployAnt('Thrower', '0,1');
    game.takeTurn(); //for example
    game.takeTurn();
    game.takeTurn();
    (0, ui_1.showMapOf)(game); //show the board, for example (for debugging)
    //play(game); //launch the interactive version from here
}
else {
    //initialize the game to play (not interactively selected yet)
    var colony = new game_1.AntColony(2, 3, 8, 3); //full colony
    var hive = new game_1.Hive(3, 1) //testing Hive
        .addWave(2, 1)
        .addWave(3, 1);
    var game = new game_1.AntGame(colony, hive);
    //start playing the game
    (0, ui_1.play)(game);
}
