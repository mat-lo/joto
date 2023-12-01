module.exports = {
    startGcode : 'G21',
    positioning : { relative: 'G91', absolute: 'G90'},
    speed : 'F30000',
    home : {
        y: 'G28 Y0',              // INFO logging level
        x: 'G28 X0',  
        xy: 'G28 Y0 X0',            // Category name for logging
    },
    stop : 'M112',
    penUp : 'M106 S105',
    penDown : 'M106 S130',
    penWipe : 'M106 S80',
    controlUp : 'G1 Y20',
    controlDown : 'G1 Y-20',
    controlLeft : 'G1 X-20',
    controlRight : 'G1 X20',
    move : 'G1',
    penPause : 'G4 P150',
    wipePause : 'G4 P100',
    motorsOff : 'M84'
};