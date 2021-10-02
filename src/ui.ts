import {AntGame, AntColony, Place, Hive} from './game';
import {Ant, EaterAnt, GuardAnt} from './ants';

import vorpal = require('vorpal');
import chalk = require('chalk');
import _ = require('lodash');

/**
 * The Vorpal library for command-line interaction
 */
const Vorpal = vorpal();
/**
 * This function displays the game board given the game object
 * @param game AntGame object to display game board
 */
export function showMapOf(game:AntGame){
  console.log(getMap(game));
}
/**
 * This function displays the map of the given game.
 * 
 * Displays turn, food, boosts, and icons of insects present
 * 
 * Displays the number of tunnels and water by iterating the place length
 * 
 * @param game AntGame object to get mapped 
 * @returns map of the AntGame object
 */
function getMap(game:AntGame) {
  let places:Place[][] = game.getPlaces();
  let tunnelLength = places[0].length;
  let beeIcon = chalk.bgYellow.black('B');
   
  let map = '';

  map += chalk.bold('The Colony is under attack!\n');
  map += `Turn: ${game.getTurn()}, Food: ${game.getFood()}, Boosts available: [${game.getBoostNames()}]\n`;
  map += '     '+_.range(0,tunnelLength).join('    ')+'      Hive'+'\n';
   
  for(let i=0; i<places.length; i++){
    map += '    '+Array(tunnelLength+1).join('=====');
    
    if(i===0){
      map += '    ';
      let hiveBeeCount = game.getHiveBeesCount();
      if(hiveBeeCount > 0){
        map += beeIcon;
        map += (hiveBeeCount > 1 ? hiveBeeCount : ' ');
      }
    }
    map += '\n';

    map += i+')  ';
      
    for(let j=0; j<places[i].length; j++){ 
      let place:Place = places[i][j];

      map += iconFor(place.getAnt());
      map += ' '; 

      if(place.getBees().length > 0){
        map += beeIcon;
        map += (place.getBees().length > 1 ? place.getBees().length : ' ');
      } else {
        map += '  ';
      }
      map += ' '; 
    }
    map += '\n    ';
    for(let j=0; j<places[i].length; j++){
      let place = places[i][j];
      if(place.isWater()){
        map += chalk.bgCyan('~~~~')+' ';
      } else {
        map += '==== ';
      }
    }
    map += '\n';
  }
  map += '     '+_.range(0,tunnelLength).join('    ')+'\n';

  return map;
}

/**
 * This function sets the icon and color for the given Ant type.
 * @param ant type of Ant object
 * @returns icon and color of Ant object
 */
function iconFor(ant:Ant){
  if(ant === undefined){ return ' ' };
  let icon:string;
  switch(ant.name){
    case "Grower":
      icon = chalk.green('G'); break;
    case "Thrower":
      icon = chalk.red('T'); break;
    case "Eater":
      if((<EaterAnt>ant).isFull())
        icon = chalk.yellow.bgMagenta('E');
      else
        icon = chalk.magenta('E');
      break;
    case "Scuba":
      icon = chalk.cyan('S'); break;
    case "Guard":
      let guarded:Ant = (<GuardAnt>ant).getGuarded();
      if(guarded){
        icon = chalk.underline(iconFor(guarded)); break;
      } else {
        icon = chalk.underline('x'); break;
      }
    default:
      icon = '?';
  }
  return icon;
}

/**
 * This function displays a user interface for commands in the console to play the game using the Vorpal library
 * @param game AntGame object to play
 */
export function play(game:AntGame) {
  Vorpal
    .delimiter(chalk.green('AvB $')) //Sets the user's prompt in the console to "AvB $" while the game is running
    .log(getMap(game)) //Prints out the display of the game board
    .show(); //Allows input to be made when things are printed in the console

  Vorpal
    .command('show', 'Shows the current game board.') //Creates the 'show' commands which shows the game board
    .action(function(args, callback){ //Executes the show command if 'show' was inputted
      Vorpal.log(getMap(game)); //Prints out the game board
      callback(); //Ends the command execution
    });

  Vorpal
    //Creates the 'deploy' command that takes in two arguments antType and tunnel
    .command('deploy <antType> <tunnel>', 'Deploys an ant to tunnel (as "row,col" eg. "0,6").')
    .alias('add', 'd') //Creates alias 'add' and 'a' of the 'deploy' command
    .autocomplete(['Grower','Thrower','Eater','Scuba','Guard']) //Autocompletes partially typed antType
    .action(function(args, callback) { //Executes the command if 'deploy' was inputted with arguments
      let error = game.deployAnt(args.antType, args.tunnel)
      if(error){
        Vorpal.log(`Invalid deployment: ${error}.`); //Prints out error message in the console
      }
      else {
        Vorpal.log(getMap(game)); //Prints out the updated game board if deployment was successful
      }
      callback(); //Ends the command execution
    });

  Vorpal
    //Creates the 'remove' command that takes in one argument tunnel
    .command('remove <tunnel>', 'Removes the ant from the tunnel (as "row,col" eg. "0,6").')
    .alias('rm') //Creates alias 'rm' of the 'remove' command
    .action(function(args, callback){ //Executes the command if 'remove' was inputted with arguments
      let error = game.removeAnt(args.tunnel);
      if(error){
        Vorpal.log(`Invalid removal: ${error}.`); //Prints out error message in the console
      }
      else {
        Vorpal.log(getMap(game)); //Prints out the updated game board if remove was successful
      }
      callback(); //Ends the command execution
    });

  Vorpal
    //Creates the 'boost' command that takes in two arguments boost and tunnel
    .command('boost <boost> <tunnel>', 'Applies a boost to the ant in a tunnel (as "row,col" eg. "0,6")')
    .alias('b') //Creates alias 'b' of the 'boost' command
    .autocomplete({data:() => game.getBoostNames()}) //Autocompletes boost names found in the game
    .action(function(args, callback){ //Executes the command if 'boost' was inputted with arguments 
      let error = game.boostAnt(args.boost, args.tunnel);
      if(error){
        Vorpal.log(`Invalid boost: ${error}`); //Prints out error message in the console
      }
      callback(); //Ends the command execution
    })

  Vorpal
    .command('turn', 'Ends the current turn. Ants and bees will act.') //Creates the 'turn' command
    .alias('end turn', 'take turn','t') //Creates alias 'end turn', 'take turn', and 't' of the 'turn' command
    .action(function(args, callback){ //Executes the command if 'turn' was inputted
      game.takeTurn();
      Vorpal.log(getMap(game));
      let won:boolean = game.gameIsWon();
      if(won === true){
        Vorpal.log(chalk.green('Yaaaay---\nAll bees are vanquished. You win!\n')); //Prints out message in the console if win conditions are met
      }
      else if(won === false){
        Vorpal.log(chalk.yellow('Bzzzzz---\nThe ant queen has perished! Please try again.\n')); //Prints out message in the console if lose conditions are met
      }
      else {
        callback(); //Ends the command execution
      }
    });
}
