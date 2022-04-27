class Unit {
  constructor(id, health, damage, faction, defense, speed, x, y, range) {
    this._id = id;
    this._health = health;
    this._damage = damage;
    this._faction = faction;
    this._defense = defense;
    this._speed = speed;
    this._maxSpeed = speed;
    this._x = x;
    this._y = y;
    this._path = [];
    this._range = range;
  }

  get id() {
    return this._id;
  }
  get health() {
    return this._health;
  }
  get damage() {
    return this._damage;
  }
  get faction() {
    return this._faction;
  }
  get defense() {
    return this._defense;
  }
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get speed() {
    return this._speed;
  }
  get path() {
    return this._path;
  }
  get range() {
    return this._range;
  }
  set path(p) {
    this._path = p;
  }

  attacked(dam) { 
    var damReduct = 1 - this._defense;
    this._health -= dam * damReduct;
		console.log("dam reduct" + dam * damReduct);
    
    if(this._health <= 0) {
      killUnit(this);
      console.log("killed");
    }
  }
  
  turn() {
   this._speed = this._maxSpeed;
  }

  calculatePathing(dx, dy, s, range) {
    var x = clamp(dx, 0, worldWidth - 1);
    var y = clamp(dy, 0, worldHeight - 1);
    if(s > 0) {
        var c = tileMap[y][x].path;
        if(s > c) {
        tileMap[y][x].path = s;
      }
      c = tileMap[y][x].path;
      if(y < worldHeight - 1) {
        var u = tileMap[y + 1][x];
        if(c > u.path && y < worldHeight) {
          this.calculatePathing(x, y + 1, s - tileData[tileMap[y + 1][x].terrain].speed, range);
        }
      }
      if(y > 0) {
        var b = tileMap[y - 1][x];
        if(c > b.path && y > 0) {
          this.calculatePathing(x, y - 1, s - tileData[tileMap[y - 1][x].terrain].speed, range)
        }
      }
      if(x < worldWidth - 1) {
        var r = tileMap[y][x + 1];
        if(c > r.path && x < worldWidth) {
          this.calculatePathing(x + 1, y, s - tileData[tileMap[y][x + 1].terrain].speed, range);
        }
      }
      if(x > 0) {
        var l = tileMap[y][x - 1];
        if(c > l.path && x > 0) {
          this.calculatePathing(x - 1, y, s - tileData[tileMap[y][x - 1].terrain].speed, range)
        }
      }
    } else if(range > 0) {

    }
  }  

  calculatePathingSegment(x, y, ammount, c) {
    if(y < worldHeight - 1) {
      var u = tileMap[y + 1][x];
      if(c > u.path && y < worldHeight) {
        this.calculatePathing(x, y + 1, s - tileData[tileMap[y + 1][x].terrain].speed, range);
      }
    }
    if(y > 0) {
      var b = tileMap[y - 1][x];
      if(c > b.path && y > 0) {
        this.calculatePathing(x, y - 1, s - tileData[tileMap[y - 1][x].terrain].speed, range)
      }
    }
    if(x < worldWidth - 1) {
      var r = tileMap[y][x + 1];
      if(c > r.path && x < worldWidth) {
        this.calculatePathing(x + 1, y, s - tileData[tileMap[y][x + 1].terrain].speed, range);
      }
    }
    if(x > 0) {
      var l = tileMap[y][x - 1];
      if(c > l.path && x > 0) {
        this.calculatePathing(x - 1, y, s - tileData[tileMap[y][x - 1].terrain].speed, range)
      }
    }
  }

  move(x, y, speed) {
    if(tileMap[y][x].unit != 'empty' && tileMap[y][x].unit.faction != this._faction) {
      var enemy = tileMap[y][x].unit;
      enemy.attacked(this._damage);
      this.attacked(enemy._damage); 
      if(enemy.health <= 0) {
        var prevX = this._x;
        var prevY = this._y;
        console.log(x.toString() + ", " + y.toString());
        var unit;
        tileMap[y][x].unit = this;
        var newUnit = tileMap[y][x].unit;
        tileMap[prevY][prevX].unit = "empty";
        newUnit._x = x;
        newUnit._y = y;
        newUnit._speed = 0;
      }

    } else if(tileMap[y][x].building != "empty") {
      console.log("building there");
    } else if(tileMap[y][x].unit == 'empty') {
    var prevX = this._x;
    var prevY = this._y;
    console.log(x.toString() + ", " + y.toString());
    var unit;
    tileMap[y][x].unit = this;
    var newUnit = tileMap[y][x].unit;
    tileMap[prevY][prevX].unit = "empty";
    newUnit._x = x;
    newUnit._y = y;
    newUnit._speed = speed;
    }
    
    else {
      console.log("friendly unit");
    }
  }
}

