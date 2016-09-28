"use strict";

module.exports = exports = PipeManager

function PipeManager(spritesheet) {
  this.spritesheet = spritesheet;
  this.map = [];
  // spritesheet items are 32x32
  // four wide by five tall
  // 0, 1, 2, 3
  // 4, 5, ...

  // World map is 32 wide by 26 wide at 32x32 pixels
  for(var i = 0; i < 16 * 14; i++){
    var y = Math.floor(i/16);
    var x = i % 16;

    this.map.push({x: x, y: y, idx: i%(5*4)});
  }
}

PipeManager.prototype.update = function(elapsedTime){

}

PipeManager.prototype.render = function(elapsedTime, ctx){
  var self = this;
  this.map.forEach(function(item){
    // Double check these. I think dividin number is wrong
    var y = Math.floor(item.idx/4);
    var x = item.idx % 4;

    ctx.drawImage(
      // Source Image
      self.spritesheet,
      // Source Rect
      x * 32, y * 32, 32, 32,
      // Destination Rect
      item.x * 64, item.y * 64, 64, 64);
  });
}
