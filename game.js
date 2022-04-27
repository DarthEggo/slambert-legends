"use strict"

var canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const WIDTH = canvas.width;

const HEIGHT = canvas.height;

console.log(WIDTH + ", " + HEIGHT);

var TILE = 96;
var TILE_SPACE = 1;
var zoom = 1;

var firstland;

//Arrays to store data in
var unitArray = [];
var buildingArray = [];

//generate world here:

var worldWidth = 200;
var worldHeight = 200;

var homeGenerated = false;

var perlinSize = 0.1;
var lakeSeed = 972;
var mountainSeed = -485;
var islandSeed = 420;
var terrainSize = 0.2;

var gameStarted = false;

var turnNum = 1;
var turnClicked = false;

var buildMode = false;

var tileMap = [];

var unitSelected = false;
var selectedUnit;

var playerFaction = "chinese";

//Game
var Game = {};
Game.camX = 0;
Game.camY = 0;
Game.Keys = {};
Game.Mouse = {};
Game.Mouse.Buttons = {}
Game.Selected = {
};
Game.camSpeed = 2;

function worldGenerate() {
  console.log(playerFaction);
  var bx;
  var by;
  loading++;
  perlin.seed();  
  var heroPlaced = 0;
  var buildingPlaced = 0;
  for(var y = clamp(0, Game.camY - TILE, HEIGHT + TILE); y < HEIGHT + TILE; y += 1) {
    var row = [];
    for(var x = 0; x < worldWidth; x += 1) {
      var terrain = perlin.get(x * perlinSize * terrainSize, y * perlinSize * terrainSize) / 2 + 0.5;
      var lake = perlin.get(x * perlinSize  + lakeSeed, y * perlinSize + lakeSeed) / 2 + 0.5;
      var mountain = perlin.get(x * perlinSize + mountainSeed, y * perlinSize + mountainSeed) / 2 + 0.5;
      var msep = perlin.get(x * perlinSize * 4, y * perlinSize * 4);
      var island = perlin.get(x * perlinSize + islandSeed, y * perlinSize + islandSeed) / 2 + 0.5;
      lake = (lake + terrain * 4) / 5;
      var forest = perlin.get(x * perlinSize, y * perlinSize) / 2 + 0.5;
      mountain = (mountain + (1 - terrain) * 4) / 5;
      mountain = (mountain * 4 + msep) / 5;
      var t;
      var p = {};
      p.building = "empty";
      p.unit = "empty";
      if(lake < 0.5) {
        if(lake < 0.35) {
          if(island < 0.4) {
            t = ("forest");
          } else if(island > 0.6) {
            t = ("mountain");
          } else {
            t = ("beach");
          }
        } else if(lake < 0.4) { 
          t = ("deepWater");
        } else if(lake < 0.48) {
          t = ("water");
        } else {
          t = ("beach");
        }
        
      } 
        else if(forest < 0.35) {
        t = ("forest");
      } else if(mountain < 0.28) {
        t= ("mountain");
      } else {
        t = ("grass");
      }
      p.terrain = (t);
      if(x + y > 10 && Math.abs(x - y) < 5 && p.terrain == factionData[playerFaction] && heroPlaced == 0) {
        p.unit = new Hero("Slambert", 250, 15, "chinese", 0.3, 10, x, y, 1, 1);
        unitArray.push(p.unit);
        bx = x + 1;
        by = y + 1;
        heroPlaced = 1;
        Game.Selected.x = x;
        Game.Selected.y = y;
        Game.camX = x * TILE - WIDTH / 2;
        Game.camY = y * TILE - HEIGHT / 2;
        console.log(p.unit);
      } else {
        p.unit = ("empty");
        if(x + y > 10 && Math.abs(x - y) < 5 && p.terrain == factionData[playerFaction] && buildingPlaced == 0) {
          p.building = new Barracks(playerFaction + "Capital", x, y, 0, 0, playerFaction,3,"Worker");
	//				generateCity(Cities["smallRome"], x + 1, y);
          buildingArray.push(p.building);
          buildingPlaced = 1;
        }
      }
      p.x = x;
      p.y = y;
      p.path = 0;
      p.attackField = 0;
      row.push(p);
    }
    tileMap.push(row);
  }
  loading--;
}




