/*
Copyright (c) 2014 Bryan Hughes <bryan@theoreticalideations.com>

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the 'Software'), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

var fs = require('fs');
var revision;
var boardPins;

// Version lookup info obtained from:
// http://raspberryalphaomega.org.uk/2013/02/06/automatic-raspberry-pi-board-revision-detection-model-a-b1-and-b2/
var BOARD_REVISIONS = {
  0x00: 'Unknown',
  0x02: 'B1',
  0x03: 'B1',
  0x04: 'B2',
  0x05: 'B2',
  0x06: 'B2',
  0x07: 'A',
  0x08: 'A',
  0x09: 'A',
  0x0D: 'B2',
  0x0E: 'B2',
  0x0F: 'B2'
};

var modes = module.exports.modes = Object.freeze({
  INPUT: 0,
  OUTPUT: 1,
  ANALOG: 2,
  PWM: 3,
  SERVO: 4
});

// Pin function info obtained from:
// http://elinux.org/Rpi_Low-level_peripherals
function createPinDescriptor(gpio) {

  // Calculate the supported modes
  var supportedModes = [];
  if (typeof gpio === 'number') {
    supportedModes.push(modes.INPUT, modes.OUTPUT);
  }

  // Return the descriptor
  return {
    supportedModes: supportedModes,
    mode: modes.INPUT,
    get value() {
      return this._instance.readValueSync();
    },
    set value(value) {
      if (this.mode != modes.OUTPUT) {
        throw new Error('Cannot write to pin because it is not in output mode');
      }
      return this._instance.writeValueSync(value);
    },
    analogChannel: 127,
    _gpio: gpio
  };
}
var B1_BOARD_PINS = [

  // There's not really a pin 0, so we create an empty entry
  createPinDescriptor(),

  // 1-10
  createPinDescriptor(),
  createPinDescriptor(),
  createPinDescriptor(0),
  createPinDescriptor(),
  createPinDescriptor(1),
  createPinDescriptor(),
  createPinDescriptor(4),
  createPinDescriptor(14),
  createPinDescriptor(),
  createPinDescriptor(15),

  // 11-20
  createPinDescriptor(17),
  createPinDescriptor(18),
  createPinDescriptor(21),
  createPinDescriptor(),
  createPinDescriptor(22),
  createPinDescriptor(23),
  createPinDescriptor(),
  createPinDescriptor(24),
  createPinDescriptor(10),
  createPinDescriptor(),

  // 21-26
  createPinDescriptor(9),
  createPinDescriptor(25),
  createPinDescriptor(11),
  createPinDescriptor(8),
  createPinDescriptor(),
  createPinDescriptor(7),
];
var B2_BOARD_PINS = [

  // There's not really a pin 0, so we create an empty entry
  createPinDescriptor(),

  // 1-10
  createPinDescriptor(),
  createPinDescriptor(),
  createPinDescriptor(2),
  createPinDescriptor(),
  createPinDescriptor(3),
  createPinDescriptor(),
  createPinDescriptor(4),
  createPinDescriptor(14),
  createPinDescriptor(),
  createPinDescriptor(15),

  // 11-20
  createPinDescriptor(17),
  createPinDescriptor(18),
  createPinDescriptor(27),
  createPinDescriptor(),
  createPinDescriptor(22),
  createPinDescriptor(23),
  createPinDescriptor(),
  createPinDescriptor(24),
  createPinDescriptor(10),
  createPinDescriptor(),

  // 21-26
  createPinDescriptor(9),
  createPinDescriptor(25),
  createPinDescriptor(11),
  createPinDescriptor(8),
  createPinDescriptor(),
  createPinDescriptor(7),
];

module.exports.getBoardVersion = function(cb) {
  if (revision) {
    process.nextTick(cb.bind(undefined, null, revision));
    return;
  }
  fs.readFile('/proc/cpuinfo', function(err, buf) {
    if (err) {
      cb(err);
    } else {
      var rev = buf.toString().match(/Revision\s*:\s*(.*)/);
      rev = parseInt(rev && rev[1] || '0', 16);
      revision = BOARD_REVISIONS[rev];

      switch(revision) {
        case 'A':
          // Information is scarce, going to have to reverse-engineer the schematics to figure out pinouts
          throw 'Rev A boards are not yet supported.';
        case 'B1':
          boardPins = B1_BOARD_PINS;
          break;
        case 'B2':
          boardPins = B2_BOARD_PINS;
          break;
      }

      cb(null, revision);
    }
  });
};

module.exports.getBoardPins = function(cb) {
  if (!boardPins) {
    module.exports.getBoardVersion(function (err) {
      if (err) {
        cb(err);
        return;
      }
      cb(null, boardPins);
    });
  } else {
    process.nextTick(cb.bind(undefined, null, boardPins));
  }
};
