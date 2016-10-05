"use strict";

module.exports = exports = AudioManager;

function AudioManager(resourceManager) {
  this.AudioClip = {
    Place: 0,
    Rotate: 1,
    LevelComplete: 2,
    Death: 3,
    Background: 4
  };

  this.clips = [
    resourceManager.getResource('assets/place.wav'),
    resourceManager.getResource('assets/rotate.wav'),
    resourceManager.getResource('assets/levelcomplete.wav'),
    resourceManager.getResource('assets/gameover.wav'),
    resourceManager.getResource('assets/pumped.mp3')
  ]

  this.clips[this.AudioClip.Background].addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);

  this.clips[this.AudioClip.Background].play();

}

AudioManager.prototype.play = function(audioClip){
  this.clips[audioClip].play();
}
