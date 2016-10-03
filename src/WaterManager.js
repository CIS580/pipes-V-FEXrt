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
