"use strict";

/* Classes */
const Game = require('./game');
const ResourceManager = require('./ResourceManager.js');
const PipeManager = require('./PipeManager.js');
/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var pipeManager;
var resourceManager = new ResourceManager(function(){
  // Load game
  pipeManager = new PipeManager(resourceManager.getResource('assets/pipes.png'));
  masterLoop(performance.now());
});

resourceManager.addImage('assets/pipes.png');
resourceManager.loadAll();

canvas.onclick = function(event) {
  event.preventDefault();
  pipeManager.addPipe(pipeManager.convertCoord(normalizeClick(event)), pipeManager.pipeType.Straight);
  // TODO: Place or rotate pipe tile
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

  // TODO: Render the board
  //ctx.drawImage(resourceManager.getResource('assets/pipes.png'), 0, 0);
  pipeManager.render(elapsedTime, ctx);
}

function normalizeClick(event){
  var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  return {x: x, y: y};
}
