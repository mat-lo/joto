global.__base = __dirname + '/';

//client.js
//var io = require('socket.io-client');
var clientConfig = require('./clientConfig');
var request = require('request');
var shell = require('shelljs');
var async = require('async');
var fs = require('fs');
var admin = require("firebase-admin");

var serviceAccount = require("./joto-bot.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://joto-bot.firebaseio.com"
});

var db = admin.database();
var ref = db.ref();
ref.on("value", function(snapshot) {
  printEzFile(snapshot.val().gcode)
  // console.log();
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});

//INIT PLOTTER
//===============================================================
//
var p = require(__base + 'modules/plotter.js');
var Plotter = new p(clientConfig);
Plotter.startUp();


//SETUP QUEUES....
var printQueue = async.queue(function(task, callback) {
  task(callback);
}, 1);

printQueue.drain = function() {
  console.log('All queue lines have been sent');
}

// fs.readFile('gcode/ramen.gcode', 'utf8', function (err,data) {
//   if (err) {
//     return console.log(err);
//   }
//   printEzFile(data)
// });


//SOCKETS
//===============================================================
//
//var socket = io.connect(clientConfig.url);

// var socket = require('socket.io-client')(clientConfig.url,{'forceNew': true });

//   //socket.on('event', function(data){});
// socket.on('disconnect', function(){
//   console.log('disconnected');
//   socket.removeListener('action');
// });


// socket.on('connect', function(){
//   console.log('connected');
//   console.log(clientConfig.token);
//   socket.emit('authentication', {token: clientConfig.token, secret: clientConfig.secret, type: clientConfig.type});
// });

// socket.on('authenticated', function() {
//     console.log('authenticated with server');
//     // use the socket as usual
//     socket.on('connected', function(data) {
//       // use the socket as usual 
//       //console.log(data);
//     });

//     socket.on('action', function(data){
//       console.log('received emit: ' + data.eventName);

//       switch (data.eventName){
//           case 'print':
//             printFile(data.file)
//           break;

//           case 'homeXY':
//             Plotter.homeXY();
//           break;

//           case 'motorsOff':
//             Plotter.motorsOff();
//           break;

//           case 'controlUp':
//             Plotter.controlUp();
//           break;

//           case 'controlDown':
//             Plotter.controlDown();
//           break;

//           case 'controlLeft':
//             Plotter.controlLeft();
//           break;

//           case 'controlRight':
//             Plotter.controlRight();
//           break;

//           case 'penUp':
//             Plotter.penUp();
//           break;

//           case 'penDown':
//             Plotter.penDown();
//           break;

//           case 'penWipe':
//             Plotter.penWipe();
//           break;

//           case 'stop':
//             printQueue.kill();
//             Plotter.stop();
//           break;

//           case 'pishutdown':
//              shell.exec('sudo shutdown -h now');
//           break;

//           case 'emergency':
//              Plotter.emergency_stop();
//           break;

//           case 'gcode':
//              console.log('gcode called');
//              processGcode(data);
//           break;

//         }

//     });


// });



Plotter.on('busy', function(){
  console.log('client.js: Plotter busy event');
  Plotter.status = 'busy';
  // socket.emit('event', {event: 'busy', token: clientConfig.token, secret: clientConfig.secret, type: clientConfig.type});
});

Plotter.on('idle', function(){
  console.log('client.js: Plotter idle event');
  Plotter.status = 'idle';
  // socket.emit('event', {event: 'idle', token: clientConfig.token, secret: clientConfig.secret, type: clientConfig.type});
});



//PRINT FUNCTION
//===============================================================
//
function printFile(msg){
  var url = clientConfig.url + '/gcode/'+ msg + '/' + clientConfig.token + '/'+ clientConfig.secret;
  console.log(url);
  request(url, function (error, response, gcode) {
    console.log("gcode uguel " + gcode)
    if (error) throw error;
    
      if (!error && response.statusCode == 200) {
          if(gcode !== ""){
                  console.log('printing...' + msg);

                  printQueue.push(function(next) {
                    
                    Plotter.send(gcode, function(){
                       console.log('succesfully sent');
                       next();
                    });

                  });

          }else{
              console.log('no gcode');
          }
      }
  });
}


function processGcode(data){
    if(data.priority == 1){

         printQueue.unshift(function(next) {
            
            Plotter.send(data.gcode, function(){
               console.log('succesfully sent');
               next();
            });

          });

    }else{

         printQueue.push(function(next) {
            
            Plotter.send(data.gcode, function(){
               console.log('succesfully sent');
               next();
            });

          });
    }
}

////// MATLO

function printEzFile(gcode){          
    
          if(gcode !== ""){
                  console.log('printing...' + gcode);

                  printQueue.push(function(next) {
                    
                    Plotter.send(gcode, function(){
                       console.log('succesfully sent');
                       next();
                    });

                  });

          }else{
              console.log('no gcode');
          }      
}