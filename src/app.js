"use strict";

window.debug = false;

/* Classes */
const Game = require('./game');
const ResourceManager = require('./ResourceManager.js');
const ProgressManager = require('./ProgressManager.js');
const PipeManager = require('./PipeManager.js');
const WaterManager = require('./WaterManager.js');
const Hud = require('./hud.js');
const AudioManager = require('./AudioManager.js');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = {score: 0, level: 0};
var hud = new Hud(player, canvas.width, canvas.height);
var pipeManager;
var waterManager;
var audioManager;

var gameOverAlpha = 0;
var gameOverProgress = new ProgressManager(1000,
  function(pm, percent){
    gameOverAlpha = percent;
  },
  function(pm) {
    gameOverProgress.reset();
    pipeManager.reset();
    waterManager.reset();
    gameOverAlpha = 1;
    player.level = 0;
    player.score = 0;
  }
);

var newGameProgress = new ProgressManager(1000,
  function(pm, percent){
    gameOverAlpha = 1 - percent;
  },
  function(pm) {
    gameOverAlpha = 0;
    newGameProgress.reset();
    waterManager.start();
    gameState = GameState.Playing;
  }
);

var resourceManager = new ResourceManager(function(){
  // Load game
  pipeManager = new PipeManager(resourceManager.getResource('assets/pipes2.png'));
  type = pipeManager.pipeType.Straight;

  audioManager = new AudioManager(resourceManager);


  waterManager = new WaterManager(pipeManager,
    function(didWin){
      if(didWin){

        audioManager.play(audioManager.AudioClip.LevelComplete);

        pipeManager.reset();
        waterManager.reset();

        player.level += 1;
        waterManager.setLevel(player.level);

        waterManager.start();
      }else{
        gameState = GameState.Over;
        gameOverProgress.isActive = true;
        audioManager.play(audioManager.AudioClip.Death);
      }
    },
    function(scoreIncrease){
      player.score += scoreIncrease;
    }
  );

  waterManager.start();

  masterLoop(performance.now());
});

var Mouse = {
  LeftClick: 1,
  RightClick: 3
}

var GameState = {
  Playing: 0,
  Over: 1
}

var gameState = GameState.Playing;

resourceManager.addImage('assets/pipes2.png');
resourceManager.addAudio('assets/place.wav');
resourceManager.addAudio('assets/rotate.wav');
resourceManager.addAudio('assets/levelcomplete.wav');
resourceManager.addAudio('assets/gameover.wav');
resourceManager.addAudio('assets/pumped.mp3');
resourceManager.loadAll();

var type;

var onclickCallback = function(event) {
  event.preventDefault();

  if(gameState == GameState.Over) return;

  if(!window.debug){
    // Randomly select pipe if not in debug mode
    type = (Math.random() >= 0.5) ? pipeManager.pipeType.Straight :  pipeManager.pipeType.Corner;
  }

  switch (event.which) {
    case Mouse.LeftClick:
      if (pipeManager.addPipe(pipeManager.convertCoord(normalizeClick(event)), type)){
        audioManager.play(audioManager.AudioClip.Place);
      }
      break;
    case Mouse.RightClick:
      if(pipeManager.rotatePipe(pipeManager.convertCoord(normalizeClick(event)))){
        audioManager.play(audioManager.AudioClip.Rotate);
      }
      break;
  }
}
canvas.onclick = onclickCallback;
canvas.oncontextmenu = onclickCallback;

window.onkeydown = function(event){
  if(gameState == GameState.Over && event.keyCode == 32){
    newGameProgress.isActive = true;
  }

  if(!window.debug) return;

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
  if(gameState == GameState.Playing){
    pipeManager.update(elapsedTime);
    waterManager.update(elapsedTime);
  }
  gameOverProgress.progress(elapsedTime);
  newGameProgress.progress(elapsedTime);
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
  hud.render(elapsedTime, ctx);

  // Animate game Over
  ctx.save();
  ctx.globalAlpha=gameOverAlpha;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "yellow";
  ctx.font = "bold 40px Garamond";
  ctx.textAlign="center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
  ctx.font = "bold 24px Garamond";
  ctx.fillText("Space to play again", canvas.width / 2, canvas.height / 2 + 30 );

  ctx.restore();


}

function normalizeClick(event){
  var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  return {x: x, y: y};
}
