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

var SOFTWARE_PWM_RANGE = 1000;
var SOFTWARE_PWM_FREQUENCY = 50;

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
                frequency: SOFTWARE_PWM_FREQUENCY,
                range: SOFTWARE_PWM_RANGE
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

//# sourceMappingURL=data:application/json;base64,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Q0Ysc0JBQWdCLGFBQUcsWUFBSCxDQUFnQixpQkFBaEIsRUFBbUMsUUFBbkMsR0FBOEMsT0FBOUMsQ0FBc0QsVUFBdEQsTUFBc0UsQ0FBQyxDQUFELENBRHBGO0tBQUosQ0FFRSxPQUFPLENBQVAsRUFBVSxFQUFWO0FBTlMsV0FPSixhQUFQLENBUFc7R0FBTjtDQUZUOztBQWFBLE9BQU8sT0FBUCxHQUFpQixLQUFqQiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgKGMpIDIwMTQgQnJ5YW4gSHVnaGVzIDxicnlhbkB0aGVvcmV0aWNhbGlkZWF0aW9ucy5jb20+XG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uXG5vYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvblxuZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dFxucmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsXG5jb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlXG5Tb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZ1xuY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFU1xuT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbk5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUXG5IT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSxcbldIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lOR1xuRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUlxuT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBpbml0IH0gZnJvbSAncmFzcGknO1xuaW1wb3J0IHsgZ2V0UGlucywgZ2V0UGluTnVtYmVyIH0gZnJvbSAncmFzcGktYm9hcmQnO1xuaW1wb3J0IHsgUFVMTF9OT05FLCBQVUxMX1VQLCBQVUxMX0RPV04sIERpZ2l0YWxPdXRwdXQsIERpZ2l0YWxJbnB1dCB9IGZyb20gJ3Jhc3BpLWdwaW8nO1xuaW1wb3J0IHsgUFdNIH0gZnJvbSAncmFzcGktcHdtJztcbmltcG9ydCB7IFNvZnRQV00gfSBmcm9tICdyYXNwaS1zb2Z0LXB3bSc7XG5pbXBvcnQgeyBJMkMgfSBmcm9tICdyYXNwaS1pMmMnO1xuaW1wb3J0IHsgTEVEIH0gZnJvbSAncmFzcGktbGVkJztcbmltcG9ydCB7IFNlcmlhbCwgREVGQVVMVF9QT1JUIH0gZnJvbSAncmFzcGktc2VyaWFsJztcblxuLy8gQ29uc3RhbnRzXG5jb25zdCBJTlBVVF9NT0RFID0gMDtcbmNvbnN0IE9VVFBVVF9NT0RFID0gMTtcbmNvbnN0IEFOQUxPR19NT0RFID0gMjtcbmNvbnN0IFBXTV9NT0RFID0gMztcbmNvbnN0IFNFUlZPX01PREUgPSA0O1xuY29uc3QgVU5LTk9XTl9NT0RFID0gOTk7XG5cbmNvbnN0IExPVyA9IDA7XG5jb25zdCBISUdIID0gMTtcblxuY29uc3QgTEVEX1BJTiA9IC0xO1xuXG5jb25zdCBTT0ZUV0FSRV9QV01fUkFOR0UgPSAxMDAwO1xuY29uc3QgU09GVFdBUkVfUFdNX0ZSRVFVRU5DWSA9IDUwO1xuXG4vLyBTZXR0aW5nc1xuY29uc3QgREVGQVVMVF9TRVJWT19NSU4gPSAxMDAwO1xuY29uc3QgREVGQVVMVF9TRVJWT19NQVggPSAyMDAwO1xuY29uc3QgRElHSVRBTF9SRUFEX1VQREFURV9SQVRFID0gMTk7XG5cbi8vIFByaXZhdGUgc3ltYm9sc1xuY29uc3QgaXNSZWFkeSA9IFN5bWJvbCgnaXNSZWFkeScpO1xuY29uc3QgcGlucyA9IFN5bWJvbCgncGlucycpO1xuY29uc3QgaW5zdGFuY2VzID0gU3ltYm9sKCdpbnN0YW5jZXMnKTtcbmNvbnN0IGFuYWxvZ1BpbnMgPSBTeW1ib2woJ2FuYWxvZ1BpbnMnKTtcbmNvbnN0IGdldFBpbkluc3RhbmNlID0gU3ltYm9sKCdnZXRQaW5JbnN0YW5jZScpO1xuY29uc3QgaTJjID0gU3ltYm9sKCdpMmMnKTtcbmNvbnN0IGkyY0RlbGF5ID0gU3ltYm9sKCdpMmNEZWxheScpO1xuY29uc3QgaTJjUmVhZCA9IFN5bWJvbCgnaTJjUmVhZCcpO1xuY29uc3QgaTJjQ2hlY2tBbGl2ZSA9IFN5bWJvbCgnaTJjQ2hlY2tBbGl2ZScpO1xuY29uc3QgcGluTW9kZSA9IFN5bWJvbCgncGluTW9kZScpO1xuY29uc3Qgc2VyaWFsID0gU3ltYm9sKCdzZXJpYWwnKTtcbmNvbnN0IHNlcmlhbFF1ZXVlID0gU3ltYm9sKCdzZXJpYWxRdWV1ZScpO1xuY29uc3QgYWRkVG9TZXJpYWxRdWV1ZSA9IFN5bWJvbCgnYWRkVG9TZXJpYWxRdWV1ZScpO1xuY29uc3Qgc2VyaWFsUHVtcCA9IFN5bWJvbCgnc2VyaWFsUHVtcCcpO1xuY29uc3QgaXNTZXJpYWxQcm9jZXNzaW5nID0gU3ltYm9sKCdpc1NlcmlhbFByb2Nlc3NpbmcnKTtcbmNvbnN0IGlzU2VyaWFsT3BlbiA9IFN5bWJvbCgnaXNTZXJpYWxPcGVuJyk7XG5cbmNvbnN0IFNFUklBTF9BQ1RJT05fV1JJVEUgPSAnU0VSSUFMX0FDVElPTl9XUklURSc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX0NMT1NFID0gJ1NFUklBTF9BQ1RJT05fQ0xPU0UnO1xuY29uc3QgU0VSSUFMX0FDVElPTl9GTFVTSCA9ICdTRVJJQUxfQUNUSU9OX0ZMVVNIJztcbmNvbnN0IFNFUklBTF9BQ1RJT05fQ09ORklHID0gJ1NFUklBTF9BQ1RJT05fQ09ORklHJztcbmNvbnN0IFNFUklBTF9BQ1RJT05fUkVBRCA9ICdTRVJJQUxfQUNUSU9OX1JFQUQnO1xuY29uc3QgU0VSSUFMX0FDVElPTl9TVE9QID0gJ1NFUklBTF9BQ1RJT05fU1RPUCc7XG5cbmZ1bmN0aW9uIGJ1ZmZlclRvQXJyYXkoYnVmZmVyKSB7XG4gIGNvbnN0IGFycmF5ID0gQXJyYXkoYnVmZmVyLmxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnVmZmVyLmxlbmd0aDsgaSsrKSB7XG4gICAgYXJyYXlbaV0gPSBidWZmZXJbaV07XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5jbGFzcyBSYXNwaSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cbiAgY29uc3RydWN0b3IoeyBpbmNsdWRlUGlucywgZXhjbHVkZVBpbnMsIGVuYWJsZVNvZnRQd20gPSBmYWxzZSB9ID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgbmFtZToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogJ1Jhc3BiZXJyeVBpLUlPJ1xuICAgICAgfSxcblxuICAgICAgW2luc3RhbmNlc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcblxuICAgICAgW2lzUmVhZHldOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG4gICAgICBpc1JlYWR5OiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1tpc1JlYWR5XTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW3BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBwaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1twaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2FuYWxvZ1BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBhbmFsb2dQaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1thbmFsb2dQaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2kyY106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBuZXcgSTJDKClcbiAgICAgIH0sXG5cbiAgICAgIFtpMmNEZWxheV06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiAwXG4gICAgICB9LFxuXG4gICAgICBbc2VyaWFsXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IG5ldyBTZXJpYWwoKVxuICAgICAgfSxcblxuICAgICAgW3NlcmlhbFF1ZXVlXToge1xuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG5cbiAgICAgIFtpc1NlcmlhbFByb2Nlc3NpbmddOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG5cbiAgICAgIFtpc1NlcmlhbE9wZW5dOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG5cbiAgICAgIE1PREVTOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICBJTlBVVDogSU5QVVRfTU9ERSxcbiAgICAgICAgICBPVVRQVVQ6IE9VVFBVVF9NT0RFLFxuICAgICAgICAgIEFOQUxPRzogQU5BTE9HX01PREUsXG4gICAgICAgICAgUFdNOiBQV01fTU9ERSxcbiAgICAgICAgICBTRVJWTzogU0VSVk9fTU9ERVxuICAgICAgICB9KVxuICAgICAgfSxcblxuICAgICAgSElHSDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogSElHSFxuICAgICAgfSxcbiAgICAgIExPVzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTE9XXG4gICAgICB9LFxuXG4gICAgICBkZWZhdWx0TGVkOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBMRURfUElOXG4gICAgICB9LFxuXG4gICAgICBTRVJJQUxfUE9SVF9JRHM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgIEhXX1NFUklBTDA6IERFRkFVTFRfUE9SVCxcbiAgICAgICAgICBERUZBVUxUOiBERUZBVUxUX1BPUlRcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGluaXQoKCkgPT4ge1xuICAgICAgbGV0IHBpbk1hcHBpbmdzID0gZ2V0UGlucygpO1xuICAgICAgdGhpc1twaW5zXSA9IFtdO1xuXG4gICAgICAvLyBTbGlnaHQgaGFjayB0byBnZXQgdGhlIExFRCBpbiB0aGVyZSwgc2luY2UgaXQncyBub3QgYWN0dWFsbHkgYSBwaW5cbiAgICAgIHBpbk1hcHBpbmdzW0xFRF9QSU5dID0ge1xuICAgICAgICBwaW5zOiBbIExFRF9QSU4gXSxcbiAgICAgICAgcGVyaXBoZXJhbHM6IFsgJ2dwaW8nIF1cbiAgICAgIH07XG5cbiAgICAgIGlmIChpbmNsdWRlUGlucyAmJiBleGNsdWRlUGlucykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wiaW5jbHVkZVBpbnNcIiBhbmQgXCJleGNsdWRlUGluc1wiIGNhbm5vdCBiZSBzcGVjaWZpZWQgYXQgdGhlIHNhbWUgdGltZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShpbmNsdWRlUGlucykpIHtcbiAgICAgICAgY29uc3QgbmV3UGluTWFwcGluZ3MgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBwaW4gb2YgaW5jbHVkZVBpbnMpIHtcbiAgICAgICAgICBjb25zdCBub3JtYWxpemVkUGluID0gZ2V0UGluTnVtYmVyKHBpbik7XG4gICAgICAgICAgaWYgKG5vcm1hbGl6ZWRQaW4gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwaW4gXCIke3Bpbn1cIiBzcGVjaWZpZWQgaW4gaW5jbHVkZVBpbnNgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbmV3UGluTWFwcGluZ3Nbbm9ybWFsaXplZFBpbl0gPSBwaW5NYXBwaW5nc1tub3JtYWxpemVkUGluXTtcbiAgICAgICAgfVxuICAgICAgICBwaW5NYXBwaW5ncyA9IG5ld1Bpbk1hcHBpbmdzO1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGV4Y2x1ZGVQaW5zKSkge1xuICAgICAgICBwaW5NYXBwaW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIHBpbk1hcHBpbmdzKTtcbiAgICAgICAgZm9yIChjb25zdCBwaW4gb2YgZXhjbHVkZVBpbnMpIHtcbiAgICAgICAgICBjb25zdCBub3JtYWxpemVkUGluID0gZ2V0UGluTnVtYmVyKHBpbik7XG4gICAgICAgICAgaWYgKG5vcm1hbGl6ZWRQaW4gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwaW4gXCIke3Bpbn1cIiBzcGVjaWZpZWQgaW4gZXhjbHVkZVBpbnNgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVsZXRlIHBpbk1hcHBpbmdzW25vcm1hbGl6ZWRQaW5dO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5rZXlzKHBpbk1hcHBpbmdzKS5mb3JFYWNoKChwaW4pID0+IHtcbiAgICAgICAgY29uc3QgcGluSW5mbyA9IHBpbk1hcHBpbmdzW3Bpbl07XG4gICAgICAgIGNvbnN0IHN1cHBvcnRlZE1vZGVzID0gW107XG4gICAgICAgIC8vIFdlIGRvbid0IHdhbnQgSTJDIHRvIGJlIHVzZWQgZm9yIGFueXRoaW5nIGVsc2UsIHNpbmNlIGNoYW5naW5nIHRoZVxuICAgICAgICAvLyBwaW4gbW9kZSBtYWtlcyBpdCB1bmFibGUgdG8gZXZlciBkbyBJMkMgYWdhaW4uXG4gICAgICAgIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ2kyYycpID09IC0xICYmIHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZigndWFydCcpID09IC0xKSB7XG4gICAgICAgICAgaWYgKHBpbiA9PSBMRURfUElOKSB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlcy5wdXNoKE9VVFBVVF9NT0RFKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZignZ3BpbycpICE9IC0xKSB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlcy5wdXNoKElOUFVUX01PREUsIE9VVFBVVF9NT0RFKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZigncHdtJykgIT0gLTEpIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goUFdNX01PREUsIFNFUlZPX01PREUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZW5hYmxlU29mdFB3bSA9PT0gdHJ1ZSAmJiBwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ2dwaW8nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goUFdNX01PREUsIFNFUlZPX01PREUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnN0YW5jZSA9IHRoaXNbaW5zdGFuY2VzXVtwaW5dID0ge1xuICAgICAgICAgIHBlcmlwaGVyYWw6IG51bGwsXG4gICAgICAgICAgbW9kZTogc3VwcG9ydGVkTW9kZXMuaW5kZXhPZihPVVRQVVRfTU9ERSkgPT0gLTEgPyBVTktOT1dOX01PREUgOiBPVVRQVVRfTU9ERSxcblxuICAgICAgICAgIC8vIFVzZWQgdG8gY2FjaGUgdGhlIHByZXZpb3VzbHkgd3JpdHRlbiB2YWx1ZSBmb3IgcmVhZGluZyBiYWNrIGluIE9VVFBVVCBtb2RlXG4gICAgICAgICAgLy8gV2Ugc3RhcnQgd2l0aCB1bmRlZmluZWQgYmVjYXVzZSBpdCdzIGluIGFuIHVua25vd24gc3RhdGVcbiAgICAgICAgICBwcmV2aW91c1dyaXR0ZW5WYWx1ZTogdW5kZWZpbmVkLFxuXG4gICAgICAgICAgLy8gVXNlZCB0byBzZXQgdGhlIGRlZmF1bHQgbWluIGFuZCBtYXggdmFsdWVzXG4gICAgICAgICAgbWluOiBERUZBVUxUX1NFUlZPX01JTixcbiAgICAgICAgICBtYXg6IERFRkFVTFRfU0VSVk9fTUFYLFxuXG4gICAgICAgICAgLy8gVXNlZCB0byB0cmFjayBpZiB0aGlzIHBpbiBpcyBjYXBhYmxlIG9mIGhhcmR3YXJlIFBXTVxuICAgICAgICAgIGlzSGFyZHdhcmVQd206IHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZigncHdtJykgIT09IC0xXG4gICAgICAgIH07XG4gICAgICAgIHRoaXNbcGluc11bcGluXSA9IE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgIHN1cHBvcnRlZE1vZGVzOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoc3VwcG9ydGVkTW9kZXMpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBtb2RlOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UubW9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICBzd2l0Y2ggKGluc3RhbmNlLm1vZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICAgICAgICAgICAgY2FzZSBPVVRQVVRfTU9ERTpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLm1vZGUgPT0gT1VUUFVUX01PREUpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVwb3J0OiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFuYWxvZ0NoYW5uZWw6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMTI3XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGluc3RhbmNlLm1vZGUgPT0gT1VUUFVUX01PREUpIHtcbiAgICAgICAgICB0aGlzLnBpbk1vZGUocGluLCBPVVRQVVRfTU9ERSk7XG4gICAgICAgICAgdGhpcy5kaWdpdGFsV3JpdGUocGluLCBMT1cpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gRmlsbCBpbiB0aGUgaG9sZXMsIHNpbnMgcGlucyBhcmUgc3BhcnNlIG9uIHRoZSBBKy9CKy8yXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXNbcGluc10ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCF0aGlzW3BpbnNdW2ldKSB7XG4gICAgICAgICAgdGhpc1twaW5zXVtpXSA9IE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXM6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoW10pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFVOS05PV05fTU9ERTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc2V0KCkge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXBvcnQ6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbmFsb2dDaGFubmVsOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiAxMjdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNlcmlhbENvbmZpZyh7XG4gICAgICAgIHBvcnRJZDogREVGQVVMVF9QT1JULFxuICAgICAgICBiYXVkOiA5NjAwXG4gICAgICB9KTtcblxuICAgICAgdGhpc1tpc1JlYWR5XSA9IHRydWU7XG4gICAgICB0aGlzLmVtaXQoJ3JlYWR5Jyk7XG4gICAgICB0aGlzLmVtaXQoJ2Nvbm5lY3QnKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVzZXQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBub3JtYWxpemUocGluKSB7XG4gICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IGdldFBpbk51bWJlcihwaW4pO1xuICAgIGlmICh0eXBlb2Ygbm9ybWFsaXplZFBpbiAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwaW4gXCIke3Bpbn1cImApO1xuICAgIH1cbiAgICByZXR1cm4gbm9ybWFsaXplZFBpbjtcbiAgfVxuXG4gIFtnZXRQaW5JbnN0YW5jZV0ocGluKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXTtcbiAgICBpZiAoIXBpbkluc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcGluIFwiJHtwaW59XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIHBpbkluc3RhbmNlO1xuICB9XG5cbiAgcGluTW9kZShwaW4sIG1vZGUpIHtcbiAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlIH0pO1xuICB9XG5cbiAgW3Bpbk1vZGVdKHsgcGluLCBtb2RlLCBwdWxsUmVzaXN0b3IgPSBQVUxMX05PTkUgfSkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSB0aGlzLm5vcm1hbGl6ZShwaW4pO1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0obm9ybWFsaXplZFBpbik7XG4gICAgcGluSW5zdGFuY2UucHVsbFJlc2lzdG9yID0gcHVsbFJlc2lzdG9yO1xuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgIHBpbjogbm9ybWFsaXplZFBpbixcbiAgICAgIHB1bGxSZXNpc3RvcjogcGluSW5zdGFuY2UucHVsbFJlc2lzdG9yXG4gICAgfTtcbiAgICBpZiAodGhpc1twaW5zXVtub3JtYWxpemVkUGluXS5zdXBwb3J0ZWRNb2Rlcy5pbmRleE9mKG1vZGUpID09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFBpbiBcIiR7cGlufVwiIGRvZXMgbm90IHN1cHBvcnQgbW9kZSBcIiR7bW9kZX1cImApO1xuICAgIH1cblxuICAgIGlmIChwaW4gPT0gTEVEX1BJTikge1xuICAgICAgaWYgKHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgaW5zdGFuY2VvZiBMRUQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBMRUQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3dpdGNoIChtb2RlKSB7XG4gICAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IERpZ2l0YWxJbnB1dChjb25maWcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbE91dHB1dChjb25maWcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFBXTV9NT0RFOlxuICAgICAgICBjYXNlIFNFUlZPX01PREU6XG4gICAgICAgICAgaWYgKHBpbkluc3RhbmNlLmlzSGFyZHdhcmVQd20pIHtcbiAgICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgUFdNKG5vcm1hbGl6ZWRQaW4pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IFNvZnRQV00oe1xuICAgICAgICAgICAgICBwaW46IG5vcm1hbGl6ZWRQaW4sXG4gICAgICAgICAgICAgIGZyZXF1ZW5jeTogU09GVFdBUkVfUFdNX0ZSRVFVRU5DWSxcbiAgICAgICAgICAgICAgcmFuZ2U6IFNPRlRXQVJFX1BXTV9SQU5HRVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnNvbGUud2FybihgVW5rbm93biBwaW4gbW9kZTogJHttb2RlfWApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5tb2RlID0gbW9kZTtcbiAgfVxuXG4gIGFuYWxvZ1JlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhbmFsb2dSZWFkIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgYW5hbG9nV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIHRoaXMucHdtV3JpdGUocGluLCB2YWx1ZSk7XG4gIH1cblxuICBwd21Xcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBQV01fTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgUFdNX01PREUpO1xuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKE1hdGgucm91bmQodmFsdWUgKiBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJhbmdlIC8gMjU1KSk7XG4gIH1cblxuICBkaWdpdGFsUmVhZChwaW4sIGhhbmRsZXIpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IElOUFVUX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIElOUFVUX01PREUpO1xuICAgIH1cbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGxldCB2YWx1ZTtcbiAgICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09IElOUFVUX01PREUpIHtcbiAgICAgICAgdmFsdWUgPSBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAoaGFuZGxlcikge1xuICAgICAgICBoYW5kbGVyKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdChgZGlnaXRhbC1yZWFkLSR7cGlufWAsIHZhbHVlKTtcbiAgICB9LCBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUpO1xuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwub24oJ2Rlc3Ryb3llZCcsICgpID0+IHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgZGlnaXRhbFdyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09PSBJTlBVVF9NT0RFICYmIHZhbHVlID09PSBISUdIKSB7XG4gICAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlOiBJTlBVVF9NT0RFLCBwdWxsUmVzaXN0b3I6IFBVTExfVVAgfSk7XG4gICAgfSBlbHNlIGlmIChwaW5JbnN0YW5jZS5tb2RlID09PSBJTlBVVF9NT0RFICYmIHZhbHVlID09PSBMT1cpIHtcbiAgICAgIHRoaXNbcGluTW9kZV0oeyBwaW4sIG1vZGU6IElOUFVUX01PREUsIHB1bGxSZXNpc3RvcjogUFVMTF9ET1dOIH0pO1xuICAgIH0gZWxzZSBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBPVVRQVVRfTU9ERSkge1xuICAgICAgdGhpc1twaW5Nb2RlXSh7IHBpbiwgbW9kZTogT1VUUFVUX01PREUgfSk7XG4gICAgfVxuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09PSBPVVRQVVRfTU9ERSAmJiB2YWx1ZSAhPSBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSkge1xuICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSh2YWx1ZSA/IEhJR0ggOiBMT1cpO1xuICAgICAgcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBzZXJ2b0NvbmZpZyhwaW4sIG1pbiwgbWF4KSB7XG4gICAgbGV0IGNvbmZpZyA9IHBpbjtcbiAgICBpZiAodHlwZW9mIGNvbmZpZyAhPT0gJ29iamVjdCcpIHtcbiAgICAgIGNvbmZpZyA9IHsgcGluLCBtaW4sIG1heCB9O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNvbmZpZy5taW4gIT09ICdudW1iZXInKSB7XG4gICAgICBjb25maWcubWluID0gREVGQVVMVF9TRVJWT19NSU47XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY29uZmlnLm1heCAhPT0gJ251bWJlcicpIHtcbiAgICAgIGNvbmZpZy5tYXggPSBERUZBVUxUX1NFUlZPX01BWDtcbiAgICB9XG4gICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IHRoaXMubm9ybWFsaXplKHBpbik7XG4gICAgdGhpc1twaW5Nb2RlXSh7XG4gICAgICBwaW46IG5vcm1hbGl6ZWRQaW4sXG4gICAgICBtb2RlOiBTRVJWT19NT0RFXG4gICAgfSk7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShub3JtYWxpemVkUGluKSk7XG4gICAgcGluSW5zdGFuY2UubWluID0gY29uZmlnLm1pbjtcbiAgICBwaW5JbnN0YW5jZS5tYXggPSBjb25maWcubWF4O1xuICB9XG5cbiAgc2Vydm9Xcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBTRVJWT19NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBTRVJWT19NT0RFKTtcbiAgICB9XG4gICAgY29uc3QgZHV0eUN5Y2xlID0gKHBpbkluc3RhbmNlLm1pbiArICh2YWx1ZSAvIDE4MCkgKiAocGluSW5zdGFuY2UubWF4IC0gcGluSW5zdGFuY2UubWluKSkgLyAyMDAwMDtcbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKGR1dHlDeWNsZSAqIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwucmFuZ2UpO1xuICB9XG5cbiAgcXVlcnlDYXBhYmlsaXRpZXMoY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcXVlcnlBbmFsb2dNYXBwaW5nKGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHF1ZXJ5UGluU3RhdGUocGluLCBjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBbaTJjQ2hlY2tBbGl2ZV0oKSB7XG4gICAgaWYgKCF0aGlzW2kyY10uYWxpdmUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSTJDIHBpbnMgbm90IGluIEkyQyBtb2RlJyk7XG4gICAgfVxuICB9XG5cbiAgaTJjQ29uZmlnKG9wdGlvbnMpIHtcbiAgICBsZXQgZGVsYXk7XG5cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdudW1iZXInKSB7XG4gICAgICBkZWxheSA9IG9wdGlvbnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgb3B0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICBkZWxheSA9IG9wdGlvbnMuZGVsYXk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgdGhpc1tpMmNEZWxheV0gPSBNYXRoLnJvdW5kKChkZWxheSB8fCAwKSAvIDEwMDApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNXcml0ZShhZGRyZXNzLCBjbWRSZWdPckRhdGEsIGluQnl0ZXMpIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICAvLyBJZiBpMmNXcml0ZSB3YXMgdXNlZCBmb3IgYW4gaTJjV3JpdGVSZWcgY2FsbC4uLlxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzICYmXG4gICAgICAgICFBcnJheS5pc0FycmF5KGNtZFJlZ09yRGF0YSkgJiZcbiAgICAgICAgIUFycmF5LmlzQXJyYXkoaW5CeXRlcykpIHtcbiAgICAgIHJldHVybiB0aGlzLmkyY1dyaXRlUmVnKGFkZHJlc3MsIGNtZFJlZ09yRGF0YSwgaW5CeXRlcyk7XG4gICAgfVxuXG4gICAgLy8gRml4IGFyZ3VtZW50cyBpZiBjYWxsZWQgd2l0aCBGaXJtYXRhLmpzIEFQSVxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShjbWRSZWdPckRhdGEpKSB7XG4gICAgICAgIGluQnl0ZXMgPSBjbWRSZWdPckRhdGEuc2xpY2UoKTtcbiAgICAgICAgY21kUmVnT3JEYXRhID0gaW5CeXRlcy5zaGlmdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5CeXRlcyA9IFtdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIoW2NtZFJlZ09yRGF0YV0uY29uY2F0KGluQnl0ZXMpKTtcblxuICAgIC8vIE9ubHkgd3JpdGUgaWYgYnl0ZXMgcHJvdmlkZWRcbiAgICBpZiAoYnVmZmVyLmxlbmd0aCkge1xuICAgICAgdGhpc1tpMmNdLndyaXRlU3luYyhhZGRyZXNzLCBidWZmZXIpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaTJjV3JpdGVSZWcoYWRkcmVzcywgcmVnaXN0ZXIsIHZhbHVlKSB7XG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgdGhpc1tpMmNdLndyaXRlQnl0ZVN5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIHZhbHVlKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgW2kyY1JlYWRdKGNvbnRpbnVvdXMsIGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlc1RvUmVhZCwgY2FsbGJhY2spIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICAvLyBGaXggYXJndW1lbnRzIGlmIGNhbGxlZCB3aXRoIEZpcm1hdGEuanMgQVBJXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gNCAmJlxuICAgICAgdHlwZW9mIHJlZ2lzdGVyID09ICdudW1iZXInICYmXG4gICAgICB0eXBlb2YgYnl0ZXNUb1JlYWQgPT0gJ2Z1bmN0aW9uJ1xuICAgICkge1xuICAgICAgY2FsbGJhY2sgPSBieXRlc1RvUmVhZDtcbiAgICAgIGJ5dGVzVG9SZWFkID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IG51bGw7XG4gICAgfVxuXG4gICAgY2FsbGJhY2sgPSB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBjYWxsYmFjayA6ICgpID0+IHt9O1xuXG4gICAgbGV0IGV2ZW50ID0gYGkyYy1yZXBseS0ke2FkZHJlc3N9LWA7XG4gICAgZXZlbnQgKz0gcmVnaXN0ZXIgIT09IG51bGwgPyByZWdpc3RlciA6IDA7XG5cbiAgICBjb25zdCByZWFkID0gKCkgPT4ge1xuICAgICAgY29uc3QgYWZ0ZXJSZWFkID0gKGVyciwgYnVmZmVyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb252ZXJ0IGJ1ZmZlciB0byBBcnJheSBiZWZvcmUgZW1pdFxuICAgICAgICB0aGlzLmVtaXQoZXZlbnQsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGJ1ZmZlcikpO1xuXG4gICAgICAgIGlmIChjb250aW51b3VzKSB7XG4gICAgICAgICAgc2V0VGltZW91dChyZWFkLCB0aGlzW2kyY0RlbGF5XSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRoaXMub25jZShldmVudCwgY2FsbGJhY2spO1xuXG4gICAgICBpZiAocmVnaXN0ZXIgIT09IG51bGwpIHtcbiAgICAgICAgdGhpc1tpMmNdLnJlYWQoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGVzVG9SZWFkLCBhZnRlclJlYWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1tpMmNdLnJlYWQoYWRkcmVzcywgYnl0ZXNUb1JlYWQsIGFmdGVyUmVhZCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNldFRpbWVvdXQocmVhZCwgdGhpc1tpMmNEZWxheV0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNSZWFkKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpc1tpMmNSZWFkXSh0cnVlLCAuLi5yZXN0KTtcbiAgfVxuXG4gIGkyY1JlYWRPbmNlKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpc1tpMmNSZWFkXShmYWxzZSwgLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDQ29uZmlnKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNDb25maWcoLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDV3JpdGVSZXF1ZXN0KC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNXcml0ZSguLi5yZXN0KTtcbiAgfVxuXG4gIHNlbmRJMkNSZWFkUmVxdWVzdCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjUmVhZE9uY2UoLi4ucmVzdCk7XG4gIH1cblxuICBzZXJpYWxDb25maWcoeyBwb3J0SWQsIGJhdWQgfSkge1xuICAgIGlmICghdGhpc1tpc1NlcmlhbE9wZW5dIHx8IChiYXVkICYmIGJhdWQgIT09IHRoaXNbc2VyaWFsXS5iYXVkUmF0ZSkpIHtcbiAgICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX0NPTkZJRyxcbiAgICAgICAgcG9ydElkLFxuICAgICAgICBiYXVkXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBzZXJpYWxXcml0ZShwb3J0SWQsIGluQnl0ZXMpIHtcbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fV1JJVEUsXG4gICAgICBwb3J0SWQsXG4gICAgICBpbkJ5dGVzXG4gICAgfSk7XG4gIH1cblxuICBzZXJpYWxSZWFkKHBvcnRJZCwgbWF4Qnl0ZXNUb1JlYWQsIGhhbmRsZXIpIHtcbiAgICBpZiAodHlwZW9mIG1heEJ5dGVzVG9SZWFkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBoYW5kbGVyID0gbWF4Qnl0ZXNUb1JlYWQ7XG4gICAgICBtYXhCeXRlc1RvUmVhZCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX1JFQUQsXG4gICAgICBwb3J0SWQsXG4gICAgICBtYXhCeXRlc1RvUmVhZCxcbiAgICAgIGhhbmRsZXJcbiAgICB9KTtcbiAgfVxuXG4gIHNlcmlhbFN0b3AocG9ydElkKSB7XG4gICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX1NUT1AsXG4gICAgICBwb3J0SWRcbiAgICB9KTtcbiAgfVxuXG4gIHNlcmlhbENsb3NlKHBvcnRJZCkge1xuICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgdHlwZTogU0VSSUFMX0FDVElPTl9DTE9TRSxcbiAgICAgIHBvcnRJZFxuICAgIH0pO1xuICB9XG5cbiAgc2VyaWFsRmx1c2gocG9ydElkKSB7XG4gICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX0ZMVVNILFxuICAgICAgcG9ydElkXG4gICAgfSk7XG4gIH1cblxuICBbYWRkVG9TZXJpYWxRdWV1ZV0oYWN0aW9uKSB7XG4gICAgaWYgKGFjdGlvbi5wb3J0SWQgIT09IERFRkFVTFRfUE9SVCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHNlcmlhbCBwb3J0IFwiJHtwb3J0SWR9XCJgKTtcbiAgICB9XG4gICAgdGhpc1tzZXJpYWxRdWV1ZV0ucHVzaChhY3Rpb24pO1xuICAgIHRoaXNbc2VyaWFsUHVtcF0oKTtcbiAgfVxuXG4gIFtzZXJpYWxQdW1wXSgpIHtcbiAgICBpZiAodGhpc1tpc1NlcmlhbFByb2Nlc3NpbmddIHx8ICF0aGlzW3NlcmlhbFF1ZXVlXS5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpc1tpc1NlcmlhbFByb2Nlc3NpbmddID0gdHJ1ZTtcbiAgICBjb25zdCBhY3Rpb24gPSB0aGlzW3NlcmlhbFF1ZXVlXS5zaGlmdCgpO1xuICAgIGNvbnN0IGZpbmFsaXplID0gKCkgPT4ge1xuICAgICAgdGhpc1tpc1NlcmlhbFByb2Nlc3NpbmddID0gZmFsc2U7XG4gICAgICB0aGlzW3NlcmlhbFB1bXBdKCk7XG4gICAgfTtcbiAgICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fV1JJVEU6XG4gICAgICAgIGlmICghdGhpc1tpc1NlcmlhbE9wZW5dKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgd3JpdGUgdG8gY2xvc2VkIHNlcmlhbCBwb3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpc1tzZXJpYWxdLndyaXRlKGFjdGlvbi5pbkJ5dGVzLCBmaW5hbGl6ZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fUkVBRDpcbiAgICAgICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCByZWFkIGZyb20gY2xvc2VkIHNlcmlhbCBwb3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETzogYWRkIHN1cHBvcnQgZm9yIGFjdGlvbi5tYXhCeXRlc1RvUmVhZFxuICAgICAgICB0aGlzW3NlcmlhbF0ub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgIGFjdGlvbi5oYW5kbGVyKGJ1ZmZlclRvQXJyYXkoZGF0YSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmaW5hbGl6ZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fU1RPUDpcbiAgICAgICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzdG9wIGNsb3NlZCBzZXJpYWwgcG9ydCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXNbc2VyaWFsXS5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmaW5hbGl6ZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fQ09ORklHOlxuICAgICAgICB0aGlzW3NlcmlhbF0uY2xvc2UoKCkgPT4ge1xuICAgICAgICAgIHRoaXNbc2VyaWFsXSA9IG5ldyBTZXJpYWwoe1xuICAgICAgICAgICAgYmF1ZFJhdGU6IGFjdGlvbi5iYXVkXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpc1tzZXJpYWxdLm9wZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpc1tzZXJpYWxdLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5lbWl0KGBzZXJpYWwtZGF0YS0ke2FjdGlvbi5wb3J0SWR9YCwgYnVmZmVyVG9BcnJheShkYXRhKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXNbaXNTZXJpYWxPcGVuXSA9IHRydWU7XG4gICAgICAgICAgICBmaW5hbGl6ZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9DTE9TRTpcbiAgICAgICAgdGhpc1tzZXJpYWxdLmNsb3NlKCgpID0+IHtcbiAgICAgICAgICB0aGlzW2lzU2VyaWFsT3Blbl0gPSBmYWxzZTtcbiAgICAgICAgICBmaW5hbGl6ZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9GTFVTSDpcbiAgICAgICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmbHVzaCBjbG9zZWQgc2VyaWFsIHBvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzW3NlcmlhbF0uZmx1c2goZmluYWxpemUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnRlcm5hbCBlcnJvcjogdW5rbm93biBzZXJpYWwgYWN0aW9uIHR5cGUnKTtcbiAgICB9XG4gIH1cblxuICBzZW5kT25lV2lyZUNvbmZpZygpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlQ29uZmlnIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVTZWFyY2goKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVNlYXJjaCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlQWxhcm1zU2VhcmNoKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVBbGFybXNTZWFyY2ggaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVJlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlc2V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVDb25maWcgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVXcml0ZSBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlRGVsYXkoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZURlbGF5IGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNldFNhbXBsaW5nSW50ZXJ2YWwoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRTYW1wbGluZ0ludGVydmFsIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHJlcG9ydEFuYWxvZ1BpbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlcG9ydEFuYWxvZ1BpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICByZXBvcnREaWdpdGFsUGluKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVwb3J0RGlnaXRhbFBpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBwaW5nUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3BpbmdSZWFkIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHB1bHNlSW4oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwdWxzZUluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHN0ZXBwZXJDb25maWcoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzdGVwcGVyQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHN0ZXBwZXJTdGVwKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc3RlcHBlclN0ZXAgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShSYXNwaSwgJ2lzUmFzcGJlcnJ5UGknLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIHZhbHVlOiAoKSA9PiB7XG4gICAgLy8gRGV0ZXJtaW5pbmcgaWYgYSBzeXN0ZW0gaXMgYSBSYXNwYmVycnkgUGkgaXNuJ3QgcG9zc2libGUgdGhyb3VnaFxuICAgIC8vIHRoZSBvcyBtb2R1bGUgb24gUmFzcGJpYW4sIHNvIHdlIHJlYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0gaW5zdGVhZFxuICAgIGxldCBpc1Jhc3BiZXJyeVBpID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIGlzUmFzcGJlcnJ5UGkgPSBmcy5yZWFkRmlsZVN5bmMoJy9ldGMvb3MtcmVsZWFzZScpLnRvU3RyaW5nKCkuaW5kZXhPZignUmFzcGJpYW4nKSAhPT0gLTE7XG4gICAgfSBjYXRjaCAoZSkge30vLyBTcXVhc2ggZmlsZSBub3QgZm91bmQsIGV0YyBlcnJvcnNcbiAgICByZXR1cm4gaXNSYXNwYmVycnlQaTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFzcGk7XG4iXX0=