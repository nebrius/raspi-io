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
var isHardwarePwm = Symbol('isHardwarePwm');
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
          } else if (enableSoftPwm === true && pinInfo.peripherals.indexOf('gpio') != -1) {
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
        _this[pins][pin] = Object.create(null, _defineProperty({
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
        }, isHardwarePwm, {
          enumerable: false,
          value: pinInfo.peripherals.indexOf('pwm') != -1
        }));
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
            if (this[pins][normalizedPin][isHardwarePwm] === true) {
              pinInstance.peripheral = new _raspiPwm.PWM(normalizedPin);
            } else {
              pinInstance.peripheral = new _raspiSoftPwm.SoftPWM({
                pin: normalizedPin,
                range: 255
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

//# sourceMappingURL=data:application/json;base64,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R0FBaUIsS0FBakIiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IChjKSAyMDE0IEJyeWFuIEh1Z2hlcyA8YnJ5YW5AdGhlb3JldGljYWxpZGVhdGlvbnMuY29tPlxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvblxub2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb25cbmZpbGVzICh0aGUgJ1NvZnR3YXJlJyksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXRcbnJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLFxuY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZVxuU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmdcbmNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG5FWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVNcbk9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXG5OT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVFxuSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksXG5XSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkdcbkZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1Jcbk9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgaW5pdCB9IGZyb20gJ3Jhc3BpJztcbmltcG9ydCB7IGdldFBpbnMsIGdldFBpbk51bWJlciB9IGZyb20gJ3Jhc3BpLWJvYXJkJztcbmltcG9ydCB7IFBVTExfTk9ORSwgUFVMTF9VUCwgUFVMTF9ET1dOLCBEaWdpdGFsT3V0cHV0LCBEaWdpdGFsSW5wdXQgfSBmcm9tICdyYXNwaS1ncGlvJztcbmltcG9ydCB7IFBXTSB9IGZyb20gJ3Jhc3BpLXB3bSc7XG5pbXBvcnQgeyBTb2Z0UFdNIH0gZnJvbSAncmFzcGktc29mdC1wd20nO1xuaW1wb3J0IHsgSTJDIH0gZnJvbSAncmFzcGktaTJjJztcbmltcG9ydCB7IExFRCB9IGZyb20gJ3Jhc3BpLWxlZCc7XG5pbXBvcnQgeyBTZXJpYWwsIERFRkFVTFRfUE9SVCB9IGZyb20gJ3Jhc3BpLXNlcmlhbCc7XG5cbi8vIENvbnN0YW50c1xuY29uc3QgSU5QVVRfTU9ERSA9IDA7XG5jb25zdCBPVVRQVVRfTU9ERSA9IDE7XG5jb25zdCBBTkFMT0dfTU9ERSA9IDI7XG5jb25zdCBQV01fTU9ERSA9IDM7XG5jb25zdCBTRVJWT19NT0RFID0gNDtcbmNvbnN0IFVOS05PV05fTU9ERSA9IDk5O1xuXG5jb25zdCBMT1cgPSAwO1xuY29uc3QgSElHSCA9IDE7XG5cbmNvbnN0IExFRF9QSU4gPSAtMTtcblxuLy8gU2V0dGluZ3NcbmNvbnN0IERFRkFVTFRfU0VSVk9fTUlOID0gMTAwMDtcbmNvbnN0IERFRkFVTFRfU0VSVk9fTUFYID0gMjAwMDtcbmNvbnN0IERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSA9IDE5O1xuXG4vLyBQcml2YXRlIHN5bWJvbHNcbmNvbnN0IGlzUmVhZHkgPSBTeW1ib2woJ2lzUmVhZHknKTtcbmNvbnN0IHBpbnMgPSBTeW1ib2woJ3BpbnMnKTtcbmNvbnN0IGluc3RhbmNlcyA9IFN5bWJvbCgnaW5zdGFuY2VzJyk7XG5jb25zdCBhbmFsb2dQaW5zID0gU3ltYm9sKCdhbmFsb2dQaW5zJyk7XG5jb25zdCBpc0hhcmR3YXJlUHdtID0gU3ltYm9sKCdpc0hhcmR3YXJlUHdtJyk7XG5jb25zdCBnZXRQaW5JbnN0YW5jZSA9IFN5bWJvbCgnZ2V0UGluSW5zdGFuY2UnKTtcbmNvbnN0IGkyYyA9IFN5bWJvbCgnaTJjJyk7XG5jb25zdCBpMmNEZWxheSA9IFN5bWJvbCgnaTJjRGVsYXknKTtcbmNvbnN0IGkyY1JlYWQgPSBTeW1ib2woJ2kyY1JlYWQnKTtcbmNvbnN0IGkyY0NoZWNrQWxpdmUgPSBTeW1ib2woJ2kyY0NoZWNrQWxpdmUnKTtcbmNvbnN0IHBpbk1vZGUgPSBTeW1ib2woJ3Bpbk1vZGUnKTtcbmNvbnN0IHNlcmlhbCA9IFN5bWJvbCgnc2VyaWFsJyk7XG5jb25zdCBzZXJpYWxRdWV1ZSA9IFN5bWJvbCgnc2VyaWFsUXVldWUnKTtcbmNvbnN0IGFkZFRvU2VyaWFsUXVldWUgPSBTeW1ib2woJ2FkZFRvU2VyaWFsUXVldWUnKTtcbmNvbnN0IHNlcmlhbFB1bXAgPSBTeW1ib2woJ3NlcmlhbFB1bXAnKTtcbmNvbnN0IGlzU2VyaWFsUHJvY2Vzc2luZyA9IFN5bWJvbCgnaXNTZXJpYWxQcm9jZXNzaW5nJyk7XG5jb25zdCBpc1NlcmlhbE9wZW4gPSBTeW1ib2woJ2lzU2VyaWFsT3BlbicpO1xuXG5jb25zdCBTRVJJQUxfQUNUSU9OX1dSSVRFID0gJ1NFUklBTF9BQ1RJT05fV1JJVEUnO1xuY29uc3QgU0VSSUFMX0FDVElPTl9DTE9TRSA9ICdTRVJJQUxfQUNUSU9OX0NMT1NFJztcbmNvbnN0IFNFUklBTF9BQ1RJT05fRkxVU0ggPSAnU0VSSUFMX0FDVElPTl9GTFVTSCc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX0NPTkZJRyA9ICdTRVJJQUxfQUNUSU9OX0NPTkZJRyc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX1JFQUQgPSAnU0VSSUFMX0FDVElPTl9SRUFEJztcbmNvbnN0IFNFUklBTF9BQ1RJT05fU1RPUCA9ICdTRVJJQUxfQUNUSU9OX1NUT1AnO1xuXG5mdW5jdGlvbiBidWZmZXJUb0FycmF5KGJ1ZmZlcikge1xuICBjb25zdCBhcnJheSA9IEFycmF5KGJ1ZmZlci5sZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGJ1ZmZlci5sZW5ndGg7IGkrKykge1xuICAgIGFycmF5W2ldID0gYnVmZmVyW2ldO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuY2xhc3MgUmFzcGkgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKHsgaW5jbHVkZVBpbnMsIGV4Y2x1ZGVQaW5zLCBlbmFibGVTb2Z0UHdtPWZhbHNlIH0gPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICBuYW1lOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiAnUmFzcGJlcnJ5UGktSU8nXG4gICAgICB9LFxuXG4gICAgICBbaW5zdGFuY2VzXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuXG4gICAgICBbaXNSZWFkeV06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIGlzUmVhZHk6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW2lzUmVhZHldO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBbcGluc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcbiAgICAgIHBpbnM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW3BpbnNdO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBbYW5hbG9nUGluc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcbiAgICAgIGFuYWxvZ1BpbnM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW2FuYWxvZ1BpbnNdO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBbaTJjXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IG5ldyBJMkMoKVxuICAgICAgfSxcblxuICAgICAgW2kyY0RlbGF5XToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IDBcbiAgICAgIH0sXG5cbiAgICAgIFtzZXJpYWxdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogbmV3IFNlcmlhbCgpXG4gICAgICB9LFxuXG4gICAgICBbc2VyaWFsUXVldWVdOiB7XG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcblxuICAgICAgW2lzU2VyaWFsUHJvY2Vzc2luZ106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgfSxcblxuICAgICAgW2lzU2VyaWFsT3Blbl06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgfSxcblxuICAgICAgTU9ERVM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgIElOUFVUOiBJTlBVVF9NT0RFLFxuICAgICAgICAgIE9VVFBVVDogT1VUUFVUX01PREUsXG4gICAgICAgICAgQU5BTE9HOiBBTkFMT0dfTU9ERSxcbiAgICAgICAgICBQV006IFBXTV9NT0RFLFxuICAgICAgICAgIFNFUlZPOiBTRVJWT19NT0RFXG4gICAgICAgIH0pXG4gICAgICB9LFxuXG4gICAgICBISUdIOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBISUdIXG4gICAgICB9LFxuICAgICAgTE9XOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBMT1dcbiAgICAgIH0sXG5cbiAgICAgIGRlZmF1bHRMZWQ6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IExFRF9QSU5cbiAgICAgIH0sXG5cbiAgICAgIFNFUklBTF9QT1JUX0lEczoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgSFdfU0VSSUFMMDogREVGQVVMVF9QT1JULFxuICAgICAgICAgIERFRkFVTFQ6IERFRkFVTFRfUE9SVFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaW5pdCgoKSA9PiB7XG4gICAgICBsZXQgcGluTWFwcGluZ3MgPSBnZXRQaW5zKCk7XG4gICAgICB0aGlzW3BpbnNdID0gW107XG5cbiAgICAgIC8vIFNsaWdodCBoYWNrIHRvIGdldCB0aGUgTEVEIGluIHRoZXJlLCBzaW5jZSBpdCdzIG5vdCBhY3R1YWxseSBhIHBpblxuICAgICAgcGluTWFwcGluZ3NbTEVEX1BJTl0gPSB7XG4gICAgICAgIHBpbnM6IFsgTEVEX1BJTiBdLFxuICAgICAgICBwZXJpcGhlcmFsczogWyAnZ3BpbycgXVxuICAgICAgfTtcblxuICAgICAgaWYgKGluY2x1ZGVQaW5zICYmIGV4Y2x1ZGVQaW5zKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignXCJpbmNsdWRlUGluc1wiIGFuZCBcImV4Y2x1ZGVQaW5zXCIgY2Fubm90IGJlIHNwZWNpZmllZCBhdCB0aGUgc2FtZSB0aW1lJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGluY2x1ZGVQaW5zKSkge1xuICAgICAgICBjb25zdCBuZXdQaW5NYXBwaW5ncyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHBpbiBvZiBpbmNsdWRlUGlucykge1xuICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSBnZXRQaW5OdW1iZXIocGluKTtcbiAgICAgICAgICBpZiAobm9ybWFsaXplZFBpbiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBpbiBcIiR7cGlufVwiIHNwZWNpZmllZCBpbiBpbmNsdWRlUGluc2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBuZXdQaW5NYXBwaW5nc1tub3JtYWxpemVkUGluXSA9IHBpbk1hcHBpbmdzW25vcm1hbGl6ZWRQaW5dO1xuICAgICAgICB9XG4gICAgICAgIHBpbk1hcHBpbmdzID0gbmV3UGluTWFwcGluZ3M7XG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZXhjbHVkZVBpbnMpKSB7XG4gICAgICAgIHBpbk1hcHBpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgcGluTWFwcGluZ3MpO1xuICAgICAgICBmb3IgKGNvbnN0IHBpbiBvZiBleGNsdWRlUGlucykge1xuICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSBnZXRQaW5OdW1iZXIocGluKTtcbiAgICAgICAgICBpZiAobm9ybWFsaXplZFBpbiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBpbiBcIiR7cGlufVwiIHNwZWNpZmllZCBpbiBleGNsdWRlUGluc2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkZWxldGUgcGluTWFwcGluZ3Nbbm9ybWFsaXplZFBpbl07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmtleXMocGluTWFwcGluZ3MpLmZvckVhY2goKHBpbikgPT4ge1xuICAgICAgICBjb25zdCBwaW5JbmZvID0gcGluTWFwcGluZ3NbcGluXTtcbiAgICAgICAgY29uc3Qgc3VwcG9ydGVkTW9kZXMgPSBbXTtcbiAgICAgICAgLy8gV2UgZG9uJ3Qgd2FudCBJMkMgdG8gYmUgdXNlZCBmb3IgYW55dGhpbmcgZWxzZSwgc2luY2UgY2hhbmdpbmcgdGhlXG4gICAgICAgIC8vIHBpbiBtb2RlIG1ha2VzIGl0IHVuYWJsZSB0byBldmVyIGRvIEkyQyBhZ2Fpbi5cbiAgICAgICAgaWYgKHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZignaTJjJykgPT0gLTEgJiYgcGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCd1YXJ0JykgPT0gLTEpIHtcbiAgICAgICAgICBpZiAocGluID09IExFRF9QSU4pIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goT1VUUFVUX01PREUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdncGlvJykgIT0gLTEpIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goSU5QVVRfTU9ERSwgT1VUUFVUX01PREUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdwd20nKSAhPSAtMSkge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChQV01fTU9ERSwgU0VSVk9fTU9ERSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChlbmFibGVTb2Z0UHdtID09PSB0cnVlICYmIHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZignZ3BpbycpICE9IC0xKSB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlcy5wdXNoKFBXTV9NT0RFLCBTRVJWT19NT0RFKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXSA9IHtcbiAgICAgICAgICBwZXJpcGhlcmFsOiBudWxsLFxuICAgICAgICAgIG1vZGU6IHN1cHBvcnRlZE1vZGVzLmluZGV4T2YoT1VUUFVUX01PREUpID09IC0xID8gVU5LTk9XTl9NT0RFIDogT1VUUFVUX01PREUsXG5cbiAgICAgICAgICAvLyBVc2VkIHRvIGNhY2hlIHRoZSBwcmV2aW91c2x5IHdyaXR0ZW4gdmFsdWUgZm9yIHJlYWRpbmcgYmFjayBpbiBPVVRQVVQgbW9kZVxuICAgICAgICAgIHByZXZpb3VzV3JpdHRlblZhbHVlOiBMT1csXG5cbiAgICAgICAgICAvLyBVc2VkIHRvIHNldCB0aGUgZGVmYXVsdCBtaW4gYW5kIG1heCB2YWx1ZXNcbiAgICAgICAgICBtaW46IERFRkFVTFRfU0VSVk9fTUlOLFxuICAgICAgICAgIG1heDogREVGQVVMVF9TRVJWT19NQVhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpc1twaW5zXVtwaW5dID0gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgICAgc3VwcG9ydGVkTW9kZXM6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZShzdXBwb3J0ZWRNb2RlcylcbiAgICAgICAgICB9LFxuICAgICAgICAgIG1vZGU6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5tb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHN3aXRjaCAoaW5zdGFuY2UubW9kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgICAgICAgICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UubW9kZSA9PSBPVVRQVVRfTU9ERSkge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUodmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZXBvcnQ6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgYW5hbG9nQ2hhbm5lbDoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiAxMjdcbiAgICAgICAgICB9LFxuICAgICAgICAgIFtpc0hhcmR3YXJlUHdtXToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB2YWx1ZTogcGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdwd20nKSAhPSAtMVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpbnN0YW5jZS5tb2RlID09IE9VVFBVVF9NT0RFKSB7XG4gICAgICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgT1VUUFVUX01PREUpO1xuICAgICAgICAgIHRoaXMuZGlnaXRhbFdyaXRlKHBpbiwgTE9XKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEZpbGwgaW4gdGhlIGhvbGVzLCBzaW5zIHBpbnMgYXJlIHNwYXJzZSBvbiB0aGUgQSsvQisvMlxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzW3BpbnNdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghdGhpc1twaW5zXVtpXSkge1xuICAgICAgICAgIHRoaXNbcGluc11baV0gPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKFtdKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZGU6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBVTktOT1dOX01PREU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHNldCgpIHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVwb3J0OiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYW5hbG9nQ2hhbm5lbDoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogMTI3XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXJpYWxDb25maWcoe1xuICAgICAgICBwb3J0SWQ6IERFRkFVTFRfUE9SVCxcbiAgICAgICAgYmF1ZDogOTYwMFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXNbaXNSZWFkeV0gPSB0cnVlO1xuICAgICAgdGhpcy5lbWl0KCdyZWFkeScpO1xuICAgICAgdGhpcy5lbWl0KCdjb25uZWN0Jyk7XG4gICAgfSk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Jlc2V0IGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgbm9ybWFsaXplKHBpbikge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSBnZXRQaW5OdW1iZXIocGluKTtcbiAgICBpZiAodHlwZW9mIG5vcm1hbGl6ZWRQaW4gIT09ICdudW1iZXInKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcGluIFwiJHtwaW59XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRQaW47XG4gIH1cblxuICBbZ2V0UGluSW5zdGFuY2VdKHBpbikge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl07XG4gICAgaWYgKCFwaW5JbnN0YW5jZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHBpbiBcIiR7cGlufVwiYCk7XG4gICAgfVxuICAgIHJldHVybiBwaW5JbnN0YW5jZTtcbiAgfVxuXG4gIHBpbk1vZGUocGluLCBtb2RlKSB7XG4gICAgdGhpc1twaW5Nb2RlXSh7IHBpbiwgbW9kZSB9KTtcbiAgfVxuXG4gIFtwaW5Nb2RlXSh7IHBpbiwgbW9kZSwgcHVsbFJlc2lzdG9yID0gUFVMTF9OT05FIH0pIHtcbiAgICBjb25zdCBub3JtYWxpemVkUGluID0gdGhpcy5ub3JtYWxpemUocGluKTtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKG5vcm1hbGl6ZWRQaW4pO1xuICAgIHBpbkluc3RhbmNlLnB1bGxSZXNpc3RvciA9IHB1bGxSZXNpc3RvcjtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICBwaW46IG5vcm1hbGl6ZWRQaW4sXG4gICAgICBwdWxsUmVzaXN0b3I6IHBpbkluc3RhbmNlLnB1bGxSZXNpc3RvclxuICAgIH07XG4gICAgaWYgKHRoaXNbcGluc11bbm9ybWFsaXplZFBpbl0uc3VwcG9ydGVkTW9kZXMuaW5kZXhPZihtb2RlKSA9PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQaW4gXCIke3Bpbn1cIiBkb2VzIG5vdCBzdXBwb3J0IG1vZGUgXCIke21vZGV9XCJgKTtcbiAgICB9XG5cbiAgICBpZiAocGluID09IExFRF9QSU4pIHtcbiAgICAgIGlmIChwaW5JbnN0YW5jZS5wZXJpcGhlcmFsIGluc3RhbmNlb2YgTEVEKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgTEVEKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBEaWdpdGFsSW5wdXQoY29uZmlnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBPVVRQVVRfTU9ERTpcbiAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IERpZ2l0YWxPdXRwdXQoY29uZmlnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBQV01fTU9ERTpcbiAgICAgICAgY2FzZSBTRVJWT19NT0RFOlxuICAgICAgICAgIGlmICh0aGlzW3BpbnNdW25vcm1hbGl6ZWRQaW5dW2lzSGFyZHdhcmVQd21dID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IFBXTShub3JtYWxpemVkUGluKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBTb2Z0UFdNKHtcbiAgICAgICAgICAgICAgcGluOiBub3JtYWxpemVkUGluLFxuICAgICAgICAgICAgICByYW5nZTogMjU1XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS53YXJuKGBVbmtub3duIHBpbiBtb2RlOiAke21vZGV9YCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLm1vZGUgPSBtb2RlO1xuICB9XG5cbiAgYW5hbG9nUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2FuYWxvZ1JlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBhbmFsb2dXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgdGhpcy5wd21Xcml0ZShwaW4sIHZhbHVlKTtcbiAgfVxuXG4gIHB3bVdyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFBXTV9NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBQV01fTU9ERSk7XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUoTWF0aC5yb3VuZCh2YWx1ZSAqIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwucmFuZ2UgLyAyNTUpKTtcbiAgfVxuXG4gIGRpZ2l0YWxSZWFkKHBpbiwgaGFuZGxlcikge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gSU5QVVRfTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgSU5QVVRfTU9ERSk7XG4gICAgfVxuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgbGV0IHZhbHVlO1xuICAgICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgPT0gSU5QVVRfTU9ERSkge1xuICAgICAgICB2YWx1ZSA9IHBpbkluc3RhbmNlLnBlcmlwaGVyYWwucmVhZCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgIGhhbmRsZXIodmFsdWUpO1xuICAgICAgfVxuICAgICAgdGhpcy5lbWl0KGBkaWdpdGFsLXJlYWQtJHtwaW59YCwgdmFsdWUpO1xuICAgIH0sIERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSk7XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC5vbignZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgfSk7XG4gIH1cblxuICBkaWdpdGFsV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgPT09IElOUFVUX01PREUgJiYgdmFsdWUgPT09IEhJR0gpIHtcbiAgICAgIHRoaXNbcGluTW9kZV0oeyBwaW4sIG1vZGU6IElOUFVUX01PREUsIHB1bGxSZXNpc3RvcjogUFVMTF9VUCB9KTtcbiAgICB9IGVsc2UgaWYgKHBpbkluc3RhbmNlLm1vZGUgPT09IElOUFVUX01PREUgJiYgdmFsdWUgPT09IExPVykge1xuICAgICAgdGhpc1twaW5Nb2RlXSh7IHBpbiwgbW9kZTogSU5QVVRfTU9ERSwgcHVsbFJlc2lzdG9yOiBQVUxMX0RPV04gfSk7XG4gICAgfSBlbHNlIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IE9VVFBVVF9NT0RFKSB7XG4gICAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlOiBPVVRQVVRfTU9ERSB9KTtcbiAgICB9XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgPT09IE9VVFBVVF9NT0RFICYmIHZhbHVlICE9IHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlKSB7XG4gICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlID8gSElHSCA6IExPVyk7XG4gICAgICBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHNlcnZvQ29uZmlnKHBpbiwgbWluLCBtYXgpIHtcbiAgICBsZXQgY29uZmlnID0gcGluO1xuICAgIGlmICh0eXBlb2YgY29uZmlnICE9PSAnb2JqZWN0Jykge1xuICAgICAgY29uZmlnID0geyBwaW4sIG1pbiwgbWF4IH07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY29uZmlnLm1pbiAhPT0gJ251bWJlcicpIHtcbiAgICAgIGNvbmZpZy5taW4gPSBERUZBVUxUX1NFUlZPX01JTjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb25maWcubWF4ICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uZmlnLm1heCA9IERFRkFVTFRfU0VSVk9fTUFYO1xuICAgIH1cbiAgICBjb25zdCBub3JtYWxpemVkUGluID0gdGhpcy5ub3JtYWxpemUocGluKTtcbiAgICB0aGlzW3Bpbk1vZGVdKHtcbiAgICAgIHBpbjogbm9ybWFsaXplZFBpbixcbiAgICAgIG1vZGU6IFNFUlZPX01PREVcbiAgICB9KTtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKG5vcm1hbGl6ZWRQaW4pKTtcbiAgICBwaW5JbnN0YW5jZS5taW4gPSBjb25maWcubWluO1xuICAgIHBpbkluc3RhbmNlLm1heCA9IGNvbmZpZy5tYXg7XG4gIH1cblxuICBzZXJ2b1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFNFUlZPX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIFNFUlZPX01PREUpO1xuICAgIH1cbiAgICBjb25zdCBkdXR5Q3ljbGUgPSAocGluSW5zdGFuY2UubWluICsgKHZhbHVlIC8gMTgwKSAqIChwaW5JbnN0YW5jZS5tYXggLSBwaW5JbnN0YW5jZS5taW4pKSAvIDIwMDAwO1xuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUoZHV0eUN5Y2xlICogcGluSW5zdGFuY2UucGVyaXBoZXJhbC5yYW5nZSk7XG4gIH1cblxuICBxdWVyeUNhcGFiaWxpdGllcyhjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBxdWVyeUFuYWxvZ01hcHBpbmcoY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcXVlcnlQaW5TdGF0ZShwaW4sIGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIFtpMmNDaGVja0FsaXZlXSgpIHtcbiAgICBpZiAoIXRoaXNbaTJjXS5hbGl2ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJMkMgcGlucyBub3QgaW4gSTJDIG1vZGUnKTtcbiAgICB9XG4gIH1cblxuICBpMmNDb25maWcob3B0aW9ucykge1xuICAgIGxldCBkZWxheTtcblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ251bWJlcicpIHtcbiAgICAgIGRlbGF5ID0gb3B0aW9ucztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJiBvcHRpb25zICE9PSBudWxsKSB7XG4gICAgICAgIGRlbGF5ID0gb3B0aW9ucy5kZWxheTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICB0aGlzW2kyY0RlbGF5XSA9IE1hdGgucm91bmQoKGRlbGF5IHx8IDApIC8gMTAwMCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGkyY1dyaXRlKGFkZHJlc3MsIGNtZFJlZ09yRGF0YSwgaW5CeXRlcykge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIC8vIElmIGkyY1dyaXRlIHdhcyB1c2VkIGZvciBhbiBpMmNXcml0ZVJlZyBjYWxsLi4uXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgJiZcbiAgICAgICAgIUFycmF5LmlzQXJyYXkoY21kUmVnT3JEYXRhKSAmJlxuICAgICAgICAhQXJyYXkuaXNBcnJheShpbkJ5dGVzKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaTJjV3JpdGVSZWcoYWRkcmVzcywgY21kUmVnT3JEYXRhLCBpbkJ5dGVzKTtcbiAgICB9XG5cbiAgICAvLyBGaXggYXJndW1lbnRzIGlmIGNhbGxlZCB3aXRoIEZpcm1hdGEuanMgQVBJXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGNtZFJlZ09yRGF0YSkpIHtcbiAgICAgICAgaW5CeXRlcyA9IGNtZFJlZ09yRGF0YS5zbGljZSgpO1xuICAgICAgICBjbWRSZWdPckRhdGEgPSBpbkJ5dGVzLnNoaWZ0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbkJ5dGVzID0gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYnVmZmVyID0gbmV3IEJ1ZmZlcihbY21kUmVnT3JEYXRhXS5jb25jYXQoaW5CeXRlcykpO1xuXG4gICAgLy8gT25seSB3cml0ZSBpZiBieXRlcyBwcm92aWRlZFxuICAgIGlmIChidWZmZXIubGVuZ3RoKSB7XG4gICAgICB0aGlzW2kyY10ud3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNXcml0ZVJlZyhhZGRyZXNzLCByZWdpc3RlciwgdmFsdWUpIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICB0aGlzW2kyY10ud3JpdGVCeXRlU3luYyhhZGRyZXNzLCByZWdpc3RlciwgdmFsdWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBbaTJjUmVhZF0oY29udGludW91cywgYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGVzVG9SZWFkLCBjYWxsYmFjaykge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIC8vIEZpeCBhcmd1bWVudHMgaWYgY2FsbGVkIHdpdGggRmlybWF0YS5qcyBBUElcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSA0ICYmXG4gICAgICB0eXBlb2YgcmVnaXN0ZXIgPT0gJ251bWJlcicgJiZcbiAgICAgIHR5cGVvZiBieXRlc1RvUmVhZCA9PSAnZnVuY3Rpb24nXG4gICAgKSB7XG4gICAgICBjYWxsYmFjayA9IGJ5dGVzVG9SZWFkO1xuICAgICAgYnl0ZXNUb1JlYWQgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gbnVsbDtcbiAgICB9XG5cbiAgICBjYWxsYmFjayA9IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogKCkgPT4ge307XG5cbiAgICBsZXQgZXZlbnQgPSBgaTJjLXJlcGx5LSR7YWRkcmVzc30tYDtcbiAgICBldmVudCArPSByZWdpc3RlciAhPT0gbnVsbCA/IHJlZ2lzdGVyIDogMDtcblxuICAgIGNvbnN0IHJlYWQgPSAoKSA9PiB7XG4gICAgICBjb25zdCBhZnRlclJlYWQgPSAoZXJyLCBidWZmZXIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnZlcnQgYnVmZmVyIHRvIEFycmF5IGJlZm9yZSBlbWl0XG4gICAgICAgIHRoaXMuZW1pdChldmVudCwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYnVmZmVyKSk7XG5cbiAgICAgICAgaWYgKGNvbnRpbnVvdXMpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KHJlYWQsIHRoaXNbaTJjRGVsYXldKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdGhpcy5vbmNlKGV2ZW50LCBjYWxsYmFjayk7XG5cbiAgICAgIGlmIChyZWdpc3RlciAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzW2kyY10ucmVhZChhZGRyZXNzLCByZWdpc3RlciwgYnl0ZXNUb1JlYWQsIGFmdGVyUmVhZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzW2kyY10ucmVhZChhZGRyZXNzLCBieXRlc1RvUmVhZCwgYWZ0ZXJSZWFkKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc2V0VGltZW91dChyZWFkLCB0aGlzW2kyY0RlbGF5XSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGkyY1JlYWQoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzW2kyY1JlYWRdKHRydWUsIC4uLnJlc3QpO1xuICB9XG5cbiAgaTJjUmVhZE9uY2UoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzW2kyY1JlYWRdKGZhbHNlLCAuLi5yZXN0KTtcbiAgfVxuXG4gIHNlbmRJMkNDb25maWcoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzLmkyY0NvbmZpZyguLi5yZXN0KTtcbiAgfVxuXG4gIHNlbmRJMkNXcml0ZVJlcXVlc3QoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzLmkyY1dyaXRlKC4uLnJlc3QpO1xuICB9XG5cbiAgc2VuZEkyQ1JlYWRSZXF1ZXN0KC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNSZWFkT25jZSguLi5yZXN0KTtcbiAgfVxuXG4gIHNlcmlhbENvbmZpZyh7IHBvcnRJZCwgYmF1ZCB9KSB7XG4gICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0gfHwgKGJhdWQgJiYgYmF1ZCAhPT0gdGhpc1tzZXJpYWxdLmJhdWRSYXRlKSkge1xuICAgICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fQ09ORklHLFxuICAgICAgICBwb3J0SWQsXG4gICAgICAgIGJhdWRcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNlcmlhbFdyaXRlKHBvcnRJZCwgaW5CeXRlcykge1xuICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgdHlwZTogU0VSSUFMX0FDVElPTl9XUklURSxcbiAgICAgIHBvcnRJZCxcbiAgICAgIGluQnl0ZXNcbiAgICB9KTtcbiAgfVxuXG4gIHNlcmlhbFJlYWQocG9ydElkLCBtYXhCeXRlc1RvUmVhZCwgaGFuZGxlcikge1xuICAgIGlmICh0eXBlb2YgbWF4Qnl0ZXNUb1JlYWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGhhbmRsZXIgPSBtYXhCeXRlc1RvUmVhZDtcbiAgICAgIG1heEJ5dGVzVG9SZWFkID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fUkVBRCxcbiAgICAgIHBvcnRJZCxcbiAgICAgIG1heEJ5dGVzVG9SZWFkLFxuICAgICAgaGFuZGxlclxuICAgIH0pO1xuICB9XG5cbiAgc2VyaWFsU3RvcChwb3J0SWQpIHtcbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fU1RPUCxcbiAgICAgIHBvcnRJZFxuICAgIH0pO1xuICB9XG5cbiAgc2VyaWFsQ2xvc2UocG9ydElkKSB7XG4gICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX0NMT1NFLFxuICAgICAgcG9ydElkXG4gICAgfSk7XG4gIH1cblxuICBzZXJpYWxGbHVzaChwb3J0SWQpIHtcbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fRkxVU0gsXG4gICAgICBwb3J0SWRcbiAgICB9KTtcbiAgfVxuXG4gIFthZGRUb1NlcmlhbFF1ZXVlXShhY3Rpb24pIHtcbiAgICBpZiAoYWN0aW9uLnBvcnRJZCAhPT0gREVGQVVMVF9QT1JUKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgc2VyaWFsIHBvcnQgXCIke3BvcnRJZH1cImApO1xuICAgIH1cbiAgICB0aGlzW3NlcmlhbFF1ZXVlXS5wdXNoKGFjdGlvbik7XG4gICAgdGhpc1tzZXJpYWxQdW1wXSgpO1xuICB9XG5cbiAgW3NlcmlhbFB1bXBdKCkge1xuICAgIGlmICh0aGlzW2lzU2VyaWFsUHJvY2Vzc2luZ10gfHwgIXRoaXNbc2VyaWFsUXVldWVdLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzW2lzU2VyaWFsUHJvY2Vzc2luZ10gPSB0cnVlO1xuICAgIGNvbnN0IGFjdGlvbiA9IHRoaXNbc2VyaWFsUXVldWVdLnNoaWZ0KCk7XG4gICAgY29uc3QgZmluYWxpemUgPSAoKSA9PiB7XG4gICAgICB0aGlzW2lzU2VyaWFsUHJvY2Vzc2luZ10gPSBmYWxzZTtcbiAgICAgIHRoaXNbc2VyaWFsUHVtcF0oKTtcbiAgICB9O1xuICAgIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9XUklURTpcbiAgICAgICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCB3cml0ZSB0byBjbG9zZWQgc2VyaWFsIHBvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzW3NlcmlhbF0ud3JpdGUoYWN0aW9uLmluQnl0ZXMsIGZpbmFsaXplKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9SRUFEOlxuICAgICAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHJlYWQgZnJvbSBjbG9zZWQgc2VyaWFsIHBvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPOiBhZGQgc3VwcG9ydCBmb3IgYWN0aW9uLm1heEJ5dGVzVG9SZWFkXG4gICAgICAgIHRoaXNbc2VyaWFsXS5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgYWN0aW9uLmhhbmRsZXIoYnVmZmVyVG9BcnJheShkYXRhKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZpbmFsaXplKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9TVE9QOlxuICAgICAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHN0b3AgY2xvc2VkIHNlcmlhbCBwb3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpc1tzZXJpYWxdLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZpbmFsaXplKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9DT05GSUc6XG4gICAgICAgIHRoaXNbc2VyaWFsXS5jbG9zZSgoKSA9PiB7XG4gICAgICAgICAgdGhpc1tzZXJpYWxdID0gbmV3IFNlcmlhbCh7XG4gICAgICAgICAgICBiYXVkUmF0ZTogYWN0aW9uLmJhdWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzW3NlcmlhbF0ub3BlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzW3NlcmlhbF0ub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmVtaXQoYHNlcmlhbC1kYXRhLSR7YWN0aW9uLnBvcnRJZH1gLCBidWZmZXJUb0FycmF5KGRhdGEpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpc1tpc1NlcmlhbE9wZW5dID0gdHJ1ZTtcbiAgICAgICAgICAgIGZpbmFsaXplKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX0NMT1NFOlxuICAgICAgICB0aGlzW3NlcmlhbF0uY2xvc2UoKCkgPT4ge1xuICAgICAgICAgIHRoaXNbaXNTZXJpYWxPcGVuXSA9IGZhbHNlO1xuICAgICAgICAgIGZpbmFsaXplKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX0ZMVVNIOlxuICAgICAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZsdXNoIGNsb3NlZCBzZXJpYWwgcG9ydCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXNbc2VyaWFsXS5mbHVzaChmaW5hbGl6ZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludGVybmFsIGVycm9yOiB1bmtub3duIHNlcmlhbCBhY3Rpb24gdHlwZScpO1xuICAgIH1cbiAgfVxuXG4gIHNlbmRPbmVXaXJlQ29uZmlnKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVDb25maWcgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVNlYXJjaCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlU2VhcmNoIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVBbGFybXNTZWFyY2goKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZUFsYXJtc1NlYXJjaCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlUmVzZXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZUNvbmZpZyBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlV3JpdGUoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVdyaXRlIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVEZWxheSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlRGVsYXkgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlV3JpdGVBbmRSZWFkIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2V0U2FtcGxpbmdJbnRlcnZhbCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFNhbXBsaW5nSW50ZXJ2YWwgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcmVwb3J0QW5hbG9nUGluKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVwb3J0QW5hbG9nUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHJlcG9ydERpZ2l0YWxQaW4oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZXBvcnREaWdpdGFsUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHBpbmdSZWFkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncGluZ1JlYWQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcHVsc2VJbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3B1bHNlSW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgc3RlcHBlckNvbmZpZygpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0ZXBwZXJDb25maWcgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgc3RlcHBlclN0ZXAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzdGVwcGVyU3RlcCBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFJhc3BpLCAnaXNSYXNwYmVycnlQaScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgdmFsdWU6ICgpID0+IHtcbiAgICAvLyBEZXRlcm1pbmluZyBpZiBhIHN5c3RlbSBpcyBhIFJhc3BiZXJyeSBQaSBpc24ndCBwb3NzaWJsZSB0aHJvdWdoXG4gICAgLy8gdGhlIG9zIG1vZHVsZSBvbiBSYXNwYmlhbiwgc28gd2UgcmVhZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbSBpbnN0ZWFkXG4gICAgbGV0IGlzUmFzcGJlcnJ5UGkgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgaXNSYXNwYmVycnlQaSA9IGZzLnJlYWRGaWxlU3luYygnL2V0Yy9vcy1yZWxlYXNlJykudG9TdHJpbmcoKS5pbmRleE9mKCdSYXNwYmlhbicpICE9PSAtMTtcbiAgICB9IGNhdGNoIChlKSB7fS8vIFNxdWFzaCBmaWxlIG5vdCBmb3VuZCwgZXRjIGVycm9yc1xuICAgIHJldHVybiBpc1Jhc3BiZXJyeVBpO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXNwaTtcbiJdfQ==