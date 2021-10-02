import {AntColony, Place} from './game';

export abstract class Insect {
  readonly name:string;
  /**
   * This abstract constructor provides the definition for all clases that extend from Insect class
   * @param armor Insect's armor
   * @param place place of the Insect
   */
  constructor(protected armor:number, protected place:Place){}

  /**
   * This function gets the name of the Insect.
   * @returns string of the Insect name
   */
  getName():string { return this.name; }
  /**
   * This function gets the armor of the Insect.
   * @returns number of the armor
   */
  getArmor():number { return this.armor; }
  /**
   * This function gets the place of the Insect.
   * @returns the place of the Insect 
   */
  getPlace() { return this.place; }
  /**
   * This function sets the given place.
   * @param place place to be set
   */
  setPlace(place:Place){ this.place = place; }

  /**
   * This function subtracts the Insect's armor given the amount.
   * 
   * Removes Insect if armor < 0
   * @param amount amount to be subtracted
   * @returns true if armor < 0, otherwise false
   */
  reduceArmor(amount:number):boolean {
    this.armor -= amount;
    if(this.armor <= 0){
      console.log(this.toString()+' ran out of armor and expired');
      this.place.removeInsect(this);
      return true;
    }
    return false;
  }
  /**
   * This abstract function provides the defintion for act.
   * @param colony optional AntColony object 
   */
  abstract act(colony?:AntColony):void;
  /**
   * This function displays the Insect name and the place.
   * @returns string of Insect name and the placement
   */
  toString():string {
    return this.name + '('+(this.place ? this.place.name : '')+')';
  }
}


export class Bee extends Insect {
  readonly name:string = 'Bee';
  private status:string;
  /**
   * The Bee has a 3 armor and deals 1 damage by default.
   * @param armor armor of a Bee
   * @param damage damage dealt by a Bee
   * @param place place of a Bee
   */
  constructor(armor:number, private damage:number, place?:Place){
    super(armor, place);
  }
  /**
   * This function provides an attack for a Bee.
   * @param ant Ant object to attack
   * @returns Ant's armor
   */
  sting(ant:Ant):boolean{
    console.log(this+ ' stings '+ant+'!');
    return ant.reduceArmor(this.damage);
  }
  /**
   * This function checks if the Ant occupies a space where the Bee
   * is trying to move to.
   * @returns true if the Ant is in front of a Bee, otherwise false
   */
  isBlocked():boolean {
    return this.place.getAnt() !== undefined;
  }
  /**
   * This function sets the status of the Bee.
   * @param status status of the Bee
   */
  setStatus(status:string) { this.status = status; }
  /**
   * This function provides actions for the Bee.
   * 
   * If the Bee is blocked and does not have a status, it stings the Ant.
   * 
   * Otherwise, Bee will move forward if armor > 0 and is not stuck.
   */
  act() {
    if(this.isBlocked()){
      if(this.status !== 'cold') {
        this.sting(this.place.getAnt());
      }
    }
    else if(this.armor > 0) {
      if(this.status !== 'stuck'){
        this.place.exitBee(this);
      }
    }    
    this.status = undefined;
  }
}


export abstract class Ant extends Insect {
  protected boost:string;
  /**
   * This abstract constructor provides the defintion for all classes that extend from the Ant class.
   * @param armor Ant's armor
   * @param foodCost cost of the food of an Ant
   * @param place place of the Ant
   */
  constructor(armor:number, private foodCost:number = 0, place?:Place) {
    super(armor, place);
  }
  /**
   * This function gets the food cost of an Ant.
   * @returns the food cost
   */
  getFoodCost():number { return this.foodCost; }
  /**
   * This function sets the boost and prints out a message.
   * @param boost name of the boost
   */
  setBoost(boost:string) { 
    this.boost = boost; 
      console.log(this.toString()+' is given a '+boost);
  }
}


export class GrowerAnt extends Ant {
  readonly name:string = "Grower";
  /**
   * The GrowerAnt has 1 armor and 1 food cost.
   */
  constructor() {
    super(1,1)
  }
  /**
   * This function provides actions for the GrowerAnt.
   * 
   * Adds boosts and increases food depending on the random
   * number generated
   * 
   * @param colony AntColony object to provide these actions to
   */
  act(colony:AntColony) {
    let roll = Math.random();
    if(roll < 0.6){
      colony.increaseFood(1);
    } else if(roll < 0.7) {
      colony.addBoost('FlyingLeaf');
    } else if(roll < 0.8) {
      colony.addBoost('StickyLeaf');
    } else if(roll < 0.9) {
      colony.addBoost('IcyLeaf');
    } else if(roll < 0.95) {
      colony.addBoost('BugSpray');
    }
  }  
}


