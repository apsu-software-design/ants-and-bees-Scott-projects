"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.GuardAnt = exports.ScubaAnt = exports.EaterAnt = exports.ThrowerAnt = exports.GrowerAnt = exports.Ant = exports.Bee = exports.Insect = void 0;
var game_1 = require("./game");
var Insect = /** @class */ (function () {
    /**
     * This abstract constructor provides the definition for all clases that extend from Insect class
     * @param armor Insect's armor
     * @param place place of the Insect
     */
    function Insect(armor, place) {
        this.armor = armor;
        this.place = place;
    }
    /**
     * This function gets the name of the Insect.
     * @returns string of the Insect name
     */
    Insect.prototype.getName = function () { return this.name; };
    /**
     * This function gets the armor of the Insect.
     * @returns number of the armor
     */
    Insect.prototype.getArmor = function () { return this.armor; };
    /**
     * This function gets the place of the Insect.
     * @returns the place of the Insect
     */
    Insect.prototype.getPlace = function () { return this.place; };
    /**
     * This function sets the given place.
     * @param place place to be set
     */
    Insect.prototype.setPlace = function (place) { this.place = place; };
    /**
     * This function subtracts the Insect's armor given the amount.
     *
     * Removes Insect if armor < 0
     * @param amount amount to be subtracted
     * @returns true if armor < 0, otherwise false
     */
    Insect.prototype.reduceArmor = function (amount) {
        this.armor -= amount;
        if (this.armor <= 0) {
            console.log(this.toString() + ' ran out of armor and expired');
            this.place.removeInsect(this);
            return true;
        }
        return false;
    };
    /**
     * This function displays the Insect name and the place.
     * @returns string of Insect name and the placement
     */
    Insect.prototype.toString = function () {
        return this.name + '(' + (this.place ? this.place.name : '') + ')';
    };
    return Insect;
}());
exports.Insect = Insect;
var Bee = /** @class */ (function (_super) {
    __extends(Bee, _super);
    /**
     * The Bee has 3 armor and deals 1 damage by default.
     * @param armor armor of a Bee
     * @param damage damage dealt by a Bee
     * @param place place of a Bee
     */
    function Bee(armor, damage, place) {
        var _this = _super.call(this, armor, place) || this;
        _this.damage = damage;
        _this.name = 'Bee';
        return _this;
    }
    /**
     * This function provides an attack for a Bee.
     * @param ant Ant object to attack
     * @returns Ant's armor
     */
    Bee.prototype.sting = function (ant) {
        console.log(this + ' stings ' + ant + '!');
        return ant.reduceArmor(this.damage);
    };
    /**
     * This function checks if the Ant occupies a space where the Bee
     * is trying to move to.
     * @returns true if the Ant is in front of a Bee, otherwise false
     */
    Bee.prototype.isBlocked = function () {
        return this.place.getAnt() !== undefined;
    };
    /**
     * This function sets the status of the Bee.
     * @param status status of the Bee
     */
    Bee.prototype.setStatus = function (status) { this.status = status; };
    /**
     * This function provides actions for the Bee.
     *
     * If the Bee is blocked and does not have a status, it stings the Ant.
     *
     * Otherwise, Bee will move forward if armor > 0 and is not stuck.
     */
    Bee.prototype.act = function () {
        if (this.isBlocked()) {
            if (this.status !== 'cold') {
                this.sting(this.place.getAnt());
            }
        }
        else if (this.armor > 0) {
            if (this.status !== 'stuck') {
                this.place.exitBee(this);
            }
        }
        this.status = undefined;
    };
    return Bee;
}(Insect));
exports.Bee = Bee;
var Ant = /** @class */ (function (_super) {
    __extends(Ant, _super);
    /**
     * This abstract constructor provides the defintion for all classes that extend from the Ant class.
     * @param armor Ant's armor
     * @param foodCost cost of the food of an Ant
     * @param place place of the Ant
     */
    function Ant(armor, foodCost, place) {
        if (foodCost === void 0) { foodCost = 0; }
        var _this = _super.call(this, armor, place) || this;
        _this.foodCost = foodCost;
        return _this;
    }
    /**
     * This function gets the food cost of an Ant.
     * @returns the food cost
     */
    Ant.prototype.getFoodCost = function () { return this.foodCost; };
    /**
     * This function sets the boost and prints out a message.
     * @param boost name of the boost
     */
    Ant.prototype.setBoost = function (boost) {
        this.boost = boost;
        console.log(this.toString() + ' is given a ' + boost);
    };
    return Ant;
}(Insect));
exports.Ant = Ant;
var GrowerAnt = /** @class */ (function (_super) {
    __extends(GrowerAnt, _super);
    /**
     * The GrowerAnt has 1 armor and 1 food cost.
     */
    function GrowerAnt() {
        var _this = _super.call(this, 1, 1) || this;
        _this.name = "Grower";
        return _this;
    }
    /**
     * This function provides actions for the GrowerAnt.
     *
     * Adds boosts and increases food depending on the random
     * number generated
     *
     * @param colony AntColony object to provide these actions to
     */
    GrowerAnt.prototype.act = function (colony) {
        var roll = Math.random();
        if (roll < 0.6) {
            colony.increaseFood(1);
        }
        else if (roll < 0.7) {
            colony.addBoost('FlyingLeaf');
        }
        else if (roll < 0.8) {
            colony.addBoost('StickyLeaf');
        }
        else if (roll < 0.9) {
            colony.addBoost('IcyLeaf');
        }
        else if (roll < 0.95) {
            colony.addBoost('BugSpray');
        }
    };
    return GrowerAnt;
}(Ant));
exports.GrowerAnt = GrowerAnt;
var ThrowerAnt = /** @class */ (function (_super) {
    __extends(ThrowerAnt, _super);
    /**
     * The ThrowerAnt has 1 armor and 4 food cost.
     */
    function ThrowerAnt() {
        var _this = _super.call(this, 1, 4) || this;
        _this.name = "Thrower";
        _this.damage = 1;
        return _this;
    }
    /**
     * This function provides actions for the ThrowerAnt.
     *
     * If the boost is used, apply status/do extend range damage to the bee
     *
     */
    ThrowerAnt.prototype.act = function () {
        if (this.boost !== 'BugSpray') {
            var target = void 0;
            if (this.boost === 'FlyingLeaf')
                target = this.place.getClosestBee(5);
            else
                target = this.place.getClosestBee(3);
            if (target) {
                console.log(this + ' throws a leaf at ' + target);
                target.reduceArmor(this.damage);
                if (this.boost === 'StickyLeaf') {
                    target.setStatus('stuck');
                    console.log(target + ' is stuck!');
                }
                if (this.boost === 'IcyLeaf') {
                    target.setStatus('cold');
                    console.log(target + ' is cold!');
                }
                this.boost = undefined;
            }
        }
        else {
            console.log(this + ' sprays bug repellant everywhere!');
            var target = this.place.getClosestBee(0);
            while (target) {
                target.reduceArmor(10);
                target = this.place.getClosestBee(0);
            }
            this.reduceArmor(10);
        }
    };
    return ThrowerAnt;
}(Ant));
exports.ThrowerAnt = ThrowerAnt;
var EaterAnt = /** @class */ (function (_super) {
    __extends(EaterAnt, _super);
    /**
     * The EaterAnt has 2 armor and 4 food cost.
     */
    function EaterAnt() {
        var _this = _super.call(this, 2, 4) || this;
        _this.name = "Eater";
        _this.turnsEating = 0;
        _this.stomach = new game_1.Place('stomach');
        return _this;
    }
    /**
     * This function checks if the EaterAnt is full.
     * @returns true if Bees is more than 0 in stomach
     */
    EaterAnt.prototype.isFull = function () {
        return this.stomach.getBees().length > 0;
    };
    /**
     * This function provides actions for EaterAnt.
    
     * Eats a Bee that is nearby and places it in the stomach
     */
    EaterAnt.prototype.act = function () {
        console.log("eating: " + this.turnsEating);
        if (this.turnsEating == 0) {
            console.log("try to eat");
            var target = this.place.getClosestBee(0);
            if (target) {
                console.log(this + ' eats ' + target + '!');
                this.place.removeBee(target);
                this.stomach.addBee(target);
                this.turnsEating = 1;
            }
        }
        else {
            if (this.turnsEating > 3) {
                this.stomach.removeBee(this.stomach.getBees()[0]);
                this.turnsEating = 0;
            }
            else
                this.turnsEating++;
        }
    };
    /**
     * This function subtracts the EaterAnt's armor.
     *
     * Releases bee out of the stomach after a certain amount of turns or dies
     *
     * @param amount armor to be subtracted
     * @returns true if the Eater's armor < 0, otherwise false
     */
    EaterAnt.prototype.reduceArmor = function (amount) {
        this.armor -= amount;
        console.log('armor reduced to: ' + this.armor);
        if (this.armor > 0) {
            if (this.turnsEating == 1) {
                var eaten = this.stomach.getBees()[0];
                this.stomach.removeBee(eaten);
                this.place.addBee(eaten);
                console.log(this + ' coughs up ' + eaten + '!');
                this.turnsEating = 3;
            }
        }
        else if (this.armor <= 0) {
            if (this.turnsEating > 0 && this.turnsEating <= 2) {
                var eaten = this.stomach.getBees()[0];
                this.stomach.removeBee(eaten);
                this.place.addBee(eaten);
                console.log(this + ' coughs up ' + eaten + '!');
            }
            return _super.prototype.reduceArmor.call(this, amount);
        }
        return false;
    };
    return EaterAnt;
}(Ant));
exports.EaterAnt = EaterAnt;
var ScubaAnt = /** @class */ (function (_super) {
    __extends(ScubaAnt, _super);
    /**
     * The ScubaAnt has 1 armor and 5 food cost.
     */
    function ScubaAnt() {
        var _this = _super.call(this, 1, 5) || this;
        _this.name = "Scuba";
        _this.damage = 1;
        return _this;
    }
    /**
     * This function provides actions for the ScubaAnt.
     *
     * If the boost is used, apply status/do extend range damage to the Bee
     */
    ScubaAnt.prototype.act = function () {
        if (this.boost !== 'BugSpray') {
            var target = void 0;
            if (this.boost === 'FlyingLeaf')
                target = this.place.getClosestBee(5);
            else
                target = this.place.getClosestBee(3);
            if (target) {
                console.log(this + ' throws a leaf at ' + target);
                target.reduceArmor(this.damage);
                if (this.boost === 'StickyLeaf') {
                    target.setStatus('stuck');
                    console.log(target + ' is stuck!');
                }
                if (this.boost === 'IcyLeaf') {
                    target.setStatus('cold');
                    console.log(target + ' is cold!');
                }
                this.boost = undefined;
            }
        }
        else {
            console.log(this + ' sprays bug repellant everywhere!');
            var target = this.place.getClosestBee(0);
            while (target) {
                target.reduceArmor(10);
                target = this.place.getClosestBee(0);
            }
            this.reduceArmor(10);
        }
    };
    return ScubaAnt;
}(Ant));
exports.ScubaAnt = ScubaAnt;
var GuardAnt = /** @class */ (function (_super) {
    __extends(GuardAnt, _super);
    /**
     * The GuardAnt has 2 armor and 4 food cost.
     */
    function GuardAnt() {
        var _this = _super.call(this, 2, 4) || this;
        _this.name = "Guard";
        return _this;
    }
    /**
     * This function places the GuardAnt.
     * @returns place of the GuardAnt
     */
    GuardAnt.prototype.getGuarded = function () {
        return this.place.getGuardedAnt();
    };
    /**
     * This function provides no action for the GuardAnt
     */
    GuardAnt.prototype.act = function () { };
    return GuardAnt;
}(Ant));
exports.GuardAnt = GuardAnt;
