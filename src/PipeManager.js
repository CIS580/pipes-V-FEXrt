"use strict";

module.exports = exports = PipeManager

function PipeManager(spritesheet) {
  this.spritesheet = {};
  this.spritesheet.image = spritesheet;
  this.spritesheet.size = 31.5;
  this.spritesheet.width = 4;
  this.spritesheet.height = 5;

  this.map = {};
  this.map.items = [];
  this.map.width = 16;
  this.map.height = 14;
  this.map.scale = 64;

  this.pipeType = {
    Corner : 5,
    Straight : 7,
    Source: 1
  };

  this.Direction = {
    Up: 0,
    Down: 1,
    Left: 2,
    Right: 3,
    UpRight: 4,
    UpLeft: 5,
    DownRight: 6,
    DownLeft: 7
  };

  this.Direction.inverse = {};
  this.Direction.inverse[this.Direction.Up] = this.Direction.Down;
  this.Direction.inverse[this.Direction.Down] = this.Direction.Up
  this.Direction.inverse[this.Direction.Left] = this.Direction.Right;
  this.Direction.inverse[this.Direction.Right] = this.Direction.Left;

  this.rotationMap = {};
  this.rotationMap[this.pipeType.Corner] = [5, 6, 9, 10];
  this.rotationMap[this.pipeType.Straight] = [7, 11];
  this.rotationMap[this.pipeType.Source] = [1, 3, 4, 12];

  this.attachmentMap = {};
  this.attachmentMap[this.pipeType.Corner] = [
    [this.Direction.Down, this.Direction.Right],
    [this.Direction.Down, this.Direction.Left],
    [this.Direction.Up, this.Direction.Right],
    [this.Direction.Up, this.Direction.Left]
  ];
  this.attachmentMap[this.pipeType.Straight] = [
    [this.Direction.Left, this.Direction.Right],
    [this.Direction.Up, this.Direction.Down]
  ];
  this.attachmentMap[this.pipeType.Source] = [
    [this.Direction.Left],
    [this.Direction.Right],
    [this.Direction.Up],
    [this.Direction.Down]
  ];

  this.flowDirectionMap = {};
  this.flowDirectionMap[this.pipeType.Corner] = [
    {0: this.Direction.UpRight, 2: this.Direction.DownLeft},
    {0: this.Direction.UpLeft, 3: this.Direction.DownRight},
    {1: this.Direction.DownRight, 2: this.Direction.UpLeft},
    {1: this.Direction.DownLeft, 3: this.Direction.UpRight}
  ];
  this.flowDirectionMap[this.pipeType.Source] = [
    [this.Direction.Left],
    [this.Direction.Right],
    [this.Direction.Up],
    [this.Direction.Down]
  ];

  this.sourcePipe = this.placeSource();
  this.exitPipe = this.placeExit(this.sourcePipe);

  this.sourcePipe.enabled = false;
  this.exitPipe.enabled = false;
}

PipeManager.prototype.reset = function(){

  this.map.items = [];

  this.sourcePipe = this.placeSource();
  this.exitPipe = this.placeExit(this.sourcePipe);

  this.sourcePipe.enabled = false;
  this.exitPipe.enabled = false;
}

PipeManager.prototype.addPipe = function(location, pipeType){
  if(this.findPipe(location)) return false;
  this.addPipeUnprotected(location, pipeType);
  return true;
}

PipeManager.prototype.addPipeUnprotected = function(location, pipeType){
  this.map.items.push({x: location.x, y: location.y, idx: 0, type: pipeType, enabled: true});
}

PipeManager.prototype.rotatePipe = function(location){
  var pipe = this.findPipe(location)
  if(typeof pipe === 'undefined') return false;
  if(!pipe.enabled) return false;
  pipe.idx = (pipe.idx + 1) % this.rotationMap[pipe.type].length;
  return true;
}

PipeManager.prototype.findPipe = function(location){
  return this.map.items.find(function(pipe) {
      return pipe.x == location.x && pipe.y == location.y;
  })
}

PipeManager.prototype.lockPipe = function(location){
  var pipe = this.findPipe(location)
  if(typeof pipe === 'undefined') return;
  pipe.enabled = false;
}

PipeManager.prototype.convertCoord = function(location){
  return {x: Math.floor(location.x / 64),  y: Math.floor(location.y / 64)};
}

PipeManager.prototype.isCorner = function(location){
  return (
    (location.x == 0 && location.y == 0) ||
    (location.x == 0 && location.y == this.map.height - 1) ||
    (location.x == this.map.width - 1 && location.y == 0) ||
    (location.x == this.map.width - 1 && location.y == this.map.height - 1)
  )
}

PipeManager.prototype.getFlowDirection = function(pipe, relativeDirection){
  if((typeof relativeDirection === 'undefined') || pipe.type == this.pipeType.Source){
    var direction = this.flowDirectionMap[pipe.type][pipe.idx][0];
    if(pipe === this.exitPipe) direction = this.Direction.inverse[direction];
    return direction
  }

  if(pipe.type == this.pipeType.Straight){
    return relativeDirection;
  }

  if(pipe.type == this.pipeType.Corner){
    return this.flowDirectionMap[pipe.type][pipe.idx][relativeDirection];
  }
}

