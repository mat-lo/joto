
var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
	id: String,
	username: String,
	password: String,
	email: String,
	firstName: String,
	lastName: String,
	token: String,
	secret: String,
	sockets: {
		woodpecker: String,
		client: String
	},
	group: String,
	config: {
		port: String,
		baud: String,
		height: String,
		width: String,
		offsetx: String,
		offsety: String,
		gcode: {
			penup: String,
			pendown: String,
			wipe: String,
			start: String,
			stop: String,
			speed: String
		}
	}
});
