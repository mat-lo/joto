var events = require('events')
var util = require('util');

var async = require('async');
var SerialPort = require("serialport");

util.inherits(serial, events.EventEmitter);


//CONFIG FROM FILE
var config = {};
config.serialBaudRate = 115200;
config.usettyAMA0 = 0;


//GLOBALS
var queuePause = 0;
var sp = [];
var allPorts = [];

var pause = true;
var debug = true;
var currentSocketPort = {};
var connectedPort = null;



function ConvChar( str ) {
  c = {'<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#039;',
       '#':'&#035;' };
  return str.replace( /[<&>'"#]/g, function(s) { return c[s]; } );
}



function serial(config){
  
  var self = this;
  //self.config = config;
  
  events.EventEmitter.call(this);
  //IDLE EMIT EVENT
  self.emit('plotterIdle');
 
};


serial.prototype.startup = function() {

  var self = this;

  //CONNECT
  // this.connection = new SerialPort(this.config.port, {
  //   baudrate: parseInt(this.config.rate),
  //   autoOpen: false
  // });

  //START CONNECTION
  SerialPort.list(function (err, ports) {

    //console.log(ports);
    allPorts = ports;

    for (var i=0; i<ports.length; i++) {
    !function outer(i){

        sp[i] = {};
        sp[i].port = ports[i].comName;
        sp[i].q = [];
        sp[i].qCurrentMax = 0;
        sp[i].lastSerialWrite = [];
        sp[i].lastSerialReadLine = '';
        sp[i].handle = new SerialPort(ports[i].comName, {
          parser: SerialPort.parsers.readline("\n"),
          baudrate: config.serialBaudRate
        });
        sp[i].handle.on("open", function() {
          
          console.log('connected to '+sp[i].port+' at '+config.serialBaudRate);
          // line from serial port
          sp[i].handle.on("data", function (data) {
            serialData(data, i);
          });

          sp[i].handle.write("M115\n"); // Lets check if its Marlin?
          sp[i].handle.write("version\n"); // Lets check if its Smoothieware?

        });

        //EXPERIMENTAL SOCKET CLOSE FUNCTION
        sp[i].handle.on("close", function() {
          console.log('disconnected port');
          if(sp[i].port == connectedPort){
            connectedPort = null;
          };

        });

        sp[i].handle.on('error', function (error) {
          var errMsg = 'Cannot open' + sp[i].port;
            console.log(errMsg);
        });
    }(i)
    }

  });

}



//SEND FUNCTION
serial.prototype.send = function(data){


  if(connectedPort !== null){
    //var nl = data.split("\n");
     var nl = data;
    // add to queue
    sp[connectedPort].q = sp[connectedPort].q.concat(nl);

    // add to qCurrentMax
    sp[connectedPort].qCurrentMax += nl.length;
    //console.log(nl.length);
    if (sp[connectedPort].q.length == nl.length) {
      sendFirstQ(sp[connectedPort]);
    }
  }else{
    console.log('no connectedPort');
  }

}



serial.prototype.close = function() {
    // DO CONNECT
    console.log("Serial", "closing");
}

serial.prototype.kill = function() {
    // DO CONNECT
    //console.log("Serial", "killing");
    var self = this;
    sp[connectedPort].q = [];

}

serial.prototype.pause = function() {
    // DO CONNECT
    console.log("Serial", "pausing");
    //this.serialQueue.pause()
}

serial.prototype.resume = function() {
    // DO CONNECT
    console.log("Serial", "resuming");
    //this.serialQueue.resume()
}




function serialData(data, port) {

  // handle ?
  if (data.indexOf('<') == 0) {
    var t = data.substr(1);
    t = t.substr(0,t.length-2);
    t = t.split(/,|:/);
    console.log('status received');

    return;
  }


  if (data.indexOf('LPC1769') != -1 || data.indexOf('LPC1768') != -1) { //  found a Smoothie or AZSMZ type Board
    // setInterval(function() {
    //   sp[port].handle.write("M114\n"); //for Smoothieware
    // }, 1000);
    data = data.replace(/:/g,',');
    var firmwareVersion = data.split(/(,+)/);
    var smoothieVersion = 'Smoothie'+firmwareVersion[14]+''+firmwareVersion[2];
    console.log(smoothieVersion);
    connectedPort = port;
    sp[port].firmware = smoothieVersion;
  }

  if (data.indexOf('Repetier') != -1) { //found Repetier
    data = data.replace(/_/g,' ');
    data = data.replace(/:/g,' ');
    var firmwareVersion = data.split(/(\s+)/);
    var firmware = firmwareVersion[4]+' '+firmwareVersion[6];
    sp[port].firmware = firmware;
    console.log(firmware);
    currentPort = port;
  }

  if (queuePause == 1) {
    // pause queue
    return;
  }

  data = ConvChar(data);

  
  if (data.indexOf('ok') == 0) {
    console.log('serialRead - data -', data);
    if (sp[port].q.length > 0) {
      sendFirstQ(port);
    }
    sp[port].lastSerialWrite.shift();

  } else if (data.indexOf('error') == 0) {

    console.log('serialRead - error -', data);
    if (sp[port].q.length > 0) {
      sendFirstQ(port);
    }
    sp[port].lastSerialWrite.shift();

  } else {
    console.log('serialRead - other', data);
  }   


  if (sp[port].q.length == 0) {
    console.log('Queue finished');
    // reset max once queue is done
    sp[port].qCurrentMax = 0;
  }

  console.log('qStatus', 'currentLength' + sp[port].q.length + ' | currentMax' + sp[port].qCurrentMax);
  sp[port].lastSerialReadLine = data;

}



//


function sendFirstQ(port) {

  //OVERIDE
  var port = connectedPort;

  if (sp[port].q.length < 1) {
    // nothing to send
    return;
  }
  var t = sp[port].q.shift();
  // remove any comments after the command
  tt = t.split(';');
  t = tt[0];
  // trim it because we create the \n
  t = t.trim();
  if (t == '' || t.indexOf(';') == 0) {
    // this is a comment or blank line, go to next
    sendFirstQ(port);
    return;
  }
  console.log('writing line -', sp[port].q.length + ' | ' + t);
  sp[port].handle.write(t+"\n")
  sp[port].lastSerialWrite.push(t);
}





module.exports = serial;