class Hero extends Unit {
  constructor(id, health, damage, faction, defense, speed, x, y, range) {
    super(id, health, damage, faction, defense, speed, x, y, range);
  }
}

class Ranged extends Unit {
  constructor(id, health, damage, faction, defense, speed, x, y, range, acc, projAmount) {
    super(id, health, damage, faction, defense, speed, x, y, range);
    this._acc = acc;
    this._projAmount = projAmount;
    
    
  }
  get acc() {
    return this._acc;
  }
  get projAmount() {
    return this_.projAmount;
  }
 
  rangedAttack(enemy) {
      for(let i = 0; i < projAmount; i++) {
        let hitChance = health - this._health + acc;
        console.log(hitChance);
        let hit = weight(hitChance);
        if(hit) {
          enemy.attacked(damage);
        }
      }
    }
} 

class Worker extends Unit {
	constructor(id, health, damage, faction, defense, speed, x, y, range, constTime) {
		super(id, health, damage, faction, defense, speed, x, y, range);
		this._constTime = constTime;
		
	}
}

class Building {
  constructor(id, x, y, health, buildTime, faction) {
    this._id = id;
    this._x = x;
    this._y = y;
    this._health = health;
    this._faction = faction;
    if(this._faction == "roman") {
      this._buildTime = Math.ceil(buildTime / 2);
      
    }
    else {
      this._buildTime = buildTime;
    }
    this._buildProgress = 0;
  }

  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get health() {
    return this._health;
  }
  get id() {
    return this._id
  }
  get faction() {
    return this._faction;
  }
	get buildTime() {
		return this._buildTime;
	}
	get buildProgress() {
		return this._buildProgress;
	}
  damage(dam){
    this._health -= dam;
  }
  turn(){
    if(this._buildProgress != this._buildTime) {
      this._buildProgress++;
    }
			if(this._unitTraining) {
				this._trainProgress++;
				if(this._trainTime == this._trainProgress) {
					this._trainProgess = 0;
					this.trainUnit(this._unit);
				}
			}
  }
}

class Barracks extends Building {
  constructor(id, x, y, health, buildTime, faction, trainTime,unit) {
  super(id,x,y,health,faction);
  if(this._faction == "roman") {
      this._buildTime = Math.ceil(buildTime / 2);
    }
    else {
      this._buildTime = buildTime;
    }
    this._buildProgress = 0;
    this._trainTime = trainTime;
    this._trainProgress = 0;
    this._unitTraining = false;
    this._unit = unit;
  }
   trainUnit(unit) {
    if(this._unitTraining) {
      this._unitTraining = false;
      this._trainProgress = 0;
      var tile = tileMap[this._y + 1][this._x + 1];
			if(tile.unit != "empty" || (tile.terrain == "water" || tile.terrain == "water")) {
					tile = tileMap[this._y + 1][this._x];
					if(tile.unit != "empty" || (tile.terrain == "water" || tile.terrain == "water")) {
						tile = tileMap[this._y + 1][this._x - 1];
						if(tile.unit != "empty" || (tile.terrain == "water" || tile.terrain == "water")) {
								tile = tileMap[this._y][this._x - 1];
								if(tile.unit != "empty" || (tile.terrain == "water" || tile.terrain == "water")) {
								tile = tileMap[this._y - 1][this._x - 1];
										if(tile.unit != "empty" || (tile.terrain == "water" || tile.terrain == "water")) {
									tile = tileMap[this._y - 1][this._x];
												if(tile.unit != "empty" || (tile.terrain == "water" || tile.terrain == "water")) {
									tile = tileMap[this._y - 1][this._x];
													if(tile.unit != "empty" || (tile.terrain == "water" || tile.terrain == "water")) {
														tile = tileMap[this._y - 1][this._x + 1];
														if(tile.unit != "empty" || (tile.terrain == "water" || tile.terrain == "water")) {
									tile = tileMap[this._y][this._x + 1];
															if(tile.unit != "empty" || (tile.terrain == "water" || tile.terrain == "water")) {
									console.log("no open tiles");
											}
										}
									}
								}			
							}
						}
					}	
				}
			}
        tile.unit = new Unit(trainData[unit].id, trainData[unit].health, trainData[unit].damage, trainData[unit].faction, trainData[unit].defense, trainData[unit].speed, tile.x,tile.y, trainData[unit].range);
        unitArray.push(tile.unit);
    } else {
      this._unitTraining = true; 
    }
  }

}
  
 
