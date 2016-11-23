'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _events = require('events');

var _raspi = require('raspi');

var _raspiBoard = require('raspi-board');

var _raspiGpio = require('raspi-gpio');

var _raspiPwm = require('raspi-pwm');

var _raspiI2c = require('raspi-i2c');

var _raspiLed = require('raspi-led');

var _raspiSerial = require('raspi-serial');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
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

// Constants
var INPUT_MODE = 0;
var OUTPUT_MODE = 1;
var ANALOG_MODE = 2;
var PWM_MODE = 3;
var SERVO_MODE = 4;
var UNKNOWN_MODE = 99;

var LOW = 0;
var HIGH = 1;

var LED_PIN = -1;

// Settings
var DEFAULT_SERVO_MIN = 1000;
var DEFAULT_SERVO_MAX = 2000;
var DIGITAL_READ_UPDATE_RATE = 19;

// Private symbols
var isReady = Symbol('isReady');
var pins = Symbol('pins');
var instances = Symbol('instances');
var analogPins = Symbol('analogPins');
var getPinInstance = Symbol('getPinInstance');
var i2c = Symbol('i2c');
var i2cDelay = Symbol('i2cDelay');
var _i2cRead = Symbol('i2cRead');
var i2cCheckAlive = Symbol('i2cCheckAlive');
var _pinMode = Symbol('pinMode');
var serial = Symbol('serial');
var serialQueue = Symbol('serialQueue');
var addToSerialQueue = Symbol('addToSerialQueue');
var serialPump = Symbol('serialPump');
var isSerialProcessing = Symbol('isSerialProcessing');
var isSerialOpen = Symbol('isSerialOpen');

var SERIAL_ACTION_WRITE = 'SERIAL_ACTION_WRITE';
var SERIAL_ACTION_CLOSE = 'SERIAL_ACTION_CLOSE';
var SERIAL_ACTION_FLUSH = 'SERIAL_ACTION_FLUSH';
var SERIAL_ACTION_CONFIG = 'SERIAL_ACTION_CONFIG';
var SERIAL_ACTION_READ = 'SERIAL_ACTION_READ';
var SERIAL_ACTION_STOP = 'SERIAL_ACTION_STOP';

function bufferToArray(buffer) {
  var array = Array(buffer.length);
  for (var i = 0; i < buffer.length; i++) {
    array[i] = buffer[i];
  }
  return array;
}

