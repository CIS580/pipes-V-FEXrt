"use strict";

/**
 * @module exports the Hud class
 */
module.exports = exports = Hud;

/**
 * @constructor Hud
 * Creates a new Hud object
 */
function Hud(player, canvasWidth, canvasHeight) {
  var widthMultiTop = 0.4;
  var widthMultiBottom = 0.4;
  this.player = player;

  // Top Hud
  this.top = {};
  this.top.width = canvasWidth * widthMultiTop;
  this.top.height = 32;
  this.top.x = canvasWidth * ((1 - widthMultiTop)/2);
  this.top.y = 0;

  // Bottom Hud
  this.bottom = {};
  this.bottom.width = canvasWidth * widthMultiBottom;
  this.bottom.height = 32;
  this.bottom.x = canvasWidth * ((1 - widthMultiBottom)/2);
  this.bottom.y = canvasHeight - this.bottom.height;
}

/**
 * @function updates the Hud object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Hud.prototype.update = function(time) {
}

/**
 * @function renders the Hud into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Hud.prototype.render = function(time, ctx) {
  var cornerRadius = 50;
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "black";

  // Draw Top Hud
  ctx.beginPath();
  ctx.moveTo(this.top.x + cornerRadius, this.top.y + this.top.height);
  ctx.lineTo(this.top.x + this.top.width - cornerRadius, this.top.y + this.top.height);
  ctx.arc(this.top.x + this.top.width - cornerRadius, this.top.y, this.top.height, 0.5*Math.PI, 0, true);
  ctx.lineTo(this.top.x, this.top.y);
  ctx.arc(this.top.x + cornerRadius, this.top.y, this.top.height, Math.PI, 0.5 * Math.PI, true);
  ctx.fill();

  // Draw Bottom Hud
  ctx.beginPath();
  ctx.moveTo(this.bottom.x + cornerRadius, this.bottom.y);
  ctx.lineTo(this.bottom.x + this.bottom.width - cornerRadius, this.bottom.y);
  ctx.arc(this.bottom.x + this.bottom.width - cornerRadius, this.bottom.y + this.bottom.height, this.bottom.height, 1.5*Math.PI, 0);
  ctx.lineTo(this.bottom.x, this.bottom.y + this.bottom.height);
  ctx.arc(this.bottom.x + cornerRadius, this.bottom.y + this.bottom.height, this.bottom.height, Math.PI, 1.5 * Math.PI);
  ctx.fill();

  ctx.restore();

  var centerX = this.bottom.x + (this.bottom.width / 2);
  var bottomCenterY = this.bottom.y + (this.bottom.height / 2);
  var topCenterY = this.top.y + (this.top.height / 2);

  ctx.fillStyle = "yellow";
  ctx.font = "bold 24px Arial";
  ctx.textAlign="center";

  ctx.fillText("Level: " + this.player.level, centerX, topCenterY + 10)
  ctx.fillText("Score: " + this.player.score, centerX, bottomCenterY + 10 );
}
