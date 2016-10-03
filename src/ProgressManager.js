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
