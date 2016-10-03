"use strict";

window.debug = false;

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
  pipeManager = new PipeManager(resourceManager.getResource('assets/pipes2.png'));
  type = pipeManager.pipeType.Straight;

  waterManager = new WaterManager(pipeManager, function(didWin){
    console.log(didWin ? "Win" : "Lose");
  });

  masterLoop(performance.now());
});

var Mouse = {
  LeftClick: 1,
  RightClick: 3
}

resourceManager.addImage('assets/pipes2.png');
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
