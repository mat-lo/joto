var events = require('events')
var util = require('util');
var async = require('async');
var SerialPort = require("serialport");
var Readable = require('stream').Readable;

util.inherits(serial, events.EventEmitter);
var debug = true;


// //INTER PROCESS COMMS TO AVOID SERIAL CONFLICTS
// // subber.js
// var zmq = require('zmq')
//   , sock = zmq.socket('sub');

// sock.connect('tcp://127.0.0.1:3000');
// sock.subscribe('tweet');
// console.log('Subscriber connected to port 3000');

// sock.on('message', function(topic, message) {
//   console.log('received a message related to:', topic, 'containing message:', message);
// });



function serial(config){
  
  var self = this;

  self.config = config;
  
  events.EventEmitter.call(this);

  self.serialQueue = async.queue(function (task, callback) {
    task(callback);
  }, 1);

  self.serialQueue.drain = function () {
    console.log('end of queue');
    self.emit('done');
  } 
 
};


serial.prototype.startup = function() {

  var self = this;
    var buff = null;
    var startup = false;


      //CONNECT
       var serial = new SerialPort('/dev/ttyAMA0', {
            baudrate: 115200,
            autoOpen: false
            //parser: serialport.parsers.readline("\n")
            // parser: serialport.parsers.raw
        });

       var wrapper = new Readable().wrap(serial);

       wrapper.open(function (error) {
               
         if ( error ) {
           console.log('failed to open: '+error);
           self.emit('failed');  
         } else {
           self.emit("connect","test");  
         }

       });

      wrapper.on('data', function(response) {
        if (buff === null) {
           buff = response;
        } else {
           buff = Buffer.concat([buff, response]);
        }

        //NEEDS EXPANDING
        if (buff.toString().indexOf("ok") >= 0 && startup == false){
           self.emit("startup","test");  
           startup = true;
        }

      });


      self.connection = wrapper;
      
      self.connection.on('error', function(message) {
        self.emit("serialStatus","error");  
      });

      self.connection.on('close', function(message) {
        self.emit("serialStatus","close");  
      });


   


}

//SEND FUNCTION
serial.prototype.send = function(lines){

  //console.log(lines);
  console.log('serial.js: lines received');

  var self = this;

  self.emit('busy');
  lines.forEach(function(line) {

    //IGNORE COMMENTS
  if(line.indexOf(";") >= 0 || line == ''){
      console.log('blank line');
  }else{
      
      self.serialQueue.push(function(nextLine) {
        //console.log('pushed line');
        var buff = null;

        self.connection.on('data', function(response) {
         
          if(debug){
            console.log('line:', line);
            //console.log('raw data', response);
            console.log('data', response.toString());
            //console.log('buff', buff.toString().indexOf("ok"));
          }
              
          if (buff === null) {
             buff = response;
          } else {
             buff = Buffer.concat([buff, response]);
          }

          //NEEDS EXPANDING
          if (buff.toString().indexOf("ok") >= 0 || buff.toString().indexOf("w") >= 0){
             self.connection.removeAllListeners('data');
             buff = null;
             nextLine();
          }

        });//self.connection.on

        self.connection.write(line + "\r\n");
           
      });//serialQueue 
  }   



  });//lines foreach

}

serial.prototype.close = function() {
    // DO CONNECT
    this.connection.close();
}


serial.prototype.open = function() {
    // DO CONNECT
    this.connection.open(function (error) {
               
         if ( error ) {
           console.log('failed to open: '+error);
         } else {
           console.log('connected'); 
         }

  });
}

serial.prototype.insert = function(line) {
    // DO CONNECT
    //console.log("Serial", "killing");
    var self = this;
    this.serialQueue.pause();
    this.serialQueue.unshift(line);
    this.serialQueue.resume();
    self.emit('kill');
}

serial.prototype.kill = function() {
    // DO CONNECT
    //console.log("Serial", "killing");
    var self = this;
    self.connection.flush(function (error) {
          self.serialQueue.kill();
          self.emit('kill');
    });
}

serial.prototype.pause = function() {
    // DO CONNECT
    console.log("Serial", "pausing");
    this.serialQueue.pause();
    self.emit('pause');
}

serial.prototype.resume = function() {
    // DO CONNECT
    console.log("Serial", "resuming");
    this.serialQueue.resume();
    self.emit('resume');
}


module.exports = serial;