export class ThrowerAnt extends Ant {
  readonly name:string = "Thrower";
  private damage:number = 1;
  /**
   * The ThrowerAnt has 1 armor and 4 food cost.
   */
  constructor() {
    super(1,4);
  }
  /**
   * This function provides actions for the ThrowerAnt.
   * 
   * If the boost is used, apply status/do extend range damage to the bee
   * 
   */
  act() {
    if(this.boost !== 'BugSpray'){
      let target;
      if(this.boost === 'FlyingLeaf')
        target = this.place.getClosestBee(5);
      else
        target = this.place.getClosestBee(3);

      if(target){
        console.log(this + ' throws a leaf at '+target);
        target.reduceArmor(this.damage);
    
        if(this.boost === 'StickyLeaf'){
          target.setStatus('stuck');
          console.log(target + ' is stuck!');
        }
        if(this.boost === 'IcyLeaf') {
          target.setStatus('cold');
          console.log(target + ' is cold!');
        }
        this.boost = undefined;
      }
    }
    else {
      console.log(this + ' sprays bug repellant everywhere!');
      let target = this.place.getClosestBee(0);
      while(target){
        target.reduceArmor(10);
        target = this.place.getClosestBee(0);
      }
      this.reduceArmor(10);
    }
  }
}


export class EaterAnt extends Ant {
  readonly name:string = "Eater";
  private turnsEating:number = 0;
  private stomach:Place = new Place('stomach');
  /**
   * The EaterAnt has 2 armor and 4 food cost.
   */
  constructor() {
    super(2,4)
  }
  /**
   * This function checks if the EaterAnt is full.
   * @returns true if Bees is more than 0 in stomach
   */
  isFull():boolean {
    return this.stomach.getBees().length > 0;
  }
  /**
   * This function provides actions for EaterAnt.
  
   * Eats a Bee that is nearby and places it in the stomach
   */
  act() {
    console.log("eating: "+this.turnsEating);
    if(this.turnsEating == 0){
      console.log("try to eat");
      let target = this.place.getClosestBee(0);
      if(target) {
        console.log(this + ' eats '+target+'!');
        this.place.removeBee(target);
        this.stomach.addBee(target);
        this.turnsEating = 1;
      }
    } else {
      if(this.turnsEating > 3){
        this.stomach.removeBee(this.stomach.getBees()[0]);
        this.turnsEating = 0;
      } 
      else 
        this.turnsEating++;
    }
  }  
  /**
   * This function subtracts the EaterAnt's armor.
   * 
   * Releases bee out of the stomach after a certain amount of turns or dies
   * 
   * @param amount armor to be subtracted
   * @returns true if the Eater's armor < 0, otherwise false
   */
  reduceArmor(amount:number):boolean {
    this.armor -= amount;
    console.log('armor reduced to: '+this.armor);
    if(this.armor > 0){
      if(this.turnsEating == 1){
        let eaten = this.stomach.getBees()[0];
        this.stomach.removeBee(eaten);
        this.place.addBee(eaten);
        console.log(this + ' coughs up '+eaten+'!');
        this.turnsEating = 3;
      }
    }
    else if(this.armor <= 0){
      if(this.turnsEating > 0 && this.turnsEating <= 2){
        let eaten = this.stomach.getBees()[0];
        this.stomach.removeBee(eaten);
        this.place.addBee(eaten);
        console.log(this + ' coughs up '+eaten+'!');
      }
      return super.reduceArmor(amount);
    }
    return false;
  }
}


export class ScubaAnt extends Ant {
  readonly name:string = "Scuba";
  private damage:number = 1;
  /**
   * The ScubaAnt has 1 armor and 5 food cost.
   */
  constructor() {
    super(1,5)
  }
  /**
   * This function provides actions for the ScubaAnt.
   * 
   * If the boost is used, apply status/do extend range damage to the Bee
   */
  act() {
    if(this.boost !== 'BugSpray'){
      let target;
      if(this.boost === 'FlyingLeaf')
        target = this.place.getClosestBee(5);
      else
        target = this.place.getClosestBee(3);

      if(target){
        console.log(this + ' throws a leaf at '+target);
        target.reduceArmor(this.damage);
    
        if(this.boost === 'StickyLeaf'){
          target.setStatus('stuck');
          console.log(target + ' is stuck!');
        }
        if(this.boost === 'IcyLeaf') {
          target.setStatus('cold');
          console.log(target + ' is cold!');
        }
        this.boost = undefined;
      }
    }
    else {
      console.log(this + ' sprays bug repellant everywhere!');
      let target = this.place.getClosestBee(0);
      while(target){
        target.reduceArmor(10);
        target = this.place.getClosestBee(0);
      }
      this.reduceArmor(10);
    }
  }
}


export class GuardAnt extends Ant {
  readonly name:string = "Guard";
  /**
   * The GuardAnt has 2 armor and 4 food cost.
   */
  constructor() {
    super(2,4)
  }
  /**
   * This function places the GuardAnt.
   * @returns place of the GuardAnt
   */
  getGuarded():Ant {
    return this.place.getGuardedAnt();
  }
  /**
   * This function provides no action for the GuardAnt
   */
  act() {}
}
