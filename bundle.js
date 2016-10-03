(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = exports = PipeManager

function PipeManager(spritesheet) {
  this.spritesheet = {};
  this.spritesheet.image = spritesheet;
  this.spritesheet.size = 32;
  this.spritesheet.width = 4;
  this.spritesheet.height = 5;

  this.map = {};
  this.map.items = [];
  this.map.width = 16;
  this.map.height = 14;
  this.map.scale = 64;

  this.pipeType = {
    Corner : 5,
    Straight : 7,
    Source: 1
  };

  this.Direction = {
    Up: 0,
    Down: 1,
    Left: 2,
    Right: 3
  };

  this.Direction.inverse = {};
  this.Direction.inverse[this.Direction.Up] = this.Direction.Down;
  this.Direction.inverse[this.Direction.Down] = this.Direction.Up
  this.Direction.inverse[this.Direction.Left] = this.Direction.Right;
  this.Direction.inverse[this.Direction.Right] = this.Direction.Left;

  this.rotationMap = {};
  this.rotationMap[this.pipeType.Corner] = [5, 6, 9, 10];
  this.rotationMap[this.pipeType.Straight] = [7, 11];
  this.rotationMap[this.pipeType.Source] = [1, 3, 4, 12];


  this.attachmentMap = {};
  this.attachmentMap[this.pipeType.Corner] = [
    [this.Direction.Down, this.Direction.Right],
    [this.Direction.Down, this.Direction.Left],
    [this.Direction.Up, this.Direction.Right],
    [this.Direction.Up, this.Direction.Left]
  ];
  this.attachmentMap[this.pipeType.Straight] = [
    [this.Direction.Left, this.Direction.Right],
    [this.Direction.Up, this.Direction.Down]
  ];
  this.attachmentMap[this.pipeType.Source] = [
    [this.Direction.Left],
    [this.Direction.Right],
    [this.Direction.Up],
    [this.Direction.Down]
  ];

  this.sourcePipe = this.placeSource();
  this.exitPipe = this.placeExit(this.sourcePipe);
}

PipeManager.prototype.addPipe = function(location, pipeType){
  if(this.findPipe(location)) return;
  if(location.x == 0 || location.y == 0) return;
  if(location.x == this.map.width - 1) return;
  if(location.y == this.map.height - 1) return;
  this.addPipeUnprotected(location, pipeType);
}

PipeManager.prototype.addPipeUnprotected = function(location, pipeType){
  this.map.items.push({x: location.x, y: location.y, idx: 0, type: pipeType, enabled: true});
}

PipeManager.prototype.rotatePipe = function(location){
  var pipe = this.findPipe(location)
  if(!pipe) return;
  if(!pipe.enabled) return;
  pipe.idx = (pipe.idx + 1) % this.rotationMap[pipe.type].length;
}

PipeManager.prototype.findPipe = function(location){
  return this.map.items.find(function(pipe) {
      return pipe.x == location.x && pipe.y == location.y;
  })
}

PipeManager.prototype.lockPipe = function(location){
  var pipe = this.findPipe(location)
  if(!pipe) return;
  pipe.enabled = false;
}

PipeManager.prototype.convertCoord = function(location){
  return {x: Math.floor(location.x / 64),  y: Math.floor(location.y / 64)};
}

PipeManager.prototype.isCorner = function(location){
  return (
    (location.x == 0 && location.y == 0) ||
    (location.x == 0 && location.y == this.map.height - 1) ||
    (location.x == this.map.width - 1 && location.y == 0) ||
    (location.x == this.map.width - 1 && location.y == this.map.height - 1)
  )
}

PipeManager.prototype.getRandomBoundary = function(){
  var location = {x: 0, y: 0};
  var xOption = [0, this.map.width - 1];
  var yOption = [0, this.map.height -1];

  while(this.isCorner(location)){
    var isXEdge = (Math.random() >= 0.5);
    var cornerIdx = (Math.random() >= 0.5) ? 0 : 1;
    var max = (isXEdge) ? this.map.width : this.map.height;
    var other = Math.floor(Math.random() * max);

    if(isXEdge){
      location.x = xOption[cornerIdx];
      location.y = other;
    } else{
      location.x = other;
      location.y = yOption[cornerIdx];
    }
  }

  return location;
}

PipeManager.prototype.addBoundaryPipe = function(location){
  this.addPipeUnprotected(location, this.pipeType.Source);
  var pipe = this.findPipe(location);
  pipe.idx = this.getSourceOrientationIndex(location);
  return pipe;
}

PipeManager.prototype.placeSource = function(){
  var location = (window.debug) ? {x: 0, y: 6} : this.getRandomBoundary();
  var pipe = this.addBoundaryPipe(location);
  return pipe;
}
PipeManager.prototype.placeExit = function(sourceLocation){
  var location = (window.debug) ? {x: this.map.width - 1, y: 6} : this.getRandomBoundary();
  while(sourceLocation == location){
    location = this.getRandomBoundary();
  }
  var pipe = this.addBoundaryPipe(location);
  return pipe;
}

PipeManager.prototype.getSourceOrientationIndex = function(location){
  if(location.x == 0) return 1;
  if(location.x == this.map.width - 1) return 0;
  if(location.y == 0) return 3;
  if(location.y == this.map.height - 1) return 2;
}

PipeManager.prototype.getConnectedPipe = function(pipe, ignoringPipe){
  var locations = [];
  var ignoringLocation = {x: -1, y:-1};

  if(ignoringPipe !== undefined){
    ignoringLocation.x = ignoringPipe.x;
    ignoringLocation.y = ignoringPipe.y;
  }

  // Up
  if(pipe.y > 0) locations.push({x: pipe.x, y: pipe.y - 1});
  // Down
  if(pipe.y < this.map.height - 1) locations.push({x: pipe.x, y: pipe.y + 1});
  // Left
  if(pipe.x > 0) locations.push({x: pipe.x - 1, y: pipe.y});
  // Right
  if(pipe.x < this.map.width - 1) locations.push({x: pipe.x + 1, y: pipe.y});

  var adjacentPipes = [];

  var self = this;
  locations.forEach(function(location){
    if(location.x == ignoringLocation.x && location.y == ignoringLocation.y){
      return;
    }
    var adjPipe = self.findPipe(location);
    if(adjPipe) adjacentPipes.push(adjPipe);
  });

  var attachedPipe;

  adjacentPipes.forEach(function(adjacentPipe){
    if(self.arePipesAttached(pipe, adjacentPipe)) attachedPipe = adjacentPipe;
  });

  return attachedPipe;
}

PipeManager.prototype.arePipesAttached = function(pipe1, pipe2){

  var cx = pipe1.x - pipe2.x;
  // if cx == 0, then connected UP/Down.
  // if cx < 0 pipe1 is on left, cx > 0 pipe1 is on right
  var cy = pipe1.y - pipe2.y;
  // if cy == 0, then connected Left/right
  // if cy < 0, pipe1 is above, cy > 0 pipe1 is below
  var direction;

  if(cx == 0 && cy == 0){
    console.log("PipeManager.arePipesAttached: pipes are in the same location");
    return;
  }

  if((cx != 0 && cy != 0) || (Math.abs(cx) > 1) || (Math.abs(cy) > 1)){
    console.log("PipeManager.arePipesAttached: pipes are not adjacent.");
    return;
  }

  if(cx == 0){
    if(cy < 0){
      direction = this.Direction.Up;
    }else{
      direction = this.Direction.Down;
    }
  }else{
    if(cx < 0){
      direction = this.Direction.Left;
    }else{
      direction = this.Direction.Right;
    }
  }

  var pipe1Can = this.attachmentMap[pipe1.type][pipe1.idx].indexOf(this.Direction.inverse[direction]) != -1
  var pipe2Can = this.attachmentMap[pipe2.type][pipe2.idx].indexOf(direction) != -1

  return pipe1Can && pipe2Can;
}

PipeManager.prototype.convertToReal = function(pipe){
  return {x: pipe.x * this.map.scale, y: pipe.y * this.map.scale};
}

PipeManager.prototype.update = function(elapsedTime){

}

PipeManager.prototype.render = function(elapsedTime, ctx){
  var self = this;
  this.map.items.forEach(function(item){
    var idx = self.rotationMap[item.type][item.idx];
    var y = Math.floor(idx/self.spritesheet.width);
    var x = idx % self.spritesheet.width;

    ctx.drawImage(
      // Source Image
      self.spritesheet.image,
      // Source Rect
      x * self.spritesheet.size, y * self.spritesheet.size, self.spritesheet.size, self.spritesheet.size,
      // Destination Rect
      item.x * self.map.scale, item.y * self.map.scale, self.map.scale, self.map.scale);
  });
}

},{}],2:[function(require,module,exports){
"use strict";

module.exports = exports = ProgressManager;

// callbackProgress( self, percent complete)
// callbackComplete( self)

function ProgressManager(length, callbackProgress, callbackComplete) {
  this.progressTimer = 0;
  this.progressLength = length;
  this.isProgressing = true;
  this.callbackProgress = callbackProgress;
  this.callbackComplete = callbackComplete;
  this.isActive = false;
}

ProgressManager.prototype.progress = function(time){
  if(!this.isActive) return;
  if(this.isProgressing){
    this.progressTimer += time;
    this.percent = this.progressTimer / this.progressLength;
    if(this.percent > 1){
      this.percent = 1;
      this.isProgressing = false;
      this.callbackComplete(this);
    }
    else {
      this.callbackProgress(this, this.percent);
    }
  }

}

},{}],3:[function(require,module,exports){
"use strict";

module.exports = exports = ResourceManager

function ResourceManager(callback) {
  this.callback = callback;
  this.resourcesToLoad = 0;
  this.images = {};
  this.audio = {};
}

function onLoad(em) {
  em.resourcesToLoad--;
  if(em.resourcesToLoad == 0) em.callback();
}

ResourceManager.prototype.addImage = function(url) {
  if(this.images[url]) return this.images[url];
  this.resourcesToLoad++;
  var self = this;
  this.images[url] = new Image();
  this.images[url].onload = function() {onLoad(self);}
}

ResourceManager.prototype.addAudio = function(url) {
  if(this.audio[url]) return this.audio[url];
  this.resourcesToLoad++;
  var self = this;
  this.audio[url] = new Audio();
  this.audio[url].onloadeddata = function() {onLoad(self);}
}

ResourceManager.prototype.getResource = function(url) {
    if(this.images[url]) return this.images[url];
    if(this.audio[url]) return this.audio[url];
}

ResourceManager.prototype.loadAll = function() {
  var self = this;
  Object.keys(this.images).forEach(function(url){
    self.images[url].src = url;
  });
  Object.keys(this.audio).forEach(function(url){
    self.audio[url].src = url;
  });
}

},{}],4:[function(require,module,exports){
"use strict";

module.exports = exports = WaterManager;

const ProgressManager = require('./ProgressManager.js');

function WaterManager(pipeManager) {
  this.pipeManager = pipeManager;
  this.currentPipe = pipeManager.sourcePipe;

  var origin = pipeManager.convertToReal(this.currentPipe);
  this.currentRect = {x: origin.x, y: origin.y, width: 64, height: 64};
  this.currentRectRender = {x: origin.x, y: origin.y, width: 0, height: 0};

  this.renderRects = [];

  var self = this;
  this.progressManager = new ProgressManager(5000,
    function(pm, percent){
      // progress percent completion
      self.currentRectRender.width = self.currentRect.width * percent;
      self.currentRectRender.height = self.currentRect.height * percent;
      //TODO: Variable animation direction

    },
    function(pm) {
      // progress complete
      self.renderRects.push(self.currentRect);
      // TODO: get next rect to animate and reset
    });

  this.progressManager.isActive = true;
}

WaterManager.prototype.update = function(time){
  this.progressManager.progress(time);
}

WaterManager.prototype.render = function(time, ctx){
  ctx.fillStyle = "blue";
  this.renderRects.forEach(function(rect){
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  });

  ctx.fillRect(this.currentRectRender.x, this.currentRectRender.y, this.currentRectRender.width, this.currentRectRender.height);

}

},{"./ProgressManager.js":2}],5:[function(require,module,exports){
"use strict";

window.debug = true;

/* Classes */
const Game = require('./game');
const ResourceManager = require('./ResourceManager.js');
const PipeManager = require('./PipeManager.js');
const WaterManager = require('./WaterManager.js');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var pipeManager;
var waterManager;
var resourceManager = new ResourceManager(function(){
  // Load game
  pipeManager = new PipeManager(resourceManager.getResource('assets/pipes.png'));
  type = pipeManager.pipeType.Straight;

  waterManager = new WaterManager(pipeManager);

  masterLoop(performance.now());
});

var Mouse = {
  LeftClick: 1,
  RightClick: 3
}

resourceManager.addImage('assets/pipes.png');
resourceManager.loadAll();

var type;

var onclickCallback = function(event) {
  event.preventDefault();
  switch (event.which) {
    case Mouse.LeftClick:
      pipeManager.addPipe(pipeManager.convertCoord(normalizeClick(event)), type);
      break;
    case Mouse.RightClick:
      pipeManager.rotatePipe(pipeManager.convertCoord(normalizeClick(event)));
      break;
  }
}
canvas.onclick = onclickCallback;
canvas.oncontextmenu = onclickCallback;

window.onkeydown = function(event){
  if(type == pipeManager.pipeType.Straight){
    type = pipeManager.pipeType.Corner;
  } else {
    type = pipeManager.pipeType.Straight;
  }
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {

  // TODO: Advance the fluid
  pipeManager.update(elapsedTime);
  waterManager.update(elapsedTime);
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "#777777";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  waterManager.render(elapsedTime, ctx);
  pipeManager.render(elapsedTime, ctx);
}

function normalizeClick(event){
  var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  return {x: x, y: y};
}

},{"./PipeManager.js":1,"./ResourceManager.js":3,"./WaterManager.js":4,"./game":6}],6:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}]},{},[5]);
