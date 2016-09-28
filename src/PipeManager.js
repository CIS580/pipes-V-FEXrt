"use strict";

var PipeType = {
  Corner : 5,
  Straight : 7
}

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

  this.pipeType = PipeType;
}

PipeManager.prototype.addPipe = function(location, pipeIdx){
  if(this.findPipe(location)) return;
  this.map.items.push({x: location.x, y: location.y, idx: pipeIdx});
}

PipeManager.prototype.findPipe = function(location){
  return this.map.items.find(function(pipe) {
      return pipe.x == location.x && pipe.y == location.y;
  })
}

PipeManager.prototype.convertCoord = function(location){
  return {x: Math.floor(location.x / 64),  y: Math.floor(location.y / 64)};
}

PipeManager.prototype.update = function(elapsedTime){

}

PipeManager.prototype.render = function(elapsedTime, ctx){
  var self = this;
  this.map.items.forEach(function(item){
    var y = Math.floor(item.idx/self.spritesheet.width);
    var x = item.idx % self.spritesheet.width;

    ctx.drawImage(
      // Source Image
      self.spritesheet.image,
      // Source Rect
      x * self.spritesheet.size, y * self.spritesheet.size, self.spritesheet.size, self.spritesheet.size,
      // Destination Rect
      item.x * self.map.scale, item.y * self.map.scale, self.map.scale, self.map.scale);
  });
}
