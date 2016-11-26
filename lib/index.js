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

var _raspiSoftPwm = require('raspi-soft-pwm');

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
    var _ref$enableSoftPwm = _ref.enableSoftPwm;
    var enableSoftPwm = _ref$enableSoftPwm === undefined ? false : _ref$enableSoftPwm;

    _classCallCheck(this, Raspi);

    var _this = _possibleConstructorReturn(this, (Raspi.__proto__ || Object.getPrototypeOf(Raspi)).call(this));

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
          } else if (enableSoftPwm === true && pinInfo.peripherals.indexOf('gpio') !== -1) {
            supportedModes.push(PWM_MODE, SERVO_MODE);
          }
        }
        var instance = _this[instances][pin] = {
          peripheral: null,
          mode: supportedModes.indexOf(OUTPUT_MODE) == -1 ? UNKNOWN_MODE : OUTPUT_MODE,

          // Used to cache the previously written value for reading back in OUTPUT mode
          // We start with undefined because it's in an unknown state
          previousWrittenValue: undefined,

          // Used to set the default min and max values
          min: DEFAULT_SERVO_MIN,
          max: DEFAULT_SERVO_MAX,

          // Used to track if this pin is capable of hardware PWM
          isHardwarePwm: pinInfo.peripherals.indexOf('pwm') !== -1
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
            if (pinInstance.isHardwarePwm) {
              pinInstance.peripheral = new _raspiPwm.PWM(normalizedPin);
            } else {
              pinInstance.peripheral = new _raspiSoftPwm.SoftPWM({
                pin: normalizedPin,
                range: 1000
              });
            }
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

//# sourceMappingURL=data:application/json;base64,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YW4gSHVnaGVzIDxicnlhbkB0aGVvcmV0aWNhbGlkZWF0aW9ucy5jb20+XG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uXG5vYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvblxuZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dFxucmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsXG5jb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlXG5Tb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZ1xuY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFU1xuT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbk5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUXG5IT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSxcbldIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lOR1xuRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUlxuT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBpbml0IH0gZnJvbSAncmFzcGknO1xuaW1wb3J0IHsgZ2V0UGlucywgZ2V0UGluTnVtYmVyIH0gZnJvbSAncmFzcGktYm9hcmQnO1xuaW1wb3J0IHsgUFVMTF9OT05FLCBQVUxMX1VQLCBQVUxMX0RPV04sIERpZ2l0YWxPdXRwdXQsIERpZ2l0YWxJbnB1dCB9IGZyb20gJ3Jhc3BpLWdwaW8nO1xuaW1wb3J0IHsgUFdNIH0gZnJvbSAncmFzcGktcHdtJztcbmltcG9ydCB7IFNvZnRQV00gfSBmcm9tICdyYXNwaS1zb2Z0LXB3bSc7XG5pbXBvcnQgeyBJMkMgfSBmcm9tICdyYXNwaS1pMmMnO1xuaW1wb3J0IHsgTEVEIH0gZnJvbSAncmFzcGktbGVkJztcbmltcG9ydCB7IFNlcmlhbCwgREVGQVVMVF9QT1JUIH0gZnJvbSAncmFzcGktc2VyaWFsJztcblxuLy8gQ29uc3RhbnRzXG5jb25zdCBJTlBVVF9NT0RFID0gMDtcbmNvbnN0IE9VVFBVVF9NT0RFID0gMTtcbmNvbnN0IEFOQUxPR19NT0RFID0gMjtcbmNvbnN0IFBXTV9NT0RFID0gMztcbmNvbnN0IFNFUlZPX01PREUgPSA0O1xuY29uc3QgVU5LTk9XTl9NT0RFID0gOTk7XG5cbmNvbnN0IExPVyA9IDA7XG5jb25zdCBISUdIID0gMTtcblxuY29uc3QgTEVEX1BJTiA9IC0xO1xuXG4vLyBTZXR0aW5nc1xuY29uc3QgREVGQVVMVF9TRVJWT19NSU4gPSAxMDAwO1xuY29uc3QgREVGQVVMVF9TRVJWT19NQVggPSAyMDAwO1xuY29uc3QgRElHSVRBTF9SRUFEX1VQREFURV9SQVRFID0gMTk7XG5cbi8vIFByaXZhdGUgc3ltYm9sc1xuY29uc3QgaXNSZWFkeSA9IFN5bWJvbCgnaXNSZWFkeScpO1xuY29uc3QgcGlucyA9IFN5bWJvbCgncGlucycpO1xuY29uc3QgaW5zdGFuY2VzID0gU3ltYm9sKCdpbnN0YW5jZXMnKTtcbmNvbnN0IGFuYWxvZ1BpbnMgPSBTeW1ib2woJ2FuYWxvZ1BpbnMnKTtcbmNvbnN0IGdldFBpbkluc3RhbmNlID0gU3ltYm9sKCdnZXRQaW5JbnN0YW5jZScpO1xuY29uc3QgaTJjID0gU3ltYm9sKCdpMmMnKTtcbmNvbnN0IGkyY0RlbGF5ID0gU3ltYm9sKCdpMmNEZWxheScpO1xuY29uc3QgaTJjUmVhZCA9IFN5bWJvbCgnaTJjUmVhZCcpO1xuY29uc3QgaTJjQ2hlY2tBbGl2ZSA9IFN5bWJvbCgnaTJjQ2hlY2tBbGl2ZScpO1xuY29uc3QgcGluTW9kZSA9IFN5bWJvbCgncGluTW9kZScpO1xuY29uc3Qgc2VyaWFsID0gU3ltYm9sKCdzZXJpYWwnKTtcbmNvbnN0IHNlcmlhbFF1ZXVlID0gU3ltYm9sKCdzZXJpYWxRdWV1ZScpO1xuY29uc3QgYWRkVG9TZXJpYWxRdWV1ZSA9IFN5bWJvbCgnYWRkVG9TZXJpYWxRdWV1ZScpO1xuY29uc3Qgc2VyaWFsUHVtcCA9IFN5bWJvbCgnc2VyaWFsUHVtcCcpO1xuY29uc3QgaXNTZXJpYWxQcm9jZXNzaW5nID0gU3ltYm9sKCdpc1NlcmlhbFByb2Nlc3NpbmcnKTtcbmNvbnN0IGlzU2VyaWFsT3BlbiA9IFN5bWJvbCgnaXNTZXJpYWxPcGVuJyk7XG5cbmNvbnN0IFNFUklBTF9BQ1RJT05fV1JJVEUgPSAnU0VSSUFMX0FDVElPTl9XUklURSc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX0NMT1NFID0gJ1NFUklBTF9BQ1RJT05fQ0xPU0UnO1xuY29uc3QgU0VSSUFMX0FDVElPTl9GTFVTSCA9ICdTRVJJQUxfQUNUSU9OX0ZMVVNIJztcbmNvbnN0IFNFUklBTF9BQ1RJT05fQ09ORklHID0gJ1NFUklBTF9BQ1RJT05fQ09ORklHJztcbmNvbnN0IFNFUklBTF9BQ1RJT05fUkVBRCA9ICdTRVJJQUxfQUNUSU9OX1JFQUQnO1xuY29uc3QgU0VSSUFMX0FDVElPTl9TVE9QID0gJ1NFUklBTF9BQ1RJT05fU1RPUCc7XG5cbmZ1bmN0aW9uIGJ1ZmZlclRvQXJyYXkoYnVmZmVyKSB7XG4gIGNvbnN0IGFycmF5ID0gQXJyYXkoYnVmZmVyLmxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnVmZmVyLmxlbmd0aDsgaSsrKSB7XG4gICAgYXJyYXlbaV0gPSBidWZmZXJbaV07XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5jbGFzcyBSYXNwaSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cbiAgY29uc3RydWN0b3IoeyBpbmNsdWRlUGlucywgZXhjbHVkZVBpbnMsIGVuYWJsZVNvZnRQd20gPSBmYWxzZSB9ID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgbmFtZToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogJ1Jhc3BiZXJyeVBpLUlPJ1xuICAgICAgfSxcblxuICAgICAgW2luc3RhbmNlc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcblxuICAgICAgW2lzUmVhZHldOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG4gICAgICBpc1JlYWR5OiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1tpc1JlYWR5XTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW3BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBwaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1twaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2FuYWxvZ1BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBhbmFsb2dQaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1thbmFsb2dQaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2kyY106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBuZXcgSTJDKClcbiAgICAgIH0sXG5cbiAgICAgIFtpMmNEZWxheV06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiAwXG4gICAgICB9LFxuXG4gICAgICBbc2VyaWFsXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IG5ldyBTZXJpYWwoKVxuICAgICAgfSxcblxuICAgICAgW3NlcmlhbFF1ZXVlXToge1xuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG5cbiAgICAgIFtpc1NlcmlhbFByb2Nlc3NpbmddOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG5cbiAgICAgIFtpc1NlcmlhbE9wZW5dOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG5cbiAgICAgIE1PREVTOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICBJTlBVVDogSU5QVVRfTU9ERSxcbiAgICAgICAgICBPVVRQVVQ6IE9VVFBVVF9NT0RFLFxuICAgICAgICAgIEFOQUxPRzogQU5BTE9HX01PREUsXG4gICAgICAgICAgUFdNOiBQV01fTU9ERSxcbiAgICAgICAgICBTRVJWTzogU0VSVk9fTU9ERVxuICAgICAgICB9KVxuICAgICAgfSxcblxuICAgICAgSElHSDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogSElHSFxuICAgICAgfSxcbiAgICAgIExPVzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTE9XXG4gICAgICB9LFxuXG4gICAgICBkZWZhdWx0TGVkOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBMRURfUElOXG4gICAgICB9LFxuXG4gICAgICBTRVJJQUxfUE9SVF9JRHM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgIEhXX1NFUklBTDA6IERFRkFVTFRfUE9SVCxcbiAgICAgICAgICBERUZBVUxUOiBERUZBVUxUX1BPUlRcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGluaXQoKCkgPT4ge1xuICAgICAgbGV0IHBpbk1hcHBpbmdzID0gZ2V0UGlucygpO1xuICAgICAgdGhpc1twaW5zXSA9IFtdO1xuXG4gICAgICAvLyBTbGlnaHQgaGFjayB0byBnZXQgdGhlIExFRCBpbiB0aGVyZSwgc2luY2UgaXQncyBub3QgYWN0dWFsbHkgYSBwaW5cbiAgICAgIHBpbk1hcHBpbmdzW0xFRF9QSU5dID0ge1xuICAgICAgICBwaW5zOiBbIExFRF9QSU4gXSxcbiAgICAgICAgcGVyaXBoZXJhbHM6IFsgJ2dwaW8nIF1cbiAgICAgIH07XG5cbiAgICAgIGlmIChpbmNsdWRlUGlucyAmJiBleGNsdWRlUGlucykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wiaW5jbHVkZVBpbnNcIiBhbmQgXCJleGNsdWRlUGluc1wiIGNhbm5vdCBiZSBzcGVjaWZpZWQgYXQgdGhlIHNhbWUgdGltZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShpbmNsdWRlUGlucykpIHtcbiAgICAgICAgY29uc3QgbmV3UGluTWFwcGluZ3MgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBwaW4gb2YgaW5jbHVkZVBpbnMpIHtcbiAgICAgICAgICBjb25zdCBub3JtYWxpemVkUGluID0gZ2V0UGluTnVtYmVyKHBpbik7XG4gICAgICAgICAgaWYgKG5vcm1hbGl6ZWRQaW4gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwaW4gXCIke3Bpbn1cIiBzcGVjaWZpZWQgaW4gaW5jbHVkZVBpbnNgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbmV3UGluTWFwcGluZ3Nbbm9ybWFsaXplZFBpbl0gPSBwaW5NYXBwaW5nc1tub3JtYWxpemVkUGluXTtcbiAgICAgICAgfVxuICAgICAgICBwaW5NYXBwaW5ncyA9IG5ld1Bpbk1hcHBpbmdzO1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGV4Y2x1ZGVQaW5zKSkge1xuICAgICAgICBwaW5NYXBwaW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIHBpbk1hcHBpbmdzKTtcbiAgICAgICAgZm9yIChjb25zdCBwaW4gb2YgZXhjbHVkZVBpbnMpIHtcbiAgICAgICAgICBjb25zdCBub3JtYWxpemVkUGluID0gZ2V0UGluTnVtYmVyKHBpbik7XG4gICAgICAgICAgaWYgKG5vcm1hbGl6ZWRQaW4gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwaW4gXCIke3Bpbn1cIiBzcGVjaWZpZWQgaW4gZXhjbHVkZVBpbnNgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVsZXRlIHBpbk1hcHBpbmdzW25vcm1hbGl6ZWRQaW5dO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5rZXlzKHBpbk1hcHBpbmdzKS5mb3JFYWNoKChwaW4pID0+IHtcbiAgICAgICAgY29uc3QgcGluSW5mbyA9IHBpbk1hcHBpbmdzW3Bpbl07XG4gICAgICAgIGNvbnN0IHN1cHBvcnRlZE1vZGVzID0gW107XG4gICAgICAgIC8vIFdlIGRvbid0IHdhbnQgSTJDIHRvIGJlIHVzZWQgZm9yIGFueXRoaW5nIGVsc2UsIHNpbmNlIGNoYW5naW5nIHRoZVxuICAgICAgICAvLyBwaW4gbW9kZSBtYWtlcyBpdCB1bmFibGUgdG8gZXZlciBkbyBJMkMgYWdhaW4uXG4gICAgICAgIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ2kyYycpID09IC0xICYmIHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZigndWFydCcpID09IC0xKSB7XG4gICAgICAgICAgaWYgKHBpbiA9PSBMRURfUElOKSB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlcy5wdXNoKE9VVFBVVF9NT0RFKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZignZ3BpbycpICE9IC0xKSB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlcy5wdXNoKElOUFVUX01PREUsIE9VVFBVVF9NT0RFKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZigncHdtJykgIT0gLTEpIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goUFdNX01PREUsIFNFUlZPX01PREUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZW5hYmxlU29mdFB3bSA9PT0gdHJ1ZSAmJiBwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ2dwaW8nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goUFdNX01PREUsIFNFUlZPX01PREUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnN0YW5jZSA9IHRoaXNbaW5zdGFuY2VzXVtwaW5dID0ge1xuICAgICAgICAgIHBlcmlwaGVyYWw6IG51bGwsXG4gICAgICAgICAgbW9kZTogc3VwcG9ydGVkTW9kZXMuaW5kZXhPZihPVVRQVVRfTU9ERSkgPT0gLTEgPyBVTktOT1dOX01PREUgOiBPVVRQVVRfTU9ERSxcblxuICAgICAgICAgIC8vIFVzZWQgdG8gY2FjaGUgdGhlIHByZXZpb3VzbHkgd3JpdHRlbiB2YWx1ZSBmb3IgcmVhZGluZyBiYWNrIGluIE9VVFBVVCBtb2RlXG4gICAgICAgICAgLy8gV2Ugc3RhcnQgd2l0aCB1bmRlZmluZWQgYmVjYXVzZSBpdCdzIGluIGFuIHVua25vd24gc3RhdGVcbiAgICAgICAgICBwcmV2aW91c1dyaXR0ZW5WYWx1ZTogdW5kZWZpbmVkLFxuXG4gICAgICAgICAgLy8gVXNlZCB0byBzZXQgdGhlIGRlZmF1bHQgbWluIGFuZCBtYXggdmFsdWVzXG4gICAgICAgICAgbWluOiBERUZBVUxUX1NFUlZPX01JTixcbiAgICAgICAgICBtYXg6IERFRkFVTFRfU0VSVk9fTUFYLFxuXG4gICAgICAgICAgLy8gVXNlZCB0byB0cmFjayBpZiB0aGlzIHBpbiBpcyBjYXBhYmxlIG9mIGhhcmR3YXJlIFBXTVxuICAgICAgICAgIGlzSGFyZHdhcmVQd206IHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZigncHdtJykgIT09IC0xXG4gICAgICAgIH07XG4gICAgICAgIHRoaXNbcGluc11bcGluXSA9IE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgIHN1cHBvcnRlZE1vZGVzOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoc3VwcG9ydGVkTW9kZXMpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBtb2RlOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UubW9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICBzd2l0Y2ggKGluc3RhbmNlLm1vZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICAgICAgICAgICAgY2FzZSBPVVRQVVRfTU9ERTpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLm1vZGUgPT0gT1VUUFVUX01PREUpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVwb3J0OiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFuYWxvZ0NoYW5uZWw6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMTI3XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGluc3RhbmNlLm1vZGUgPT0gT1VUUFVUX01PREUpIHtcbiAgICAgICAgICB0aGlzLnBpbk1vZGUocGluLCBPVVRQVVRfTU9ERSk7XG4gICAgICAgICAgdGhpcy5kaWdpdGFsV3JpdGUocGluLCBMT1cpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gRmlsbCBpbiB0aGUgaG9sZXMsIHNpbnMgcGlucyBhcmUgc3BhcnNlIG9uIHRoZSBBKy9CKy8yXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXNbcGluc10ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCF0aGlzW3BpbnNdW2ldKSB7XG4gICAgICAgICAgdGhpc1twaW5zXVtpXSA9IE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXM6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoW10pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFVOS05PV05fTU9ERTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc2V0KCkge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXBvcnQ6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbmFsb2dDaGFubmVsOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiAxMjdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNlcmlhbENvbmZpZyh7XG4gICAgICAgIHBvcnRJZDogREVGQVVMVF9QT1JULFxuICAgICAgICBiYXVkOiA5NjAwXG4gICAgICB9KTtcblxuICAgICAgdGhpc1tpc1JlYWR5XSA9IHRydWU7XG4gICAgICB0aGlzLmVtaXQoJ3JlYWR5Jyk7XG4gICAgICB0aGlzLmVtaXQoJ2Nvbm5lY3QnKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVzZXQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBub3JtYWxpemUocGluKSB7XG4gICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IGdldFBpbk51bWJlcihwaW4pO1xuICAgIGlmICh0eXBlb2Ygbm9ybWFsaXplZFBpbiAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwaW4gXCIke3Bpbn1cImApO1xuICAgIH1cbiAgICByZXR1cm4gbm9ybWFsaXplZFBpbjtcbiAgfVxuXG4gIFtnZXRQaW5JbnN0YW5jZV0ocGluKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXTtcbiAgICBpZiAoIXBpbkluc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcGluIFwiJHtwaW59XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIHBpbkluc3RhbmNlO1xuICB9XG5cbiAgcGluTW9kZShwaW4sIG1vZGUpIHtcbiAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlIH0pO1xuICB9XG5cbiAgW3Bpbk1vZGVdKHsgcGluLCBtb2RlLCBwdWxsUmVzaXN0b3IgPSBQVUxMX05PTkUgfSkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSB0aGlzLm5vcm1hbGl6ZShwaW4pO1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0obm9ybWFsaXplZFBpbik7XG4gICAgcGluSW5zdGFuY2UucHVsbFJlc2lzdG9yID0gcHVsbFJlc2lzdG9yO1xuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgIHBpbjogbm9ybWFsaXplZFBpbixcbiAgICAgIHB1bGxSZXNpc3RvcjogcGluSW5zdGFuY2UucHVsbFJlc2lzdG9yXG4gICAgfTtcbiAgICBpZiAodGhpc1twaW5zXVtub3JtYWxpemVkUGluXS5zdXBwb3J0ZWRNb2Rlcy5pbmRleE9mKG1vZGUpID09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFBpbiBcIiR7cGlufVwiIGRvZXMgbm90IHN1cHBvcnQgbW9kZSBcIiR7bW9kZX1cImApO1xuICAgIH1cblxuICAgIGlmIChwaW4gPT0gTEVEX1BJTikge1xuICAgICAgaWYgKHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgaW5zdGFuY2VvZiBMRUQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBMRUQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3dpdGNoIChtb2RlKSB7XG4gICAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IERpZ2l0YWxJbnB1dChjb25maWcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbE91dHB1dChjb25maWcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFBXTV9NT0RFOlxuICAgICAgICBjYXNlIFNFUlZPX01PREU6XG4gICAgICAgICAgaWYgKHBpbkluc3RhbmNlLmlzSGFyZHdhcmVQd20pIHtcbiAgICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgUFdNKG5vcm1hbGl6ZWRQaW4pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IFNvZnRQV00oe1xuICAgICAgICAgICAgICBwaW46IG5vcm1hbGl6ZWRQaW4sXG4gICAgICAgICAgICAgIHJhbmdlOiAxMDAwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS53YXJuKGBVbmtub3duIHBpbiBtb2RlOiAke21vZGV9YCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLm1vZGUgPSBtb2RlO1xuICB9XG5cbiAgYW5hbG9nUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2FuYWxvZ1JlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBhbmFsb2dXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgdGhpcy5wd21Xcml0ZShwaW4sIHZhbHVlKTtcbiAgfVxuXG4gIHB3bVdyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFBXTV9NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBQV01fTU9ERSk7XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUoTWF0aC5yb3VuZCh2YWx1ZSAqIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwucmFuZ2UgLyAyNTUpKTtcbiAgfVxuXG4gIGRpZ2l0YWxSZWFkKHBpbiwgaGFuZGxlcikge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gSU5QVVRfTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgSU5QVVRfTU9ERSk7XG4gICAgfVxuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgbGV0IHZhbHVlO1xuICAgICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgPT0gSU5QVVRfTU9ERSkge1xuICAgICAgICB2YWx1ZSA9IHBpbkluc3RhbmNlLnBlcmlwaGVyYWwucmVhZCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgIGhhbmRsZXIodmFsdWUpO1xuICAgICAgfVxuICAgICAgdGhpcy5lbWl0KGBkaWdpdGFsLXJlYWQtJHtwaW59YCwgdmFsdWUpO1xuICAgIH0sIERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSk7XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC5vbignZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgfSk7XG4gIH1cblxuICBkaWdpdGFsV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgPT09IElOUFVUX01PREUgJiYgdmFsdWUgPT09IEhJR0gpIHtcbiAgICAgIHRoaXNbcGluTW9kZV0oeyBwaW4sIG1vZGU6IElOUFVUX01PREUsIHB1bGxSZXNpc3RvcjogUFVMTF9VUCB9KTtcbiAgICB9IGVsc2UgaWYgKHBpbkluc3RhbmNlLm1vZGUgPT09IElOUFVUX01PREUgJiYgdmFsdWUgPT09IExPVykge1xuICAgICAgdGhpc1twaW5Nb2RlXSh7IHBpbiwgbW9kZTogSU5QVVRfTU9ERSwgcHVsbFJlc2lzdG9yOiBQVUxMX0RPV04gfSk7XG4gICAgfSBlbHNlIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IE9VVFBVVF9NT0RFKSB7XG4gICAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlOiBPVVRQVVRfTU9ERSB9KTtcbiAgICB9XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgPT09IE9VVFBVVF9NT0RFICYmIHZhbHVlICE9IHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlKSB7XG4gICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlID8gSElHSCA6IExPVyk7XG4gICAgICBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHNlcnZvQ29uZmlnKHBpbiwgbWluLCBtYXgpIHtcbiAgICBsZXQgY29uZmlnID0gcGluO1xuICAgIGlmICh0eXBlb2YgY29uZmlnICE9PSAnb2JqZWN0Jykge1xuICAgICAgY29uZmlnID0geyBwaW4sIG1pbiwgbWF4IH07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY29uZmlnLm1pbiAhPT0gJ251bWJlcicpIHtcbiAgICAgIGNvbmZpZy5taW4gPSBERUZBVUxUX1NFUlZPX01JTjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb25maWcubWF4ICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uZmlnLm1heCA9IERFRkFVTFRfU0VSVk9fTUFYO1xuICAgIH1cbiAgICBjb25zdCBub3JtYWxpemVkUGluID0gdGhpcy5ub3JtYWxpemUocGluKTtcbiAgICB0aGlzW3Bpbk1vZGVdKHtcbiAgICAgIHBpbjogbm9ybWFsaXplZFBpbixcbiAgICAgIG1vZGU6IFNFUlZPX01PREVcbiAgICB9KTtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKG5vcm1hbGl6ZWRQaW4pKTtcbiAgICBwaW5JbnN0YW5jZS5taW4gPSBjb25maWcubWluO1xuICAgIHBpbkluc3RhbmNlLm1heCA9IGNvbmZpZy5tYXg7XG4gIH1cblxuICBzZXJ2b1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFNFUlZPX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIFNFUlZPX01PREUpO1xuICAgIH1cbiAgICBjb25zdCBkdXR5Q3ljbGUgPSAocGluSW5zdGFuY2UubWluICsgKHZhbHVlIC8gMTgwKSAqIChwaW5JbnN0YW5jZS5tYXggLSBwaW5JbnN0YW5jZS5taW4pKSAvIDIwMDAwO1xuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUoZHV0eUN5Y2xlICogcGluSW5zdGFuY2UucGVyaXBoZXJhbC5yYW5nZSk7XG4gIH1cblxuICBxdWVyeUNhcGFiaWxpdGllcyhjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBxdWVyeUFuYWxvZ01hcHBpbmcoY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcXVlcnlQaW5TdGF0ZShwaW4sIGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIFtpMmNDaGVja0FsaXZlXSgpIHtcbiAgICBpZiAoIXRoaXNbaTJjXS5hbGl2ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJMkMgcGlucyBub3QgaW4gSTJDIG1vZGUnKTtcbiAgICB9XG4gIH1cblxuICBpMmNDb25maWcob3B0aW9ucykge1xuICAgIGxldCBkZWxheTtcblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ251bWJlcicpIHtcbiAgICAgIGRlbGF5ID0gb3B0aW9ucztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJiBvcHRpb25zICE9PSBudWxsKSB7XG4gICAgICAgIGRlbGF5ID0gb3B0aW9ucy5kZWxheTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICB0aGlzW2kyY0RlbGF5XSA9IE1hdGgucm91bmQoKGRlbGF5IHx8IDApIC8gMTAwMCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGkyY1dyaXRlKGFkZHJlc3MsIGNtZFJlZ09yRGF0YSwgaW5CeXRlcykge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIC8vIElmIGkyY1dyaXRlIHdhcyB1c2VkIGZvciBhbiBpMmNXcml0ZVJlZyBjYWxsLi4uXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgJiZcbiAgICAgICAgIUFycmF5LmlzQXJyYXkoY21kUmVnT3JEYXRhKSAmJlxuICAgICAgICAhQXJyYXkuaXNBcnJheShpbkJ5dGVzKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaTJjV3JpdGVSZWcoYWRkcmVzcywgY21kUmVnT3JEYXRhLCBpbkJ5dGVzKTtcbiAgICB9XG5cbiAgICAvLyBGaXggYXJndW1lbnRzIGlmIGNhbGxlZCB3aXRoIEZpcm1hdGEuanMgQVBJXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGNtZFJlZ09yRGF0YSkpIHtcbiAgICAgICAgaW5CeXRlcyA9IGNtZFJlZ09yRGF0YS5zbGljZSgpO1xuICAgICAgICBjbWRSZWdPckRhdGEgPSBpbkJ5dGVzLnNoaWZ0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbkJ5dGVzID0gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYnVmZmVyID0gbmV3IEJ1ZmZlcihbY21kUmVnT3JEYXRhXS5jb25jYXQoaW5CeXRlcykpO1xuXG4gICAgLy8gT25seSB3cml0ZSBpZiBieXRlcyBwcm92aWRlZFxuICAgIGlmIChidWZmZXIubGVuZ3RoKSB7XG4gICAgICB0aGlzW2kyY10ud3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNXcml0ZVJlZyhhZGRyZXNzLCByZWdpc3RlciwgdmFsdWUpIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICB0aGlzW2kyY10ud3JpdGVCeXRlU3luYyhhZGRyZXNzLCByZWdpc3RlciwgdmFsdWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBbaTJjUmVhZF0oY29udGludW91cywgYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGVzVG9SZWFkLCBjYWxsYmFjaykge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIC8vIEZpeCBhcmd1bWVudHMgaWYgY2FsbGVkIHdpdGggRmlybWF0YS5qcyBBUElcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSA0ICYmXG4gICAgICB0eXBlb2YgcmVnaXN0ZXIgPT0gJ251bWJlcicgJiZcbiAgICAgIHR5cGVvZiBieXRlc1RvUmVhZCA9PSAnZnVuY3Rpb24nXG4gICAgKSB7XG4gICAgICBjYWxsYmFjayA9IGJ5dGVzVG9SZWFkO1xuICAgICAgYnl0ZXNUb1JlYWQgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gbnVsbDtcbiAgICB9XG5cbiAgICBjYWxsYmFjayA9IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogKCkgPT4ge307XG5cbiAgICBsZXQgZXZlbnQgPSBgaTJjLXJlcGx5LSR7YWRkcmVzc30tYDtcbiAgICBldmVudCArPSByZWdpc3RlciAhPT0gbnVsbCA/IHJlZ2lzdGVyIDogMDtcblxuICAgIGNvbnN0IHJlYWQgPSAoKSA9PiB7XG4gICAgICBjb25zdCBhZnRlclJlYWQgPSAoZXJyLCBidWZmZXIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnZlcnQgYnVmZmVyIHRvIEFycmF5IGJlZm9yZSBlbWl0XG4gICAgICAgIHRoaXMuZW1pdChldmVudCwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYnVmZmVyKSk7XG5cbiAgICAgICAgaWYgKGNvbnRpbnVvdXMpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KHJlYWQsIHRoaXNbaTJjRGVsYXldKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdGhpcy5vbmNlKGV2ZW50LCBjYWxsYmFjayk7XG5cbiAgICAgIGlmIChyZWdpc3RlciAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzW2kyY10ucmVhZChhZGRyZXNzLCByZWdpc3RlciwgYnl0ZXNUb1JlYWQsIGFmdGVyUmVhZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzW2kyY10ucmVhZChhZGRyZXNzLCBieXRlc1RvUmVhZCwgYWZ0ZXJSZWFkKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc2V0VGltZW91dChyZWFkLCB0aGlzW2kyY0RlbGF5XSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGkyY1JlYWQoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzW2kyY1JlYWRdKHRydWUsIC4uLnJlc3QpO1xuICB9XG5cbiAgaTJjUmVhZE9uY2UoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzW2kyY1JlYWRdKGZhbHNlLCAuLi5yZXN0KTtcbiAgfVxuXG4gIHNlbmRJMkNDb25maWcoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzLmkyY0NvbmZpZyguLi5yZXN0KTtcbiAgfVxuXG4gIHNlbmRJMkNXcml0ZVJlcXVlc3QoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzLmkyY1dyaXRlKC4uLnJlc3QpO1xuICB9XG5cbiAgc2VuZEkyQ1JlYWRSZXF1ZXN0KC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNSZWFkT25jZSguLi5yZXN0KTtcbiAgfVxuXG4gIHNlcmlhbENvbmZpZyh7IHBvcnRJZCwgYmF1ZCB9KSB7XG4gICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0gfHwgKGJhdWQgJiYgYmF1ZCAhPT0gdGhpc1tzZXJpYWxdLmJhdWRSYXRlKSkge1xuICAgICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fQ09ORklHLFxuICAgICAgICBwb3J0SWQsXG4gICAgICAgIGJhdWRcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNlcmlhbFdyaXRlKHBvcnRJZCwgaW5CeXRlcykge1xuICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgdHlwZTogU0VSSUFMX0FDVElPTl9XUklURSxcbiAgICAgIHBvcnRJZCxcbiAgICAgIGluQnl0ZXNcbiAgICB9KTtcbiAgfVxuXG4gIHNlcmlhbFJlYWQocG9ydElkLCBtYXhCeXRlc1RvUmVhZCwgaGFuZGxlcikge1xuICAgIGlmICh0eXBlb2YgbWF4Qnl0ZXNUb1JlYWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGhhbmRsZXIgPSBtYXhCeXRlc1RvUmVhZDtcbiAgICAgIG1heEJ5dGVzVG9SZWFkID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fUkVBRCxcbiAgICAgIHBvcnRJZCxcbiAgICAgIG1heEJ5dGVzVG9SZWFkLFxuICAgICAgaGFuZGxlclxuICAgIH0pO1xuICB9XG5cbiAgc2VyaWFsU3RvcChwb3J0SWQpIHtcbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fU1RPUCxcbiAgICAgIHBvcnRJZFxuICAgIH0pO1xuICB9XG5cbiAgc2VyaWFsQ2xvc2UocG9ydElkKSB7XG4gICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX0NMT1NFLFxuICAgICAgcG9ydElkXG4gICAgfSk7XG4gIH1cblxuICBzZXJpYWxGbHVzaChwb3J0SWQpIHtcbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fRkxVU0gsXG4gICAgICBwb3J0SWRcbiAgICB9KTtcbiAgfVxuXG4gIFthZGRUb1NlcmlhbFF1ZXVlXShhY3Rpb24pIHtcbiAgICBpZiAoYWN0aW9uLnBvcnRJZCAhPT0gREVGQVVMVF9QT1JUKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgc2VyaWFsIHBvcnQgXCIke3BvcnRJZH1cImApO1xuICAgIH1cbiAgICB0aGlzW3NlcmlhbFF1ZXVlXS5wdXNoKGFjdGlvbik7XG4gICAgdGhpc1tzZXJpYWxQdW1wXSgpO1xuICB9XG5cbiAgW3NlcmlhbFB1bXBdKCkge1xuICAgIGlmICh0aGlzW2lzU2VyaWFsUHJvY2Vzc2luZ10gfHwgIXRoaXNbc2VyaWFsUXVldWVdLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzW2lzU2VyaWFsUHJvY2Vzc2luZ10gPSB0cnVlO1xuICAgIGNvbnN0IGFjdGlvbiA9IHRoaXNbc2VyaWFsUXVldWVdLnNoaWZ0KCk7XG4gICAgY29uc3QgZmluYWxpemUgPSAoKSA9PiB7XG4gICAgICB0aGlzW2lzU2VyaWFsUHJvY2Vzc2luZ10gPSBmYWxzZTtcbiAgICAgIHRoaXNbc2VyaWFsUHVtcF0oKTtcbiAgICB9O1xuICAgIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9XUklURTpcbiAgICAgICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCB3cml0ZSB0byBjbG9zZWQgc2VyaWFsIHBvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzW3NlcmlhbF0ud3JpdGUoYWN0aW9uLmluQnl0ZXMsIGZpbmFsaXplKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9SRUFEOlxuICAgICAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHJlYWQgZnJvbSBjbG9zZWQgc2VyaWFsIHBvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPOiBhZGQgc3VwcG9ydCBmb3IgYWN0aW9uLm1heEJ5dGVzVG9SZWFkXG4gICAgICAgIHRoaXNbc2VyaWFsXS5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgYWN0aW9uLmhhbmRsZXIoYnVmZmVyVG9BcnJheShkYXRhKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZpbmFsaXplKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9TVE9QOlxuICAgICAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHN0b3AgY2xvc2VkIHNlcmlhbCBwb3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpc1tzZXJpYWxdLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZpbmFsaXplKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9DT05GSUc6XG4gICAgICAgIHRoaXNbc2VyaWFsXS5jbG9zZSgoKSA9PiB7XG4gICAgICAgICAgdGhpc1tzZXJpYWxdID0gbmV3IFNlcmlhbCh7XG4gICAgICAgICAgICBiYXVkUmF0ZTogYWN0aW9uLmJhdWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzW3NlcmlhbF0ub3BlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzW3NlcmlhbF0ub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmVtaXQoYHNlcmlhbC1kYXRhLSR7YWN0aW9uLnBvcnRJZH1gLCBidWZmZXJUb0FycmF5KGRhdGEpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpc1tpc1NlcmlhbE9wZW5dID0gdHJ1ZTtcbiAgICAgICAgICAgIGZpbmFsaXplKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX0NMT1NFOlxuICAgICAgICB0aGlzW3NlcmlhbF0uY2xvc2UoKCkgPT4ge1xuICAgICAgICAgIHRoaXNbaXNTZXJpYWxPcGVuXSA9IGZhbHNlO1xuICAgICAgICAgIGZpbmFsaXplKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX0ZMVVNIOlxuICAgICAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZsdXNoIGNsb3NlZCBzZXJpYWwgcG9ydCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXNbc2VyaWFsXS5mbHVzaChmaW5hbGl6ZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludGVybmFsIGVycm9yOiB1bmtub3duIHNlcmlhbCBhY3Rpb24gdHlwZScpO1xuICAgIH1cbiAgfVxuXG4gIHNlbmRPbmVXaXJlQ29uZmlnKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVDb25maWcgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVNlYXJjaCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlU2VhcmNoIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVBbGFybXNTZWFyY2goKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZUFsYXJtc1NlYXJjaCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlUmVzZXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZUNvbmZpZyBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlV3JpdGUoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVdyaXRlIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVEZWxheSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlRGVsYXkgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlV3JpdGVBbmRSZWFkIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2V0U2FtcGxpbmdJbnRlcnZhbCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFNhbXBsaW5nSW50ZXJ2YWwgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcmVwb3J0QW5hbG9nUGluKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVwb3J0QW5hbG9nUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHJlcG9ydERpZ2l0YWxQaW4oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZXBvcnREaWdpdGFsUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHBpbmdSZWFkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncGluZ1JlYWQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcHVsc2VJbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3B1bHNlSW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgc3RlcHBlckNvbmZpZygpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0ZXBwZXJDb25maWcgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgc3RlcHBlclN0ZXAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzdGVwcGVyU3RlcCBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFJhc3BpLCAnaXNSYXNwYmVycnlQaScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgdmFsdWU6ICgpID0+IHtcbiAgICAvLyBEZXRlcm1pbmluZyBpZiBhIHN5c3RlbSBpcyBhIFJhc3BiZXJyeSBQaSBpc24ndCBwb3NzaWJsZSB0aHJvdWdoXG4gICAgLy8gdGhlIG9zIG1vZHVsZSBvbiBSYXNwYmlhbiwgc28gd2UgcmVhZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbSBpbnN0ZWFkXG4gICAgbGV0IGlzUmFzcGJlcnJ5UGkgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgaXNSYXNwYmVycnlQaSA9IGZzLnJlYWRGaWxlU3luYygnL2V0Yy9vcy1yZWxlYXNlJykudG9TdHJpbmcoKS5pbmRleE9mKCdSYXNwYmlhbicpICE9PSAtMTtcbiAgICB9IGNhdGNoIChlKSB7fS8vIFNxdWFzaCBmaWxlIG5vdCBmb3VuZCwgZXRjIGVycm9yc1xuICAgIHJldHVybiBpc1Jhc3BiZXJyeVBpO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXNwaTtcbiJdfQ==