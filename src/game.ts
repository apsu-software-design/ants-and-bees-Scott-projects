import {Insect, Bee, Ant, GrowerAnt, ThrowerAnt, EaterAnt, ScubaAnt, GuardAnt} from './ants';

class Place {
  protected ant:Ant;
  protected guard:GuardAnt;
  protected bees:Bee[] = [];
  
  constructor(readonly name:string,
              protected readonly water = false,
              private exit?:Place, 
              private entrance?:Place) {}

  /**
   * This function gets the exit.
   * @returns Place of the exit
   */
  getExit():Place { return this.exit; }
  /**
   * This function sets the entrance given the place.
   * @param place place of the entrance to be set
   */
  setEntrance(place:Place){ this.entrance = place; }
  /**
   * This function checks if the place has water.
   * @returns true if there is water, otherwise false
  */
  isWater():boolean { return this.water; }
  /**
   * This function gets the Ant.
   * @returns Guard Ant, otherwise return Ant
   */
  getAnt():Ant { 
    if(this.guard) 
      return this.guard;
    else 
      return this.ant;
  }
  /**
   * This function gets the GuardAnt.
   * @returns the Ant object
   */
  getGuardedAnt():Ant {
    return this.ant;
  }
  /**
   * This function gets the array of Bees.
   * @returns the array of Bees
   */
  getBees():Bee[] { return this.bees; }
  /**
   * This function finds the closest Bee in the Ant colony given the maxDistance
   * and minDistance.
   * @param maxDistance maximum distance to find bee in the vicinity
   * @param minDistance minimum distance to find bee in the vicinity
   * @returns returns the closest Bee if found, otherwise undefined if no Bee is found
   */
  getClosestBee(maxDistance:number, minDistance:number = 0):Bee {
		let p:Place = this;
		for(let dist = 0; p!==undefined && dist <= maxDistance; dist++) {
			if(dist >= minDistance && p.bees.length > 0) {
				return p.bees[0];
      }
			p = p.entrance;
		}
		return undefined;
  }
  /**
   * This function adds an Ant to a place.
   * @param ant Ant object to add
   * @returns true if the GuardAt/Ant was added, otherwise false
   */
  addAnt(ant:Ant):boolean {
    if(ant instanceof GuardAnt) {
      if(this.guard === undefined){
        this.guard = ant;
        this.guard.setPlace(this);
        return true;
      }
    }
    else 
      if(this.ant === undefined) {
        this.ant = ant;
        this.ant.setPlace(this);
        return true;
      }
    return false;
  }
  /**
   * This function removes the GuardAnt/Ant.
   * @returns the Ant object that was removed
   */
  removeAnt():Ant {
    if(this.guard !== undefined){
      let guard = this.guard;
      this.guard = undefined;
      return guard;
    }
    else {
      let ant = this.ant;
      this.ant = undefined;
      return ant;
    }
  }
  /**
   * This function adds the Bee to the array and sets them in a place.
   * @param bee Bee object to add
   */
  addBee(bee:Bee):void {
    this.bees.push(bee);
    bee.setPlace(this);
  }
  /**
   * This function removes the given Bee object from the place and array.
   * @param bee Bee object to be removed
   */
  removeBee(bee:Bee):void {
    var index = this.bees.indexOf(bee);
    if(index >= 0){
      this.bees.splice(index,1);
      bee.setPlace(undefined);
    }
  }
  /**
   * This function removes all the Bees from the place by iterating through the array.
   * and sets the array to empty 
   */
  removeAllBees():void {
    this.bees.forEach((bee) => bee.setPlace(undefined) );
    this.bees = [];
  }
  /**
   * This function removes the given Bee and adds it to the exit.
   * @param bee Bee object to be added to exit
   */
  exitBee(bee:Bee):void {
    this.removeBee(bee);
    this.exit.addBee(bee);  
  }
  /**
   * This function removes the given Insect either Ant or Bee.
   * @param insect Insect to be removed
   */
  removeInsect(insect:Insect) {
    if(insect instanceof Ant){
      this.removeAnt();
    }
    else if(insect instanceof Bee){
      this.removeBee(insect);
    }
  }
  /**
   * This function removes Ants if there is water in place except ScubaAnt.
   */
  act() {
    if(this.water){
      if(this.guard){
        this.removeAnt();
      }
      if(!(this.ant instanceof ScubaAnt)){
        this.removeAnt();
      }
    }
  }
}


class Hive extends Place {
  private waves:{[index:number]:Bee[]} = {}

