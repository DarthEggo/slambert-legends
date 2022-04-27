"use strict" 

var tileData = {
  grass: {color: "#00bb0f", speed: 1, texture: "assets/graphics/tiles/grassland.png"},
  water: {color: "#4bb6ef", speed: 128, texture: "assets/graphics/tiles/water.png"},
  deepWater: {color: "#0055aa", speed: 128},
  mountain: {color: "#999999", speed: 4},
  beach: {color: "#f2d16b", speed: 1},
  forest: {color: "#008807", speed: 2},
};

var unitData = {
  Swordsman: "#d5544f",
  Archer: "#d5555f",
  Slambert: "#ffffff",
	Worker: "#964B00"
};

var trainData = {
  //Unit Data
  Swordsman: {id: "Swordsman", health: 5, damage: 20, faction: "roman", defense: 0.9, speed: 5, range: 1},
	Worker: {id: "Worker", health: 5, damage: 1, faction: "roman", defense: 0.1, speed: 5, range: 1, constTime: 2 },
};

var buildingData = {
  romanCapital: "#bb0000",
  vikingCapital: "00001100",
  persianCapital: "#5A1073",
  chineseCapital: "#ffb200",
	swordsmanBarracks: "#d5544f",

};

var factionData = {
  roman: "grass",
  viking: "beach",
  persian: "mountain",
  chinese: "grass"
};

var Cities = {
  smallRome: [["sB"]],
};

function generateCity(prefab, sx, sy) {
	let size = prefab.length;
	for(let x = 0; x < size; x++) {
		for(let y = 0; y < size; y++) {
			let tile = tileMap[sy + y][sx + x];
			if(prefab[y][x] !== "/")  {
				if(prefab[y][x] == "sB") {
					console.log("yes");
					tile.building = new Barracks("swordsmanBarracks", Game.Selected.x, Game.Selected.y, 0, 3, "yes", 3,"Swordsman");
				}
			}
			
		}
	}
}