//Ultlities 
function rng(max) {
  return Math.floor(Math.random() * max);
}

function clamp(value, min, max) {
  var res = value;
  if(res > max) {
    res = max;
  } 
  if(res < min) {
    res = min;
  }
  return res;
}

function weight(percent) {
  var res = rng(100);
  if(percent >= res) {
    return true;
  } else {
    return false;
  } 
}

function killUnit(unit) {
  var selfTile = tileMap[unit.y][unit.x];
  selfTile.unit = 'empty';
}


function renderTiles() {
  var sx = Math.floor(Game.camX / TILE) * TILE;
  var sy = Math.floor(Game.camY / TILE) * TILE;
  ctx.save();
  ctx.scale(zoom, zoom);
  var mouseRect = [];
  ctx.strokeStyle = "#bbbbbb";
  ctx.lineWidth = TILE_SPACE * 8;
  var pathQueue = undefined;
  for(var x = sx; x < sx + WIDTH / zoom + TILE; x += TILE) { 
    for(var y = sy; y < sy + HEIGHT / zoom + TILE; y += TILE) {
      var tile = tileMap[Math.floor(y / TILE)][Math.floor(x / TILE)];
      var color = tileData[tile.terrain].color;
      ctx.fillStyle = color; 
      var recX = x - Game.camX + TILE_SPACE;
      var recY = y - Game.camY + TILE_SPACE;
      var recW = TILE - TILE_SPACE * 2;
      var recH = TILE - TILE_SPACE * 2;
      ctx.fillRect(recX, recY, recW, recH);
      if(Game.Mouse.x == clamp(Game.Mouse.x, recX, recX + recW) && Game.Mouse.y == clamp(Game.Mouse.y, recY, recY + recH)) {
        mouseRect.push(recX);
        mouseRect.push(recY);
        mouseRect.push(recW);
        mouseRect.push(recH);
      }
      if(tile.path) {
        ctx.fillStyle = "#f8efaab0";
        //                rrggbbaa
        ctx.fillRect(recX, recY, recW, recH);
        ctx.fillStyle = "#000000";
        ctx.fillText(tile.path, recX, recY + TILE / 2);
      }
      if(!(tile.unit == "empty")) {
        ctx.beginPath();
        ctx.fillStyle = unitData[tile.unit.id];
        ctx.arc(x + (TILE - TILE_SPACE * 2) / 2 - Game.camX, y + (TILE - TILE_SPACE * 2) / 2 - Game.camY, TILE / 3, 0, Math.PI * 2);
        ctx.fill();
        if(tile.unit.path.length > 0) {
          pathQueue = tile.unit.path;
        }
      } else if(tile.building != "empty") {
        ctx.beginPath();
        ctx.fillStyle = buildingData[tile.building.id];
        ctx.fillRect(recX + 10, recY + 10, recW - 20, recH - 20);
      }
    }
  }
  ctx.strokeRect(mouseRect[0], mouseRect[1], mouseRect[2], mouseRect[3]);
  if(Game.Selected.x != null) {
    ctx.strokeRect(Game.Selected.x * TILE - Game.camX, Game.Selected.y * TILE - Game.camY, TILE, TILE);
  }
  if(pathQueue) {
    ctx.beginPath();
    ctx.strokeStyle = "#111111";
    var path = pathQueue;
    for(var i = 0; i < path.length; i++) {
      ctx.lineTo(path[i].x * TILE - Game.camX + TILE / 2, path[i].y * TILE - Game.camY + TILE / 2);
    }
    ctx.stroke();
  }


  
  //RestoreCanvasContext
  ctx.restore();
}
function renderUI() {
		if(unitSelected) {
	console.log("yes");
			let unit = selectedUnit;
			ctx.fillStyle = "gray";
			ctx.fillRect(1000,400, 400, 300);
			//id, health, damage, faction, defense, speed, x, y, range
			ctx.fillStyle = "white";
			ctx.fillText(unit._id, 1200, 450);
			ctx.fillText(unit._faction, 1200, 500);
			ctx.fillText("Health: " + unit._health, 1200, 550);
			ctx.fillText("Speed: " + unit._speed + "/" + unit._maxSpeed, 1200, 600);
		}
	  ctx.fillStyle = "black";
		ctx.fillText(`Turn: ${turnNum}`, 25, 25);
}