  constructor(private beeArmor:number, private beeDamage:number){
    super('Hive');
  }
  /**
   * This function adds waves of Bees given the turn and number of Bees.
   * 
   * Iterates through the number of Bees and creating Bee objects to be put into a waves array
   * @param attackTurn number of turns the Bee will show in the Ant Colony
   * @param numBees number of Bees 
   * @returns Hive object
   */
  addWave(attackTurn:number, numBees:number):Hive {
    let wave:Bee[] = [];
    for(let i=0; i<numBees; i++) {
      let bee = new Bee(this.beeArmor, this.beeDamage, this);
      this.addBee(bee);
      wave.push(bee);
    }
    this.waves[attackTurn] = wave;
    return this;
  }
  /**
   * This function adds Bees to the given AntColony and current turn.
   * 
   * Iterates through waves array to add Bees to the entrance of the AntColony
   * 
   * @param colony AntColony object to be invaded
   * @param currentTurn current turn of the game
   * @returns the number of Bees invading the colony in that current turn, otherwise empty array
   */
  invade(colony:AntColony, currentTurn:number): Bee[]{
    if(this.waves[currentTurn] !== undefined) {
      this.waves[currentTurn].forEach((bee) => {
        this.removeBee(bee);
        let entrances:Place[] = colony.getEntrances();
        let randEntrance:number = Math.floor(Math.random()*entrances.length);
        entrances[randEntrance].addBee(bee);
      });
      return this.waves[currentTurn];
    }
    else{
      return [];
    }    
  }
}


class AntColony {
  private food:number;
  private places:Place[][] = [];
  private beeEntrances:Place[] = [];
  private queenPlace:Place = new Place('Ant Queen');
  private boosts:{[index:string]:number} = {'FlyingLeaf':1,'StickyLeaf':1,'IcyLeaf':1,'BugSpray':0}

  constructor(startingFood:number, numTunnels:number, tunnelLength:number, moatFrequency=0){
    this.food = startingFood;

    let prev:Place;
		for(let tunnel=0; tunnel < numTunnels; tunnel++)
		{
			let curr:Place = this.queenPlace;
      this.places[tunnel] = [];
			for(let step=0; step < tunnelLength; step++)
			{
        let typeName = 'tunnel';
        if(moatFrequency !== 0 && (step+1)%moatFrequency === 0){
          typeName = 'water';
				}
				
				prev = curr;
        let locationId:string = tunnel+','+step;
        curr = new Place(typeName+'['+locationId+']', typeName=='water', prev);
        prev.setEntrance(curr);
				this.places[tunnel][step] = curr;
			}
			this.beeEntrances.push(curr);
		}
  }
  /**
   * This functions gets the number of food.
   * @returns the number of food
   */
  getFood():number { return this.food; }
  /**
   * This function adds the given amount of food.
   * @param amount number of amount added to food
   */
  increaseFood(amount:number):void { this.food += amount; }
  /**
   * This function gets the place in the AntColony.
   * @returns the place with row and col
   */
  getPlaces():Place[][] { return this.places; }
  /**
   * This function gets the entrance of the AntColony.
   * @returns entrance of the AntColony
   */
  getEntrances():Place[] { return this.beeEntrances; }
  /**
   * This function gets the place of the Queen Bee.
   * @returns place of the Queen
   */
  getQueenPlace():Place { return this.queenPlace; }
  /**
   * This function checks if there are bees at the Queen's place.
   * @returns true if there is at least 1 Bee, otherwise false
   */
  queenHasBees():boolean { return this.queenPlace.getBees().length > 0; }
  /**
   * This function gets the boosts.
   * @returns array of boosts
   */
  getBoosts():{[index:string]:number} { return this.boosts; }
  /**
   * This function adds the given boost.
   * @param boost boost to be added in the AntColony 
   */
  addBoost(boost:string){
    if(this.boosts[boost] === undefined){
      this.boosts[boost] = 0;
    }
    this.boosts[boost] = this.boosts[boost]+1;
    console.log('Found a '+boost+'!');
  }
  /**
   * This function adds the given Ant and place to the AntColony.
   * @param ant Ant object to be added in the AntColony
   * @param place place to add the Ant object
   * @returns undefined if successful, otherwise returns an error message(Occupied/Insufficent Food)
   */
  deployAnt(ant:Ant, place:Place):string {
    if(this.food >= ant.getFoodCost()){
      let success = place.addAnt(ant);
      if(success){
        this.food -= ant.getFoodCost();
        return undefined;
      }
      return 'tunnel already occupied';
    }
    return 'not enough food';
  }
  /**
   * This function removes an Ant given the place.
   * @param place place to remove the Ant
   */
  removeAnt(place:Place){
    place.removeAnt();
  }
  /**
   * This function gives an Ant a boost given the boost name and place of the Ant.
   * @param boost name of the boost to give to Ant
   * @param place place where the Ant is given the boost
   * @returns an error message or nothing if successful
   */
  applyBoost(boost:string, place:Place):string {
    if(this.boosts[boost] === undefined || this.boosts[boost] < 1) {
      return 'no such boost';
    }
    let ant:Ant = place.getAnt();
    if(!ant) {
      return 'no Ant at location' 
    }
    ant.setBoost(boost);
    return undefined;
  }
  /**
   * This function executes the actions of all the Ants in the AntColony by
   * iterating the array of Ants.
   */
  antsAct() {
    this.getAllAnts().forEach((ant) => {
      if(ant instanceof GuardAnt) {
        let guarded = ant.getGuarded();
        if(guarded)
          guarded.act(this);
      }
      ant.act(this);
    });    
  }
  /**
   * This function executes the actions of all the Bees in the AntColony by iterating
   * through the array of Bees.
   */
  beesAct() {
    this.getAllBees().forEach((bee) => {
      bee.act();
    });
  }
  /**
   * This function executes actions of places(Water) in the AntColony
   * by iterating through the rows and col in the colony.
   */
  placesAct() {
    for(let i=0; i<this.places.length; i++) {
      for(let j=0; j<this.places[i].length; j++) {
        this.places[i][j].act();
      }
    }    
  }
  /**
   * This function gets all the Ants in the colony by iterating through
   * the rows and cols for Ants.
   * @returns the array of Ants in the AntColony
   */
  getAllAnts():Ant[] {
    let ants = [];
    for(let i=0; i<this.places.length; i++) {
      for(let j=0; j<this.places[i].length; j++) {
        if(this.places[i][j].getAnt() !== undefined) {
          ants.push(this.places[i][j].getAnt());
        }
      }
    }
    return ants;
  }
  /**
   * This function gets all the Bees in the colony by iterating
   * through the rows and cols for Bees.
   * @returns the array of Bees in the AntColony
   */
  getAllBees():Bee[] {
    var bees = [];
    for(var i=0; i<this.places.length; i++){
      for(var j=0; j<this.places[i].length; j++){
        bees = bees.concat(this.places[i][j].getBees());
      }
    }
    return bees;
  }
}