PipeManager.prototype.getRandomBoundary = function(){
  var location = {x: 0, y: 0};
  var xOption = [0, this.map.width - 1];
  var yOption = [0, this.map.height - 1];

  while(this.isCorner(location)){
    var isXEdge = (Math.random() >= 0.5);
    var cornerIdx = (Math.random() >= 0.5) ? 0 : 1;
    var max = (isXEdge) ? this.map.height : this.map.width;
    var other = Math.floor(Math.random() * max);

    if(isXEdge){
      location.x = xOption[cornerIdx];
      location.y = other;
    } else{
      location.x = other;
      location.y = yOption[cornerIdx];
    }
  }

  return location;
}

PipeManager.prototype.addBoundaryPipe = function(location){
  this.addPipeUnprotected(location, this.pipeType.Source);
  var pipe = this.findPipe(location);
  pipe.idx = this.getSourceOrientationIndex(location);
  return pipe;
}

PipeManager.prototype.placeSource = function(){
  var location = (window.debug) ? {x: 0, y: 6} : this.getRandomBoundary();
  var pipe = this.addBoundaryPipe(location);
  return pipe;
}
PipeManager.prototype.placeExit = function(sourceLocation){
  var location = (window.debug) ? {x: this.map.width - 1, y: 6} : this.getRandomBoundary();
  while(sourceLocation == location){
    location = this.getRandomBoundary();
  }
  var pipe = this.addBoundaryPipe(location);
  return pipe;
}

PipeManager.prototype.getSourceOrientationIndex = function(location){
  if(location.x == 0) return 1;
  if(location.x == this.map.width - 1) return 0;
  if(location.y == 0) return 3;
  if(location.y == this.map.height - 1) return 2;
}

PipeManager.prototype.getConnectedPipe = function(pipe, ignoringPipe){
  var locations = [];
  var ignoringLocation = {x: -1, y:-1};

  if(ignoringPipe !== undefined){
    ignoringLocation.x = ignoringPipe.x;
    ignoringLocation.y = ignoringPipe.y;
  }

  // Up
  if(pipe.y > 0) locations.push({x: pipe.x, y: pipe.y - 1});
  // Down
  if(pipe.y < this.map.height - 1) locations.push({x: pipe.x, y: pipe.y + 1});
  // Left
  if(pipe.x > 0) locations.push({x: pipe.x - 1, y: pipe.y});
  // Right
  if(pipe.x < this.map.width - 1) locations.push({x: pipe.x + 1, y: pipe.y});

  var adjacentPipes = [];

  var self = this;
  locations.forEach(function(location){
    if(location.x == ignoringLocation.x && location.y == ignoringLocation.y){
      return;
    }
    var adjPipe = self.findPipe(location);
    if(adjPipe) adjacentPipes.push(adjPipe);
  });

  var attachedPipe;
  adjacentPipes.forEach(function(adjacentPipe){
    if(self.arePipesAttached(pipe, adjacentPipe)) attachedPipe = adjacentPipe;
  });

  return attachedPipe;
}

PipeManager.prototype.getRelativeDirection = function(pipe1, pipe2){
  var cx = pipe1.x - pipe2.x;
  // if cx == 0, then connected UP/Down.
  // if cx < 0 pipe1 is on left, cx > 0 pipe1 is on right
  var cy = pipe1.y - pipe2.y;
  // if cy == 0, then connected Left/right
  // if cy < 0, pipe1 is above, cy > 0 pipe1 is below
  var direction;

  if(cx == 0 && cy == 0){
    console.log("PipeManager.getRelativeDirection: pipes are in the same location");
    return;
  }

  if((cx != 0 && cy != 0) || (Math.abs(cx) > 1) || (Math.abs(cy) > 1)){
    console.log("PipeManager.getRelativeDirection: pipes are not adjacent.");
    return;
  }

  if(cx == 0){
    if(cy < 0){
      direction = this.Direction.Up;
    }else{
      direction = this.Direction.Down;
    }
  }else{
    if(cx < 0){
      direction = this.Direction.Left;
    }else{
      direction = this.Direction.Right;
    }
  }

  return direction;
}

PipeManager.prototype.arePipesAttached = function(pipe1, pipe2){
  var direction = this.getRelativeDirection(pipe1, pipe2);
  if (typeof direction === 'undefined') return false;

  var pipe1Can = this.attachmentMap[pipe1.type][pipe1.idx].indexOf(this.Direction.inverse[direction]) != -1
  var pipe2Can = this.attachmentMap[pipe2.type][pipe2.idx].indexOf(direction) != -1

  return pipe1Can && pipe2Can;
}

PipeManager.prototype.convertToReal = function(pipe){
  return {x: pipe.x * this.map.scale, y: pipe.y * this.map.scale};
}

PipeManager.prototype.update = function(elapsedTime){

}

PipeManager.prototype.render = function(elapsedTime, ctx){
  var self = this;
  this.map.items.forEach(function(item){
    var idx = self.rotationMap[item.type][item.idx];
    var y = Math.floor(idx/self.spritesheet.width);
    var x = idx % self.spritesheet.width;

    ctx.drawImage(
      // Source Image
      self.spritesheet.image,
      // Source Rect
      x * self.spritesheet.size, y * self.spritesheet.size, self.spritesheet.size, self.spritesheet.size,
      // Destination Rect
      item.x * self.map.scale, item.y * self.map.scale, self.map.scale, self.map.scale);
  });

  for(var i = 0; i < this.map.width; i++){
    for(var j = 0; j < this.map.height; j++){
        ctx.beginPath();
        ctx.strokeStyle="black";
        ctx.rect(i * this.map.scale, j * this.map.scale, this.map.scale, this.map.scale);
        ctx.stroke();
    }
  }

}
