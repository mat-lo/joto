var events = require('events')
  , util = require('util'),
  async = require('async')

util.inherits(plotter, events.EventEmitter);

var commands =  require(__base + 'config/commands.js');

var s = require(__base + 'modules/serial.js');
var Serial;
//STARTUP FUNCTION
function plotter(config){

  Serial = new s(config.serial);

  this.config = config;
  this.commands = commands;
  this.serial = Serial;

  return this;
}


plotter.prototype.startUp = function(){
  var self = this;
  console.log('starting up....');
  Serial.startup();
 
  Serial.on('connect', function(){
    console.log('serial connected');
    function startcode(){
      Serial.send([self.commands.penUp, self.commands.home.xy]);
    }
    setTimeout(startcode, 3000);
    
  });

  Serial.on('busy', function(){
    self.emit('busy');
    console.log('plotter.js: busy event from serial');
  });

  Serial.on('done', function(){
    self.emit('idle');
    console.log('serial finished');
  });

  Serial.on('serialStatus', function(message){
    self.emit('serialStatus', message);
    console.log('serialStatus', message);
  });

  Serial.on('failed', function(){
    console.log('serial failed');
  });

}

plotter.prototype.send = function(data, cb){
  //console.log(data);
  var gcode = data.split("\n");
  console.log('plotter.js: sending ' + gcode + ' to serial');
  Serial.send(gcode);
  cb(true);
}


plotter.prototype.homeXY = function() {
  Serial.send([this.commands.penUp, this.commands.home.xy]);
  //Serial.emit('homed');  
}

plotter.prototype.serialOpen = function() {
  Serial.open();
  Serial.emit("serialStatus","open");  
  //Serial.emit('homed');  
}

plotter.prototype.serialClose = function() {
  Serial.close();
  //Serial.emit('homed');  
}


plotter.prototype.motorsOff = function() {
  Serial.send([this.commands.motorsOff]);
  //Serial.emit('homed');  
}

plotter.prototype.penUp = function() {
  Serial.send([this.commands.penUp]);
  //Serial.emit('homed');  
}

plotter.prototype.penDown = function() {
  Serial.send([this.commands.penDown]);
  //Serial.emit('homed');  
}

plotter.prototype.penWipe = function() {
  Serial.send([this.commands.penWipe]);
  //Serial.emit('homed');  
}

plotter.prototype.controlUp = function() {
  Serial.send([this.commands.positioning.relative, this.commands.controlUp]);
  //Serial.emit('homed');  
}

plotter.prototype.controlDown = function() {
  Serial.send([this.commands.positioning.relative, this.commands.controlDown]);
  //Serial.emit('homed');  
}

plotter.prototype.controlLeft = function() {
  Serial.send([this.commands.positioning.relative, this.commands.controlLeft]);
  //Serial.emit('homed');  
}

plotter.prototype.controlRight = function() {
  Serial.send([this.commands.positioning.relative, this.commands.controlRight]);
  //Serial.emit('homed');  
}

plotter.prototype.resume = function() {
  Serial.resume();    
}

plotter.prototype.stop = function() {
  console.log('stopping');
  Serial.kill();
  Serial.send([this.commands.penUp, this.commands.home.xy]);    
}

plotter.prototype.emergency_stop = function() {
  console.log('emergency stop');
  Serial.kill();    
}


module.exports = plotter;
