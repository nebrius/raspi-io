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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQXlCQTs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7OytlQWxDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9DQTtBQUNBLElBQU0sYUFBYSxDQUFuQjtBQUNBLElBQU0sY0FBYyxDQUFwQjtBQUNBLElBQU0sY0FBYyxDQUFwQjtBQUNBLElBQU0sV0FBVyxDQUFqQjtBQUNBLElBQU0sYUFBYSxDQUFuQjtBQUNBLElBQU0sZUFBZSxFQUFyQjs7QUFFQSxJQUFNLE1BQU0sQ0FBWjtBQUNBLElBQU0sT0FBTyxDQUFiOztBQUVBLElBQU0sVUFBVSxDQUFDLENBQWpCOztBQUVBO0FBQ0EsSUFBTSxvQkFBb0IsSUFBMUI7QUFDQSxJQUFNLG9CQUFvQixJQUExQjtBQUNBLElBQU0sMkJBQTJCLEVBQWpDOztBQUVBO0FBQ0EsSUFBTSxVQUFVLE9BQU8sU0FBUCxDQUFoQjtBQUNBLElBQU0sT0FBTyxPQUFPLE1BQVAsQ0FBYjtBQUNBLElBQU0sWUFBWSxPQUFPLFdBQVAsQ0FBbEI7QUFDQSxJQUFNLGFBQWEsT0FBTyxZQUFQLENBQW5CO0FBQ0EsSUFBTSxnQkFBZ0IsT0FBTyxlQUFQLENBQXRCO0FBQ0EsSUFBTSxpQkFBaUIsT0FBTyxnQkFBUCxDQUF2QjtBQUNBLElBQU0sTUFBTSxPQUFPLEtBQVAsQ0FBWjtBQUNBLElBQU0sV0FBVyxPQUFPLFVBQVAsQ0FBakI7QUFDQSxJQUFNLFdBQVUsT0FBTyxTQUFQLENBQWhCO0FBQ0EsSUFBTSxnQkFBZ0IsT0FBTyxlQUFQLENBQXRCO0FBQ0EsSUFBTSxXQUFVLE9BQU8sU0FBUCxDQUFoQjtBQUNBLElBQU0sU0FBUyxPQUFPLFFBQVAsQ0FBZjtBQUNBLElBQU0sY0FBYyxPQUFPLGFBQVAsQ0FBcEI7QUFDQSxJQUFNLG1CQUFtQixPQUFPLGtCQUFQLENBQXpCO0FBQ0EsSUFBTSxhQUFhLE9BQU8sWUFBUCxDQUFuQjtBQUNBLElBQU0scUJBQXFCLE9BQU8sb0JBQVAsQ0FBM0I7QUFDQSxJQUFNLGVBQWUsT0FBTyxjQUFQLENBQXJCOztBQUVBLElBQU0sc0JBQXNCLHFCQUE1QjtBQUNBLElBQU0sc0JBQXNCLHFCQUE1QjtBQUNBLElBQU0sc0JBQXNCLHFCQUE1QjtBQUNBLElBQU0sdUJBQXVCLHNCQUE3QjtBQUNBLElBQU0scUJBQXFCLG9CQUEzQjtBQUNBLElBQU0scUJBQXFCLG9CQUEzQjs7QUFFQSxTQUFTLGFBQVQsQ0FBdUIsTUFBdkIsRUFBK0I7QUFDN0IsTUFBTSxRQUFRLE1BQU0sT0FBTyxNQUFiLENBQWQ7QUFDQSxPQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksT0FBTyxNQUEzQixFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxVQUFNLENBQU4sSUFBVyxPQUFPLENBQVAsQ0FBWDtBQUNEO0FBQ0QsU0FBTyxLQUFQO0FBQ0Q7O0lBRUssSzs7O0FBRUosbUJBQXNFO0FBQUE7O0FBQUEscUVBQUosRUFBSTs7QUFBQSxRQUF4RCxXQUF3RCxRQUF4RCxXQUF3RDtBQUFBLFFBQTNDLFdBQTJDLFFBQTNDLFdBQTJDO0FBQUEsa0NBQTlCLGFBQThCO0FBQUEsUUFBOUIsYUFBOEIsc0NBQWQsS0FBYzs7QUFBQTs7QUFBQTs7QUFHcEUsV0FBTyxnQkFBUDtBQUNFLFlBQU07QUFDSixvQkFBWSxJQURSO0FBRUosZUFBTztBQUZIOztBQURSLDhDQU1HLFNBTkgsRUFNZTtBQUNYLGdCQUFVLElBREM7QUFFWCxhQUFPO0FBRkksS0FOZiwwQ0FXRyxPQVhILEVBV2E7QUFDVCxnQkFBVSxJQUREO0FBRVQsYUFBTztBQUZFLEtBWGIscURBZVc7QUFDUCxrQkFBWSxJQURMO0FBRVAsU0FGTyxpQkFFRDtBQUNKLGVBQU8sS0FBSyxPQUFMLENBQVA7QUFDRDtBQUpNLEtBZlgsMENBc0JHLElBdEJILEVBc0JVO0FBQ04sZ0JBQVUsSUFESjtBQUVOLGFBQU87QUFGRCxLQXRCVixrREEwQlE7QUFDSixrQkFBWSxJQURSO0FBRUosU0FGSSxpQkFFRTtBQUNKLGVBQU8sS0FBSyxJQUFMLENBQVA7QUFDRDtBQUpHLEtBMUJSLDBDQWlDRyxVQWpDSCxFQWlDZ0I7QUFDWixnQkFBVSxJQURFO0FBRVosYUFBTztBQUZLLEtBakNoQix3REFxQ2M7QUFDVixrQkFBWSxJQURGO0FBRVYsU0FGVSxpQkFFSjtBQUNKLGVBQU8sS0FBSyxVQUFMLENBQVA7QUFDRDtBQUpTLEtBckNkLDBDQTRDRyxHQTVDSCxFQTRDUztBQUNMLGdCQUFVLElBREw7QUFFTCxhQUFPO0FBRkYsS0E1Q1QsMENBaURHLFFBakRILEVBaURjO0FBQ1YsZ0JBQVUsSUFEQTtBQUVWLGFBQU87QUFGRyxLQWpEZCwwQ0FzREcsTUF0REgsRUFzRFk7QUFDUixnQkFBVSxJQURGO0FBRVIsYUFBTztBQUZDLEtBdERaLDBDQTJERyxXQTNESCxFQTJEaUI7QUFDYixhQUFPO0FBRE0sS0EzRGpCLDBDQStERyxrQkEvREgsRUErRHdCO0FBQ3BCLGdCQUFVLElBRFU7QUFFcEIsYUFBTztBQUZhLEtBL0R4QiwwQ0FvRUcsWUFwRUgsRUFvRWtCO0FBQ2QsZ0JBQVUsSUFESTtBQUVkLGFBQU87QUFGTyxLQXBFbEIsbURBeUVTO0FBQ0wsa0JBQVksSUFEUDtBQUVMLGFBQU8sT0FBTyxNQUFQLENBQWM7QUFDbkIsZUFBTyxVQURZO0FBRW5CLGdCQUFRLFdBRlc7QUFHbkIsZ0JBQVEsV0FIVztBQUluQixhQUFLLFFBSmM7QUFLbkIsZUFBTztBQUxZLE9BQWQ7QUFGRixLQXpFVCxrREFvRlE7QUFDSixrQkFBWSxJQURSO0FBRUosYUFBTztBQUZILEtBcEZSLGlEQXdGTztBQUNILGtCQUFZLElBRFQ7QUFFSCxhQUFPO0FBRkosS0F4RlAsd0RBNkZjO0FBQ1Ysa0JBQVksSUFERjtBQUVWLGFBQU87QUFGRyxLQTdGZCw2REFrR21CO0FBQ2Ysa0JBQVksSUFERztBQUVmLGFBQU8sT0FBTyxNQUFQLENBQWM7QUFDbkIsNkNBRG1CO0FBRW5CO0FBRm1CLE9BQWQ7QUFGUSxLQWxHbkI7O0FBMkdBLHFCQUFLLFlBQU07QUFDVCxVQUFJLGNBQWMsMEJBQWxCO0FBQ0EsWUFBSyxJQUFMLElBQWEsRUFBYjs7QUFFQTtBQUNBLGtCQUFZLE9BQVosSUFBdUI7QUFDckIsY0FBTSxDQUFFLE9BQUYsQ0FEZTtBQUVyQixxQkFBYSxDQUFFLE1BQUY7QUFGUSxPQUF2Qjs7QUFLQSxVQUFJLGVBQWUsV0FBbkIsRUFBZ0M7QUFDOUIsY0FBTSxJQUFJLEtBQUosQ0FBVSxzRUFBVixDQUFOO0FBQ0Q7O0FBRUQsVUFBSSxNQUFNLE9BQU4sQ0FBYyxXQUFkLENBQUosRUFBZ0M7QUFDOUIsWUFBTSxpQkFBaUIsRUFBdkI7QUFEOEI7QUFBQTtBQUFBOztBQUFBO0FBRTlCLCtCQUFrQixXQUFsQiw4SEFBK0I7QUFBQSxnQkFBcEIsR0FBb0I7O0FBQzdCLGdCQUFNLGdCQUFnQiw4QkFBYSxHQUFiLENBQXRCO0FBQ0EsZ0JBQUksa0JBQWtCLElBQXRCLEVBQTRCO0FBQzFCLG9CQUFNLElBQUksS0FBSixtQkFBMEIsR0FBMUIsZ0NBQU47QUFDRDtBQUNELDJCQUFlLGFBQWYsSUFBZ0MsWUFBWSxhQUFaLENBQWhDO0FBQ0Q7QUFSNkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFTOUIsc0JBQWMsY0FBZDtBQUNELE9BVkQsTUFVTyxJQUFJLE1BQU0sT0FBTixDQUFjLFdBQWQsQ0FBSixFQUFnQztBQUNyQyxzQkFBYyxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLFdBQWxCLENBQWQ7QUFEcUM7QUFBQTtBQUFBOztBQUFBO0FBRXJDLGdDQUFrQixXQUFsQixtSUFBK0I7QUFBQSxnQkFBcEIsSUFBb0I7O0FBQzdCLGdCQUFNLGlCQUFnQiw4QkFBYSxJQUFiLENBQXRCO0FBQ0EsZ0JBQUksbUJBQWtCLElBQXRCLEVBQTRCO0FBQzFCLG9CQUFNLElBQUksS0FBSixtQkFBMEIsSUFBMUIsZ0NBQU47QUFDRDtBQUNELG1CQUFPLFlBQVksY0FBWixDQUFQO0FBQ0Q7QUFSb0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVN0Qzs7QUFFRCxhQUFPLElBQVAsQ0FBWSxXQUFaLEVBQXlCLE9BQXpCLENBQWlDLFVBQUMsR0FBRCxFQUFTO0FBQ3hDLFlBQU0sVUFBVSxZQUFZLEdBQVosQ0FBaEI7QUFDQSxZQUFNLGlCQUFpQixFQUF2QjtBQUNBO0FBQ0E7QUFDQSxZQUFJLFFBQVEsV0FBUixDQUFvQixPQUFwQixDQUE0QixLQUE1QixLQUFzQyxDQUFDLENBQXZDLElBQTRDLFFBQVEsV0FBUixDQUFvQixPQUFwQixDQUE0QixNQUE1QixLQUF1QyxDQUFDLENBQXhGLEVBQTJGO0FBQ3pGLGNBQUksT0FBTyxPQUFYLEVBQW9CO0FBQ2xCLDJCQUFlLElBQWYsQ0FBb0IsV0FBcEI7QUFDRCxXQUZELE1BRU8sSUFBSSxRQUFRLFdBQVIsQ0FBb0IsT0FBcEIsQ0FBNEIsTUFBNUIsS0FBdUMsQ0FBQyxDQUE1QyxFQUErQztBQUNwRCwyQkFBZSxJQUFmLENBQW9CLFVBQXBCLEVBQWdDLFdBQWhDO0FBQ0Q7QUFDRCxjQUFJLFFBQVEsV0FBUixDQUFvQixPQUFwQixDQUE0QixLQUE1QixLQUFzQyxDQUFDLENBQTNDLEVBQThDO0FBQzVDLDJCQUFlLElBQWYsQ0FBb0IsUUFBcEIsRUFBOEIsVUFBOUI7QUFDRCxXQUZELE1BRU8sSUFBSSxrQkFBa0IsSUFBbEIsSUFBMEIsUUFBUSxXQUFSLENBQW9CLE9BQXBCLENBQTRCLE1BQTVCLEtBQXVDLENBQUMsQ0FBdEUsRUFBeUU7QUFDOUUsMkJBQWUsSUFBZixDQUFvQixRQUFwQixFQUE4QixVQUE5QjtBQUNEO0FBQ0Y7QUFDRCxZQUFNLFdBQVcsTUFBSyxTQUFMLEVBQWdCLEdBQWhCLElBQXVCO0FBQ3RDLHNCQUFZLElBRDBCO0FBRXRDLGdCQUFNLGVBQWUsT0FBZixDQUF1QixXQUF2QixLQUF1QyxDQUFDLENBQXhDLEdBQTRDLFlBQTVDLEdBQTJELFdBRjNCOztBQUl0QztBQUNBLGdDQUFzQixHQUxnQjs7QUFPdEM7QUFDQSxlQUFLLGlCQVJpQztBQVN0QyxlQUFLO0FBVGlDLFNBQXhDO0FBV0EsY0FBSyxJQUFMLEVBQVcsR0FBWCxJQUFrQixPQUFPLE1BQVAsQ0FBYyxJQUFkO0FBQ2hCLDBCQUFnQjtBQUNkLHdCQUFZLElBREU7QUFFZCxtQkFBTyxPQUFPLE1BQVAsQ0FBYyxjQUFkO0FBRk8sV0FEQTtBQUtoQixnQkFBTTtBQUNKLHdCQUFZLElBRFI7QUFFSixlQUZJLGlCQUVFO0FBQ0oscUJBQU8sU0FBUyxJQUFoQjtBQUNEO0FBSkcsV0FMVTtBQVdoQixpQkFBTztBQUNMLHdCQUFZLElBRFA7QUFFTCxlQUZLLGlCQUVDO0FBQ0osc0JBQVEsU0FBUyxJQUFqQjtBQUNFLHFCQUFLLFVBQUw7QUFDRSx5QkFBTyxTQUFTLFVBQVQsQ0FBb0IsSUFBcEIsRUFBUDtBQUNGLHFCQUFLLFdBQUw7QUFDRSx5QkFBTyxTQUFTLG9CQUFoQjtBQUNGO0FBQ0UseUJBQU8sSUFBUDtBQU5KO0FBUUQsYUFYSTtBQVlMLGVBWkssZUFZRCxLQVpDLEVBWU07QUFDVCxrQkFBSSxTQUFTLElBQVQsSUFBaUIsV0FBckIsRUFBa0M7QUFDaEMseUJBQVMsVUFBVCxDQUFvQixLQUFwQixDQUEwQixLQUExQjtBQUNEO0FBQ0Y7QUFoQkksV0FYUztBQTZCaEIsa0JBQVE7QUFDTix3QkFBWSxJQUROO0FBRU4sbUJBQU87QUFGRCxXQTdCUTtBQWlDaEIseUJBQWU7QUFDYix3QkFBWSxJQURDO0FBRWIsbUJBQU87QUFGTTtBQWpDQyxXQXFDZixhQXJDZSxFQXFDQztBQUNmLHNCQUFZLEtBREc7QUFFZixpQkFBTyxRQUFRLFdBQVIsQ0FBb0IsT0FBcEIsQ0FBNEIsS0FBNUIsS0FBc0MsQ0FBQztBQUYvQixTQXJDRCxFQUFsQjtBQTBDQSxZQUFJLFNBQVMsSUFBVCxJQUFpQixXQUFyQixFQUFrQztBQUNoQyxnQkFBSyxPQUFMLENBQWEsR0FBYixFQUFrQixXQUFsQjtBQUNBLGdCQUFLLFlBQUwsQ0FBa0IsR0FBbEIsRUFBdUIsR0FBdkI7QUFDRDtBQUNGLE9BMUVEOztBQTRFQTtBQUNBLFdBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxNQUFLLElBQUwsRUFBVyxNQUEvQixFQUF1QyxHQUF2QyxFQUE0QztBQUMxQyxZQUFJLENBQUMsTUFBSyxJQUFMLEVBQVcsQ0FBWCxDQUFMLEVBQW9CO0FBQ2xCLGdCQUFLLElBQUwsRUFBVyxDQUFYLElBQWdCLE9BQU8sTUFBUCxDQUFjLElBQWQsRUFBb0I7QUFDbEMsNEJBQWdCO0FBQ2QsMEJBQVksSUFERTtBQUVkLHFCQUFPLE9BQU8sTUFBUCxDQUFjLEVBQWQ7QUFGTyxhQURrQjtBQUtsQyxrQkFBTTtBQUNKLDBCQUFZLElBRFI7QUFFSixpQkFGSSxpQkFFRTtBQUNKLHVCQUFPLFlBQVA7QUFDRDtBQUpHLGFBTDRCO0FBV2xDLG1CQUFPO0FBQ0wsMEJBQVksSUFEUDtBQUVMLGlCQUZLLGlCQUVDO0FBQ0osdUJBQU8sQ0FBUDtBQUNELGVBSkk7QUFLTCxpQkFMSyxpQkFLQyxDQUFFO0FBTEgsYUFYMkI7QUFrQmxDLG9CQUFRO0FBQ04sMEJBQVksSUFETjtBQUVOLHFCQUFPO0FBRkQsYUFsQjBCO0FBc0JsQywyQkFBZTtBQUNiLDBCQUFZLElBREM7QUFFYixxQkFBTztBQUZNO0FBdEJtQixXQUFwQixDQUFoQjtBQTJCRDtBQUNGOztBQUVELFlBQUssWUFBTCxDQUFrQjtBQUNoQix5Q0FEZ0I7QUFFaEIsY0FBTTtBQUZVLE9BQWxCOztBQUtBLFlBQUssT0FBTCxJQUFnQixJQUFoQjtBQUNBLFlBQUssSUFBTCxDQUFVLE9BQVY7QUFDQSxZQUFLLElBQUwsQ0FBVSxTQUFWO0FBQ0QsS0F4SkQ7QUE5R29FO0FBdVFyRTs7Ozs0QkFFTztBQUNOLFlBQU0sSUFBSSxLQUFKLENBQVUsNENBQVYsQ0FBTjtBQUNEOzs7OEJBRVMsRyxFQUFLO0FBQ2IsVUFBTSxnQkFBZ0IsOEJBQWEsR0FBYixDQUF0QjtBQUNBLFVBQUksT0FBTyxhQUFQLEtBQXlCLFFBQTdCLEVBQXVDO0FBQ3JDLGNBQU0sSUFBSSxLQUFKLG1CQUEwQixHQUExQixPQUFOO0FBQ0Q7QUFDRCxhQUFPLGFBQVA7QUFDRDs7U0FFQSxjOzBCQUFnQixHLEVBQUs7QUFDcEIsVUFBTSxjQUFjLEtBQUssU0FBTCxFQUFnQixHQUFoQixDQUFwQjtBQUNBLFVBQUksQ0FBQyxXQUFMLEVBQWtCO0FBQ2hCLGNBQU0sSUFBSSxLQUFKLG1CQUEwQixHQUExQixPQUFOO0FBQ0Q7QUFDRCxhQUFPLFdBQVA7QUFDRDs7OzRCQUVPLEcsRUFBSyxJLEVBQU07QUFDakIsV0FBSyxRQUFMLEVBQWMsRUFBRSxRQUFGLEVBQU8sVUFBUCxFQUFkO0FBQ0Q7O1NBRUEsUTtpQ0FBa0Q7QUFBQSxVQUF2QyxHQUF1QyxTQUF2QyxHQUF1QztBQUFBLFVBQWxDLElBQWtDLFNBQWxDLElBQWtDO0FBQUEscUNBQTVCLFlBQTRCO0FBQUEsVUFBNUIsWUFBNEI7O0FBQ2pELFVBQU0sZ0JBQWdCLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBdEI7QUFDQSxVQUFNLGNBQWMsS0FBSyxjQUFMLEVBQXFCLGFBQXJCLENBQXBCO0FBQ0Esa0JBQVksWUFBWixHQUEyQixZQUEzQjtBQUNBLFVBQU0sU0FBUztBQUNiLGFBQUssYUFEUTtBQUViLHNCQUFjLFlBQVk7QUFGYixPQUFmO0FBSUEsVUFBSSxLQUFLLElBQUwsRUFBVyxhQUFYLEVBQTBCLGNBQTFCLENBQXlDLE9BQXpDLENBQWlELElBQWpELEtBQTBELENBQUMsQ0FBL0QsRUFBa0U7QUFDaEUsY0FBTSxJQUFJLEtBQUosV0FBa0IsR0FBbEIsaUNBQWlELElBQWpELE9BQU47QUFDRDs7QUFFRCxVQUFJLE9BQU8sT0FBWCxFQUFvQjtBQUNsQixZQUFJLFlBQVksVUFBWix5QkFBSixFQUEyQztBQUN6QztBQUNEO0FBQ0Qsb0JBQVksVUFBWixHQUF5QixtQkFBekI7QUFDRCxPQUxELE1BS087QUFDTCxnQkFBUSxJQUFSO0FBQ0UsZUFBSyxVQUFMO0FBQ0Usd0JBQVksVUFBWixHQUF5Qiw0QkFBaUIsTUFBakIsQ0FBekI7QUFDQTtBQUNGLGVBQUssV0FBTDtBQUNFLHdCQUFZLFVBQVosR0FBeUIsNkJBQWtCLE1BQWxCLENBQXpCO0FBQ0E7QUFDRixlQUFLLFFBQUw7QUFDQSxlQUFLLFVBQUw7QUFDRSxnQkFBSSxLQUFLLElBQUwsRUFBVyxhQUFYLEVBQTBCLGFBQTFCLE1BQTZDLElBQWpELEVBQXVEO0FBQ3JELDBCQUFZLFVBQVosR0FBeUIsa0JBQVEsYUFBUixDQUF6QjtBQUNELGFBRkQsTUFFTztBQUNMLDBCQUFZLFVBQVosR0FBeUIsMEJBQVk7QUFDbkMscUJBQUssYUFEOEI7QUFFbkMsdUJBQU87QUFGNEIsZUFBWixDQUF6QjtBQUlEO0FBQ0Q7QUFDRjtBQUNFLG9CQUFRLElBQVIsd0JBQWtDLElBQWxDO0FBQ0E7QUFwQko7QUFzQkQ7QUFDRCxrQkFBWSxJQUFaLEdBQW1CLElBQW5CO0FBQ0Q7OztpQ0FFWTtBQUNYLFlBQU0sSUFBSSxLQUFKLENBQVUsaURBQVYsQ0FBTjtBQUNEOzs7Z0NBRVcsRyxFQUFLLEssRUFBTztBQUN0QixXQUFLLFFBQUwsQ0FBYyxHQUFkLEVBQW1CLEtBQW5CO0FBQ0Q7Ozs2QkFFUSxHLEVBQUssSyxFQUFPO0FBQ25CLFVBQU0sY0FBYyxLQUFLLGNBQUwsRUFBcUIsS0FBSyxTQUFMLENBQWUsR0FBZixDQUFyQixDQUFwQjtBQUNBLFVBQUksWUFBWSxJQUFaLElBQW9CLFFBQXhCLEVBQWtDO0FBQ2hDLGFBQUssT0FBTCxDQUFhLEdBQWIsRUFBa0IsUUFBbEI7QUFDRDtBQUNELGtCQUFZLFVBQVosQ0FBdUIsS0FBdkIsQ0FBNkIsS0FBSyxLQUFMLENBQVcsUUFBUSxZQUFZLFVBQVosQ0FBdUIsS0FBL0IsR0FBdUMsR0FBbEQsQ0FBN0I7QUFDRDs7O2dDQUVXLEcsRUFBSyxPLEVBQVM7QUFBQTs7QUFDeEIsVUFBTSxjQUFjLEtBQUssY0FBTCxFQUFxQixLQUFLLFNBQUwsQ0FBZSxHQUFmLENBQXJCLENBQXBCO0FBQ0EsVUFBSSxZQUFZLElBQVosSUFBb0IsVUFBeEIsRUFBb0M7QUFDbEMsYUFBSyxPQUFMLENBQWEsR0FBYixFQUFrQixVQUFsQjtBQUNEO0FBQ0QsVUFBTSxXQUFXLFlBQVksWUFBTTtBQUNqQyxZQUFJLGNBQUo7QUFDQSxZQUFJLFlBQVksSUFBWixJQUFvQixVQUF4QixFQUFvQztBQUNsQyxrQkFBUSxZQUFZLFVBQVosQ0FBdUIsSUFBdkIsRUFBUjtBQUNELFNBRkQsTUFFTztBQUNMLGtCQUFRLFlBQVksb0JBQXBCO0FBQ0Q7QUFDRCxZQUFJLE9BQUosRUFBYTtBQUNYLGtCQUFRLEtBQVI7QUFDRDtBQUNELGVBQUssSUFBTCxtQkFBMEIsR0FBMUIsRUFBaUMsS0FBakM7QUFDRCxPQVhnQixFQVdkLHdCQVhjLENBQWpCO0FBWUEsa0JBQVksVUFBWixDQUF1QixFQUF2QixDQUEwQixXQUExQixFQUF1QyxZQUFNO0FBQzNDLHNCQUFjLFFBQWQ7QUFDRCxPQUZEO0FBR0Q7OztpQ0FFWSxHLEVBQUssSyxFQUFPO0FBQ3ZCLFVBQU0sY0FBYyxLQUFLLGNBQUwsRUFBcUIsS0FBSyxTQUFMLENBQWUsR0FBZixDQUFyQixDQUFwQjtBQUNBLFVBQUksWUFBWSxJQUFaLEtBQXFCLFVBQXJCLElBQW1DLFVBQVUsSUFBakQsRUFBdUQ7QUFDckQsYUFBSyxRQUFMLEVBQWMsRUFBRSxRQUFGLEVBQU8sTUFBTSxVQUFiLEVBQXlCLGdDQUF6QixFQUFkO0FBQ0QsT0FGRCxNQUVPLElBQUksWUFBWSxJQUFaLEtBQXFCLFVBQXJCLElBQW1DLFVBQVUsR0FBakQsRUFBc0Q7QUFDM0QsYUFBSyxRQUFMLEVBQWMsRUFBRSxRQUFGLEVBQU8sTUFBTSxVQUFiLEVBQXlCLGtDQUF6QixFQUFkO0FBQ0QsT0FGTSxNQUVBLElBQUksWUFBWSxJQUFaLElBQW9CLFdBQXhCLEVBQXFDO0FBQzFDLGFBQUssUUFBTCxFQUFjLEVBQUUsUUFBRixFQUFPLE1BQU0sV0FBYixFQUFkO0FBQ0Q7QUFDRCxVQUFJLFlBQVksSUFBWixLQUFxQixXQUFyQixJQUFvQyxTQUFTLFlBQVksb0JBQTdELEVBQW1GO0FBQ2pGLG9CQUFZLFVBQVosQ0FBdUIsS0FBdkIsQ0FBNkIsUUFBUSxJQUFSLEdBQWUsR0FBNUM7QUFDQSxvQkFBWSxvQkFBWixHQUFtQyxLQUFuQztBQUNEO0FBQ0Y7OztnQ0FFVyxHLEVBQUssRyxFQUFLLEcsRUFBSztBQUN6QixVQUFJLFNBQVMsR0FBYjtBQUNBLFVBQUksUUFBTyxNQUFQLHlDQUFPLE1BQVAsT0FBa0IsUUFBdEIsRUFBZ0M7QUFDOUIsaUJBQVMsRUFBRSxRQUFGLEVBQU8sUUFBUCxFQUFZLFFBQVosRUFBVDtBQUNEO0FBQ0QsVUFBSSxPQUFPLE9BQU8sR0FBZCxLQUFzQixRQUExQixFQUFvQztBQUNsQyxlQUFPLEdBQVAsR0FBYSxpQkFBYjtBQUNEO0FBQ0QsVUFBSSxPQUFPLE9BQU8sR0FBZCxLQUFzQixRQUExQixFQUFvQztBQUNsQyxlQUFPLEdBQVAsR0FBYSxpQkFBYjtBQUNEO0FBQ0QsVUFBTSxnQkFBZ0IsS0FBSyxTQUFMLENBQWUsR0FBZixDQUF0QjtBQUNBLFdBQUssUUFBTCxFQUFjO0FBQ1osYUFBSyxhQURPO0FBRVosY0FBTTtBQUZNLE9BQWQ7QUFJQSxVQUFNLGNBQWMsS0FBSyxjQUFMLEVBQXFCLEtBQUssU0FBTCxDQUFlLGFBQWYsQ0FBckIsQ0FBcEI7QUFDQSxrQkFBWSxHQUFaLEdBQWtCLE9BQU8sR0FBekI7QUFDQSxrQkFBWSxHQUFaLEdBQWtCLE9BQU8sR0FBekI7QUFDRDs7OytCQUVVLEcsRUFBSyxLLEVBQU87QUFDckIsVUFBTSxjQUFjLEtBQUssY0FBTCxFQUFxQixLQUFLLFNBQUwsQ0FBZSxHQUFmLENBQXJCLENBQXBCO0FBQ0EsVUFBSSxZQUFZLElBQVosSUFBb0IsVUFBeEIsRUFBb0M7QUFDbEMsYUFBSyxPQUFMLENBQWEsR0FBYixFQUFrQixVQUFsQjtBQUNEO0FBQ0QsVUFBTSxZQUFZLENBQUMsWUFBWSxHQUFaLEdBQW1CLFFBQVEsR0FBVCxJQUFpQixZQUFZLEdBQVosR0FBa0IsWUFBWSxHQUEvQyxDQUFuQixJQUEwRSxLQUE1RjtBQUNBLGtCQUFZLFVBQVosQ0FBdUIsS0FBdkIsQ0FBNkIsWUFBWSxZQUFZLFVBQVosQ0FBdUIsS0FBaEU7QUFDRDs7O3NDQUVpQixFLEVBQUk7QUFDcEIsVUFBSSxLQUFLLE9BQVQsRUFBa0I7QUFDaEIsZ0JBQVEsUUFBUixDQUFpQixFQUFqQjtBQUNELE9BRkQsTUFFTztBQUNMLGFBQUssRUFBTCxDQUFRLE9BQVIsRUFBaUIsRUFBakI7QUFDRDtBQUNGOzs7dUNBRWtCLEUsRUFBSTtBQUNyQixVQUFJLEtBQUssT0FBVCxFQUFrQjtBQUNoQixnQkFBUSxRQUFSLENBQWlCLEVBQWpCO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsYUFBSyxFQUFMLENBQVEsT0FBUixFQUFpQixFQUFqQjtBQUNEO0FBQ0Y7OztrQ0FFYSxHLEVBQUssRSxFQUFJO0FBQ3JCLFVBQUksS0FBSyxPQUFULEVBQWtCO0FBQ2hCLGdCQUFRLFFBQVIsQ0FBaUIsRUFBakI7QUFDRCxPQUZELE1BRU87QUFDTCxhQUFLLEVBQUwsQ0FBUSxPQUFSLEVBQWlCLEVBQWpCO0FBQ0Q7QUFDRjs7U0FFQSxhOzRCQUFpQjtBQUNoQixVQUFJLENBQUMsS0FBSyxHQUFMLEVBQVUsS0FBZixFQUFzQjtBQUNwQixjQUFNLElBQUksS0FBSixDQUFVLDBCQUFWLENBQU47QUFDRDtBQUNGOzs7OEJBRVMsTyxFQUFTO0FBQ2pCLFVBQUksY0FBSjs7QUFFQSxVQUFJLE9BQU8sT0FBUCxLQUFtQixRQUF2QixFQUFpQztBQUMvQixnQkFBUSxPQUFSO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsWUFBSSxRQUFPLE9BQVAseUNBQU8sT0FBUCxPQUFtQixRQUFuQixJQUErQixZQUFZLElBQS9DLEVBQXFEO0FBQ25ELGtCQUFRLFFBQVEsS0FBaEI7QUFDRDtBQUNGOztBQUVELFdBQUssYUFBTDs7QUFFQSxXQUFLLFFBQUwsSUFBaUIsS0FBSyxLQUFMLENBQVcsQ0FBQyxTQUFTLENBQVYsSUFBZSxJQUExQixDQUFqQjs7QUFFQSxhQUFPLElBQVA7QUFDRDs7OzZCQUVRLE8sRUFBUyxZLEVBQWMsTyxFQUFTO0FBQ3ZDLFdBQUssYUFBTDs7QUFFQTtBQUNBLFVBQUksVUFBVSxNQUFWLEtBQXFCLENBQXJCLElBQ0EsQ0FBQyxNQUFNLE9BQU4sQ0FBYyxZQUFkLENBREQsSUFFQSxDQUFDLE1BQU0sT0FBTixDQUFjLE9BQWQsQ0FGTCxFQUU2QjtBQUMzQixlQUFPLEtBQUssV0FBTCxDQUFpQixPQUFqQixFQUEwQixZQUExQixFQUF3QyxPQUF4QyxDQUFQO0FBQ0Q7O0FBRUQ7QUFDQSxVQUFJLFVBQVUsTUFBVixLQUFxQixDQUF6QixFQUE0QjtBQUMxQixZQUFJLE1BQU0sT0FBTixDQUFjLFlBQWQsQ0FBSixFQUFpQztBQUMvQixvQkFBVSxhQUFhLEtBQWIsRUFBVjtBQUNBLHlCQUFlLFFBQVEsS0FBUixFQUFmO0FBQ0QsU0FIRCxNQUdPO0FBQ0wsb0JBQVUsRUFBVjtBQUNEO0FBQ0Y7O0FBRUQsVUFBTSxTQUFTLElBQUksTUFBSixDQUFXLENBQUMsWUFBRCxFQUFlLE1BQWYsQ0FBc0IsT0FBdEIsQ0FBWCxDQUFmOztBQUVBO0FBQ0EsVUFBSSxPQUFPLE1BQVgsRUFBbUI7QUFDakIsYUFBSyxHQUFMLEVBQVUsU0FBVixDQUFvQixPQUFwQixFQUE2QixNQUE3QjtBQUNEOztBQUVELGFBQU8sSUFBUDtBQUNEOzs7Z0NBRVcsTyxFQUFTLFEsRUFBVSxLLEVBQU87QUFDcEMsV0FBSyxhQUFMOztBQUVBLFdBQUssR0FBTCxFQUFVLGFBQVYsQ0FBd0IsT0FBeEIsRUFBaUMsUUFBakMsRUFBMkMsS0FBM0M7O0FBRUEsYUFBTyxJQUFQO0FBQ0Q7O1NBRUEsUTswQkFBUyxVLEVBQVksTyxFQUFTLFEsRUFBVSxXLEVBQWEsUSxFQUFVO0FBQUE7O0FBQzlELFdBQUssYUFBTDs7QUFFQTtBQUNBLFVBQUksVUFBVSxNQUFWLElBQW9CLENBQXBCLElBQ0YsT0FBTyxRQUFQLElBQW1CLFFBRGpCLElBRUYsT0FBTyxXQUFQLElBQXNCLFVBRnhCLEVBR0U7QUFDQSxtQkFBVyxXQUFYO0FBQ0Esc0JBQWMsUUFBZDtBQUNBLG1CQUFXLElBQVg7QUFDRDs7QUFFRCxpQkFBVyxPQUFPLFFBQVAsS0FBb0IsVUFBcEIsR0FBaUMsUUFBakMsR0FBNEMsWUFBTSxDQUFFLENBQS9EOztBQUVBLFVBQUksdUJBQXFCLE9BQXJCLE1BQUo7QUFDQSxlQUFTLGFBQWEsSUFBYixHQUFvQixRQUFwQixHQUErQixDQUF4Qzs7QUFFQSxVQUFNLE9BQU8sU0FBUCxJQUFPLEdBQU07QUFDakIsWUFBTSxZQUFZLFNBQVosU0FBWSxDQUFDLEdBQUQsRUFBTSxNQUFOLEVBQWlCO0FBQ2pDLGNBQUksR0FBSixFQUFTO0FBQ1AsbUJBQU8sT0FBSyxJQUFMLENBQVUsT0FBVixFQUFtQixHQUFuQixDQUFQO0FBQ0Q7O0FBRUQ7QUFDQSxpQkFBSyxJQUFMLENBQVUsS0FBVixFQUFpQixNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsSUFBdEIsQ0FBMkIsTUFBM0IsQ0FBakI7O0FBRUEsY0FBSSxVQUFKLEVBQWdCO0FBQ2QsdUJBQVcsSUFBWCxFQUFpQixPQUFLLFFBQUwsQ0FBakI7QUFDRDtBQUNGLFNBWEQ7O0FBYUEsZUFBSyxJQUFMLENBQVUsS0FBVixFQUFpQixRQUFqQjs7QUFFQSxZQUFJLGFBQWEsSUFBakIsRUFBdUI7QUFDckIsaUJBQUssR0FBTCxFQUFVLElBQVYsQ0FBZSxPQUFmLEVBQXdCLFFBQXhCLEVBQWtDLFdBQWxDLEVBQStDLFNBQS9DO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsaUJBQUssR0FBTCxFQUFVLElBQVYsQ0FBZSxPQUFmLEVBQXdCLFdBQXhCLEVBQXFDLFNBQXJDO0FBQ0Q7QUFDRixPQXJCRDs7QUF1QkEsaUJBQVcsSUFBWCxFQUFpQixLQUFLLFFBQUwsQ0FBakI7O0FBRUEsYUFBTyxJQUFQO0FBQ0Q7Ozs4QkFFZ0I7QUFBQSx3Q0FBTixJQUFNO0FBQU4sWUFBTTtBQUFBOztBQUNmLGFBQU8sS0FBSyxRQUFMLGVBQWMsSUFBZCxTQUF1QixJQUF2QixFQUFQO0FBQ0Q7OztrQ0FFb0I7QUFBQSx5Q0FBTixJQUFNO0FBQU4sWUFBTTtBQUFBOztBQUNuQixhQUFPLEtBQUssUUFBTCxlQUFjLEtBQWQsU0FBd0IsSUFBeEIsRUFBUDtBQUNEOzs7b0NBRXNCO0FBQ3JCLGFBQU8sS0FBSyxTQUFMLHVCQUFQO0FBQ0Q7OzswQ0FFNEI7QUFDM0IsYUFBTyxLQUFLLFFBQUwsdUJBQVA7QUFDRDs7O3lDQUUyQjtBQUMxQixhQUFPLEtBQUssV0FBTCx1QkFBUDtBQUNEOzs7d0NBRThCO0FBQUEsVUFBaEIsTUFBZ0IsU0FBaEIsTUFBZ0I7QUFBQSxVQUFSLElBQVEsU0FBUixJQUFROztBQUM3QixVQUFJLENBQUMsS0FBSyxZQUFMLENBQUQsSUFBd0IsUUFBUSxTQUFTLEtBQUssTUFBTCxFQUFhLFFBQTFELEVBQXFFO0FBQ25FLGFBQUssZ0JBQUwsRUFBdUI7QUFDckIsZ0JBQU0sb0JBRGU7QUFFckIsd0JBRnFCO0FBR3JCO0FBSHFCLFNBQXZCO0FBS0Q7QUFDRjs7O2dDQUVXLE0sRUFBUSxPLEVBQVM7QUFDM0IsV0FBSyxnQkFBTCxFQUF1QjtBQUNyQixjQUFNLG1CQURlO0FBRXJCLHNCQUZxQjtBQUdyQjtBQUhxQixPQUF2QjtBQUtEOzs7K0JBRVUsTSxFQUFRLGMsRUFBZ0IsTyxFQUFTO0FBQzFDLFVBQUksT0FBTyxjQUFQLEtBQTBCLFVBQTlCLEVBQTBDO0FBQ3hDLGtCQUFVLGNBQVY7QUFDQSx5QkFBaUIsU0FBakI7QUFDRDtBQUNELFdBQUssZ0JBQUwsRUFBdUI7QUFDckIsY0FBTSxrQkFEZTtBQUVyQixzQkFGcUI7QUFHckIsc0NBSHFCO0FBSXJCO0FBSnFCLE9BQXZCO0FBTUQ7OzsrQkFFVSxNLEVBQVE7QUFDakIsV0FBSyxnQkFBTCxFQUF1QjtBQUNyQixjQUFNLGtCQURlO0FBRXJCO0FBRnFCLE9BQXZCO0FBSUQ7OztnQ0FFVyxNLEVBQVE7QUFDbEIsV0FBSyxnQkFBTCxFQUF1QjtBQUNyQixjQUFNLG1CQURlO0FBRXJCO0FBRnFCLE9BQXZCO0FBSUQ7OztnQ0FFVyxNLEVBQVE7QUFDbEIsV0FBSyxnQkFBTCxFQUF1QjtBQUNyQixjQUFNLG1CQURlO0FBRXJCO0FBRnFCLE9BQXZCO0FBSUQ7O1NBRUEsZ0I7MEJBQWtCLE0sRUFBUTtBQUN6QixVQUFJLE9BQU8sTUFBUCw4QkFBSixFQUFvQztBQUNsQyxjQUFNLElBQUksS0FBSiwyQkFBa0MsTUFBbEMsT0FBTjtBQUNEO0FBQ0QsV0FBSyxXQUFMLEVBQWtCLElBQWxCLENBQXVCLE1BQXZCO0FBQ0EsV0FBSyxVQUFMO0FBQ0Q7O1NBRUEsVTs0QkFBYztBQUFBOztBQUNiLFVBQUksS0FBSyxrQkFBTCxLQUE0QixDQUFDLEtBQUssV0FBTCxFQUFrQixNQUFuRCxFQUEyRDtBQUN6RDtBQUNEO0FBQ0QsV0FBSyxrQkFBTCxJQUEyQixJQUEzQjtBQUNBLFVBQU0sU0FBUyxLQUFLLFdBQUwsRUFBa0IsS0FBbEIsRUFBZjtBQUNBLFVBQU0sV0FBVyxTQUFYLFFBQVcsR0FBTTtBQUNyQixlQUFLLGtCQUFMLElBQTJCLEtBQTNCO0FBQ0EsZUFBSyxVQUFMO0FBQ0QsT0FIRDtBQUlBLGNBQVEsT0FBTyxJQUFmO0FBQ0UsYUFBSyxtQkFBTDtBQUNFLGNBQUksQ0FBQyxLQUFLLFlBQUwsQ0FBTCxFQUF5QjtBQUN2QixrQkFBTSxJQUFJLEtBQUosQ0FBVSxvQ0FBVixDQUFOO0FBQ0Q7QUFDRCxlQUFLLE1BQUwsRUFBYSxLQUFiLENBQW1CLE9BQU8sT0FBMUIsRUFBbUMsUUFBbkM7QUFDQTs7QUFFRixhQUFLLGtCQUFMO0FBQ0UsY0FBSSxDQUFDLEtBQUssWUFBTCxDQUFMLEVBQXlCO0FBQ3ZCLGtCQUFNLElBQUksS0FBSixDQUFVLHFDQUFWLENBQU47QUFDRDtBQUNEO0FBQ0EsZUFBSyxNQUFMLEVBQWEsRUFBYixDQUFnQixNQUFoQixFQUF3QixVQUFDLElBQUQsRUFBVTtBQUNoQyxtQkFBTyxPQUFQLENBQWUsY0FBYyxJQUFkLENBQWY7QUFDRCxXQUZEO0FBR0Esa0JBQVEsUUFBUixDQUFpQixRQUFqQjtBQUNBOztBQUVGLGFBQUssa0JBQUw7QUFDRSxjQUFJLENBQUMsS0FBSyxZQUFMLENBQUwsRUFBeUI7QUFDdkIsa0JBQU0sSUFBSSxLQUFKLENBQVUsZ0NBQVYsQ0FBTjtBQUNEO0FBQ0QsZUFBSyxNQUFMLEVBQWEsa0JBQWI7QUFDQSxrQkFBUSxRQUFSLENBQWlCLFFBQWpCO0FBQ0E7O0FBRUYsYUFBSyxvQkFBTDtBQUNFLGVBQUssTUFBTCxFQUFhLEtBQWIsQ0FBbUIsWUFBTTtBQUN2QixtQkFBSyxNQUFMLElBQWUsd0JBQVc7QUFDeEIsd0JBQVUsT0FBTztBQURPLGFBQVgsQ0FBZjtBQUdBLG1CQUFLLE1BQUwsRUFBYSxJQUFiLENBQWtCLFlBQU07QUFDdEIscUJBQUssTUFBTCxFQUFhLEVBQWIsQ0FBZ0IsTUFBaEIsRUFBd0IsVUFBQyxJQUFELEVBQVU7QUFDaEMsdUJBQUssSUFBTCxrQkFBeUIsT0FBTyxNQUFoQyxFQUEwQyxjQUFjLElBQWQsQ0FBMUM7QUFDRCxlQUZEO0FBR0EscUJBQUssWUFBTCxJQUFxQixJQUFyQjtBQUNBO0FBQ0QsYUFORDtBQU9ELFdBWEQ7QUFZQTs7QUFFRixhQUFLLG1CQUFMO0FBQ0UsZUFBSyxNQUFMLEVBQWEsS0FBYixDQUFtQixZQUFNO0FBQ3ZCLG1CQUFLLFlBQUwsSUFBcUIsS0FBckI7QUFDQTtBQUNELFdBSEQ7QUFJQTs7QUFFRixhQUFLLG1CQUFMO0FBQ0UsY0FBSSxDQUFDLEtBQUssWUFBTCxDQUFMLEVBQXlCO0FBQ3ZCLGtCQUFNLElBQUksS0FBSixDQUFVLGlDQUFWLENBQU47QUFDRDtBQUNELGVBQUssTUFBTCxFQUFhLEtBQWIsQ0FBbUIsUUFBbkI7QUFDQTs7QUFFRjtBQUNFLGdCQUFNLElBQUksS0FBSixDQUFVLDRDQUFWLENBQU47QUF6REo7QUEyREQ7Ozt3Q0FFbUI7QUFDbEIsWUFBTSxJQUFJLEtBQUosQ0FBVSx3REFBVixDQUFOO0FBQ0Q7Ozt3Q0FFbUI7QUFDbEIsWUFBTSxJQUFJLEtBQUosQ0FBVSx3REFBVixDQUFOO0FBQ0Q7Ozs4Q0FFeUI7QUFDeEIsWUFBTSxJQUFJLEtBQUosQ0FBVSw4REFBVixDQUFOO0FBQ0Q7OztzQ0FFaUI7QUFDaEIsWUFBTSxJQUFJLEtBQUosQ0FBVSxzREFBVixDQUFOO0FBQ0Q7Ozt1Q0FFa0I7QUFDakIsWUFBTSxJQUFJLEtBQUosQ0FBVSx3REFBVixDQUFOO0FBQ0Q7Ozt1Q0FFa0I7QUFDakIsWUFBTSxJQUFJLEtBQUosQ0FBVSx1REFBVixDQUFOO0FBQ0Q7Ozt1Q0FFa0I7QUFDakIsWUFBTSxJQUFJLEtBQUosQ0FBVSx1REFBVixDQUFOO0FBQ0Q7Ozs4Q0FFeUI7QUFDeEIsWUFBTSxJQUFJLEtBQUosQ0FBVSw4REFBVixDQUFOO0FBQ0Q7OzswQ0FFcUI7QUFDcEIsWUFBTSxJQUFJLEtBQUosQ0FBVSw0Q0FBVixDQUFOO0FBQ0Q7OztzQ0FFaUI7QUFDaEIsWUFBTSxJQUFJLEtBQUosQ0FBVSx3Q0FBVixDQUFOO0FBQ0Q7Ozt1Q0FFa0I7QUFDakIsWUFBTSxJQUFJLEtBQUosQ0FBVSx5Q0FBVixDQUFOO0FBQ0Q7OzsrQkFFVTtBQUNULFlBQU0sSUFBSSxLQUFKLENBQVUsaUNBQVYsQ0FBTjtBQUNEOzs7OEJBRVM7QUFDUixZQUFNLElBQUksS0FBSixDQUFVLGdDQUFWLENBQU47QUFDRDs7O29DQUVlO0FBQ2QsWUFBTSxJQUFJLEtBQUosQ0FBVSxzQ0FBVixDQUFOO0FBQ0Q7OztrQ0FFYTtBQUNaLFlBQU0sSUFBSSxLQUFKLENBQVUsb0NBQVYsQ0FBTjtBQUNEOzs7Ozs7QUFHSCxPQUFPLGNBQVAsQ0FBc0IsS0FBdEIsRUFBNkIsZUFBN0IsRUFBOEM7QUFDNUMsY0FBWSxJQURnQztBQUU1QyxTQUFPLGlCQUFNO0FBQ1g7QUFDQTtBQUNBLFFBQUksZ0JBQWdCLEtBQXBCO0FBQ0EsUUFBSTtBQUNGLHNCQUFnQixhQUFHLFlBQUgsQ0FBZ0IsaUJBQWhCLEVBQW1DLFFBQW5DLEdBQThDLE9BQTlDLENBQXNELFVBQXRELE1BQXNFLENBQUMsQ0FBdkY7QUFDRCxLQUZELENBRUUsT0FBTyxDQUFQLEVBQVUsQ0FBRSxDQU5ILENBTUc7QUFDZCxXQUFPLGFBQVA7QUFDRDtBQVYyQyxDQUE5Qzs7QUFhQSxPQUFPLE9BQVAsR0FBaUIsS0FBakIiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IChjKSAyMDE0IEJyeWFuIEh1Z2hlcyA8YnJ5YW5AdGhlb3JldGljYWxpZGVhdGlvbnMuY29tPlxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvblxub2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb25cbmZpbGVzICh0aGUgJ1NvZnR3YXJlJyksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXRcbnJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLFxuY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZVxuU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmdcbmNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG5FWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVNcbk9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXG5OT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVFxuSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksXG5XSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkdcbkZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1Jcbk9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgaW5pdCB9IGZyb20gJ3Jhc3BpJztcbmltcG9ydCB7IGdldFBpbnMsIGdldFBpbk51bWJlciB9IGZyb20gJ3Jhc3BpLWJvYXJkJztcbmltcG9ydCB7IFBVTExfTk9ORSwgUFVMTF9VUCwgUFVMTF9ET1dOLCBEaWdpdGFsT3V0cHV0LCBEaWdpdGFsSW5wdXQgfSBmcm9tICdyYXNwaS1ncGlvJztcbmltcG9ydCB7IFBXTSB9IGZyb20gJ3Jhc3BpLXB3bSc7XG5pbXBvcnQgeyBTb2Z0UFdNIH0gZnJvbSAncmFzcGktc29mdC1wd20nO1xuaW1wb3J0IHsgSTJDIH0gZnJvbSAncmFzcGktaTJjJztcbmltcG9ydCB7IExFRCB9IGZyb20gJ3Jhc3BpLWxlZCc7XG5pbXBvcnQgeyBTZXJpYWwsIERFRkFVTFRfUE9SVCB9IGZyb20gJ3Jhc3BpLXNlcmlhbCc7XG5cbi8vIENvbnN0YW50c1xuY29uc3QgSU5QVVRfTU9ERSA9IDA7XG5jb25zdCBPVVRQVVRfTU9ERSA9IDE7XG5jb25zdCBBTkFMT0dfTU9ERSA9IDI7XG5jb25zdCBQV01fTU9ERSA9IDM7XG5jb25zdCBTRVJWT19NT0RFID0gNDtcbmNvbnN0IFVOS05PV05fTU9ERSA9IDk5O1xuXG5jb25zdCBMT1cgPSAwO1xuY29uc3QgSElHSCA9IDE7XG5cbmNvbnN0IExFRF9QSU4gPSAtMTtcblxuLy8gU2V0dGluZ3NcbmNvbnN0IERFRkFVTFRfU0VSVk9fTUlOID0gMTAwMDtcbmNvbnN0IERFRkFVTFRfU0VSVk9fTUFYID0gMjAwMDtcbmNvbnN0IERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSA9IDE5O1xuXG4vLyBQcml2YXRlIHN5bWJvbHNcbmNvbnN0IGlzUmVhZHkgPSBTeW1ib2woJ2lzUmVhZHknKTtcbmNvbnN0IHBpbnMgPSBTeW1ib2woJ3BpbnMnKTtcbmNvbnN0IGluc3RhbmNlcyA9IFN5bWJvbCgnaW5zdGFuY2VzJyk7XG5jb25zdCBhbmFsb2dQaW5zID0gU3ltYm9sKCdhbmFsb2dQaW5zJyk7XG5jb25zdCBpc0hhcmR3YXJlUHdtID0gU3ltYm9sKCdpc0hhcmR3YXJlUHdtJyk7XG5jb25zdCBnZXRQaW5JbnN0YW5jZSA9IFN5bWJvbCgnZ2V0UGluSW5zdGFuY2UnKTtcbmNvbnN0IGkyYyA9IFN5bWJvbCgnaTJjJyk7XG5jb25zdCBpMmNEZWxheSA9IFN5bWJvbCgnaTJjRGVsYXknKTtcbmNvbnN0IGkyY1JlYWQgPSBTeW1ib2woJ2kyY1JlYWQnKTtcbmNvbnN0IGkyY0NoZWNrQWxpdmUgPSBTeW1ib2woJ2kyY0NoZWNrQWxpdmUnKTtcbmNvbnN0IHBpbk1vZGUgPSBTeW1ib2woJ3Bpbk1vZGUnKTtcbmNvbnN0IHNlcmlhbCA9IFN5bWJvbCgnc2VyaWFsJyk7XG5jb25zdCBzZXJpYWxRdWV1ZSA9IFN5bWJvbCgnc2VyaWFsUXVldWUnKTtcbmNvbnN0IGFkZFRvU2VyaWFsUXVldWUgPSBTeW1ib2woJ2FkZFRvU2VyaWFsUXVldWUnKTtcbmNvbnN0IHNlcmlhbFB1bXAgPSBTeW1ib2woJ3NlcmlhbFB1bXAnKTtcbmNvbnN0IGlzU2VyaWFsUHJvY2Vzc2luZyA9IFN5bWJvbCgnaXNTZXJpYWxQcm9jZXNzaW5nJyk7XG5jb25zdCBpc1NlcmlhbE9wZW4gPSBTeW1ib2woJ2lzU2VyaWFsT3BlbicpO1xuXG5jb25zdCBTRVJJQUxfQUNUSU9OX1dSSVRFID0gJ1NFUklBTF9BQ1RJT05fV1JJVEUnO1xuY29uc3QgU0VSSUFMX0FDVElPTl9DTE9TRSA9ICdTRVJJQUxfQUNUSU9OX0NMT1NFJztcbmNvbnN0IFNFUklBTF9BQ1RJT05fRkxVU0ggPSAnU0VSSUFMX0FDVElPTl9GTFVTSCc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX0NPTkZJRyA9ICdTRVJJQUxfQUNUSU9OX0NPTkZJRyc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX1JFQUQgPSAnU0VSSUFMX0FDVElPTl9SRUFEJztcbmNvbnN0IFNFUklBTF9BQ1RJT05fU1RPUCA9ICdTRVJJQUxfQUNUSU9OX1NUT1AnO1xuXG5mdW5jdGlvbiBidWZmZXJUb0FycmF5KGJ1ZmZlcikge1xuICBjb25zdCBhcnJheSA9IEFycmF5KGJ1ZmZlci5sZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGJ1ZmZlci5sZW5ndGg7IGkrKykge1xuICAgIGFycmF5W2ldID0gYnVmZmVyW2ldO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuY2xhc3MgUmFzcGkgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKHsgaW5jbHVkZVBpbnMsIGV4Y2x1ZGVQaW5zLCBlbmFibGVTb2Z0UHdtID0gZmFsc2UgfSA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIG5hbWU6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6ICdSYXNwYmVycnlQaS1JTydcbiAgICAgIH0sXG5cbiAgICAgIFtpbnN0YW5jZXNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG5cbiAgICAgIFtpc1JlYWR5XToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICB9LFxuICAgICAgaXNSZWFkeToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbaXNSZWFkeV07XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFtwaW5zXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuICAgICAgcGluczoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbcGluc107XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFthbmFsb2dQaW5zXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuICAgICAgYW5hbG9nUGluczoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbYW5hbG9nUGluc107XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFtpMmNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogbmV3IEkyQygpXG4gICAgICB9LFxuXG4gICAgICBbaTJjRGVsYXldOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogMFxuICAgICAgfSxcblxuICAgICAgW3NlcmlhbF06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBuZXcgU2VyaWFsKClcbiAgICAgIH0sXG5cbiAgICAgIFtzZXJpYWxRdWV1ZV06IHtcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuXG4gICAgICBbaXNTZXJpYWxQcm9jZXNzaW5nXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICB9LFxuXG4gICAgICBbaXNTZXJpYWxPcGVuXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICB9LFxuXG4gICAgICBNT0RFUzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgSU5QVVQ6IElOUFVUX01PREUsXG4gICAgICAgICAgT1VUUFVUOiBPVVRQVVRfTU9ERSxcbiAgICAgICAgICBBTkFMT0c6IEFOQUxPR19NT0RFLFxuICAgICAgICAgIFBXTTogUFdNX01PREUsXG4gICAgICAgICAgU0VSVk86IFNFUlZPX01PREVcbiAgICAgICAgfSlcbiAgICAgIH0sXG5cbiAgICAgIEhJR0g6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IEhJR0hcbiAgICAgIH0sXG4gICAgICBMT1c6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IExPV1xuICAgICAgfSxcblxuICAgICAgZGVmYXVsdExlZDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTEVEX1BJTlxuICAgICAgfSxcblxuICAgICAgU0VSSUFMX1BPUlRfSURzOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICBIV19TRVJJQUwwOiBERUZBVUxUX1BPUlQsXG4gICAgICAgICAgREVGQVVMVDogREVGQVVMVF9QT1JUXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpbml0KCgpID0+IHtcbiAgICAgIGxldCBwaW5NYXBwaW5ncyA9IGdldFBpbnMoKTtcbiAgICAgIHRoaXNbcGluc10gPSBbXTtcblxuICAgICAgLy8gU2xpZ2h0IGhhY2sgdG8gZ2V0IHRoZSBMRUQgaW4gdGhlcmUsIHNpbmNlIGl0J3Mgbm90IGFjdHVhbGx5IGEgcGluXG4gICAgICBwaW5NYXBwaW5nc1tMRURfUElOXSA9IHtcbiAgICAgICAgcGluczogWyBMRURfUElOIF0sXG4gICAgICAgIHBlcmlwaGVyYWxzOiBbICdncGlvJyBdXG4gICAgICB9O1xuXG4gICAgICBpZiAoaW5jbHVkZVBpbnMgJiYgZXhjbHVkZVBpbnMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcImluY2x1ZGVQaW5zXCIgYW5kIFwiZXhjbHVkZVBpbnNcIiBjYW5ub3QgYmUgc3BlY2lmaWVkIGF0IHRoZSBzYW1lIHRpbWUnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaW5jbHVkZVBpbnMpKSB7XG4gICAgICAgIGNvbnN0IG5ld1Bpbk1hcHBpbmdzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgcGluIG9mIGluY2x1ZGVQaW5zKSB7XG4gICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IGdldFBpbk51bWJlcihwaW4pO1xuICAgICAgICAgIGlmIChub3JtYWxpemVkUGluID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGluIFwiJHtwaW59XCIgc3BlY2lmaWVkIGluIGluY2x1ZGVQaW5zYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5ld1Bpbk1hcHBpbmdzW25vcm1hbGl6ZWRQaW5dID0gcGluTWFwcGluZ3Nbbm9ybWFsaXplZFBpbl07XG4gICAgICAgIH1cbiAgICAgICAgcGluTWFwcGluZ3MgPSBuZXdQaW5NYXBwaW5ncztcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShleGNsdWRlUGlucykpIHtcbiAgICAgICAgcGluTWFwcGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBwaW5NYXBwaW5ncyk7XG4gICAgICAgIGZvciAoY29uc3QgcGluIG9mIGV4Y2x1ZGVQaW5zKSB7XG4gICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IGdldFBpbk51bWJlcihwaW4pO1xuICAgICAgICAgIGlmIChub3JtYWxpemVkUGluID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGluIFwiJHtwaW59XCIgc3BlY2lmaWVkIGluIGV4Y2x1ZGVQaW5zYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlbGV0ZSBwaW5NYXBwaW5nc1tub3JtYWxpemVkUGluXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBPYmplY3Qua2V5cyhwaW5NYXBwaW5ncykuZm9yRWFjaCgocGluKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbkluZm8gPSBwaW5NYXBwaW5nc1twaW5dO1xuICAgICAgICBjb25zdCBzdXBwb3J0ZWRNb2RlcyA9IFtdO1xuICAgICAgICAvLyBXZSBkb24ndCB3YW50IEkyQyB0byBiZSB1c2VkIGZvciBhbnl0aGluZyBlbHNlLCBzaW5jZSBjaGFuZ2luZyB0aGVcbiAgICAgICAgLy8gcGluIG1vZGUgbWFrZXMgaXQgdW5hYmxlIHRvIGV2ZXIgZG8gSTJDIGFnYWluLlxuICAgICAgICBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdpMmMnKSA9PSAtMSAmJiBwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ3VhcnQnKSA9PSAtMSkge1xuICAgICAgICAgIGlmIChwaW4gPT0gTEVEX1BJTikge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChPVVRQVVRfTU9ERSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ2dwaW8nKSAhPSAtMSkge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChJTlBVVF9NT0RFLCBPVVRQVVRfTU9ERSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ3B3bScpICE9IC0xKSB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlcy5wdXNoKFBXTV9NT0RFLCBTRVJWT19NT0RFKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGVuYWJsZVNvZnRQd20gPT09IHRydWUgJiYgcGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdncGlvJykgIT0gLTEpIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goUFdNX01PREUsIFNFUlZPX01PREUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnN0YW5jZSA9IHRoaXNbaW5zdGFuY2VzXVtwaW5dID0ge1xuICAgICAgICAgIHBlcmlwaGVyYWw6IG51bGwsXG4gICAgICAgICAgbW9kZTogc3VwcG9ydGVkTW9kZXMuaW5kZXhPZihPVVRQVVRfTU9ERSkgPT0gLTEgPyBVTktOT1dOX01PREUgOiBPVVRQVVRfTU9ERSxcblxuICAgICAgICAgIC8vIFVzZWQgdG8gY2FjaGUgdGhlIHByZXZpb3VzbHkgd3JpdHRlbiB2YWx1ZSBmb3IgcmVhZGluZyBiYWNrIGluIE9VVFBVVCBtb2RlXG4gICAgICAgICAgcHJldmlvdXNXcml0dGVuVmFsdWU6IExPVyxcblxuICAgICAgICAgIC8vIFVzZWQgdG8gc2V0IHRoZSBkZWZhdWx0IG1pbiBhbmQgbWF4IHZhbHVlc1xuICAgICAgICAgIG1pbjogREVGQVVMVF9TRVJWT19NSU4sXG4gICAgICAgICAgbWF4OiBERUZBVUxUX1NFUlZPX01BWFxuICAgICAgICB9O1xuICAgICAgICB0aGlzW3BpbnNdW3Bpbl0gPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICBzdXBwb3J0ZWRNb2Rlczoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHN1cHBvcnRlZE1vZGVzKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLm1vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgc3dpdGNoIChpbnN0YW5jZS5tb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBJTlBVVF9NT0RFOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnBlcmlwaGVyYWwucmVhZCgpO1xuICAgICAgICAgICAgICAgIGNhc2UgT1VUUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0KHZhbHVlKSB7XG4gICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5tb2RlID09IE9VVFBVVF9NT0RFKSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlcG9ydDoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhbmFsb2dDaGFubmVsOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IDEyN1xuICAgICAgICAgIH0sXG4gICAgICAgICAgW2lzSGFyZHdhcmVQd21dOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiBwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ3B3bScpICE9IC0xXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGluc3RhbmNlLm1vZGUgPT0gT1VUUFVUX01PREUpIHtcbiAgICAgICAgICB0aGlzLnBpbk1vZGUocGluLCBPVVRQVVRfTU9ERSk7XG4gICAgICAgICAgdGhpcy5kaWdpdGFsV3JpdGUocGluLCBMT1cpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gRmlsbCBpbiB0aGUgaG9sZXMsIHNpbnMgcGlucyBhcmUgc3BhcnNlIG9uIHRoZSBBKy9CKy8yXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXNbcGluc10ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCF0aGlzW3BpbnNdW2ldKSB7XG4gICAgICAgICAgdGhpc1twaW5zXVtpXSA9IE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXM6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoW10pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFVOS05PV05fTU9ERTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc2V0KCkge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXBvcnQ6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbmFsb2dDaGFubmVsOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiAxMjdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNlcmlhbENvbmZpZyh7XG4gICAgICAgIHBvcnRJZDogREVGQVVMVF9QT1JULFxuICAgICAgICBiYXVkOiA5NjAwXG4gICAgICB9KTtcblxuICAgICAgdGhpc1tpc1JlYWR5XSA9IHRydWU7XG4gICAgICB0aGlzLmVtaXQoJ3JlYWR5Jyk7XG4gICAgICB0aGlzLmVtaXQoJ2Nvbm5lY3QnKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVzZXQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBub3JtYWxpemUocGluKSB7XG4gICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IGdldFBpbk51bWJlcihwaW4pO1xuICAgIGlmICh0eXBlb2Ygbm9ybWFsaXplZFBpbiAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwaW4gXCIke3Bpbn1cImApO1xuICAgIH1cbiAgICByZXR1cm4gbm9ybWFsaXplZFBpbjtcbiAgfVxuXG4gIFtnZXRQaW5JbnN0YW5jZV0ocGluKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXTtcbiAgICBpZiAoIXBpbkluc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcGluIFwiJHtwaW59XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIHBpbkluc3RhbmNlO1xuICB9XG5cbiAgcGluTW9kZShwaW4sIG1vZGUpIHtcbiAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlIH0pO1xuICB9XG5cbiAgW3Bpbk1vZGVdKHsgcGluLCBtb2RlLCBwdWxsUmVzaXN0b3IgPSBQVUxMX05PTkUgfSkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSB0aGlzLm5vcm1hbGl6ZShwaW4pO1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0obm9ybWFsaXplZFBpbik7XG4gICAgcGluSW5zdGFuY2UucHVsbFJlc2lzdG9yID0gcHVsbFJlc2lzdG9yO1xuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgIHBpbjogbm9ybWFsaXplZFBpbixcbiAgICAgIHB1bGxSZXNpc3RvcjogcGluSW5zdGFuY2UucHVsbFJlc2lzdG9yXG4gICAgfTtcbiAgICBpZiAodGhpc1twaW5zXVtub3JtYWxpemVkUGluXS5zdXBwb3J0ZWRNb2Rlcy5pbmRleE9mKG1vZGUpID09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFBpbiBcIiR7cGlufVwiIGRvZXMgbm90IHN1cHBvcnQgbW9kZSBcIiR7bW9kZX1cImApO1xuICAgIH1cblxuICAgIGlmIChwaW4gPT0gTEVEX1BJTikge1xuICAgICAgaWYgKHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgaW5zdGFuY2VvZiBMRUQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBMRUQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3dpdGNoIChtb2RlKSB7XG4gICAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IERpZ2l0YWxJbnB1dChjb25maWcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbE91dHB1dChjb25maWcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFBXTV9NT0RFOlxuICAgICAgICBjYXNlIFNFUlZPX01PREU6XG4gICAgICAgICAgaWYgKHRoaXNbcGluc11bbm9ybWFsaXplZFBpbl1baXNIYXJkd2FyZVB3bV0gPT09IHRydWUpIHtcbiAgICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgUFdNKG5vcm1hbGl6ZWRQaW4pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IFNvZnRQV00oe1xuICAgICAgICAgICAgICBwaW46IG5vcm1hbGl6ZWRQaW4sXG4gICAgICAgICAgICAgIHJhbmdlOiAyNTVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb25zb2xlLndhcm4oYFVua25vd24gcGluIG1vZGU6ICR7bW9kZX1gKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcGluSW5zdGFuY2UubW9kZSA9IG1vZGU7XG4gIH1cblxuICBhbmFsb2dSZWFkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignYW5hbG9nUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIGFuYWxvZ1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICB0aGlzLnB3bVdyaXRlKHBpbiwgdmFsdWUpO1xuICB9XG5cbiAgcHdtV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gUFdNX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIFBXTV9NT0RFKTtcbiAgICB9XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZShNYXRoLnJvdW5kKHZhbHVlICogcGluSW5zdGFuY2UucGVyaXBoZXJhbC5yYW5nZSAvIDI1NSkpO1xuICB9XG5cbiAgZGlnaXRhbFJlYWQocGluLCBoYW5kbGVyKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBJTlBVVF9NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBJTlBVVF9NT0RFKTtcbiAgICB9XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBsZXQgdmFsdWU7XG4gICAgICBpZiAocGluSW5zdGFuY2UubW9kZSA9PSBJTlBVVF9NT0RFKSB7XG4gICAgICAgIHZhbHVlID0gcGluSW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgICAgaGFuZGxlcih2YWx1ZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoYGRpZ2l0YWwtcmVhZC0ke3Bpbn1gLCB2YWx1ZSk7XG4gICAgfSwgRElHSVRBTF9SRUFEX1VQREFURV9SQVRFKTtcbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLm9uKCdkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpZ2l0YWxXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSA9PT0gSU5QVVRfTU9ERSAmJiB2YWx1ZSA9PT0gSElHSCkge1xuICAgICAgdGhpc1twaW5Nb2RlXSh7IHBpbiwgbW9kZTogSU5QVVRfTU9ERSwgcHVsbFJlc2lzdG9yOiBQVUxMX1VQIH0pO1xuICAgIH0gZWxzZSBpZiAocGluSW5zdGFuY2UubW9kZSA9PT0gSU5QVVRfTU9ERSAmJiB2YWx1ZSA9PT0gTE9XKSB7XG4gICAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlOiBJTlBVVF9NT0RFLCBwdWxsUmVzaXN0b3I6IFBVTExfRE9XTiB9KTtcbiAgICB9IGVsc2UgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gT1VUUFVUX01PREUpIHtcbiAgICAgIHRoaXNbcGluTW9kZV0oeyBwaW4sIG1vZGU6IE9VVFBVVF9NT0RFIH0pO1xuICAgIH1cbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSA9PT0gT1VUUFVUX01PREUgJiYgdmFsdWUgIT0gcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWUpIHtcbiAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUodmFsdWUgPyBISUdIIDogTE9XKTtcbiAgICAgIHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgc2Vydm9Db25maWcocGluLCBtaW4sIG1heCkge1xuICAgIGxldCBjb25maWcgPSBwaW47XG4gICAgaWYgKHR5cGVvZiBjb25maWcgIT09ICdvYmplY3QnKSB7XG4gICAgICBjb25maWcgPSB7IHBpbiwgbWluLCBtYXggfTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb25maWcubWluICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uZmlnLm1pbiA9IERFRkFVTFRfU0VSVk9fTUlOO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNvbmZpZy5tYXggIT09ICdudW1iZXInKSB7XG4gICAgICBjb25maWcubWF4ID0gREVGQVVMVF9TRVJWT19NQVg7XG4gICAgfVxuICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSB0aGlzLm5vcm1hbGl6ZShwaW4pO1xuICAgIHRoaXNbcGluTW9kZV0oe1xuICAgICAgcGluOiBub3JtYWxpemVkUGluLFxuICAgICAgbW9kZTogU0VSVk9fTU9ERVxuICAgIH0pO1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUobm9ybWFsaXplZFBpbikpO1xuICAgIHBpbkluc3RhbmNlLm1pbiA9IGNvbmZpZy5taW47XG4gICAgcGluSW5zdGFuY2UubWF4ID0gY29uZmlnLm1heDtcbiAgfVxuXG4gIHNlcnZvV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gU0VSVk9fTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgU0VSVk9fTU9ERSk7XG4gICAgfVxuICAgIGNvbnN0IGR1dHlDeWNsZSA9IChwaW5JbnN0YW5jZS5taW4gKyAodmFsdWUgLyAxODApICogKHBpbkluc3RhbmNlLm1heCAtIHBpbkluc3RhbmNlLm1pbikpIC8gMjAwMDA7XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZShkdXR5Q3ljbGUgKiBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJhbmdlKTtcbiAgfVxuXG4gIHF1ZXJ5Q2FwYWJpbGl0aWVzKGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHF1ZXJ5QW5hbG9nTWFwcGluZyhjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBxdWVyeVBpblN0YXRlKHBpbiwgY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgW2kyY0NoZWNrQWxpdmVdKCkge1xuICAgIGlmICghdGhpc1tpMmNdLmFsaXZlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0kyQyBwaW5zIG5vdCBpbiBJMkMgbW9kZScpO1xuICAgIH1cbiAgfVxuXG4gIGkyY0NvbmZpZyhvcHRpb25zKSB7XG4gICAgbGV0IGRlbGF5O1xuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnbnVtYmVyJykge1xuICAgICAgZGVsYXkgPSBvcHRpb25zO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIG9wdGlvbnMgIT09IG51bGwpIHtcbiAgICAgICAgZGVsYXkgPSBvcHRpb25zLmRlbGF5O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIHRoaXNbaTJjRGVsYXldID0gTWF0aC5yb3VuZCgoZGVsYXkgfHwgMCkgLyAxMDAwKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaTJjV3JpdGUoYWRkcmVzcywgY21kUmVnT3JEYXRhLCBpbkJ5dGVzKSB7XG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgLy8gSWYgaTJjV3JpdGUgd2FzIHVzZWQgZm9yIGFuIGkyY1dyaXRlUmVnIGNhbGwuLi5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMyAmJlxuICAgICAgICAhQXJyYXkuaXNBcnJheShjbWRSZWdPckRhdGEpICYmXG4gICAgICAgICFBcnJheS5pc0FycmF5KGluQnl0ZXMpKSB7XG4gICAgICByZXR1cm4gdGhpcy5pMmNXcml0ZVJlZyhhZGRyZXNzLCBjbWRSZWdPckRhdGEsIGluQnl0ZXMpO1xuICAgIH1cblxuICAgIC8vIEZpeCBhcmd1bWVudHMgaWYgY2FsbGVkIHdpdGggRmlybWF0YS5qcyBBUElcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY21kUmVnT3JEYXRhKSkge1xuICAgICAgICBpbkJ5dGVzID0gY21kUmVnT3JEYXRhLnNsaWNlKCk7XG4gICAgICAgIGNtZFJlZ09yRGF0YSA9IGluQnl0ZXMuc2hpZnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluQnl0ZXMgPSBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKFtjbWRSZWdPckRhdGFdLmNvbmNhdChpbkJ5dGVzKSk7XG5cbiAgICAvLyBPbmx5IHdyaXRlIGlmIGJ5dGVzIHByb3ZpZGVkXG4gICAgaWYgKGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgIHRoaXNbaTJjXS53cml0ZVN5bmMoYWRkcmVzcywgYnVmZmVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGkyY1dyaXRlUmVnKGFkZHJlc3MsIHJlZ2lzdGVyLCB2YWx1ZSkge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIHRoaXNbaTJjXS53cml0ZUJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCB2YWx1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIFtpMmNSZWFkXShjb250aW51b3VzLCBhZGRyZXNzLCByZWdpc3RlciwgYnl0ZXNUb1JlYWQsIGNhbGxiYWNrKSB7XG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgLy8gRml4IGFyZ3VtZW50cyBpZiBjYWxsZWQgd2l0aCBGaXJtYXRhLmpzIEFQSVxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDQgJiZcbiAgICAgIHR5cGVvZiByZWdpc3RlciA9PSAnbnVtYmVyJyAmJlxuICAgICAgdHlwZW9mIGJ5dGVzVG9SZWFkID09ICdmdW5jdGlvbidcbiAgICApIHtcbiAgICAgIGNhbGxiYWNrID0gYnl0ZXNUb1JlYWQ7XG4gICAgICBieXRlc1RvUmVhZCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSBudWxsO1xuICAgIH1cblxuICAgIGNhbGxiYWNrID0gdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nID8gY2FsbGJhY2sgOiAoKSA9PiB7fTtcblxuICAgIGxldCBldmVudCA9IGBpMmMtcmVwbHktJHthZGRyZXNzfS1gO1xuICAgIGV2ZW50ICs9IHJlZ2lzdGVyICE9PSBudWxsID8gcmVnaXN0ZXIgOiAwO1xuXG4gICAgY29uc3QgcmVhZCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGFmdGVyUmVhZCA9IChlcnIsIGJ1ZmZlcikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29udmVydCBidWZmZXIgdG8gQXJyYXkgYmVmb3JlIGVtaXRcbiAgICAgICAgdGhpcy5lbWl0KGV2ZW50LCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChidWZmZXIpKTtcblxuICAgICAgICBpZiAoY29udGludW91cykge1xuICAgICAgICAgIHNldFRpbWVvdXQocmVhZCwgdGhpc1tpMmNEZWxheV0pO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLm9uY2UoZXZlbnQsIGNhbGxiYWNrKTtcblxuICAgICAgaWYgKHJlZ2lzdGVyICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXNbaTJjXS5yZWFkKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlc1RvUmVhZCwgYWZ0ZXJSZWFkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXNbaTJjXS5yZWFkKGFkZHJlc3MsIGJ5dGVzVG9SZWFkLCBhZnRlclJlYWQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBzZXRUaW1lb3V0KHJlYWQsIHRoaXNbaTJjRGVsYXldKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaTJjUmVhZCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXNbaTJjUmVhZF0odHJ1ZSwgLi4ucmVzdCk7XG4gIH1cblxuICBpMmNSZWFkT25jZSguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXNbaTJjUmVhZF0oZmFsc2UsIC4uLnJlc3QpO1xuICB9XG5cbiAgc2VuZEkyQ0NvbmZpZyguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjQ29uZmlnKC4uLnJlc3QpO1xuICB9XG5cbiAgc2VuZEkyQ1dyaXRlUmVxdWVzdCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjV3JpdGUoLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDUmVhZFJlcXVlc3QoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzLmkyY1JlYWRPbmNlKC4uLnJlc3QpO1xuICB9XG5cbiAgc2VyaWFsQ29uZmlnKHsgcG9ydElkLCBiYXVkIH0pIHtcbiAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSB8fCAoYmF1ZCAmJiBiYXVkICE9PSB0aGlzW3NlcmlhbF0uYmF1ZFJhdGUpKSB7XG4gICAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgICAgdHlwZTogU0VSSUFMX0FDVElPTl9DT05GSUcsXG4gICAgICAgIHBvcnRJZCxcbiAgICAgICAgYmF1ZFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgc2VyaWFsV3JpdGUocG9ydElkLCBpbkJ5dGVzKSB7XG4gICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX1dSSVRFLFxuICAgICAgcG9ydElkLFxuICAgICAgaW5CeXRlc1xuICAgIH0pO1xuICB9XG5cbiAgc2VyaWFsUmVhZChwb3J0SWQsIG1heEJ5dGVzVG9SZWFkLCBoYW5kbGVyKSB7XG4gICAgaWYgKHR5cGVvZiBtYXhCeXRlc1RvUmVhZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaGFuZGxlciA9IG1heEJ5dGVzVG9SZWFkO1xuICAgICAgbWF4Qnl0ZXNUb1JlYWQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgdHlwZTogU0VSSUFMX0FDVElPTl9SRUFELFxuICAgICAgcG9ydElkLFxuICAgICAgbWF4Qnl0ZXNUb1JlYWQsXG4gICAgICBoYW5kbGVyXG4gICAgfSk7XG4gIH1cblxuICBzZXJpYWxTdG9wKHBvcnRJZCkge1xuICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgdHlwZTogU0VSSUFMX0FDVElPTl9TVE9QLFxuICAgICAgcG9ydElkXG4gICAgfSk7XG4gIH1cblxuICBzZXJpYWxDbG9zZShwb3J0SWQpIHtcbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fQ0xPU0UsXG4gICAgICBwb3J0SWRcbiAgICB9KTtcbiAgfVxuXG4gIHNlcmlhbEZsdXNoKHBvcnRJZCkge1xuICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgdHlwZTogU0VSSUFMX0FDVElPTl9GTFVTSCxcbiAgICAgIHBvcnRJZFxuICAgIH0pO1xuICB9XG5cbiAgW2FkZFRvU2VyaWFsUXVldWVdKGFjdGlvbikge1xuICAgIGlmIChhY3Rpb24ucG9ydElkICE9PSBERUZBVUxUX1BPUlQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBzZXJpYWwgcG9ydCBcIiR7cG9ydElkfVwiYCk7XG4gICAgfVxuICAgIHRoaXNbc2VyaWFsUXVldWVdLnB1c2goYWN0aW9uKTtcbiAgICB0aGlzW3NlcmlhbFB1bXBdKCk7XG4gIH1cblxuICBbc2VyaWFsUHVtcF0oKSB7XG4gICAgaWYgKHRoaXNbaXNTZXJpYWxQcm9jZXNzaW5nXSB8fCAhdGhpc1tzZXJpYWxRdWV1ZV0ubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXNbaXNTZXJpYWxQcm9jZXNzaW5nXSA9IHRydWU7XG4gICAgY29uc3QgYWN0aW9uID0gdGhpc1tzZXJpYWxRdWV1ZV0uc2hpZnQoKTtcbiAgICBjb25zdCBmaW5hbGl6ZSA9ICgpID0+IHtcbiAgICAgIHRoaXNbaXNTZXJpYWxQcm9jZXNzaW5nXSA9IGZhbHNlO1xuICAgICAgdGhpc1tzZXJpYWxQdW1wXSgpO1xuICAgIH07XG4gICAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX1dSSVRFOlxuICAgICAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHdyaXRlIHRvIGNsb3NlZCBzZXJpYWwgcG9ydCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXNbc2VyaWFsXS53cml0ZShhY3Rpb24uaW5CeXRlcywgZmluYWxpemUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX1JFQUQ6XG4gICAgICAgIGlmICghdGhpc1tpc1NlcmlhbE9wZW5dKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgcmVhZCBmcm9tIGNsb3NlZCBzZXJpYWwgcG9ydCcpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE86IGFkZCBzdXBwb3J0IGZvciBhY3Rpb24ubWF4Qnl0ZXNUb1JlYWRcbiAgICAgICAgdGhpc1tzZXJpYWxdLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICBhY3Rpb24uaGFuZGxlcihidWZmZXJUb0FycmF5KGRhdGEpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soZmluYWxpemUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX1NUT1A6XG4gICAgICAgIGlmICghdGhpc1tpc1NlcmlhbE9wZW5dKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc3RvcCBjbG9zZWQgc2VyaWFsIHBvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzW3NlcmlhbF0ucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soZmluYWxpemUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX0NPTkZJRzpcbiAgICAgICAgdGhpc1tzZXJpYWxdLmNsb3NlKCgpID0+IHtcbiAgICAgICAgICB0aGlzW3NlcmlhbF0gPSBuZXcgU2VyaWFsKHtcbiAgICAgICAgICAgIGJhdWRSYXRlOiBhY3Rpb24uYmF1ZFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXNbc2VyaWFsXS5vcGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXNbc2VyaWFsXS5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuZW1pdChgc2VyaWFsLWRhdGEtJHthY3Rpb24ucG9ydElkfWAsIGJ1ZmZlclRvQXJyYXkoZGF0YSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzW2lzU2VyaWFsT3Blbl0gPSB0cnVlO1xuICAgICAgICAgICAgZmluYWxpemUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fQ0xPU0U6XG4gICAgICAgIHRoaXNbc2VyaWFsXS5jbG9zZSgoKSA9PiB7XG4gICAgICAgICAgdGhpc1tpc1NlcmlhbE9wZW5dID0gZmFsc2U7XG4gICAgICAgICAgZmluYWxpemUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fRkxVU0g6XG4gICAgICAgIGlmICghdGhpc1tpc1NlcmlhbE9wZW5dKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmx1c2ggY2xvc2VkIHNlcmlhbCBwb3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpc1tzZXJpYWxdLmZsdXNoKGZpbmFsaXplKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW50ZXJuYWwgZXJyb3I6IHVua25vd24gc2VyaWFsIGFjdGlvbiB0eXBlJyk7XG4gICAgfVxuICB9XG5cbiAgc2VuZE9uZVdpcmVDb25maWcoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZUNvbmZpZyBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlU2VhcmNoKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVTZWFyY2ggaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZUFsYXJtc1NlYXJjaCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlQWxhcm1zU2VhcmNoIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVSZWFkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVSZWFkIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVSZXNldCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlQ29uZmlnIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlV3JpdGUgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZURlbGF5KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVEZWxheSBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlV3JpdGVBbmRSZWFkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZXRTYW1wbGluZ0ludGVydmFsKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0U2FtcGxpbmdJbnRlcnZhbCBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICByZXBvcnRBbmFsb2dQaW4oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZXBvcnRBbmFsb2dQaW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcmVwb3J0RGlnaXRhbFBpbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlcG9ydERpZ2l0YWxQaW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcGluZ1JlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwaW5nUmVhZCBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBwdWxzZUluKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHVsc2VJbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBzdGVwcGVyQ29uZmlnKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc3RlcHBlckNvbmZpZyBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBzdGVwcGVyU3RlcCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0ZXBwZXJTdGVwIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoUmFzcGksICdpc1Jhc3BiZXJyeVBpJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICB2YWx1ZTogKCkgPT4ge1xuICAgIC8vIERldGVybWluaW5nIGlmIGEgc3lzdGVtIGlzIGEgUmFzcGJlcnJ5IFBpIGlzbid0IHBvc3NpYmxlIHRocm91Z2hcbiAgICAvLyB0aGUgb3MgbW9kdWxlIG9uIFJhc3BiaWFuLCBzbyB3ZSByZWFkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtIGluc3RlYWRcbiAgICBsZXQgaXNSYXNwYmVycnlQaSA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICBpc1Jhc3BiZXJyeVBpID0gZnMucmVhZEZpbGVTeW5jKCcvZXRjL29zLXJlbGVhc2UnKS50b1N0cmluZygpLmluZGV4T2YoJ1Jhc3BiaWFuJykgIT09IC0xO1xuICAgIH0gY2F0Y2ggKGUpIHt9Ly8gU3F1YXNoIGZpbGUgbm90IGZvdW5kLCBldGMgZXJyb3JzXG4gICAgcmV0dXJuIGlzUmFzcGJlcnJ5UGk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhc3BpO1xuIl19