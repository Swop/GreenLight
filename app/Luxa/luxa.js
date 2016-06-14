var HID = require('node-hid');

var Luxafor;

Luxafor = function () {
	this.usb_path = 'USB_04d8_f372_14142000';
	
	this.colors = {
		"red": {r:255, g:0, b:0},
		"green": {r:0, g:255, b:0},
		"blue": {r:0, g:0, b:255},
		"white": {r:255, g:255, b:255},
		"etsy": {r:255, g:55, b:0},
		"alm": {r:236, g:52, b:79},
		"off": {r:0, g:0, b:0}
	};

	this.endpoint = undefined;
}

Luxafor.prototype.init = function (cb) {
	this.endpoint = new HID.HID(this.usb_path);
}

Luxafor.prototype.setRGBColor = function (r, g, b) {
	this.endpoint.write([0x00, 2, 0xFF, r, g, b, 1]);
};

Luxafor.prototype.setColor = function (color) {
	this.setRGBColor(this.colors[color].r, this.colors[color].g, this.colors[color].b);
};

Luxafor.prototype.setRandomColor = function () {
	var randomIntInc = function() {
    	var low = 0;
    	var high = 255;

    	return Math.floor(Math.random() * (high - low + 1) + low);
	}

	this.setRGBColor(randomIntInc(), randomIntInc(), randomIntInc());
};

Luxafor.prototype.switchOff = function () {
	this.setColor('off');
};

console.log(HID.devices());

//process.exit();

var luxa = new Luxafor();
luxa.init();

luxa.setRandomColor()
var interval = setInterval(function() {
  luxa.setRandomColor()
}, 100);

//var color = "etsy";

//luxa.setColor(color);
//var interval = setInterval(function() {
//  if (color === 'alm') {
//  	color = 'etsy';
//  } else {
//  	color = 'alm';
//  }
//  luxa.setColor(color);
//}, 1000);

process.on('SIGINT', function() {
    luxa.switchOff();
    process.exit();
});