class AntGame {
  private turn:number = 0;
  constructor(private colony:AntColony, private hive:Hive){}
  /**
   * This function executes all the actions inside the AntColony and
   * spawns Bees after a certain amount of turns.
   */
  takeTurn() {
    console.log('');
    this.colony.antsAct();
    this.colony.beesAct();
    this.colony.placesAct();
    this.hive.invade(this.colony, this.turn);
    this.turn++;
    console.log('');
  }
  /**
   * This function gets the number of turns
   * @returns the number of turns
   */
  getTurn() { return this.turn; }
  /**
   * This function checks the conditions if the game is beaten.
   * 
   * @returns false if Bees reach the Queen's place, true if all Bees are vanquished, otherwise
   * undefined
   */
  gameIsWon():boolean|undefined {
    if(this.colony.queenHasBees()){
      return false;
    }
    else if(this.colony.getAllBees().length + this.hive.getBees().length === 0) {
      return true;
    }   
    return undefined;
  }
  /**
   * This function deploys an Ant given the ant type and place coordinates.
   * 
   * @param antType Grower/Thrower/Eater/Scuba/Guard Ant
   * @param placeCoordinates place to set the Ant in the AntColony
   * @returns an error message, or place of the Ant in the AntColony
   */
  deployAnt(antType:string, placeCoordinates:string):string {
    let ant;
    switch(antType.toLowerCase()) {
      case "grower":
        ant = new GrowerAnt(); break;
      case "thrower":
        ant = new ThrowerAnt(); break;
      case "eater":
        ant = new EaterAnt(); break;
      case "scuba":
        ant = new ScubaAnt(); break;
      case "guard":
        ant = new GuardAnt(); break;
      default:
        return 'unknown ant type';
    }

    try {
      let coords = placeCoordinates.split(',');
      let place:Place = this.colony.getPlaces()[coords[0]][coords[1]];
      return this.colony.deployAnt(ant, place);
    } catch(e) {
      return 'illegal location';
    }
  }
  /**
   * This function removes an existing Ant in the AntColony.
   * @param placeCoordinates place in the AntColony
   * @returns undefined or an error message
   */
  removeAnt(placeCoordinates:string):string {
    try {
      let coords = placeCoordinates.split(',');
      let place:Place = this.colony.getPlaces()[coords[0]][coords[1]];
      place.removeAnt();
      return undefined;
    }catch(e){
      return 'illegal location';
    }    
  }
  /**
   * This function applies a boost to an Ant in the AntColony given the boost type and
   * place of the Ant.
   * @param boostType type of boost
   * @param placeCoordinates place in the AntColony
   * @returns the boost applied to the Ant in the AntColony or an error message
   */
  boostAnt(boostType:string, placeCoordinates:string):string {
    try {
      let coords = placeCoordinates.split(',');
      let place:Place = this.colony.getPlaces()[coords[0]][coords[1]];
      return this.colony.applyBoost(boostType,place);
    }catch(e){
      return 'illegal location';
    }    
  }
  /**
   * This function gets the place in the AntColony by row and col.
   * @returns place by row and col
   */
  getPlaces():Place[][] { return this.colony.getPlaces(); }
  /**
   * This function gets the number of food in the AntColony.
   * @returns number of food in AntColony
   */
  getFood():number { return this.colony.getFood(); }
  /**
   * This function gets the number of Bees from the Hive.
   * @returns number of Bees in Hive
   */
  getHiveBeesCount():number { return this.hive.getBees().length; }
  /**
   * This function gets the boosts in the AntColony
   * @returns number of boosts in AntColony
   */
  getBoostNames():string[] { 
    let boosts = this.colony.getBoosts();
    return Object.keys(boosts).filter((boost:string) => {
      return boosts[boost] > 0;
    }); 
  }
}

export { AntGame, Place, Hive, AntColony }