function render() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  renderTiles();
  ctx.fillStyle = "black";
  renderUI();
  
}

function turn() {
  turnNum++;
  for(let i = 0; i < unitArray.length; i++) {
    var currentUnit = unitArray[i];
    currentUnit.turn();
  }
  for(let i = 0; i < buildingArray.length; i++) {
    var currentBuilding = buildingArray[i];
    currentBuilding.turn();
    
  }
  turnClicked = true;
}

function updateCamera() {
  if (Game.Keys['w']) Game.camY -= 8 / zoom;
  if (Game.Keys['s']) Game.camY += 8 / zoom;
  if (Game.Keys['a']) Game.camX -= 8 / zoom;
  if (Game.Keys['d']) Game.camX += 8 / zoom;
  if (Game.Keys['q']) zoom += 0.03;
  if (Game.Keys['e']) zoom -= 0.03;
  zoom = clamp(zoom, 0.1, 4);
  Game.camX = clamp(Game.camX, 0, worldWidth * TILE - WIDTH / zoom - TILE);
  Game.camY = clamp(Game.camY, 0, worldHeight * TILE - HEIGHT / zoom);
}

function updateTiles() {
  var sx = Math.floor(Game.camX / TILE) * TILE;
  var sy = Math.floor(Game.camY / TILE) * TILE;
	
  var mouseRect = [];
  if(Game.Mouse.click) {
    for(var x = 0; x < worldWidth * TILE; x += TILE) { 
      for(var y = 0; y < worldHeight * TILE; y += TILE) {
        tileMap[Math.floor(y / TILE)][Math.floor(x / TILE)].path = 0;
        if(tileMap[Math.floor(y / TILE)][Math.floor(x / TILE)].unit != 'empty') {
          tileMap[Math.floor(y / TILE)][Math.floor(x / TILE)].unit.path = [];
					unitSelected = true;
        }
				else {
					unitSelected = false;
				}
				selectedUnit = tileMap[Math.floor(y / TILE)][Math.floor(x / TILE)].unit;
      }
    }
  }
  for(var x = 0; x < worldWidth * TILE; x += TILE) { 
    for(var y = 0; y < worldHeight * TILE; y += TILE) {
			if(Game.Keys['t']) {
				tileMap[Game.Selected.y][Game.Selected.x].building.trainUnit(tileMap[Game.Selected.y][Game.Selected.x].building.unit);
				Game.Keys['t'] = false;
			}
			
			
			
			
      var tile = tileMap[Math.floor(y / TILE)][Math.floor(x / TILE)];
      var recX = x - Game.camX + TILE_SPACE;
      var recY = y - Game.camY + TILE_SPACE;
      var recW = TILE - TILE_SPACE * 2;
      var recH = TILE - TILE_SPACE * 2;
      if(Game.Selected.x === null) {
        tile.path = 0;
      }
      if(Game.Mouse.x == clamp(Game.Mouse.x, recX, recX + recW) && Game.Mouse.y == clamp(Game.Mouse.y, recY, recY + recH)) {
        if(Game.Mouse.click == true) {
					if(buildMode && tile.unit != "empty") {
							tileMap[Game.Selected.y][Game.Selected.x].building = new Barracks("swordsmanBarracks", Game.Selected.x, Game.Selected.y, 0, 3, "yes", 3,"Swordsman");
							buildingArray.push(tileMap[Game.Selected.y][Game.Selected.x].building);
				}
					var prevX = Game.Selected.x;
					var prevY = Game.Selected.y;
          Game.Selected.x = tile.x;
          Game.Selected.y = tile.y;
					
          if(tile.unit != "empty") {
            tile.unit.calculatePathing(tile.x, tile.y, tile.unit.speed);
          }
        }
        if(Game.Selected.x != null) {

          if(tileMap[Game.Selected.y][Game.Selected.x].unit != "empty") {
            if(tile.path) {
              tileMap[Game.Selected.y][Game.Selected.x].unit.path = [];
              var reached = false;
              var tx = tile.x;
              var ty = tile.y;
              var checks = 50;
              var unit = tileMap[Game.Selected.y][Game.Selected.x].unit;
              if (Game.Keys['r'] && (Game.Selected.x != tile.x || Game.Selected.y != tile.y) && tileMap[tile.y][tile.x].unit != "empty") {
                tileMap[Game.Selected.y][Game.Selected.x].rangedAttack(tileMap[tile.y][tile.x]);
                tileMap[Game.Selected.y][Game.Selected.y].speed = 0;
              }
						
              if (Game.Keys['z'] && (Game.Selected.x != tile.x || Game.Selected.y != tile.y)) {
                unit.move(tile.x, tile.y, tile.path);
                Game.Selected.x = null;
                Game.Selected.y = null;
                unit.path = [];
              } else while(!reached && checks) {
                checks--;
                var largest = tile.path;
                var largestX = tile.x;
                var largestY = tile.y;
                var increase = false;
                if(ty < worldHeight - 1) {
                  if(largest < tileMap[ty + 1][tx].path) {
                    largest = tileMap[ty + 1][tx].path;
                    largestX = tx;
                    largestY = ty + 1;
                    increase = true;
                  }
                }
                
                if(ty > 0) {
                  if(largest < tileMap[ty - 1][tx].path) {
                    largest = tileMap[ty - 1][tx].path;
                    largestX = tx;
                    largestY = ty - 1;
                    increase = true;
                  }
                }
                if(tx < worldWidth - 1) {
                  if(largest < tileMap[ty][tx + 1].path) {
                    largest = tileMap[ty][tx + 1].path;
                    largestX = tx + 1;
                    largestY = ty;
                    increase = true;
                  }
                }
                
                if(tx > 0) {
                  if(largest < tileMap[ty][tx - 1].path) {
                    largest = tileMap[ty][tx - 1].path;
                    largestX = tx - 1;
                    largestY = ty;
                    increase = true;
                  }
                }
                if(increase && !(tx == Game.Selected.x && ty == Game.Selected.y)) {
                  tx = largestX;
                  ty = largestY;
                  var p = {
                    x: tx,
                    y: ty
                  };
                  tileMap[Game.Selected.y][Game.Selected.x].unit.path.unshift(p);
                } else {
                  reached = true;
                }
              }
            }
          }
					if(tile.building != "empty") {
						if(tile.terrain == "water") {
							tile.building = "empty";
						}
					}
        }
      }
      if(Game.Selected.x == tile.x && Game.Selected.y == tile.y) {
        if(tile.unit == "empty") {
          if(Game.Keys['1']) {
            tile.unit = new Unit("Swordsman", 40, 15, "viking", 0.1, 5, tile.x, tile.y, 1,1);
            console.log(tile.unit);
            unitArray.push(tile.unit);

          }
          else if(Game.Keys['2']) {
            tile.unit = new Ranged("Archer", 40, 15, "roman", 0.1, 5, tile.x, tile.y, 1,1,50,5);
            console.log(tile.unit);
            unitArray.push(tile.unit);
          }
        }
      }
    }
  }
}

