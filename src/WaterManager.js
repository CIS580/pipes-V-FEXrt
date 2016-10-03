"use strict";

module.exports = exports = WaterManager;

const ProgressManager = require('./ProgressManager.js');

function WaterManager(pipeManager, gameOverCallback) {
  this.pipeManager = pipeManager;
  this.currentPipe = pipeManager.sourcePipe;
  this.gameOverCallback = gameOverCallback;

  var origin = pipeManager.convertToReal(this.currentPipe);
  this.currentRect = {x: origin.x, y: origin.y, width: 60, height: 60};
  this.currentRectRender = {x: origin.x, y: origin.y, width: 0, height: 0};

  this.renderRects = [];

  var self = this;
  this.progressManager = new ProgressManager(5000,
    function(pm, percent){
      var flowIsFrom;
      if(self.lastPipe){
        flowIsFrom = self.pipeManager.getRelativeDirection(self.currentPipe, self.lastPipe);
        console.log(flowIsFrom);
      }

      switch (self.pipeManager.getFlowDirection(self.currentPipe, flowIsFrom)) {
        case self.pipeManager.Direction.Right:
          self.currentRectRender.width = self.currentRect.width * percent;
          self.currentRectRender.height = self.currentRect.height;
          break;
        case self.pipeManager.Direction.Left:
          self.currentRectRender.x = self.currentRect.x + (self.currentRect.width - self.currentRect.width * percent)
          self.currentRectRender.width = self.currentRect.width * percent;
          self.currentRectRender.height = self.currentRect.height;
          break;
        case self.pipeManager.Direction.Down:
          self.currentRectRender.width = self.currentRect.width;
          self.currentRectRender.height = self.currentRect.height * percent;
          break;
        case self.pipeManager.Direction.Up:
          self.currentRectRender.y = self.currentRect.y + (self.currentRect.height - self.currentRect.height * percent)
          self.currentRectRender.width = self.currentRect.width;
          self.currentRectRender.height = self.currentRect.height * percent;
          break;
        case self.pipeManager.Direction.DownRight:
          self.currentRectRender.width = self.currentRect.width * percent;
          self.currentRectRender.height = self.currentRect.height * percent;
          break;
        case self.pipeManager.Direction.DownLeft:
          self.currentRectRender.x = self.currentRect.x + (self.currentRect.width - self.currentRect.width * percent)
          self.currentRectRender.width = self.currentRect.width * percent;
          self.currentRectRender.height = self.currentRect.height * percent;
          break;
        case self.pipeManager.Direction.UpRight:
          self.currentRectRender.y = self.currentRect.y + (self.currentRect.height - self.currentRect.height * percent)
          self.currentRectRender.width = self.currentRect.width * percent;
          self.currentRectRender.height = self.currentRect.height * percent;
          break;
        case self.pipeManager.Direction.UpLeft:
          self.currentRectRender.x = self.currentRect.x + (self.currentRect.width - self.currentRect.width * percent)
          self.currentRectRender.y = self.currentRect.y + (self.currentRect.height - self.currentRect.height * percent)
          self.currentRectRender.width = self.currentRect.width * percent;
          self.currentRectRender.height = self.currentRect.height * percent;
          break;
      }


    },
    function(pm) {
      // progress complete
      self.renderRects.push(self.currentRect);

      var cur = self.currentPipe;
      self.currentPipe = pipeManager.getConnectedPipe(self.currentPipe, self.lastPipe);
      self.lastPipe = cur;

      if(!self.currentPipe){
        self.gameOverCallback(self.lastPipe === self.pipeManager.exitPipe);
        return;
      }

      self.currentPipe.enabled = false;

      var origin = pipeManager.convertToReal(self.currentPipe);
      self.currentRect = {x: origin.x, y: origin.y, width: 60, height: 60};
      self.currentRectRender = {x: origin.x, y: origin.y, width: 0, height: 0};

      self.progressManager.reset();
      self.progressManager.isActive = true;
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