var Raspi = function (_EventEmitter) {
  _inherits(Raspi, _EventEmitter);

  function Raspi() {
    var _Object$definePropert;

    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var includePins = _ref.includePins;
    var excludePins = _ref.excludePins;

    _classCallCheck(this, Raspi);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Raspi).call(this));

    Object.defineProperties(_this, (_Object$definePropert = {
      name: {
        enumerable: true,
        value: 'RaspberryPi-IO'
      }

    }, _defineProperty(_Object$definePropert, instances, {
      writable: true,
      value: []
    }), _defineProperty(_Object$definePropert, isReady, {
      writable: true,
      value: false
    }), _defineProperty(_Object$definePropert, 'isReady', {
      enumerable: true,
      get: function get() {
        return this[isReady];
      }
    }), _defineProperty(_Object$definePropert, pins, {
      writable: true,
      value: []
    }), _defineProperty(_Object$definePropert, 'pins', {
      enumerable: true,
      get: function get() {
        return this[pins];
      }
    }), _defineProperty(_Object$definePropert, analogPins, {
      writable: true,
      value: []
    }), _defineProperty(_Object$definePropert, 'analogPins', {
      enumerable: true,
      get: function get() {
        return this[analogPins];
      }
    }), _defineProperty(_Object$definePropert, i2c, {
      writable: true,
      value: new _raspiI2c.I2C()
    }), _defineProperty(_Object$definePropert, i2cDelay, {
      writable: true,
      value: 0
    }), _defineProperty(_Object$definePropert, serial, {
      writable: true,
      value: new _raspiSerial.Serial()
    }), _defineProperty(_Object$definePropert, serialQueue, {
      value: []
    }), _defineProperty(_Object$definePropert, isSerialProcessing, {
      writable: true,
      value: false
    }), _defineProperty(_Object$definePropert, isSerialOpen, {
      writable: true,
      value: false
    }), _defineProperty(_Object$definePropert, 'MODES', {
      enumerable: true,
      value: Object.freeze({
        INPUT: INPUT_MODE,
        OUTPUT: OUTPUT_MODE,
        ANALOG: ANALOG_MODE,
        PWM: PWM_MODE,
        SERVO: SERVO_MODE
      })
    }), _defineProperty(_Object$definePropert, 'HIGH', {
      enumerable: true,
      value: HIGH
    }), _defineProperty(_Object$definePropert, 'LOW', {
      enumerable: true,
      value: LOW
    }), _defineProperty(_Object$definePropert, 'defaultLed', {
      enumerable: true,
      value: LED_PIN
    }), _defineProperty(_Object$definePropert, 'SERIAL_PORT_IDs', {
      enumerable: true,
      value: Object.freeze({
        HW_SERIAL0: _raspiSerial.DEFAULT_PORT,
        DEFAULT: _raspiSerial.DEFAULT_PORT
      })
    }), _Object$definePropert));

    (0, _raspi.init)(function () {
      var pinMappings = (0, _raspiBoard.getPins)();
      _this[pins] = [];

      // Slight hack to get the LED in there, since it's not actually a pin
      pinMappings[LED_PIN] = {
        pins: [LED_PIN],
        peripherals: ['gpio']
      };

      if (includePins && excludePins) {
        throw new Error('"includePins" and "excludePins" cannot be specified at the same time');
      }

      if (Array.isArray(includePins)) {
        var newPinMappings = {};
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = includePins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var pin = _step.value;

            var normalizedPin = (0, _raspiBoard.getPinNumber)(pin);
            if (normalizedPin === null) {
              throw new Error('Invalid pin "' + pin + '" specified in includePins');
            }
            newPinMappings[normalizedPin] = pinMappings[normalizedPin];
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        pinMappings = newPinMappings;
      } else if (Array.isArray(excludePins)) {
        pinMappings = Object.assign({}, pinMappings);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = excludePins[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _pin = _step2.value;

            var _normalizedPin = (0, _raspiBoard.getPinNumber)(_pin);
            if (_normalizedPin === null) {
              throw new Error('Invalid pin "' + _pin + '" specified in excludePins');
            }
            delete pinMappings[_normalizedPin];
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }

      Object.keys(pinMappings).forEach(function (pin) {
        var pinInfo = pinMappings[pin];
        var supportedModes = [];
        // We don't want I2C to be used for anything else, since changing the
        // pin mode makes it unable to ever do I2C again.
        if (pinInfo.peripherals.indexOf('i2c') == -1 && pinInfo.peripherals.indexOf('uart') == -1) {
          if (pin == LED_PIN) {
            supportedModes.push(OUTPUT_MODE);
          } else if (pinInfo.peripherals.indexOf('gpio') != -1) {
            supportedModes.push(INPUT_MODE, OUTPUT_MODE);
          }
          if (pinInfo.peripherals.indexOf('pwm') != -1) {
            supportedModes.push(PWM_MODE, SERVO_MODE);
          }
        }
        var instance = _this[instances][pin] = {
          peripheral: null,
          mode: supportedModes.indexOf(OUTPUT_MODE) == -1 ? UNKNOWN_MODE : OUTPUT_MODE,

          // Used to cache the previously written value for reading back in OUTPUT mode
          previousWrittenValue: LOW,

          // Used to set the default min and max values
          min: DEFAULT_SERVO_MIN,
          max: DEFAULT_SERVO_MAX
        };
        _this[pins][pin] = Object.create(null, {
          supportedModes: {
            enumerable: true,
            value: Object.freeze(supportedModes)
          },
          mode: {
            enumerable: true,
            get: function get() {
              return instance.mode;
            }
          },
          value: {
            enumerable: true,
            get: function get() {
              switch (instance.mode) {
                case INPUT_MODE:
                  return instance.peripheral.read();
                case OUTPUT_MODE:
                  return instance.previousWrittenValue;
                default:
                  return null;
              }
            },
            set: function set(value) {
              if (instance.mode == OUTPUT_MODE) {
                instance.peripheral.write(value);
              }
            }
          },
          report: {
            enumerable: true,
            value: 1
          },
          analogChannel: {
            enumerable: true,
            value: 127
          }
        });
        if (instance.mode == OUTPUT_MODE) {
          _this.pinMode(pin, OUTPUT_MODE);
          _this.digitalWrite(pin, LOW);
        }
      });

      // Fill in the holes, sins pins are sparse on the A+/B+/2
      for (var i = 0; i < _this[pins].length; i++) {
        if (!_this[pins][i]) {
          _this[pins][i] = Object.create(null, {
            supportedModes: {
              enumerable: true,
              value: Object.freeze([])
            },
            mode: {
              enumerable: true,
              get: function get() {
                return UNKNOWN_MODE;
              }
            },
            value: {
              enumerable: true,
              get: function get() {
                return 0;
              },
              set: function set() {}
            },
            report: {
              enumerable: true,
              value: 1
            },
            analogChannel: {
              enumerable: true,
              value: 127
            }
          });
        }
      }

      _this.serialConfig({
        portId: _raspiSerial.DEFAULT_PORT,
        baud: 9600
      });

      _this[isReady] = true;
      _this.emit('ready');
      _this.emit('connect');
    });
    return _this;
  }

  _createClass(Raspi, [{
    key: 'reset',
    value: function reset() {
      throw new Error('reset is not supported on the Raspberry Pi');
    }
  }, {
    key: 'normalize',
    value: function normalize(pin) {
      var normalizedPin = (0, _raspiBoard.getPinNumber)(pin);
      if (typeof normalizedPin !== 'number') {
        throw new Error('Unknown pin "' + pin + '"');
      }
      return normalizedPin;
    }
  }, {
    key: getPinInstance,
    value: function value(pin) {
      var pinInstance = this[instances][pin];
      if (!pinInstance) {
        throw new Error('Unknown pin "' + pin + '"');
      }
      return pinInstance;
    }
  }, {
    key: 'pinMode',
    value: function pinMode(pin, mode) {
      this[_pinMode]({ pin: pin, mode: mode });
    }
  }, {
    key: _pinMode,
    value: function value(_ref2) {
      var pin = _ref2.pin;
      var mode = _ref2.mode;
      var _ref2$pullResistor = _ref2.pullResistor;
      var pullResistor = _ref2$pullResistor === undefined ? _raspiGpio.PULL_NONE : _ref2$pullResistor;

      var normalizedPin = this.normalize(pin);
      var pinInstance = this[getPinInstance](normalizedPin);
      pinInstance.pullResistor = pullResistor;
      var config = {
        pin: normalizedPin,
        pullResistor: pinInstance.pullResistor
      };
      if (this[pins][normalizedPin].supportedModes.indexOf(mode) == -1) {
        throw new Error('Pin "' + pin + '" does not support mode "' + mode + '"');
      }
      if (pin == LED_PIN) {
        if (pinInstance.peripheral instanceof _raspiLed.LED) {
          return;
        }
        pinInstance.peripheral = new _raspiLed.LED();
      } else {
        switch (mode) {
          case INPUT_MODE:
            pinInstance.peripheral = new _raspiGpio.DigitalInput(config);
            break;
          case OUTPUT_MODE:
            pinInstance.peripheral = new _raspiGpio.DigitalOutput(config);
            break;
          case PWM_MODE:
          case SERVO_MODE:
            pinInstance.peripheral = new _raspiPwm.PWM(normalizedPin);
            break;
          default:
            console.warn('Unknown pin mode: ' + mode);
            break;
        }
      }
      pinInstance.mode = mode;
    }
  }, {
    key: 'analogRead',
    value: function analogRead() {
      throw new Error('analogRead is not supported on the Raspberry Pi');
    }
  }, {
    key: 'analogWrite',
    value: function analogWrite(pin, value) {
      this.pwmWrite(pin, value);
    }
  }, {
    key: 'pwmWrite',
    value: function pwmWrite(pin, value) {
      var pinInstance = this[getPinInstance](this.normalize(pin));
      if (pinInstance.mode != PWM_MODE) {
        this.pinMode(pin, PWM_MODE);
      }
      pinInstance.peripheral.write(Math.round(value * pinInstance.peripheral.range / 255));
    }
  }, {
    key: 'digitalRead',
    value: function digitalRead(pin, handler) {
      var _this2 = this;

      var pinInstance = this[getPinInstance](this.normalize(pin));
      if (pinInstance.mode != INPUT_MODE) {
        this.pinMode(pin, INPUT_MODE);
      }
      var interval = setInterval(function () {
        var value = void 0;
        if (pinInstance.mode == INPUT_MODE) {
          value = pinInstance.peripheral.read();
        } else {
          value = pinInstance.previousWrittenValue;
        }
        if (handler) {
          handler(value);
        }
        _this2.emit('digital-read-' + pin, value);
      }, DIGITAL_READ_UPDATE_RATE);
      pinInstance.peripheral.on('destroyed', function () {
        clearInterval(interval);
      });
    }
  }, {
    key: 'digitalWrite',
    value: function digitalWrite(pin, value) {
      var pinInstance = this[getPinInstance](this.normalize(pin));
      if (pinInstance.mode === INPUT_MODE && value === HIGH) {
        this[_pinMode]({ pin: pin, mode: INPUT_MODE, pullResistor: _raspiGpio.PULL_UP });
      } else if (pinInstance.mode === INPUT_MODE && value === LOW) {
        this[_pinMode]({ pin: pin, mode: INPUT_MODE, pullResistor: _raspiGpio.PULL_DOWN });
      } else if (pinInstance.mode != OUTPUT_MODE) {
        this[_pinMode]({ pin: pin, mode: OUTPUT_MODE });
      }
      if (pinInstance.mode === OUTPUT_MODE && value != pinInstance.previousWrittenValue) {
        pinInstance.peripheral.write(value ? HIGH : LOW);
        pinInstance.previousWrittenValue = value;
      }
    }
  }, {
    key: 'servoConfig',
    value: function servoConfig(pin, min, max) {
      var config = pin;
      if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) !== 'object') {
        config = { pin: pin, min: min, max: max };
      }
      if (typeof config.min !== 'number') {
        config.min = DEFAULT_SERVO_MIN;
      }
      if (typeof config.max !== 'number') {
        config.max = DEFAULT_SERVO_MAX;
      }
      var normalizedPin = this.normalize(pin);
      this[_pinMode]({
        pin: normalizedPin,
        mode: SERVO_MODE
      });
      var pinInstance = this[getPinInstance](this.normalize(normalizedPin));
      pinInstance.min = config.min;
      pinInstance.max = config.max;
    }
  }, {
    key: 'servoWrite',
    value: function servoWrite(pin, value) {
      var pinInstance = this[getPinInstance](this.normalize(pin));
      if (pinInstance.mode != SERVO_MODE) {
        this.pinMode(pin, SERVO_MODE);
      }
      var dutyCycle = (pinInstance.min + value / 180 * (pinInstance.max - pinInstance.min)) / 20000;
      pinInstance.peripheral.write(dutyCycle * pinInstance.peripheral.range);
    }
  }, {
    key: 'queryCapabilities',
    value: function queryCapabilities(cb) {
      if (this.isReady) {
        process.nextTick(cb);
      } else {
        this.on('ready', cb);
      }
    }
  }, {
    key: 'queryAnalogMapping',
    value: function queryAnalogMapping(cb) {
      if (this.isReady) {
        process.nextTick(cb);
      } else {
        this.on('ready', cb);
      }
    }
  }, {
    key: 'queryPinState',
    value: function queryPinState(pin, cb) {
      if (this.isReady) {
        process.nextTick(cb);
      } else {
        this.on('ready', cb);
      }
    }
  }, {
    key: i2cCheckAlive,
    value: function value() {
      if (!this[i2c].alive) {
        throw new Error('I2C pins not in I2C mode');
      }
    }
  }, {
    key: 'i2cConfig',
    value: function i2cConfig(options) {
      var delay = void 0;

      if (typeof options === 'number') {
        delay = options;
      } else {
        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' && options !== null) {
          delay = options.delay;
        }
      }

      this[i2cCheckAlive]();

      this[i2cDelay] = Math.round((delay || 0) / 1000);

      return this;
    }
  }, {
    key: 'i2cWrite',
    value: function i2cWrite(address, cmdRegOrData, inBytes) {
      this[i2cCheckAlive]();

      // If i2cWrite was used for an i2cWriteReg call...
      if (arguments.length === 3 && !Array.isArray(cmdRegOrData) && !Array.isArray(inBytes)) {
        return this.i2cWriteReg(address, cmdRegOrData, inBytes);
      }

      // Fix arguments if called with Firmata.js API
      if (arguments.length === 2) {
        if (Array.isArray(cmdRegOrData)) {
          inBytes = cmdRegOrData.slice();
          cmdRegOrData = inBytes.shift();
        } else {
          inBytes = [];
        }
      }

      var buffer = new Buffer([cmdRegOrData].concat(inBytes));

      // Only write if bytes provided
      if (buffer.length) {
        this[i2c].writeSync(address, buffer);
      }

      return this;
    }
  }, {
    key: 'i2cWriteReg',
    value: function i2cWriteReg(address, register, value) {
      this[i2cCheckAlive]();

      this[i2c].writeByteSync(address, register, value);

      return this;
    }
  }, {
    key: _i2cRead,
    value: function value(continuous, address, register, bytesToRead, callback) {
      var _this3 = this;

      this[i2cCheckAlive]();

      // Fix arguments if called with Firmata.js API
      if (arguments.length == 4 && typeof register == 'number' && typeof bytesToRead == 'function') {
        callback = bytesToRead;
        bytesToRead = register;
        register = null;
      }

      callback = typeof callback === 'function' ? callback : function () {};

      var event = 'i2c-reply-' + address + '-';
      event += register !== null ? register : 0;

      var read = function read() {
        var afterRead = function afterRead(err, buffer) {
          if (err) {
            return _this3.emit('error', err);
          }

          // Convert buffer to Array before emit
          _this3.emit(event, Array.prototype.slice.call(buffer));

          if (continuous) {
            setTimeout(read, _this3[i2cDelay]);
          }
        };

        _this3.once(event, callback);

        if (register !== null) {
          _this3[i2c].read(address, register, bytesToRead, afterRead);
        } else {
          _this3[i2c].read(address, bytesToRead, afterRead);
        }
      };

      setTimeout(read, this[i2cDelay]);

      return this;
    }
  }, {
    key: 'i2cRead',
    value: function i2cRead() {
      for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
        rest[_key] = arguments[_key];
      }

      return this[_i2cRead].apply(this, [true].concat(rest));
    }
  }, {
    key: 'i2cReadOnce',
    value: function i2cReadOnce() {
      for (var _len2 = arguments.length, rest = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        rest[_key2] = arguments[_key2];
      }

      return this[_i2cRead].apply(this, [false].concat(rest));
    }
  }, {
    key: 'sendI2CConfig',
    value: function sendI2CConfig() {
      return this.i2cConfig.apply(this, arguments);
    }
  }, {
    key: 'sendI2CWriteRequest',
    value: function sendI2CWriteRequest() {
      return this.i2cWrite.apply(this, arguments);
    }
  }, {
    key: 'sendI2CReadRequest',
    value: function sendI2CReadRequest() {
      return this.i2cReadOnce.apply(this, arguments);
    }
  }, {
    key: 'serialConfig',
    value: function serialConfig(_ref3) {
      var portId = _ref3.portId;
      var baud = _ref3.baud;

      if (!this[isSerialOpen] || baud && baud !== this[serial].baudRate) {
        this[addToSerialQueue]({
          type: SERIAL_ACTION_CONFIG,
          portId: portId,
          baud: baud
        });
      }
    }
  }, {
    key: 'serialWrite',
    value: function serialWrite(portId, inBytes) {
      this[addToSerialQueue]({
        type: SERIAL_ACTION_WRITE,
        portId: portId,
        inBytes: inBytes
      });
    }
  }, {
    key: 'serialRead',
    value: function serialRead(portId, maxBytesToRead, handler) {
      if (typeof maxBytesToRead === 'function') {
        handler = maxBytesToRead;
        maxBytesToRead = undefined;
      }
      this[addToSerialQueue]({
        type: SERIAL_ACTION_READ,
        portId: portId,
        maxBytesToRead: maxBytesToRead,
        handler: handler
      });
    }
  }, {
    key: 'serialStop',
    value: function serialStop(portId) {
      this[addToSerialQueue]({
        type: SERIAL_ACTION_STOP,
        portId: portId
      });
    }
  }, {
    key: 'serialClose',
    value: function serialClose(portId) {
      this[addToSerialQueue]({
        type: SERIAL_ACTION_CLOSE,
        portId: portId
      });
    }
  }, {
    key: 'serialFlush',
    value: function serialFlush(portId) {
      this[addToSerialQueue]({
        type: SERIAL_ACTION_FLUSH,
        portId: portId
      });
    }
  }, {
    key: addToSerialQueue,
    value: function value(action) {
      if (action.portId !== _raspiSerial.DEFAULT_PORT) {
        throw new Error('Invalid serial port "' + portId + '"');
      }
      this[serialQueue].push(action);
      this[serialPump]();
    }
  }, {
    key: serialPump,
    value: function value() {
      var _this4 = this;

      if (this[isSerialProcessing] || !this[serialQueue].length) {
        return;
      }
      this[isSerialProcessing] = true;
      var action = this[serialQueue].shift();
      var finalize = function finalize() {
        _this4[isSerialProcessing] = false;
        _this4[serialPump]();
      };
      switch (action.type) {
        case SERIAL_ACTION_WRITE:
          if (!this[isSerialOpen]) {
            throw new Error('Cannot write to closed serial port');
          }
          this[serial].write(action.inBytes, finalize);
          break;

        case SERIAL_ACTION_READ:
          if (!this[isSerialOpen]) {
            throw new Error('Cannot read from closed serial port');
          }
          // TODO: add support for action.maxBytesToRead
          this[serial].on('data', function (data) {
            action.handler(bufferToArray(data));
          });
          process.nextTick(finalize);
          break;

        case SERIAL_ACTION_STOP:
          if (!this[isSerialOpen]) {
            throw new Error('Cannot stop closed serial port');
          }
          this[serial].removeAllListeners();
          process.nextTick(finalize);
          break;

        case SERIAL_ACTION_CONFIG:
          this[serial].close(function () {
            _this4[serial] = new _raspiSerial.Serial({
              baudRate: action.baud
            });
            _this4[serial].open(function () {
              _this4[serial].on('data', function (data) {
                _this4.emit('serial-data-' + action.portId, bufferToArray(data));
              });
              _this4[isSerialOpen] = true;
              finalize();
            });
          });
          break;

        case SERIAL_ACTION_CLOSE:
          this[serial].close(function () {
            _this4[isSerialOpen] = false;
            finalize();
          });
          break;

        case SERIAL_ACTION_FLUSH:
          if (!this[isSerialOpen]) {
            throw new Error('Cannot flush closed serial port');
          }
          this[serial].flush(finalize);
          break;

        default:
          throw new Error('Internal error: unknown serial action type');
      }
    }
  }, {
    key: 'sendOneWireConfig',
    value: function sendOneWireConfig() {
      throw new Error('sendOneWireConfig is not supported on the Raspberry Pi');
    }
  }, {
    key: 'sendOneWireSearch',
    value: function sendOneWireSearch() {
      throw new Error('sendOneWireSearch is not supported on the Raspberry Pi');
    }
  }, {
    key: 'sendOneWireAlarmsSearch',
    value: function sendOneWireAlarmsSearch() {
      throw new Error('sendOneWireAlarmsSearch is not supported on the Raspberry Pi');
    }
  }, {
    key: 'sendOneWireRead',
    value: function sendOneWireRead() {
      throw new Error('sendOneWireRead is not supported on the Raspberry Pi');
    }
  }, {
    key: 'sendOneWireReset',
    value: function sendOneWireReset() {
      throw new Error('sendOneWireConfig is not supported on the Raspberry Pi');
    }
  }, {
    key: 'sendOneWireWrite',
    value: function sendOneWireWrite() {
      throw new Error('sendOneWireWrite is not supported on the Raspberry Pi');
    }
  }, {
    key: 'sendOneWireDelay',
    value: function sendOneWireDelay() {
      throw new Error('sendOneWireDelay is not supported on the Raspberry Pi');
    }
  }, {
    key: 'sendOneWireWriteAndRead',
    value: function sendOneWireWriteAndRead() {
      throw new Error('sendOneWireWriteAndRead is not supported on the Raspberry Pi');
    }
  }, {
    key: 'setSamplingInterval',
    value: function setSamplingInterval() {
      throw new Error('setSamplingInterval is not yet implemented');
    }
  }, {
    key: 'reportAnalogPin',
    value: function reportAnalogPin() {
      throw new Error('reportAnalogPin is not yet implemented');
    }
  }, {
    key: 'reportDigitalPin',
    value: function reportDigitalPin() {
      throw new Error('reportDigitalPin is not yet implemented');
    }
  }, {
    key: 'pingRead',
    value: function pingRead() {
      throw new Error('pingRead is not yet implemented');
    }
  }, {
    key: 'pulseIn',
    value: function pulseIn() {
      throw new Error('pulseIn is not yet implemented');
    }
  }, {
    key: 'stepperConfig',
    value: function stepperConfig() {
      throw new Error('stepperConfig is not yet implemented');
    }
  }, {
    key: 'stepperStep',
    value: function stepperStep() {
      throw new Error('stepperStep is not yet implemented');
    }
  }]);

  return Raspi;
}(_events.EventEmitter);

