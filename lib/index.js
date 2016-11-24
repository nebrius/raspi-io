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
          previousWrittenValue: LOW,

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

//# sourceMappingURL=data:application/json;base64,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QUFOO0FBQ0Q7Ozt1Q0FFa0I7QUFDakIsWUFBTSxJQUFJLEtBQUosQ0FBVSx1REFBVixDQUFOO0FBQ0Q7Ozt1Q0FFa0I7QUFDakIsWUFBTSxJQUFJLEtBQUosQ0FBVSx1REFBVixDQUFOO0FBQ0Q7Ozs4Q0FFeUI7QUFDeEIsWUFBTSxJQUFJLEtBQUosQ0FBVSw4REFBVixDQUFOO0FBQ0Q7OzswQ0FFcUI7QUFDcEIsWUFBTSxJQUFJLEtBQUosQ0FBVSw0Q0FBVixDQUFOO0FBQ0Q7OztzQ0FFaUI7QUFDaEIsWUFBTSxJQUFJLEtBQUosQ0FBVSx3Q0FBVixDQUFOO0FBQ0Q7Ozt1Q0FFa0I7QUFDakIsWUFBTSxJQUFJLEtBQUosQ0FBVSx5Q0FBVixDQUFOO0FBQ0Q7OzsrQkFFVTtBQUNULFlBQU0sSUFBSSxLQUFKLENBQVUsaUNBQVYsQ0FBTjtBQUNEOzs7OEJBRVM7QUFDUixZQUFNLElBQUksS0FBSixDQUFVLGdDQUFWLENBQU47QUFDRDs7O29DQUVlO0FBQ2QsWUFBTSxJQUFJLEtBQUosQ0FBVSxzQ0FBVixDQUFOO0FBQ0Q7OztrQ0FFYTtBQUNaLFlBQU0sSUFBSSxLQUFKLENBQVUsb0NBQVYsQ0FBTjtBQUNEOzs7Ozs7QUFHSCxPQUFPLGNBQVAsQ0FBc0IsS0FBdEIsRUFBNkIsZUFBN0IsRUFBOEM7QUFDNUMsY0FBWSxJQURnQztBQUU1QyxTQUFPLGlCQUFNO0FBQ1g7QUFDQTtBQUNBLFFBQUksZ0JBQWdCLEtBQXBCO0FBQ0EsUUFBSTtBQUNGLHNCQUFnQixhQUFHLFlBQUgsQ0FBZ0IsaUJBQWhCLEVBQW1DLFFBQW5DLEdBQThDLE9BQTlDLENBQXNELFVBQXRELE1BQXNFLENBQUMsQ0FBdkY7QUFDRCxLQUZELENBRUUsT0FBTyxDQUFQLEVBQVUsQ0FBRSxDQU5ILENBTUc7QUFDZCxXQUFPLGFBQVA7QUFDRDtBQVYyQyxDQUE5Qzs7QUFhQSxPQUFPLE9BQVAsR0FBaUIsS0FBakIiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IChjKSAyMDE0IEJyeWFuIEh1Z2hlcyA8YnJ5YW5AdGhlb3JldGljYWxpZGVhdGlvbnMuY29tPlxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvblxub2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb25cbmZpbGVzICh0aGUgJ1NvZnR3YXJlJyksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXRcbnJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLFxuY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZVxuU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmdcbmNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG5FWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVNcbk9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXG5OT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVFxuSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksXG5XSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkdcbkZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1Jcbk9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgaW5pdCB9IGZyb20gJ3Jhc3BpJztcbmltcG9ydCB7IGdldFBpbnMsIGdldFBpbk51bWJlciB9IGZyb20gJ3Jhc3BpLWJvYXJkJztcbmltcG9ydCB7IFBVTExfTk9ORSwgUFVMTF9VUCwgUFVMTF9ET1dOLCBEaWdpdGFsT3V0cHV0LCBEaWdpdGFsSW5wdXQgfSBmcm9tICdyYXNwaS1ncGlvJztcbmltcG9ydCB7IFBXTSB9IGZyb20gJ3Jhc3BpLXB3bSc7XG5pbXBvcnQgeyBTb2Z0UFdNIH0gZnJvbSAncmFzcGktc29mdC1wd20nO1xuaW1wb3J0IHsgSTJDIH0gZnJvbSAncmFzcGktaTJjJztcbmltcG9ydCB7IExFRCB9IGZyb20gJ3Jhc3BpLWxlZCc7XG5pbXBvcnQgeyBTZXJpYWwsIERFRkFVTFRfUE9SVCB9IGZyb20gJ3Jhc3BpLXNlcmlhbCc7XG5cbi8vIENvbnN0YW50c1xuY29uc3QgSU5QVVRfTU9ERSA9IDA7XG5jb25zdCBPVVRQVVRfTU9ERSA9IDE7XG5jb25zdCBBTkFMT0dfTU9ERSA9IDI7XG5jb25zdCBQV01fTU9ERSA9IDM7XG5jb25zdCBTRVJWT19NT0RFID0gNDtcbmNvbnN0IFVOS05PV05fTU9ERSA9IDk5O1xuXG5jb25zdCBMT1cgPSAwO1xuY29uc3QgSElHSCA9IDE7XG5cbmNvbnN0IExFRF9QSU4gPSAtMTtcblxuLy8gU2V0dGluZ3NcbmNvbnN0IERFRkFVTFRfU0VSVk9fTUlOID0gMTAwMDtcbmNvbnN0IERFRkFVTFRfU0VSVk9fTUFYID0gMjAwMDtcbmNvbnN0IERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSA9IDE5O1xuXG4vLyBQcml2YXRlIHN5bWJvbHNcbmNvbnN0IGlzUmVhZHkgPSBTeW1ib2woJ2lzUmVhZHknKTtcbmNvbnN0IHBpbnMgPSBTeW1ib2woJ3BpbnMnKTtcbmNvbnN0IGluc3RhbmNlcyA9IFN5bWJvbCgnaW5zdGFuY2VzJyk7XG5jb25zdCBhbmFsb2dQaW5zID0gU3ltYm9sKCdhbmFsb2dQaW5zJyk7XG5jb25zdCBnZXRQaW5JbnN0YW5jZSA9IFN5bWJvbCgnZ2V0UGluSW5zdGFuY2UnKTtcbmNvbnN0IGkyYyA9IFN5bWJvbCgnaTJjJyk7XG5jb25zdCBpMmNEZWxheSA9IFN5bWJvbCgnaTJjRGVsYXknKTtcbmNvbnN0IGkyY1JlYWQgPSBTeW1ib2woJ2kyY1JlYWQnKTtcbmNvbnN0IGkyY0NoZWNrQWxpdmUgPSBTeW1ib2woJ2kyY0NoZWNrQWxpdmUnKTtcbmNvbnN0IHBpbk1vZGUgPSBTeW1ib2woJ3Bpbk1vZGUnKTtcbmNvbnN0IHNlcmlhbCA9IFN5bWJvbCgnc2VyaWFsJyk7XG5jb25zdCBzZXJpYWxRdWV1ZSA9IFN5bWJvbCgnc2VyaWFsUXVldWUnKTtcbmNvbnN0IGFkZFRvU2VyaWFsUXVldWUgPSBTeW1ib2woJ2FkZFRvU2VyaWFsUXVldWUnKTtcbmNvbnN0IHNlcmlhbFB1bXAgPSBTeW1ib2woJ3NlcmlhbFB1bXAnKTtcbmNvbnN0IGlzU2VyaWFsUHJvY2Vzc2luZyA9IFN5bWJvbCgnaXNTZXJpYWxQcm9jZXNzaW5nJyk7XG5jb25zdCBpc1NlcmlhbE9wZW4gPSBTeW1ib2woJ2lzU2VyaWFsT3BlbicpO1xuXG5jb25zdCBTRVJJQUxfQUNUSU9OX1dSSVRFID0gJ1NFUklBTF9BQ1RJT05fV1JJVEUnO1xuY29uc3QgU0VSSUFMX0FDVElPTl9DTE9TRSA9ICdTRVJJQUxfQUNUSU9OX0NMT1NFJztcbmNvbnN0IFNFUklBTF9BQ1RJT05fRkxVU0ggPSAnU0VSSUFMX0FDVElPTl9GTFVTSCc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX0NPTkZJRyA9ICdTRVJJQUxfQUNUSU9OX0NPTkZJRyc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX1JFQUQgPSAnU0VSSUFMX0FDVElPTl9SRUFEJztcbmNvbnN0IFNFUklBTF9BQ1RJT05fU1RPUCA9ICdTRVJJQUxfQUNUSU9OX1NUT1AnO1xuXG5mdW5jdGlvbiBidWZmZXJUb0FycmF5KGJ1ZmZlcikge1xuICBjb25zdCBhcnJheSA9IEFycmF5KGJ1ZmZlci5sZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGJ1ZmZlci5sZW5ndGg7IGkrKykge1xuICAgIGFycmF5W2ldID0gYnVmZmVyW2ldO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuY2xhc3MgUmFzcGkgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKHsgaW5jbHVkZVBpbnMsIGV4Y2x1ZGVQaW5zLCBlbmFibGVTb2Z0UHdtID0gZmFsc2UgfSA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIG5hbWU6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6ICdSYXNwYmVycnlQaS1JTydcbiAgICAgIH0sXG5cbiAgICAgIFtpbnN0YW5jZXNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG5cbiAgICAgIFtpc1JlYWR5XToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICB9LFxuICAgICAgaXNSZWFkeToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbaXNSZWFkeV07XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFtwaW5zXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuICAgICAgcGluczoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbcGluc107XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFthbmFsb2dQaW5zXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuICAgICAgYW5hbG9nUGluczoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbYW5hbG9nUGluc107XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFtpMmNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogbmV3IEkyQygpXG4gICAgICB9LFxuXG4gICAgICBbaTJjRGVsYXldOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogMFxuICAgICAgfSxcblxuICAgICAgW3NlcmlhbF06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBuZXcgU2VyaWFsKClcbiAgICAgIH0sXG5cbiAgICAgIFtzZXJpYWxRdWV1ZV06IHtcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuXG4gICAgICBbaXNTZXJpYWxQcm9jZXNzaW5nXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICB9LFxuXG4gICAgICBbaXNTZXJpYWxPcGVuXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICB9LFxuXG4gICAgICBNT0RFUzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgSU5QVVQ6IElOUFVUX01PREUsXG4gICAgICAgICAgT1VUUFVUOiBPVVRQVVRfTU9ERSxcbiAgICAgICAgICBBTkFMT0c6IEFOQUxPR19NT0RFLFxuICAgICAgICAgIFBXTTogUFdNX01PREUsXG4gICAgICAgICAgU0VSVk86IFNFUlZPX01PREVcbiAgICAgICAgfSlcbiAgICAgIH0sXG5cbiAgICAgIEhJR0g6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IEhJR0hcbiAgICAgIH0sXG4gICAgICBMT1c6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IExPV1xuICAgICAgfSxcblxuICAgICAgZGVmYXVsdExlZDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTEVEX1BJTlxuICAgICAgfSxcblxuICAgICAgU0VSSUFMX1BPUlRfSURzOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICBIV19TRVJJQUwwOiBERUZBVUxUX1BPUlQsXG4gICAgICAgICAgREVGQVVMVDogREVGQVVMVF9QT1JUXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpbml0KCgpID0+IHtcbiAgICAgIGxldCBwaW5NYXBwaW5ncyA9IGdldFBpbnMoKTtcbiAgICAgIHRoaXNbcGluc10gPSBbXTtcblxuICAgICAgLy8gU2xpZ2h0IGhhY2sgdG8gZ2V0IHRoZSBMRUQgaW4gdGhlcmUsIHNpbmNlIGl0J3Mgbm90IGFjdHVhbGx5IGEgcGluXG4gICAgICBwaW5NYXBwaW5nc1tMRURfUElOXSA9IHtcbiAgICAgICAgcGluczogWyBMRURfUElOIF0sXG4gICAgICAgIHBlcmlwaGVyYWxzOiBbICdncGlvJyBdXG4gICAgICB9O1xuXG4gICAgICBpZiAoaW5jbHVkZVBpbnMgJiYgZXhjbHVkZVBpbnMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcImluY2x1ZGVQaW5zXCIgYW5kIFwiZXhjbHVkZVBpbnNcIiBjYW5ub3QgYmUgc3BlY2lmaWVkIGF0IHRoZSBzYW1lIHRpbWUnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaW5jbHVkZVBpbnMpKSB7XG4gICAgICAgIGNvbnN0IG5ld1Bpbk1hcHBpbmdzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgcGluIG9mIGluY2x1ZGVQaW5zKSB7XG4gICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IGdldFBpbk51bWJlcihwaW4pO1xuICAgICAgICAgIGlmIChub3JtYWxpemVkUGluID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGluIFwiJHtwaW59XCIgc3BlY2lmaWVkIGluIGluY2x1ZGVQaW5zYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5ld1Bpbk1hcHBpbmdzW25vcm1hbGl6ZWRQaW5dID0gcGluTWFwcGluZ3Nbbm9ybWFsaXplZFBpbl07XG4gICAgICAgIH1cbiAgICAgICAgcGluTWFwcGluZ3MgPSBuZXdQaW5NYXBwaW5ncztcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShleGNsdWRlUGlucykpIHtcbiAgICAgICAgcGluTWFwcGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBwaW5NYXBwaW5ncyk7XG4gICAgICAgIGZvciAoY29uc3QgcGluIG9mIGV4Y2x1ZGVQaW5zKSB7XG4gICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IGdldFBpbk51bWJlcihwaW4pO1xuICAgICAgICAgIGlmIChub3JtYWxpemVkUGluID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGluIFwiJHtwaW59XCIgc3BlY2lmaWVkIGluIGV4Y2x1ZGVQaW5zYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlbGV0ZSBwaW5NYXBwaW5nc1tub3JtYWxpemVkUGluXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBPYmplY3Qua2V5cyhwaW5NYXBwaW5ncykuZm9yRWFjaCgocGluKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbkluZm8gPSBwaW5NYXBwaW5nc1twaW5dO1xuICAgICAgICBjb25zdCBzdXBwb3J0ZWRNb2RlcyA9IFtdO1xuICAgICAgICAvLyBXZSBkb24ndCB3YW50IEkyQyB0byBiZSB1c2VkIGZvciBhbnl0aGluZyBlbHNlLCBzaW5jZSBjaGFuZ2luZyB0aGVcbiAgICAgICAgLy8gcGluIG1vZGUgbWFrZXMgaXQgdW5hYmxlIHRvIGV2ZXIgZG8gSTJDIGFnYWluLlxuICAgICAgICBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdpMmMnKSA9PSAtMSAmJiBwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ3VhcnQnKSA9PSAtMSkge1xuICAgICAgICAgIGlmIChwaW4gPT0gTEVEX1BJTikge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChPVVRQVVRfTU9ERSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ2dwaW8nKSAhPSAtMSkge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChJTlBVVF9NT0RFLCBPVVRQVVRfTU9ERSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ3B3bScpICE9IC0xKSB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlcy5wdXNoKFBXTV9NT0RFLCBTRVJWT19NT0RFKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGVuYWJsZVNvZnRQd20gPT09IHRydWUgJiYgcGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdncGlvJykgIT09IC0xKSB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlcy5wdXNoKFBXTV9NT0RFLCBTRVJWT19NT0RFKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXSA9IHtcbiAgICAgICAgICBwZXJpcGhlcmFsOiBudWxsLFxuICAgICAgICAgIG1vZGU6IHN1cHBvcnRlZE1vZGVzLmluZGV4T2YoT1VUUFVUX01PREUpID09IC0xID8gVU5LTk9XTl9NT0RFIDogT1VUUFVUX01PREUsXG5cbiAgICAgICAgICAvLyBVc2VkIHRvIGNhY2hlIHRoZSBwcmV2aW91c2x5IHdyaXR0ZW4gdmFsdWUgZm9yIHJlYWRpbmcgYmFjayBpbiBPVVRQVVQgbW9kZVxuICAgICAgICAgIHByZXZpb3VzV3JpdHRlblZhbHVlOiBMT1csXG5cbiAgICAgICAgICAvLyBVc2VkIHRvIHNldCB0aGUgZGVmYXVsdCBtaW4gYW5kIG1heCB2YWx1ZXNcbiAgICAgICAgICBtaW46IERFRkFVTFRfU0VSVk9fTUlOLFxuICAgICAgICAgIG1heDogREVGQVVMVF9TRVJWT19NQVgsXG5cbiAgICAgICAgICAvLyBVc2VkIHRvIHRyYWNrIGlmIHRoaXMgcGluIGlzIGNhcGFibGUgb2YgaGFyZHdhcmUgUFdNXG4gICAgICAgICAgaXNIYXJkd2FyZVB3bTogcGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdwd20nKSAhPT0gLTFcbiAgICAgICAgfTtcbiAgICAgICAgdGhpc1twaW5zXVtwaW5dID0gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgICAgc3VwcG9ydGVkTW9kZXM6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZShzdXBwb3J0ZWRNb2RlcylcbiAgICAgICAgICB9LFxuICAgICAgICAgIG1vZGU6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5tb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHN3aXRjaCAoaW5zdGFuY2UubW9kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgICAgICAgICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UubW9kZSA9PSBPVVRQVVRfTU9ERSkge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUodmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZXBvcnQ6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgYW5hbG9nQ2hhbm5lbDoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiAxMjdcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaW5zdGFuY2UubW9kZSA9PSBPVVRQVVRfTU9ERSkge1xuICAgICAgICAgIHRoaXMucGluTW9kZShwaW4sIE9VVFBVVF9NT0RFKTtcbiAgICAgICAgICB0aGlzLmRpZ2l0YWxXcml0ZShwaW4sIExPVyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBGaWxsIGluIHRoZSBob2xlcywgc2lucyBwaW5zIGFyZSBzcGFyc2Ugb24gdGhlIEErL0IrLzJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpc1twaW5zXS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXRoaXNbcGluc11baV0pIHtcbiAgICAgICAgICB0aGlzW3BpbnNdW2ldID0gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlczoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZShbXSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb2RlOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVU5LTk9XTl9NT0RFO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBzZXQoKSB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcG9ydDoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFuYWxvZ0NoYW5uZWw6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IDEyN1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2VyaWFsQ29uZmlnKHtcbiAgICAgICAgcG9ydElkOiBERUZBVUxUX1BPUlQsXG4gICAgICAgIGJhdWQ6IDk2MDBcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzW2lzUmVhZHldID0gdHJ1ZTtcbiAgICAgIHRoaXMuZW1pdCgncmVhZHknKTtcbiAgICAgIHRoaXMuZW1pdCgnY29ubmVjdCcpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZXNldCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIG5vcm1hbGl6ZShwaW4pIHtcbiAgICBjb25zdCBub3JtYWxpemVkUGluID0gZ2V0UGluTnVtYmVyKHBpbik7XG4gICAgaWYgKHR5cGVvZiBub3JtYWxpemVkUGluICE9PSAnbnVtYmVyJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHBpbiBcIiR7cGlufVwiYCk7XG4gICAgfVxuICAgIHJldHVybiBub3JtYWxpemVkUGluO1xuICB9XG5cbiAgW2dldFBpbkluc3RhbmNlXShwaW4pIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbaW5zdGFuY2VzXVtwaW5dO1xuICAgIGlmICghcGluSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwaW4gXCIke3Bpbn1cImApO1xuICAgIH1cbiAgICByZXR1cm4gcGluSW5zdGFuY2U7XG4gIH1cblxuICBwaW5Nb2RlKHBpbiwgbW9kZSkge1xuICAgIHRoaXNbcGluTW9kZV0oeyBwaW4sIG1vZGUgfSk7XG4gIH1cblxuICBbcGluTW9kZV0oeyBwaW4sIG1vZGUsIHB1bGxSZXNpc3RvciA9IFBVTExfTk9ORSB9KSB7XG4gICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IHRoaXMubm9ybWFsaXplKHBpbik7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXShub3JtYWxpemVkUGluKTtcbiAgICBwaW5JbnN0YW5jZS5wdWxsUmVzaXN0b3IgPSBwdWxsUmVzaXN0b3I7XG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgcGluOiBub3JtYWxpemVkUGluLFxuICAgICAgcHVsbFJlc2lzdG9yOiBwaW5JbnN0YW5jZS5wdWxsUmVzaXN0b3JcbiAgICB9O1xuICAgIGlmICh0aGlzW3BpbnNdW25vcm1hbGl6ZWRQaW5dLnN1cHBvcnRlZE1vZGVzLmluZGV4T2YobW9kZSkgPT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUGluIFwiJHtwaW59XCIgZG9lcyBub3Qgc3VwcG9ydCBtb2RlIFwiJHttb2RlfVwiYCk7XG4gICAgfVxuXG4gICAgaWYgKHBpbiA9PSBMRURfUElOKSB7XG4gICAgICBpZiAocGluSW5zdGFuY2UucGVyaXBoZXJhbCBpbnN0YW5jZW9mIExFRCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IExFRCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKG1vZGUpIHtcbiAgICAgICAgY2FzZSBJTlBVVF9NT0RFOlxuICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbElucHV0KGNvbmZpZyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgT1VUUFVUX01PREU6XG4gICAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBEaWdpdGFsT3V0cHV0KGNvbmZpZyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUFdNX01PREU6XG4gICAgICAgIGNhc2UgU0VSVk9fTU9ERTpcbiAgICAgICAgICBpZiAocGluSW5zdGFuY2UuaXNIYXJkd2FyZVB3bSkge1xuICAgICAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBQV00obm9ybWFsaXplZFBpbik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgU29mdFBXTSh7XG4gICAgICAgICAgICAgIHBpbjogbm9ybWFsaXplZFBpbixcbiAgICAgICAgICAgICAgcmFuZ2U6IDI1NVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnNvbGUud2FybihgVW5rbm93biBwaW4gbW9kZTogJHttb2RlfWApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5tb2RlID0gbW9kZTtcbiAgfVxuXG4gIGFuYWxvZ1JlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhbmFsb2dSZWFkIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgYW5hbG9nV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIHRoaXMucHdtV3JpdGUocGluLCB2YWx1ZSk7XG4gIH1cblxuICBwd21Xcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBQV01fTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgUFdNX01PREUpO1xuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKE1hdGgucm91bmQodmFsdWUgKiBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJhbmdlIC8gMjU1KSk7XG4gIH1cblxuICBkaWdpdGFsUmVhZChwaW4sIGhhbmRsZXIpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IElOUFVUX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIElOUFVUX01PREUpO1xuICAgIH1cbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGxldCB2YWx1ZTtcbiAgICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09IElOUFVUX01PREUpIHtcbiAgICAgICAgdmFsdWUgPSBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAoaGFuZGxlcikge1xuICAgICAgICBoYW5kbGVyKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdChgZGlnaXRhbC1yZWFkLSR7cGlufWAsIHZhbHVlKTtcbiAgICB9LCBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUpO1xuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwub24oJ2Rlc3Ryb3llZCcsICgpID0+IHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgZGlnaXRhbFdyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09PSBJTlBVVF9NT0RFICYmIHZhbHVlID09PSBISUdIKSB7XG4gICAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlOiBJTlBVVF9NT0RFLCBwdWxsUmVzaXN0b3I6IFBVTExfVVAgfSk7XG4gICAgfSBlbHNlIGlmIChwaW5JbnN0YW5jZS5tb2RlID09PSBJTlBVVF9NT0RFICYmIHZhbHVlID09PSBMT1cpIHtcbiAgICAgIHRoaXNbcGluTW9kZV0oeyBwaW4sIG1vZGU6IElOUFVUX01PREUsIHB1bGxSZXNpc3RvcjogUFVMTF9ET1dOIH0pO1xuICAgIH0gZWxzZSBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBPVVRQVVRfTU9ERSkge1xuICAgICAgdGhpc1twaW5Nb2RlXSh7IHBpbiwgbW9kZTogT1VUUFVUX01PREUgfSk7XG4gICAgfVxuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09PSBPVVRQVVRfTU9ERSAmJiB2YWx1ZSAhPSBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSkge1xuICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSh2YWx1ZSA/IEhJR0ggOiBMT1cpO1xuICAgICAgcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBzZXJ2b0NvbmZpZyhwaW4sIG1pbiwgbWF4KSB7XG4gICAgbGV0IGNvbmZpZyA9IHBpbjtcbiAgICBpZiAodHlwZW9mIGNvbmZpZyAhPT0gJ29iamVjdCcpIHtcbiAgICAgIGNvbmZpZyA9IHsgcGluLCBtaW4sIG1heCB9O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNvbmZpZy5taW4gIT09ICdudW1iZXInKSB7XG4gICAgICBjb25maWcubWluID0gREVGQVVMVF9TRVJWT19NSU47XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY29uZmlnLm1heCAhPT0gJ251bWJlcicpIHtcbiAgICAgIGNvbmZpZy5tYXggPSBERUZBVUxUX1NFUlZPX01BWDtcbiAgICB9XG4gICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IHRoaXMubm9ybWFsaXplKHBpbik7XG4gICAgdGhpc1twaW5Nb2RlXSh7XG4gICAgICBwaW46IG5vcm1hbGl6ZWRQaW4sXG4gICAgICBtb2RlOiBTRVJWT19NT0RFXG4gICAgfSk7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShub3JtYWxpemVkUGluKSk7XG4gICAgcGluSW5zdGFuY2UubWluID0gY29uZmlnLm1pbjtcbiAgICBwaW5JbnN0YW5jZS5tYXggPSBjb25maWcubWF4O1xuICB9XG5cbiAgc2Vydm9Xcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBTRVJWT19NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBTRVJWT19NT0RFKTtcbiAgICB9XG4gICAgY29uc3QgZHV0eUN5Y2xlID0gKHBpbkluc3RhbmNlLm1pbiArICh2YWx1ZSAvIDE4MCkgKiAocGluSW5zdGFuY2UubWF4IC0gcGluSW5zdGFuY2UubWluKSkgLyAyMDAwMDtcbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKGR1dHlDeWNsZSAqIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwucmFuZ2UpO1xuICB9XG5cbiAgcXVlcnlDYXBhYmlsaXRpZXMoY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcXVlcnlBbmFsb2dNYXBwaW5nKGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHF1ZXJ5UGluU3RhdGUocGluLCBjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBbaTJjQ2hlY2tBbGl2ZV0oKSB7XG4gICAgaWYgKCF0aGlzW2kyY10uYWxpdmUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSTJDIHBpbnMgbm90IGluIEkyQyBtb2RlJyk7XG4gICAgfVxuICB9XG5cbiAgaTJjQ29uZmlnKG9wdGlvbnMpIHtcbiAgICBsZXQgZGVsYXk7XG5cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdudW1iZXInKSB7XG4gICAgICBkZWxheSA9IG9wdGlvbnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgb3B0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICBkZWxheSA9IG9wdGlvbnMuZGVsYXk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgdGhpc1tpMmNEZWxheV0gPSBNYXRoLnJvdW5kKChkZWxheSB8fCAwKSAvIDEwMDApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNXcml0ZShhZGRyZXNzLCBjbWRSZWdPckRhdGEsIGluQnl0ZXMpIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICAvLyBJZiBpMmNXcml0ZSB3YXMgdXNlZCBmb3IgYW4gaTJjV3JpdGVSZWcgY2FsbC4uLlxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzICYmXG4gICAgICAgICFBcnJheS5pc0FycmF5KGNtZFJlZ09yRGF0YSkgJiZcbiAgICAgICAgIUFycmF5LmlzQXJyYXkoaW5CeXRlcykpIHtcbiAgICAgIHJldHVybiB0aGlzLmkyY1dyaXRlUmVnKGFkZHJlc3MsIGNtZFJlZ09yRGF0YSwgaW5CeXRlcyk7XG4gICAgfVxuXG4gICAgLy8gRml4IGFyZ3VtZW50cyBpZiBjYWxsZWQgd2l0aCBGaXJtYXRhLmpzIEFQSVxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShjbWRSZWdPckRhdGEpKSB7XG4gICAgICAgIGluQnl0ZXMgPSBjbWRSZWdPckRhdGEuc2xpY2UoKTtcbiAgICAgICAgY21kUmVnT3JEYXRhID0gaW5CeXRlcy5zaGlmdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5CeXRlcyA9IFtdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIoW2NtZFJlZ09yRGF0YV0uY29uY2F0KGluQnl0ZXMpKTtcblxuICAgIC8vIE9ubHkgd3JpdGUgaWYgYnl0ZXMgcHJvdmlkZWRcbiAgICBpZiAoYnVmZmVyLmxlbmd0aCkge1xuICAgICAgdGhpc1tpMmNdLndyaXRlU3luYyhhZGRyZXNzLCBidWZmZXIpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaTJjV3JpdGVSZWcoYWRkcmVzcywgcmVnaXN0ZXIsIHZhbHVlKSB7XG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgdGhpc1tpMmNdLndyaXRlQnl0ZVN5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIHZhbHVlKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgW2kyY1JlYWRdKGNvbnRpbnVvdXMsIGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlc1RvUmVhZCwgY2FsbGJhY2spIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICAvLyBGaXggYXJndW1lbnRzIGlmIGNhbGxlZCB3aXRoIEZpcm1hdGEuanMgQVBJXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gNCAmJlxuICAgICAgdHlwZW9mIHJlZ2lzdGVyID09ICdudW1iZXInICYmXG4gICAgICB0eXBlb2YgYnl0ZXNUb1JlYWQgPT0gJ2Z1bmN0aW9uJ1xuICAgICkge1xuICAgICAgY2FsbGJhY2sgPSBieXRlc1RvUmVhZDtcbiAgICAgIGJ5dGVzVG9SZWFkID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IG51bGw7XG4gICAgfVxuXG4gICAgY2FsbGJhY2sgPSB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBjYWxsYmFjayA6ICgpID0+IHt9O1xuXG4gICAgbGV0IGV2ZW50ID0gYGkyYy1yZXBseS0ke2FkZHJlc3N9LWA7XG4gICAgZXZlbnQgKz0gcmVnaXN0ZXIgIT09IG51bGwgPyByZWdpc3RlciA6IDA7XG5cbiAgICBjb25zdCByZWFkID0gKCkgPT4ge1xuICAgICAgY29uc3QgYWZ0ZXJSZWFkID0gKGVyciwgYnVmZmVyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb252ZXJ0IGJ1ZmZlciB0byBBcnJheSBiZWZvcmUgZW1pdFxuICAgICAgICB0aGlzLmVtaXQoZXZlbnQsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGJ1ZmZlcikpO1xuXG4gICAgICAgIGlmIChjb250aW51b3VzKSB7XG4gICAgICAgICAgc2V0VGltZW91dChyZWFkLCB0aGlzW2kyY0RlbGF5XSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRoaXMub25jZShldmVudCwgY2FsbGJhY2spO1xuXG4gICAgICBpZiAocmVnaXN0ZXIgIT09IG51bGwpIHtcbiAgICAgICAgdGhpc1tpMmNdLnJlYWQoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGVzVG9SZWFkLCBhZnRlclJlYWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1tpMmNdLnJlYWQoYWRkcmVzcywgYnl0ZXNUb1JlYWQsIGFmdGVyUmVhZCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNldFRpbWVvdXQocmVhZCwgdGhpc1tpMmNEZWxheV0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNSZWFkKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpc1tpMmNSZWFkXSh0cnVlLCAuLi5yZXN0KTtcbiAgfVxuXG4gIGkyY1JlYWRPbmNlKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpc1tpMmNSZWFkXShmYWxzZSwgLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDQ29uZmlnKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNDb25maWcoLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDV3JpdGVSZXF1ZXN0KC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNXcml0ZSguLi5yZXN0KTtcbiAgfVxuXG4gIHNlbmRJMkNSZWFkUmVxdWVzdCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjUmVhZE9uY2UoLi4ucmVzdCk7XG4gIH1cblxuICBzZXJpYWxDb25maWcoeyBwb3J0SWQsIGJhdWQgfSkge1xuICAgIGlmICghdGhpc1tpc1NlcmlhbE9wZW5dIHx8IChiYXVkICYmIGJhdWQgIT09IHRoaXNbc2VyaWFsXS5iYXVkUmF0ZSkpIHtcbiAgICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX0NPTkZJRyxcbiAgICAgICAgcG9ydElkLFxuICAgICAgICBiYXVkXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBzZXJpYWxXcml0ZShwb3J0SWQsIGluQnl0ZXMpIHtcbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fV1JJVEUsXG4gICAgICBwb3J0SWQsXG4gICAgICBpbkJ5dGVzXG4gICAgfSk7XG4gIH1cblxuICBzZXJpYWxSZWFkKHBvcnRJZCwgbWF4Qnl0ZXNUb1JlYWQsIGhhbmRsZXIpIHtcbiAgICBpZiAodHlwZW9mIG1heEJ5dGVzVG9SZWFkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBoYW5kbGVyID0gbWF4Qnl0ZXNUb1JlYWQ7XG4gICAgICBtYXhCeXRlc1RvUmVhZCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX1JFQUQsXG4gICAgICBwb3J0SWQsXG4gICAgICBtYXhCeXRlc1RvUmVhZCxcbiAgICAgIGhhbmRsZXJcbiAgICB9KTtcbiAgfVxuXG4gIHNlcmlhbFN0b3AocG9ydElkKSB7XG4gICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX1NUT1AsXG4gICAgICBwb3J0SWRcbiAgICB9KTtcbiAgfVxuXG4gIHNlcmlhbENsb3NlKHBvcnRJZCkge1xuICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgdHlwZTogU0VSSUFMX0FDVElPTl9DTE9TRSxcbiAgICAgIHBvcnRJZFxuICAgIH0pO1xuICB9XG5cbiAgc2VyaWFsRmx1c2gocG9ydElkKSB7XG4gICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX0ZMVVNILFxuICAgICAgcG9ydElkXG4gICAgfSk7XG4gIH1cblxuICBbYWRkVG9TZXJpYWxRdWV1ZV0oYWN0aW9uKSB7XG4gICAgaWYgKGFjdGlvbi5wb3J0SWQgIT09IERFRkFVTFRfUE9SVCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHNlcmlhbCBwb3J0IFwiJHtwb3J0SWR9XCJgKTtcbiAgICB9XG4gICAgdGhpc1tzZXJpYWxRdWV1ZV0ucHVzaChhY3Rpb24pO1xuICAgIHRoaXNbc2VyaWFsUHVtcF0oKTtcbiAgfVxuXG4gIFtzZXJpYWxQdW1wXSgpIHtcbiAgICBpZiAodGhpc1tpc1NlcmlhbFByb2Nlc3NpbmddIHx8ICF0aGlzW3NlcmlhbFF1ZXVlXS5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpc1tpc1NlcmlhbFByb2Nlc3NpbmddID0gdHJ1ZTtcbiAgICBjb25zdCBhY3Rpb24gPSB0aGlzW3NlcmlhbFF1ZXVlXS5zaGlmdCgpO1xuICAgIGNvbnN0IGZpbmFsaXplID0gKCkgPT4ge1xuICAgICAgdGhpc1tpc1NlcmlhbFByb2Nlc3NpbmddID0gZmFsc2U7XG4gICAgICB0aGlzW3NlcmlhbFB1bXBdKCk7XG4gICAgfTtcbiAgICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fV1JJVEU6XG4gICAgICAgIGlmICghdGhpc1tpc1NlcmlhbE9wZW5dKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgd3JpdGUgdG8gY2xvc2VkIHNlcmlhbCBwb3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpc1tzZXJpYWxdLndyaXRlKGFjdGlvbi5pbkJ5dGVzLCBmaW5hbGl6ZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fUkVBRDpcbiAgICAgICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCByZWFkIGZyb20gY2xvc2VkIHNlcmlhbCBwb3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETzogYWRkIHN1cHBvcnQgZm9yIGFjdGlvbi5tYXhCeXRlc1RvUmVhZFxuICAgICAgICB0aGlzW3NlcmlhbF0ub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgIGFjdGlvbi5oYW5kbGVyKGJ1ZmZlclRvQXJyYXkoZGF0YSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmaW5hbGl6ZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fU1RPUDpcbiAgICAgICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzdG9wIGNsb3NlZCBzZXJpYWwgcG9ydCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXNbc2VyaWFsXS5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmaW5hbGl6ZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fQ09ORklHOlxuICAgICAgICB0aGlzW3NlcmlhbF0uY2xvc2UoKCkgPT4ge1xuICAgICAgICAgIHRoaXNbc2VyaWFsXSA9IG5ldyBTZXJpYWwoe1xuICAgICAgICAgICAgYmF1ZFJhdGU6IGFjdGlvbi5iYXVkXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpc1tzZXJpYWxdLm9wZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpc1tzZXJpYWxdLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5lbWl0KGBzZXJpYWwtZGF0YS0ke2FjdGlvbi5wb3J0SWR9YCwgYnVmZmVyVG9BcnJheShkYXRhKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXNbaXNTZXJpYWxPcGVuXSA9IHRydWU7XG4gICAgICAgICAgICBmaW5hbGl6ZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9DTE9TRTpcbiAgICAgICAgdGhpc1tzZXJpYWxdLmNsb3NlKCgpID0+IHtcbiAgICAgICAgICB0aGlzW2lzU2VyaWFsT3Blbl0gPSBmYWxzZTtcbiAgICAgICAgICBmaW5hbGl6ZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9GTFVTSDpcbiAgICAgICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmbHVzaCBjbG9zZWQgc2VyaWFsIHBvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzW3NlcmlhbF0uZmx1c2goZmluYWxpemUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnRlcm5hbCBlcnJvcjogdW5rbm93biBzZXJpYWwgYWN0aW9uIHR5cGUnKTtcbiAgICB9XG4gIH1cblxuICBzZW5kT25lV2lyZUNvbmZpZygpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlQ29uZmlnIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVTZWFyY2goKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVNlYXJjaCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlQWxhcm1zU2VhcmNoKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVBbGFybXNTZWFyY2ggaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVJlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlc2V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVDb25maWcgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVXcml0ZSBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlRGVsYXkoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZURlbGF5IGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNldFNhbXBsaW5nSW50ZXJ2YWwoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRTYW1wbGluZ0ludGVydmFsIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHJlcG9ydEFuYWxvZ1BpbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlcG9ydEFuYWxvZ1BpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICByZXBvcnREaWdpdGFsUGluKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVwb3J0RGlnaXRhbFBpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBwaW5nUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3BpbmdSZWFkIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHB1bHNlSW4oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwdWxzZUluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHN0ZXBwZXJDb25maWcoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzdGVwcGVyQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHN0ZXBwZXJTdGVwKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc3RlcHBlclN0ZXAgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShSYXNwaSwgJ2lzUmFzcGJlcnJ5UGknLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIHZhbHVlOiAoKSA9PiB7XG4gICAgLy8gRGV0ZXJtaW5pbmcgaWYgYSBzeXN0ZW0gaXMgYSBSYXNwYmVycnkgUGkgaXNuJ3QgcG9zc2libGUgdGhyb3VnaFxuICAgIC8vIHRoZSBvcyBtb2R1bGUgb24gUmFzcGJpYW4sIHNvIHdlIHJlYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0gaW5zdGVhZFxuICAgIGxldCBpc1Jhc3BiZXJyeVBpID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIGlzUmFzcGJlcnJ5UGkgPSBmcy5yZWFkRmlsZVN5bmMoJy9ldGMvb3MtcmVsZWFzZScpLnRvU3RyaW5nKCkuaW5kZXhPZignUmFzcGJpYW4nKSAhPT0gLTE7XG4gICAgfSBjYXRjaCAoZSkge30vLyBTcXVhc2ggZmlsZSBub3QgZm91bmQsIGV0YyBlcnJvcnNcbiAgICByZXR1cm4gaXNSYXNwYmVycnlQaTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFzcGk7XG4iXX0=