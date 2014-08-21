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
var boardPinAliases;

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
  0x0F: 'B2',
  0x10: 'B+'
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
  createPinDescriptor(7)
];
var B1_BOARD_PIN_ALIASES = {
  GPIO0: 3,
  GPIO1: 5,
  GPIO4: 7,
  GPIO14: 8,
  GPIO15: 10,
  GPIO17: 11,
  GPIO18: 12,
  GPIO21: 13,
  GPIO22: 15,
  GPIO23: 16,
  GPIO24: 18,
  GPIO10: 19,
  GPIO9: 21,
  GPIO25: 22,
  GPIO11: 23,
  GPIO8: 24,
  GPIO7: 26,

  SDA: 3,
  SCL: 5,
  GPCLK0: 7,
  TXD: 8,
  RXD: 10,
  PCM_CLK: 12,
  MOSI: 19,
  MISO: 21,
  SCLK: 11,
  CE0: 24,
  CE1: 26
};
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
  createPinDescriptor(7)
];
var B2_BOARD_PIN_ALIASES = {
  GPIO2: 3,
  GPIO3: 5,
  GPIO4: 7,
  GPIO14: 8,
  GPIO15: 10,
  GPIO17: 11,
  GPIO18: 12,
  GPIO27: 13,
  GPIO22: 15,
  GPIO23: 16,
  GPIO24: 18,
  GPIO10: 19,
  GPIO9: 21,
  GPIO25: 22,
  GPIO11: 23,
  GPIO8: 24,
  GPIO7: 26,

  SDA: 3,
  SCL: 5,
  GPCLK0: 7,
  TXD: 8,
  RXD: 10,
  PCM_CLK: 12,
  MOSI: 19,
  MISO: 21,
  SCLK: 11,
  CE0: 24,
  CE1: 26
};
var BPLUS_BOARD_PINS = [

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

  // 21-30
  createPinDescriptor(9),
  createPinDescriptor(25),
  createPinDescriptor(11),
  createPinDescriptor(8),
  createPinDescriptor(),
  createPinDescriptor(7),
  createPinDescriptor(),
  createPinDescriptor(),
  createPinDescriptor(5),
  createPinDescriptor(),

  // 31-40
  createPinDescriptor(6),
  createPinDescriptor(12),
  createPinDescriptor(13),
  createPinDescriptor(),
  createPinDescriptor(19),
  createPinDescriptor(16),
  createPinDescriptor(26),
  createPinDescriptor(20),
  createPinDescriptor(),
  createPinDescriptor(21)
];
var BPLUS_BOARD_PIN_ALIASES = {
  GPIO2: 3,
  GPIO3: 5,
  GPIO4: 7,
  GPIO14: 8,
  GPIO15: 10,
  GPIO17: 11,
  GPIO18: 12,
  GPIO27: 13,
  GPIO22: 15,
  GPIO23: 16,
  GPIO24: 18,
  GPIO10: 19,
  GPIO9: 21,
  GPIO25: 22,
  GPIO11: 23,
  GPIO8: 24,
  GPIO7: 26,
  GPIO5: 29,
  GPIO6: 31,
  GPIO12: 32,
  GPIO13: 33,
  GPIO19: 35,
  GPIO16: 36,
  GPIO26: 37,
  GPIO20: 38,
  GPIO21: 40,

  SDA: 3,
  SCL: 5,
  GPCLK0: 7,
  TXD: 8,
  RXD: 10,
  PCM_CLK: 12,
  MOSI: 19,
  MISO: 21,
  SCLK: 11,
  CE0: 24,
  CE1: 26
};

// Set up support for the status LED
fs.writeFileSync('/sys/class/leds/led0/trigger', 'none');
var led0 = B1_BOARD_PINS.led0 = B2_BOARD_PINS.led0 = {
  supportedModes: [ modes.INPUT, modes.OUTPUT ],
  mode: modes.OUTPUT,
  get value() {
    return parseInt(fs.readFileSync('/sys/class/leds/led0/brightness').toString()) ? 1 : 0;
  },
  set value(value) {
    if (this.mode != modes.OUTPUT) {
      throw new Error('Cannot write to pin because it is not in output mode');
    }
    if (value !== this.value) {
      fs.writeFileSync('/sys/class/leds/led0/brightness', value ? '255' : '0');
    }
  },
  analogChannel: 127,
  _gpio: 'led0',
  _instance: {
    init: function(cb) {
      cb();
    },
    watchValue: function(handler) {}, // Ignored
    setDirectionSync: function() {}, // Ignored
    writeValueSync: function(value) {
      led0.value = value;
    },
    readValueSync: function() {
      return led0.value;
    }
  }
};

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
          throw new Error('Rev A boards are not yet supported.');
        case 'B1':
          boardPins = B1_BOARD_PINS;
          boardPinAliases = B1_BOARD_PIN_ALIASES;
          break;
        case 'B2':
          boardPins = B2_BOARD_PINS;
          boardPinAliases = B2_BOARD_PIN_ALIASES;
          break;
        case 'B+':
          boardPins = BPLUS_BOARD_PINS;
          boardPinAliases = BPLUS_BOARD_PIN_ALIASES;
          break;
        default:
          throw new Error('Unknown board revision ' + revision);
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
      cb(null, boardPins, boardPinAliases);
    });
  } else {
    process.nextTick(cb.bind(undefined, null, boardPins, boardPinAliases));
  }
};