Object.defineProperty(Raspi, 'isRaspberryPi', {
  enumerable: true,
  value: function value() {
    // Determining if a system is a Raspberry Pi isn't possible through
    // the os module on Raspbian, so we read it from the file system instead
    var isRaspberryPi = false;
    try {
      isRaspberryPi = _fs2.default.readFileSync('/etc/os-release').toString().indexOf('Raspbian') !== -1;
    } catch (e) {} // Squash file not found, etc errors
    return isRaspberryPi;
  }
});

module.exports = Raspi;

//# sourceMappingURL=data:application/json;base64,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QUFJLEtBQUosQ0FBVSw0Q0FBVixDQUFOLENBRG9COzs7O3NDQUlKO0FBQ2hCLFlBQU0sSUFBSSxLQUFKLENBQVUsd0NBQVYsQ0FBTixDQURnQjs7Ozt1Q0FJQztBQUNqQixZQUFNLElBQUksS0FBSixDQUFVLHlDQUFWLENBQU4sQ0FEaUI7Ozs7K0JBSVI7QUFDVCxZQUFNLElBQUksS0FBSixDQUFVLGlDQUFWLENBQU4sQ0FEUzs7Ozs4QkFJRDtBQUNSLFlBQU0sSUFBSSxLQUFKLENBQVUsZ0NBQVYsQ0FBTixDQURROzs7O29DQUlNO0FBQ2QsWUFBTSxJQUFJLEtBQUosQ0FBVSxzQ0FBVixDQUFOLENBRGM7Ozs7a0NBSUY7QUFDWixZQUFNLElBQUksS0FBSixDQUFVLG9DQUFWLENBQU4sQ0FEWTs7OztTQXZ1QlY7OztBQTR1Qk4sT0FBTyxjQUFQLENBQXNCLEtBQXRCLEVBQTZCLGVBQTdCLEVBQThDO0FBQzVDLGNBQVksSUFBWjtBQUNBLFNBQU8saUJBQU07OztBQUdYLFFBQUksZ0JBQWdCLEtBQWhCLENBSE87QUFJWCxRQUFJO0FBQ0Ysc0JBQWdCLGFBQUcsWUFBSCxDQUFnQixpQkFBaEIsRUFBbUMsUUFBbkMsR0FBOEMsT0FBOUMsQ0FBc0QsVUFBdEQsTUFBc0UsQ0FBQyxDQUFELENBRHBGO0tBQUosQ0FFRSxPQUFPLENBQVAsRUFBVSxFQUFWO0FBTlMsV0FPSixhQUFQLENBUFc7R0FBTjtDQUZUOztBQWFBLE9BQU8sT0FBUCxHQUFpQixLQUFqQiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgKGMpIDIwMTQgQnJ5YW4gSHVnaGVzIDxicnlhbkB0aGVvcmV0aWNhbGlkZWF0aW9ucy5jb20+XG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uXG5vYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvblxuZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dFxucmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsXG5jb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlXG5Tb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZ1xuY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFU1xuT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbk5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUXG5IT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSxcbldIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lOR1xuRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUlxuT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBpbml0IH0gZnJvbSAncmFzcGknO1xuaW1wb3J0IHsgZ2V0UGlucywgZ2V0UGluTnVtYmVyIH0gZnJvbSAncmFzcGktYm9hcmQnO1xuaW1wb3J0IHsgUFVMTF9OT05FLCBQVUxMX1VQLCBQVUxMX0RPV04sIERpZ2l0YWxPdXRwdXQsIERpZ2l0YWxJbnB1dCB9IGZyb20gJ3Jhc3BpLWdwaW8nO1xuaW1wb3J0IHsgUFdNIH0gZnJvbSAncmFzcGktcHdtJztcbmltcG9ydCB7IEkyQyB9IGZyb20gJ3Jhc3BpLWkyYyc7XG5pbXBvcnQgeyBMRUQgfSBmcm9tICdyYXNwaS1sZWQnO1xuaW1wb3J0IHsgU2VyaWFsLCBERUZBVUxUX1BPUlQgfSBmcm9tICdyYXNwaS1zZXJpYWwnO1xuXG4vLyBDb25zdGFudHNcbmNvbnN0IElOUFVUX01PREUgPSAwO1xuY29uc3QgT1VUUFVUX01PREUgPSAxO1xuY29uc3QgQU5BTE9HX01PREUgPSAyO1xuY29uc3QgUFdNX01PREUgPSAzO1xuY29uc3QgU0VSVk9fTU9ERSA9IDQ7XG5jb25zdCBVTktOT1dOX01PREUgPSA5OTtcblxuY29uc3QgTE9XID0gMDtcbmNvbnN0IEhJR0ggPSAxO1xuXG5jb25zdCBMRURfUElOID0gLTE7XG5cbi8vIFNldHRpbmdzXG5jb25zdCBERUZBVUxUX1NFUlZPX01JTiA9IDEwMDA7XG5jb25zdCBERUZBVUxUX1NFUlZPX01BWCA9IDIwMDA7XG5jb25zdCBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUgPSAxOTtcblxuLy8gUHJpdmF0ZSBzeW1ib2xzXG5jb25zdCBpc1JlYWR5ID0gU3ltYm9sKCdpc1JlYWR5Jyk7XG5jb25zdCBwaW5zID0gU3ltYm9sKCdwaW5zJyk7XG5jb25zdCBpbnN0YW5jZXMgPSBTeW1ib2woJ2luc3RhbmNlcycpO1xuY29uc3QgYW5hbG9nUGlucyA9IFN5bWJvbCgnYW5hbG9nUGlucycpO1xuY29uc3QgZ2V0UGluSW5zdGFuY2UgPSBTeW1ib2woJ2dldFBpbkluc3RhbmNlJyk7XG5jb25zdCBpMmMgPSBTeW1ib2woJ2kyYycpO1xuY29uc3QgaTJjRGVsYXkgPSBTeW1ib2woJ2kyY0RlbGF5Jyk7XG5jb25zdCBpMmNSZWFkID0gU3ltYm9sKCdpMmNSZWFkJyk7XG5jb25zdCBpMmNDaGVja0FsaXZlID0gU3ltYm9sKCdpMmNDaGVja0FsaXZlJyk7XG5jb25zdCBwaW5Nb2RlID0gU3ltYm9sKCdwaW5Nb2RlJyk7XG5jb25zdCBzZXJpYWwgPSBTeW1ib2woJ3NlcmlhbCcpO1xuY29uc3Qgc2VyaWFsUXVldWUgPSBTeW1ib2woJ3NlcmlhbFF1ZXVlJyk7XG5jb25zdCBhZGRUb1NlcmlhbFF1ZXVlID0gU3ltYm9sKCdhZGRUb1NlcmlhbFF1ZXVlJyk7XG5jb25zdCBzZXJpYWxQdW1wID0gU3ltYm9sKCdzZXJpYWxQdW1wJyk7XG5jb25zdCBpc1NlcmlhbFByb2Nlc3NpbmcgPSBTeW1ib2woJ2lzU2VyaWFsUHJvY2Vzc2luZycpO1xuY29uc3QgaXNTZXJpYWxPcGVuID0gU3ltYm9sKCdpc1NlcmlhbE9wZW4nKTtcblxuY29uc3QgU0VSSUFMX0FDVElPTl9XUklURSA9ICdTRVJJQUxfQUNUSU9OX1dSSVRFJztcbmNvbnN0IFNFUklBTF9BQ1RJT05fQ0xPU0UgPSAnU0VSSUFMX0FDVElPTl9DTE9TRSc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX0ZMVVNIID0gJ1NFUklBTF9BQ1RJT05fRkxVU0gnO1xuY29uc3QgU0VSSUFMX0FDVElPTl9DT05GSUcgPSAnU0VSSUFMX0FDVElPTl9DT05GSUcnO1xuY29uc3QgU0VSSUFMX0FDVElPTl9SRUFEID0gJ1NFUklBTF9BQ1RJT05fUkVBRCc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX1NUT1AgPSAnU0VSSUFMX0FDVElPTl9TVE9QJztcblxuZnVuY3Rpb24gYnVmZmVyVG9BcnJheShidWZmZXIpIHtcbiAgY29uc3QgYXJyYXkgPSBBcnJheShidWZmZXIubGVuZ3RoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpKyspIHtcbiAgICBhcnJheVtpXSA9IGJ1ZmZlcltpXTtcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbmNsYXNzIFJhc3BpIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuICBjb25zdHJ1Y3Rvcih7IGluY2x1ZGVQaW5zLCBleGNsdWRlUGlucyB9ID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgbmFtZToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogJ1Jhc3BiZXJyeVBpLUlPJ1xuICAgICAgfSxcblxuICAgICAgW2luc3RhbmNlc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcblxuICAgICAgW2lzUmVhZHldOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG4gICAgICBpc1JlYWR5OiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1tpc1JlYWR5XTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW3BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBwaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1twaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2FuYWxvZ1BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBhbmFsb2dQaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1thbmFsb2dQaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2kyY106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBuZXcgSTJDKClcbiAgICAgIH0sXG5cbiAgICAgIFtpMmNEZWxheV06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiAwXG4gICAgICB9LFxuXG4gICAgICBbc2VyaWFsXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IG5ldyBTZXJpYWwoKVxuICAgICAgfSxcblxuICAgICAgW3NlcmlhbFF1ZXVlXToge1xuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG5cbiAgICAgIFtpc1NlcmlhbFByb2Nlc3NpbmddOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG5cbiAgICAgIFtpc1NlcmlhbE9wZW5dOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG5cbiAgICAgIE1PREVTOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICBJTlBVVDogSU5QVVRfTU9ERSxcbiAgICAgICAgICBPVVRQVVQ6IE9VVFBVVF9NT0RFLFxuICAgICAgICAgIEFOQUxPRzogQU5BTE9HX01PREUsXG4gICAgICAgICAgUFdNOiBQV01fTU9ERSxcbiAgICAgICAgICBTRVJWTzogU0VSVk9fTU9ERVxuICAgICAgICB9KVxuICAgICAgfSxcblxuICAgICAgSElHSDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogSElHSFxuICAgICAgfSxcbiAgICAgIExPVzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTE9XXG4gICAgICB9LFxuXG4gICAgICBkZWZhdWx0TGVkOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBMRURfUElOXG4gICAgICB9LFxuXG4gICAgICBTRVJJQUxfUE9SVF9JRHM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgIEhXX1NFUklBTDA6IERFRkFVTFRfUE9SVCxcbiAgICAgICAgICBERUZBVUxUOiBERUZBVUxUX1BPUlRcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGluaXQoKCkgPT4ge1xuICAgICAgbGV0IHBpbk1hcHBpbmdzID0gZ2V0UGlucygpO1xuICAgICAgdGhpc1twaW5zXSA9IFtdO1xuXG4gICAgICAvLyBTbGlnaHQgaGFjayB0byBnZXQgdGhlIExFRCBpbiB0aGVyZSwgc2luY2UgaXQncyBub3QgYWN0dWFsbHkgYSBwaW5cbiAgICAgIHBpbk1hcHBpbmdzW0xFRF9QSU5dID0ge1xuICAgICAgICBwaW5zOiBbIExFRF9QSU4gXSxcbiAgICAgICAgcGVyaXBoZXJhbHM6IFsgJ2dwaW8nIF1cbiAgICAgIH07XG5cbiAgICAgIGlmIChpbmNsdWRlUGlucyAmJiBleGNsdWRlUGlucykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wiaW5jbHVkZVBpbnNcIiBhbmQgXCJleGNsdWRlUGluc1wiIGNhbm5vdCBiZSBzcGVjaWZpZWQgYXQgdGhlIHNhbWUgdGltZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShpbmNsdWRlUGlucykpIHtcbiAgICAgICAgY29uc3QgbmV3UGluTWFwcGluZ3MgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBwaW4gb2YgaW5jbHVkZVBpbnMpIHtcbiAgICAgICAgICBjb25zdCBub3JtYWxpemVkUGluID0gZ2V0UGluTnVtYmVyKHBpbik7XG4gICAgICAgICAgaWYgKG5vcm1hbGl6ZWRQaW4gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwaW4gXCIke3Bpbn1cIiBzcGVjaWZpZWQgaW4gaW5jbHVkZVBpbnNgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbmV3UGluTWFwcGluZ3Nbbm9ybWFsaXplZFBpbl0gPSBwaW5NYXBwaW5nc1tub3JtYWxpemVkUGluXTtcbiAgICAgICAgfVxuICAgICAgICBwaW5NYXBwaW5ncyA9IG5ld1Bpbk1hcHBpbmdzO1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGV4Y2x1ZGVQaW5zKSkge1xuICAgICAgICBwaW5NYXBwaW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIHBpbk1hcHBpbmdzKTtcbiAgICAgICAgZm9yIChjb25zdCBwaW4gb2YgZXhjbHVkZVBpbnMpIHtcbiAgICAgICAgICBjb25zdCBub3JtYWxpemVkUGluID0gZ2V0UGluTnVtYmVyKHBpbik7XG4gICAgICAgICAgaWYgKG5vcm1hbGl6ZWRQaW4gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwaW4gXCIke3Bpbn1cIiBzcGVjaWZpZWQgaW4gZXhjbHVkZVBpbnNgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVsZXRlIHBpbk1hcHBpbmdzW25vcm1hbGl6ZWRQaW5dO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5rZXlzKHBpbk1hcHBpbmdzKS5mb3JFYWNoKChwaW4pID0+IHtcbiAgICAgICAgY29uc3QgcGluSW5mbyA9IHBpbk1hcHBpbmdzW3Bpbl07XG4gICAgICAgIGNvbnN0IHN1cHBvcnRlZE1vZGVzID0gW107XG4gICAgICAgIC8vIFdlIGRvbid0IHdhbnQgSTJDIHRvIGJlIHVzZWQgZm9yIGFueXRoaW5nIGVsc2UsIHNpbmNlIGNoYW5naW5nIHRoZVxuICAgICAgICAvLyBwaW4gbW9kZSBtYWtlcyBpdCB1bmFibGUgdG8gZXZlciBkbyBJMkMgYWdhaW4uXG4gICAgICAgIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ2kyYycpID09IC0xICYmIHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZigndWFydCcpID09IC0xKSB7XG4gICAgICAgICAgaWYgKHBpbiA9PSBMRURfUElOKSB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlcy5wdXNoKE9VVFBVVF9NT0RFKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZignZ3BpbycpICE9IC0xKSB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlcy5wdXNoKElOUFVUX01PREUsIE9VVFBVVF9NT0RFKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZigncHdtJykgIT0gLTEpIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goUFdNX01PREUsIFNFUlZPX01PREUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnN0YW5jZSA9IHRoaXNbaW5zdGFuY2VzXVtwaW5dID0ge1xuICAgICAgICAgIHBlcmlwaGVyYWw6IG51bGwsXG4gICAgICAgICAgbW9kZTogc3VwcG9ydGVkTW9kZXMuaW5kZXhPZihPVVRQVVRfTU9ERSkgPT0gLTEgPyBVTktOT1dOX01PREUgOiBPVVRQVVRfTU9ERSxcblxuICAgICAgICAgIC8vIFVzZWQgdG8gY2FjaGUgdGhlIHByZXZpb3VzbHkgd3JpdHRlbiB2YWx1ZSBmb3IgcmVhZGluZyBiYWNrIGluIE9VVFBVVCBtb2RlXG4gICAgICAgICAgcHJldmlvdXNXcml0dGVuVmFsdWU6IExPVyxcblxuICAgICAgICAgIC8vIFVzZWQgdG8gc2V0IHRoZSBkZWZhdWx0IG1pbiBhbmQgbWF4IHZhbHVlc1xuICAgICAgICAgIG1pbjogREVGQVVMVF9TRVJWT19NSU4sXG4gICAgICAgICAgbWF4OiBERUZBVUxUX1NFUlZPX01BWFxuICAgICAgICB9O1xuICAgICAgICB0aGlzW3BpbnNdW3Bpbl0gPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICBzdXBwb3J0ZWRNb2Rlczoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHN1cHBvcnRlZE1vZGVzKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLm1vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgc3dpdGNoIChpbnN0YW5jZS5tb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBJTlBVVF9NT0RFOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnBlcmlwaGVyYWwucmVhZCgpO1xuICAgICAgICAgICAgICAgIGNhc2UgT1VUUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0KHZhbHVlKSB7XG4gICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5tb2RlID09IE9VVFBVVF9NT0RFKSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlcG9ydDoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhbmFsb2dDaGFubmVsOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IDEyN1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpbnN0YW5jZS5tb2RlID09IE9VVFBVVF9NT0RFKSB7XG4gICAgICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgT1VUUFVUX01PREUpO1xuICAgICAgICAgIHRoaXMuZGlnaXRhbFdyaXRlKHBpbiwgTE9XKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEZpbGwgaW4gdGhlIGhvbGVzLCBzaW5zIHBpbnMgYXJlIHNwYXJzZSBvbiB0aGUgQSsvQisvMlxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzW3BpbnNdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghdGhpc1twaW5zXVtpXSkge1xuICAgICAgICAgIHRoaXNbcGluc11baV0gPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKFtdKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZGU6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBVTktOT1dOX01PREU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHNldCgpIHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVwb3J0OiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYW5hbG9nQ2hhbm5lbDoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogMTI3XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXJpYWxDb25maWcoe1xuICAgICAgICBwb3J0SWQ6IERFRkFVTFRfUE9SVCxcbiAgICAgICAgYmF1ZDogOTYwMFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXNbaXNSZWFkeV0gPSB0cnVlO1xuICAgICAgdGhpcy5lbWl0KCdyZWFkeScpO1xuICAgICAgdGhpcy5lbWl0KCdjb25uZWN0Jyk7XG4gICAgfSk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Jlc2V0IGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgbm9ybWFsaXplKHBpbikge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSBnZXRQaW5OdW1iZXIocGluKTtcbiAgICBpZiAodHlwZW9mIG5vcm1hbGl6ZWRQaW4gIT09ICdudW1iZXInKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcGluIFwiJHtwaW59XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRQaW47XG4gIH1cblxuICBbZ2V0UGluSW5zdGFuY2VdKHBpbikge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl07XG4gICAgaWYgKCFwaW5JbnN0YW5jZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHBpbiBcIiR7cGlufVwiYCk7XG4gICAgfVxuICAgIHJldHVybiBwaW5JbnN0YW5jZTtcbiAgfVxuXG4gIHBpbk1vZGUocGluLCBtb2RlKSB7XG4gICAgdGhpc1twaW5Nb2RlXSh7IHBpbiwgbW9kZSB9KTtcbiAgfVxuXG4gIFtwaW5Nb2RlXSh7IHBpbiwgbW9kZSwgcHVsbFJlc2lzdG9yID0gUFVMTF9OT05FIH0pIHtcbiAgICBjb25zdCBub3JtYWxpemVkUGluID0gdGhpcy5ub3JtYWxpemUocGluKTtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKG5vcm1hbGl6ZWRQaW4pO1xuICAgIHBpbkluc3RhbmNlLnB1bGxSZXNpc3RvciA9IHB1bGxSZXNpc3RvcjtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICBwaW46IG5vcm1hbGl6ZWRQaW4sXG4gICAgICBwdWxsUmVzaXN0b3I6IHBpbkluc3RhbmNlLnB1bGxSZXNpc3RvclxuICAgIH07XG4gICAgaWYgKHRoaXNbcGluc11bbm9ybWFsaXplZFBpbl0uc3VwcG9ydGVkTW9kZXMuaW5kZXhPZihtb2RlKSA9PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQaW4gXCIke3Bpbn1cIiBkb2VzIG5vdCBzdXBwb3J0IG1vZGUgXCIke21vZGV9XCJgKTtcbiAgICB9XG4gICAgaWYgKHBpbiA9PSBMRURfUElOKSB7XG4gICAgICBpZiAocGluSW5zdGFuY2UucGVyaXBoZXJhbCBpbnN0YW5jZW9mIExFRCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IExFRCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKG1vZGUpIHtcbiAgICAgICAgY2FzZSBJTlBVVF9NT0RFOlxuICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbElucHV0KGNvbmZpZyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgT1VUUFVUX01PREU6XG4gICAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBEaWdpdGFsT3V0cHV0KGNvbmZpZyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUFdNX01PREU6XG4gICAgICAgIGNhc2UgU0VSVk9fTU9ERTpcbiAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IFBXTShub3JtYWxpemVkUGluKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb25zb2xlLndhcm4oYFVua25vd24gcGluIG1vZGU6ICR7bW9kZX1gKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcGluSW5zdGFuY2UubW9kZSA9IG1vZGU7XG4gIH1cblxuICBhbmFsb2dSZWFkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignYW5hbG9nUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIGFuYWxvZ1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICB0aGlzLnB3bVdyaXRlKHBpbiwgdmFsdWUpO1xuICB9XG5cbiAgcHdtV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gUFdNX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIFBXTV9NT0RFKTtcbiAgICB9XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZShNYXRoLnJvdW5kKHZhbHVlICogcGluSW5zdGFuY2UucGVyaXBoZXJhbC5yYW5nZSAvIDI1NSkpO1xuICB9XG5cbiAgZGlnaXRhbFJlYWQocGluLCBoYW5kbGVyKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBJTlBVVF9NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBJTlBVVF9NT0RFKTtcbiAgICB9XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBsZXQgdmFsdWU7XG4gICAgICBpZiAocGluSW5zdGFuY2UubW9kZSA9PSBJTlBVVF9NT0RFKSB7XG4gICAgICAgIHZhbHVlID0gcGluSW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgICAgaGFuZGxlcih2YWx1ZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoYGRpZ2l0YWwtcmVhZC0ke3Bpbn1gLCB2YWx1ZSk7XG4gICAgfSwgRElHSVRBTF9SRUFEX1VQREFURV9SQVRFKTtcbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLm9uKCdkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpZ2l0YWxXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSA9PT0gSU5QVVRfTU9ERSAmJiB2YWx1ZSA9PT0gSElHSCkge1xuICAgICAgdGhpc1twaW5Nb2RlXSh7IHBpbiwgbW9kZTogSU5QVVRfTU9ERSwgcHVsbFJlc2lzdG9yOiBQVUxMX1VQIH0pO1xuICAgIH0gZWxzZSBpZiAocGluSW5zdGFuY2UubW9kZSA9PT0gSU5QVVRfTU9ERSAmJiB2YWx1ZSA9PT0gTE9XKSB7XG4gICAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlOiBJTlBVVF9NT0RFLCBwdWxsUmVzaXN0b3I6IFBVTExfRE9XTiB9KTtcbiAgICB9IGVsc2UgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gT1VUUFVUX01PREUpIHtcbiAgICAgIHRoaXNbcGluTW9kZV0oeyBwaW4sIG1vZGU6IE9VVFBVVF9NT0RFIH0pO1xuICAgIH1cbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSA9PT0gT1VUUFVUX01PREUgJiYgdmFsdWUgIT0gcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWUpIHtcbiAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUodmFsdWUgPyBISUdIIDogTE9XKTtcbiAgICAgIHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgc2Vydm9Db25maWcocGluLCBtaW4sIG1heCkge1xuICAgIGxldCBjb25maWcgPSBwaW47XG4gICAgaWYgKHR5cGVvZiBjb25maWcgIT09ICdvYmplY3QnKSB7XG4gICAgICBjb25maWcgPSB7IHBpbiwgbWluLCBtYXggfTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb25maWcubWluICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uZmlnLm1pbiA9IERFRkFVTFRfU0VSVk9fTUlOO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNvbmZpZy5tYXggIT09ICdudW1iZXInKSB7XG4gICAgICBjb25maWcubWF4ID0gREVGQVVMVF9TRVJWT19NQVg7XG4gICAgfVxuICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSB0aGlzLm5vcm1hbGl6ZShwaW4pO1xuICAgIHRoaXNbcGluTW9kZV0oe1xuICAgICAgcGluOiBub3JtYWxpemVkUGluLFxuICAgICAgbW9kZTogU0VSVk9fTU9ERVxuICAgIH0pO1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUobm9ybWFsaXplZFBpbikpO1xuICAgIHBpbkluc3RhbmNlLm1pbiA9IGNvbmZpZy5taW47XG4gICAgcGluSW5zdGFuY2UubWF4ID0gY29uZmlnLm1heDtcbiAgfVxuXG4gIHNlcnZvV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gU0VSVk9fTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgU0VSVk9fTU9ERSk7XG4gICAgfVxuICAgIGNvbnN0IGR1dHlDeWNsZSA9IChwaW5JbnN0YW5jZS5taW4gKyAodmFsdWUgLyAxODApICogKHBpbkluc3RhbmNlLm1heCAtIHBpbkluc3RhbmNlLm1pbikpIC8gMjAwMDA7XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZShkdXR5Q3ljbGUgKiBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJhbmdlKTtcbiAgfVxuXG4gIHF1ZXJ5Q2FwYWJpbGl0aWVzKGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHF1ZXJ5QW5hbG9nTWFwcGluZyhjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBxdWVyeVBpblN0YXRlKHBpbiwgY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgW2kyY0NoZWNrQWxpdmVdKCkge1xuICAgIGlmICghdGhpc1tpMmNdLmFsaXZlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0kyQyBwaW5zIG5vdCBpbiBJMkMgbW9kZScpO1xuICAgIH1cbiAgfVxuXG4gIGkyY0NvbmZpZyhvcHRpb25zKSB7XG4gICAgbGV0IGRlbGF5O1xuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnbnVtYmVyJykge1xuICAgICAgZGVsYXkgPSBvcHRpb25zO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIG9wdGlvbnMgIT09IG51bGwpIHtcbiAgICAgICAgZGVsYXkgPSBvcHRpb25zLmRlbGF5O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIHRoaXNbaTJjRGVsYXldID0gTWF0aC5yb3VuZCgoZGVsYXkgfHwgMCkgLyAxMDAwKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaTJjV3JpdGUoYWRkcmVzcywgY21kUmVnT3JEYXRhLCBpbkJ5dGVzKSB7XG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgLy8gSWYgaTJjV3JpdGUgd2FzIHVzZWQgZm9yIGFuIGkyY1dyaXRlUmVnIGNhbGwuLi5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMyAmJlxuICAgICAgICAhQXJyYXkuaXNBcnJheShjbWRSZWdPckRhdGEpICYmXG4gICAgICAgICFBcnJheS5pc0FycmF5KGluQnl0ZXMpKSB7XG4gICAgICByZXR1cm4gdGhpcy5pMmNXcml0ZVJlZyhhZGRyZXNzLCBjbWRSZWdPckRhdGEsIGluQnl0ZXMpO1xuICAgIH1cblxuICAgIC8vIEZpeCBhcmd1bWVudHMgaWYgY2FsbGVkIHdpdGggRmlybWF0YS5qcyBBUElcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY21kUmVnT3JEYXRhKSkge1xuICAgICAgICBpbkJ5dGVzID0gY21kUmVnT3JEYXRhLnNsaWNlKCk7XG4gICAgICAgIGNtZFJlZ09yRGF0YSA9IGluQnl0ZXMuc2hpZnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluQnl0ZXMgPSBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKFtjbWRSZWdPckRhdGFdLmNvbmNhdChpbkJ5dGVzKSk7XG5cbiAgICAvLyBPbmx5IHdyaXRlIGlmIGJ5dGVzIHByb3ZpZGVkXG4gICAgaWYgKGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgIHRoaXNbaTJjXS53cml0ZVN5bmMoYWRkcmVzcywgYnVmZmVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGkyY1dyaXRlUmVnKGFkZHJlc3MsIHJlZ2lzdGVyLCB2YWx1ZSkge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIHRoaXNbaTJjXS53cml0ZUJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCB2YWx1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIFtpMmNSZWFkXShjb250aW51b3VzLCBhZGRyZXNzLCByZWdpc3RlciwgYnl0ZXNUb1JlYWQsIGNhbGxiYWNrKSB7XG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgLy8gRml4IGFyZ3VtZW50cyBpZiBjYWxsZWQgd2l0aCBGaXJtYXRhLmpzIEFQSVxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDQgJiZcbiAgICAgIHR5cGVvZiByZWdpc3RlciA9PSAnbnVtYmVyJyAmJlxuICAgICAgdHlwZW9mIGJ5dGVzVG9SZWFkID09ICdmdW5jdGlvbidcbiAgICApIHtcbiAgICAgIGNhbGxiYWNrID0gYnl0ZXNUb1JlYWQ7XG4gICAgICBieXRlc1RvUmVhZCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSBudWxsO1xuICAgIH1cblxuICAgIGNhbGxiYWNrID0gdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nID8gY2FsbGJhY2sgOiAoKSA9PiB7fTtcblxuICAgIGxldCBldmVudCA9IGBpMmMtcmVwbHktJHthZGRyZXNzfS1gO1xuICAgIGV2ZW50ICs9IHJlZ2lzdGVyICE9PSBudWxsID8gcmVnaXN0ZXIgOiAwO1xuXG4gICAgY29uc3QgcmVhZCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGFmdGVyUmVhZCA9IChlcnIsIGJ1ZmZlcikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29udmVydCBidWZmZXIgdG8gQXJyYXkgYmVmb3JlIGVtaXRcbiAgICAgICAgdGhpcy5lbWl0KGV2ZW50LCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChidWZmZXIpKTtcblxuICAgICAgICBpZiAoY29udGludW91cykge1xuICAgICAgICAgIHNldFRpbWVvdXQocmVhZCwgdGhpc1tpMmNEZWxheV0pO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLm9uY2UoZXZlbnQsIGNhbGxiYWNrKTtcblxuICAgICAgaWYgKHJlZ2lzdGVyICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXNbaTJjXS5yZWFkKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlc1RvUmVhZCwgYWZ0ZXJSZWFkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXNbaTJjXS5yZWFkKGFkZHJlc3MsIGJ5dGVzVG9SZWFkLCBhZnRlclJlYWQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBzZXRUaW1lb3V0KHJlYWQsIHRoaXNbaTJjRGVsYXldKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaTJjUmVhZCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXNbaTJjUmVhZF0odHJ1ZSwgLi4ucmVzdCk7XG4gIH1cblxuICBpMmNSZWFkT25jZSguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXNbaTJjUmVhZF0oZmFsc2UsIC4uLnJlc3QpO1xuICB9XG5cbiAgc2VuZEkyQ0NvbmZpZyguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjQ29uZmlnKC4uLnJlc3QpO1xuICB9XG5cbiAgc2VuZEkyQ1dyaXRlUmVxdWVzdCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjV3JpdGUoLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDUmVhZFJlcXVlc3QoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzLmkyY1JlYWRPbmNlKC4uLnJlc3QpO1xuICB9XG5cbiAgc2VyaWFsQ29uZmlnKHsgcG9ydElkLCBiYXVkIH0pIHtcbiAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSB8fCAoYmF1ZCAmJiBiYXVkICE9PSB0aGlzW3NlcmlhbF0uYmF1ZFJhdGUpKSB7XG4gICAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgICAgdHlwZTogU0VSSUFMX0FDVElPTl9DT05GSUcsXG4gICAgICAgIHBvcnRJZCxcbiAgICAgICAgYmF1ZFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgc2VyaWFsV3JpdGUocG9ydElkLCBpbkJ5dGVzKSB7XG4gICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX1dSSVRFLFxuICAgICAgcG9ydElkLFxuICAgICAgaW5CeXRlc1xuICAgIH0pO1xuICB9XG5cbiAgc2VyaWFsUmVhZChwb3J0SWQsIG1heEJ5dGVzVG9SZWFkLCBoYW5kbGVyKSB7XG4gICAgaWYgKHR5cGVvZiBtYXhCeXRlc1RvUmVhZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaGFuZGxlciA9IG1heEJ5dGVzVG9SZWFkO1xuICAgICAgbWF4Qnl0ZXNUb1JlYWQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgdHlwZTogU0VSSUFMX0FDVElPTl9SRUFELFxuICAgICAgcG9ydElkLFxuICAgICAgbWF4Qnl0ZXNUb1JlYWQsXG4gICAgICBoYW5kbGVyXG4gICAgfSk7XG4gIH1cblxuICBzZXJpYWxTdG9wKHBvcnRJZCkge1xuICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgdHlwZTogU0VSSUFMX0FDVElPTl9TVE9QLFxuICAgICAgcG9ydElkXG4gICAgfSk7XG4gIH1cblxuICBzZXJpYWxDbG9zZShwb3J0SWQpIHtcbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fQ0xPU0UsXG4gICAgICBwb3J0SWRcbiAgICB9KTtcbiAgfVxuXG4gIHNlcmlhbEZsdXNoKHBvcnRJZCkge1xuICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgdHlwZTogU0VSSUFMX0FDVElPTl9GTFVTSCxcbiAgICAgIHBvcnRJZFxuICAgIH0pO1xuICB9XG5cbiAgW2FkZFRvU2VyaWFsUXVldWVdKGFjdGlvbikge1xuICAgIGlmIChhY3Rpb24ucG9ydElkICE9PSBERUZBVUxUX1BPUlQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBzZXJpYWwgcG9ydCBcIiR7cG9ydElkfVwiYCk7XG4gICAgfVxuICAgIHRoaXNbc2VyaWFsUXVldWVdLnB1c2goYWN0aW9uKTtcbiAgICB0aGlzW3NlcmlhbFB1bXBdKCk7XG4gIH1cblxuICBbc2VyaWFsUHVtcF0oKSB7XG4gICAgaWYgKHRoaXNbaXNTZXJpYWxQcm9jZXNzaW5nXSB8fCAhdGhpc1tzZXJpYWxRdWV1ZV0ubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXNbaXNTZXJpYWxQcm9jZXNzaW5nXSA9IHRydWU7XG4gICAgY29uc3QgYWN0aW9uID0gdGhpc1tzZXJpYWxRdWV1ZV0uc2hpZnQoKTtcbiAgICBjb25zdCBmaW5hbGl6ZSA9ICgpID0+IHtcbiAgICAgIHRoaXNbaXNTZXJpYWxQcm9jZXNzaW5nXSA9IGZhbHNlO1xuICAgICAgdGhpc1tzZXJpYWxQdW1wXSgpO1xuICAgIH07XG4gICAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX1dSSVRFOlxuICAgICAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHdyaXRlIHRvIGNsb3NlZCBzZXJpYWwgcG9ydCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXNbc2VyaWFsXS53cml0ZShhY3Rpb24uaW5CeXRlcywgZmluYWxpemUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX1JFQUQ6XG4gICAgICAgIGlmICghdGhpc1tpc1NlcmlhbE9wZW5dKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgcmVhZCBmcm9tIGNsb3NlZCBzZXJpYWwgcG9ydCcpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE86IGFkZCBzdXBwb3J0IGZvciBhY3Rpb24ubWF4Qnl0ZXNUb1JlYWRcbiAgICAgICAgdGhpc1tzZXJpYWxdLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICBhY3Rpb24uaGFuZGxlcihidWZmZXJUb0FycmF5KGRhdGEpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soZmluYWxpemUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX1NUT1A6XG4gICAgICAgIGlmICghdGhpc1tpc1NlcmlhbE9wZW5dKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc3RvcCBjbG9zZWQgc2VyaWFsIHBvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzW3NlcmlhbF0ucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soZmluYWxpemUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX0NPTkZJRzpcbiAgICAgICAgdGhpc1tzZXJpYWxdLmNsb3NlKCgpID0+IHtcbiAgICAgICAgICB0aGlzW3NlcmlhbF0gPSBuZXcgU2VyaWFsKHtcbiAgICAgICAgICAgIGJhdWRSYXRlOiBhY3Rpb24uYmF1ZFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXNbc2VyaWFsXS5vcGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXNbc2VyaWFsXS5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuZW1pdChgc2VyaWFsLWRhdGEtJHthY3Rpb24ucG9ydElkfWAsIGJ1ZmZlclRvQXJyYXkoZGF0YSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzW2lzU2VyaWFsT3Blbl0gPSB0cnVlO1xuICAgICAgICAgICAgZmluYWxpemUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fQ0xPU0U6XG4gICAgICAgIHRoaXNbc2VyaWFsXS5jbG9zZSgoKSA9PiB7XG4gICAgICAgICAgdGhpc1tpc1NlcmlhbE9wZW5dID0gZmFsc2U7XG4gICAgICAgICAgZmluYWxpemUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fRkxVU0g6XG4gICAgICAgIGlmICghdGhpc1tpc1NlcmlhbE9wZW5dKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmx1c2ggY2xvc2VkIHNlcmlhbCBwb3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpc1tzZXJpYWxdLmZsdXNoKGZpbmFsaXplKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW50ZXJuYWwgZXJyb3I6IHVua25vd24gc2VyaWFsIGFjdGlvbiB0eXBlJyk7XG4gICAgfVxuICB9XG5cbiAgc2VuZE9uZVdpcmVDb25maWcoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZUNvbmZpZyBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlU2VhcmNoKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVTZWFyY2ggaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZUFsYXJtc1NlYXJjaCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlQWxhcm1zU2VhcmNoIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVSZWFkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVSZWFkIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVSZXNldCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlQ29uZmlnIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlV3JpdGUgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZURlbGF5KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVEZWxheSBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlV3JpdGVBbmRSZWFkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZXRTYW1wbGluZ0ludGVydmFsKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0U2FtcGxpbmdJbnRlcnZhbCBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICByZXBvcnRBbmFsb2dQaW4oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZXBvcnRBbmFsb2dQaW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcmVwb3J0RGlnaXRhbFBpbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlcG9ydERpZ2l0YWxQaW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcGluZ1JlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwaW5nUmVhZCBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBwdWxzZUluKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHVsc2VJbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBzdGVwcGVyQ29uZmlnKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc3RlcHBlckNvbmZpZyBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBzdGVwcGVyU3RlcCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0ZXBwZXJTdGVwIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoUmFzcGksICdpc1Jhc3BiZXJyeVBpJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICB2YWx1ZTogKCkgPT4ge1xuICAgIC8vIERldGVybWluaW5nIGlmIGEgc3lzdGVtIGlzIGEgUmFzcGJlcnJ5IFBpIGlzbid0IHBvc3NpYmxlIHRocm91Z2hcbiAgICAvLyB0aGUgb3MgbW9kdWxlIG9uIFJhc3BiaWFuLCBzbyB3ZSByZWFkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtIGluc3RlYWRcbiAgICBsZXQgaXNSYXNwYmVycnlQaSA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICBpc1Jhc3BiZXJyeVBpID0gZnMucmVhZEZpbGVTeW5jKCcvZXRjL29zLXJlbGVhc2UnKS50b1N0cmluZygpLmluZGV4T2YoJ1Jhc3BiaWFuJykgIT09IC0xO1xuICAgIH0gY2F0Y2ggKGUpIHt9Ly8gU3F1YXNoIGZpbGUgbm90IGZvdW5kLCBldGMgZXJyb3JzXG4gICAgcmV0dXJuIGlzUmFzcGJlcnJ5UGk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhc3BpO1xuIl19