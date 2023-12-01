var events = require('events')
var util = require('util');

var async = require('async');
var SerialPort = require("serialport");

util.inherits(serial, events.EventEmitter);


var pause = true;
var debug = false;

function serial(config){
  
  var self = this;
  self.config = config;
  
  events.EventEmitter.call(this);

  self.serialQueue = async.queue(function (task, callback) {
    task(callback);
  }, 1);

  self.serialQueue.drain = function () {
    console.log('end of queue');
    self.emit('plotterIdle');
  } 
 
};


serial.prototype.startup = function() {

  var self = this;


  

  //CONNECT
  this.connection = new SerialPort(this.config.port, {
    baudrate: parseInt(this.config.rate),
    autoOpen: false
  });

  //DEBUG LIST PORTS
    SerialPort.list(function (err, ports) {
      ports.forEach(function(port) {
        console.log(port.comName);
      });
    });

  this.connection.open(function (error) {
          
    if ( error ) {
      console.log('failed to open: '+error);
      self.emit('failed');  
    } else {
      self.emit("connect","test");  
    }

  });

}

//SEND FUNCTION
serial.prototype.send = function(lines){

  //console.log(lines);
  console.log('received send');

  var self = this;
  this.config = require(__base + 'config/config.js');
  this.commands = require(__base + 'config/commands.js');

  self.emit('plotterBusy');

  lines.forEach(function(line) {

    //IGNORE COMMENTS
  if(line.indexOf(";") >= 0 || line == ''){

  }else{
      self.serialQueue.push(function(nextLine) {
         
        var buff = null;
        self.connection.on('data', function(response) {
         
          if (debug){
            console.log('Serial', line);
              console.log('raw data', response);
              console.log('data', response.toString());
            //console.log('buff', buff.toString().indexOf("ok"));
          }

          if (buff === null) {
             buff = response;
          } else {
             buff = Buffer.concat([buff, response]);
          }

          //NEEDS EXPANDING
          if (buff.toString().indexOf("ok") >= 0){
             self.connection.removeAllListeners('data');
             nextLine();
             buff = null;
          }

        });//self.connection.on

        self.connection.write(line + "\r\n");
           

      });//serialQueue 
  }   



  });//lines foreach

}

serial.prototype.close = function() {
    // DO CONNECT
    console.log("Serial", "closing");
}

serial.prototype.kill = function() {
    // DO CONNECT
    //console.log("Serial", "killing");
    var self = this;
    self.connection.flush(function (error) {
          self.serialQueue.kill();
          self.emit('plotterIdle');
    });
}

serial.prototype.pause = function() {
    // DO CONNECT
    console.log("Serial", "pausing");
    this.serialQueue.pause();
}

serial.prototype.resume = function() {
    // DO CONNECT
    console.log("Serial", "resuming");
    this.serialQueue.resume();
}


module.exports = serial;
