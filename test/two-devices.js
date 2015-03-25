"use strict";

var five = require("johnny-five");
var RasPi = require("raspi-io");
var board = new five.Board({
  io: new RasPi()
});

board.on("ready", function () {
  var accelerometer = new five.Accelerometer({
    controller: "ADXL345"
  });
  var compass = new five.Compass({
    controller: "HMC5883L"
  });
  var x, y, z;
  var heading, bearing;
  var accelerometerReadings = 0;
  var compassReadings = 0;

  setInterval(function () {
    console.log(compassReadings + ' '
      + heading + ' '
      + bearing + ' '
      + accelerometerReadings + ' '
      + x + ' '
      + y + ' '
      + z);
  }, 500);

  accelerometer.on("data", function () {
    x = this.x;
    y = this.y;
    z = this.z;

    accelerometerReadings += 1;
  });

  compass.on("data", function () {
    heading = Math.floor(this.heading);
    bearing = this.bearing.name;

    compassReadings += 1;
  });
});