function update() {
	if(Game.Keys['b']) {
		Game.Keys['b'] = false;
		if(buildMode) {
			console.log("buildmode no");
			buildMode = false;
		}
		else {
			console.log("buildmode yes");
			buildMode = true
		}
	}
  if(!Game.Keys['x']) turnClicked = false;
  updateCamera();
  updateTiles();
  if(Game.Keys['m']) window.location.reload();
  if(Game.Keys['x'] && !turnClicked) turn();
	if(Game.Keys['g']) generateCity(Cities["smallRome"],10,10);
}

function frame() {
  update();
  render();
  Game.Mouse.click = false;
  requestAnimationFrame(frame);
}

// This handles user input (keys, mouse, etc):

addEventListener("keydown", function(e) {
    Game.Keys[e.key] = true;
  }
);

addEventListener("keyup", function(e) {
    Game.Keys[e.key] = false;
  }
);

addEventListener("mousemove", function(e) {
    Game.Mouse.x = e.offsetX / zoom;
    Game.Mouse.y = e.offsetY / zoom;
  }
);

addEventListener("mousedown", function(e) {
    Game.Mouse.down = true;
    Game.Mouse.click = true;
		Game.Mouse.Buttons[e.button] = true;
  }
);

addEventListener("mouseup", function(e) {
    Game.Mouse.down = false;
		Game.Mouse.Buttons[e.button] = false;
  }
);
