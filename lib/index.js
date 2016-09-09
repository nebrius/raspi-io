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
var SOFT_PWM_MODE = 82;
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
    value: function value(_ref) {
      var pin = _ref.pin;
      var mode = _ref.mode;
      var _ref$pullResistor = _ref.pullResistor;
      var pullResistor = _ref$pullResistor === undefined ? _raspiGpio.PULL_NONE : _ref$pullResistor;

      var normalizedPin = this.normalize(pin);
      var pinInstance = this[getPinInstance](normalizedPin);
      pinInstance.pullResistor = pullResistor;
      var config = {
        pin: normalizedPin,
        pullResistor: pinInstance.pullResistor
      };
      var isModeSupported = this[pins][normalizedPin].supportedModes.indexOf(mode) > -1;

      if (mode === PWM_MODE && isModeSupported === false) {
        mode = SOFT_PWM_MODE;
      } else if (isModeSupported === false) {
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
          case SOFT_PWM_MODE:
            pinInstance.peripheral = new _raspiSoftPwm.SoftPWM({
              pin: normalizedPin, value: 0, range: 255
            });
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
      if (pinInstance.mode != PWM_MODE || pinInstance.mode != SOFT_PWM_MODE) {
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

      this[i2cDelay] = delay || 0;

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
    value: function serialConfig(_ref2) {
      var portId = _ref2.portId;
      var baud = _ref2.baud;

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

//# sourceMappingURL=data:application/json;base64,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QVUseUNBQVYsQ0FBTjtBQUNEOzs7K0JBRVU7QUFDVCxZQUFNLElBQUksS0FBSixDQUFVLGlDQUFWLENBQU47QUFDRDs7OzhCQUVTO0FBQ1IsWUFBTSxJQUFJLEtBQUosQ0FBVSxnQ0FBVixDQUFOO0FBQ0Q7OztvQ0FFZTtBQUNkLFlBQU0sSUFBSSxLQUFKLENBQVUsc0NBQVYsQ0FBTjtBQUNEOzs7a0NBRWE7QUFDWixZQUFNLElBQUksS0FBSixDQUFVLG9DQUFWLENBQU47QUFDRDs7Ozs7O0FBR0gsT0FBTyxjQUFQLENBQXNCLEtBQXRCLEVBQTZCLGVBQTdCLEVBQThDO0FBQzVDLGNBQVksSUFEZ0M7QUFFNUMsU0FBTyxpQkFBTTtBQUNYO0FBQ0E7QUFDQSxRQUFJLGdCQUFnQixLQUFwQjtBQUNBLFFBQUk7QUFDRixzQkFBZ0IsYUFBRyxZQUFILENBQWdCLGlCQUFoQixFQUFtQyxRQUFuQyxHQUE4QyxPQUE5QyxDQUFzRCxVQUF0RCxNQUFzRSxDQUFDLENBQXZGO0FBQ0QsS0FGRCxDQUVFLE9BQU8sQ0FBUCxFQUFVLENBQUUsQ0FOSCxDQU1HO0FBQ2QsV0FBTyxhQUFQO0FBQ0Q7QUFWMkMsQ0FBOUM7O0FBYUEsT0FBTyxPQUFQLEdBQWlCLEtBQWpCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAoYykgMjAxNCBCcnlhbiBIdWdoZXMgPGJyeWFuQHRoZW9yZXRpY2FsaWRlYXRpb25zLmNvbT5cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb25cbm9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uXG5maWxlcyAodGhlICdTb2Z0d2FyZScpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0XG5yZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSxcbmNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGVcblNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nXG5jb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTXG5PRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxuTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFRcbkhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLFxuV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HXG5GUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SXG5PVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7IGluaXQgfSBmcm9tICdyYXNwaSc7XG5pbXBvcnQgeyBnZXRQaW5zLCBnZXRQaW5OdW1iZXIgfSBmcm9tICdyYXNwaS1ib2FyZCc7XG5pbXBvcnQgeyBQVUxMX05PTkUsIFBVTExfVVAsIFBVTExfRE9XTiwgRGlnaXRhbE91dHB1dCwgRGlnaXRhbElucHV0IH0gZnJvbSAncmFzcGktZ3Bpbyc7XG5pbXBvcnQgeyBQV00gfSBmcm9tICdyYXNwaS1wd20nO1xuaW1wb3J0IHsgU29mdFBXTSB9IGZyb20gJ3Jhc3BpLXNvZnQtcHdtJztcbmltcG9ydCB7IEkyQyB9IGZyb20gJ3Jhc3BpLWkyYyc7XG5pbXBvcnQgeyBMRUQgfSBmcm9tICdyYXNwaS1sZWQnO1xuaW1wb3J0IHsgU2VyaWFsLCBERUZBVUxUX1BPUlQgfSBmcm9tICdyYXNwaS1zZXJpYWwnO1xuXG4vLyBDb25zdGFudHNcbmNvbnN0IElOUFVUX01PREUgPSAwO1xuY29uc3QgT1VUUFVUX01PREUgPSAxO1xuY29uc3QgQU5BTE9HX01PREUgPSAyO1xuY29uc3QgUFdNX01PREUgPSAzO1xuY29uc3QgU0VSVk9fTU9ERSA9IDQ7XG5jb25zdCBTT0ZUX1BXTV9NT0RFID0gODI7XG5jb25zdCBVTktOT1dOX01PREUgPSA5OTtcblxuY29uc3QgTE9XID0gMDtcbmNvbnN0IEhJR0ggPSAxO1xuXG5jb25zdCBMRURfUElOID0gLTE7XG5cbi8vIFNldHRpbmdzXG5jb25zdCBERUZBVUxUX1NFUlZPX01JTiA9IDEwMDA7XG5jb25zdCBERUZBVUxUX1NFUlZPX01BWCA9IDIwMDA7XG5jb25zdCBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUgPSAxOTtcblxuLy8gUHJpdmF0ZSBzeW1ib2xzXG5jb25zdCBpc1JlYWR5ID0gU3ltYm9sKCdpc1JlYWR5Jyk7XG5jb25zdCBwaW5zID0gU3ltYm9sKCdwaW5zJyk7XG5jb25zdCBpbnN0YW5jZXMgPSBTeW1ib2woJ2luc3RhbmNlcycpO1xuY29uc3QgYW5hbG9nUGlucyA9IFN5bWJvbCgnYW5hbG9nUGlucycpO1xuY29uc3QgZ2V0UGluSW5zdGFuY2UgPSBTeW1ib2woJ2dldFBpbkluc3RhbmNlJyk7XG5jb25zdCBpMmMgPSBTeW1ib2woJ2kyYycpO1xuY29uc3QgaTJjRGVsYXkgPSBTeW1ib2woJ2kyY0RlbGF5Jyk7XG5jb25zdCBpMmNSZWFkID0gU3ltYm9sKCdpMmNSZWFkJyk7XG5jb25zdCBpMmNDaGVja0FsaXZlID0gU3ltYm9sKCdpMmNDaGVja0FsaXZlJyk7XG5jb25zdCBwaW5Nb2RlID0gU3ltYm9sKCdwaW5Nb2RlJyk7XG5jb25zdCBzZXJpYWwgPSBTeW1ib2woJ3NlcmlhbCcpO1xuY29uc3Qgc2VyaWFsUXVldWUgPSBTeW1ib2woJ3NlcmlhbFF1ZXVlJyk7XG5jb25zdCBhZGRUb1NlcmlhbFF1ZXVlID0gU3ltYm9sKCdhZGRUb1NlcmlhbFF1ZXVlJyk7XG5jb25zdCBzZXJpYWxQdW1wID0gU3ltYm9sKCdzZXJpYWxQdW1wJyk7XG5jb25zdCBpc1NlcmlhbFByb2Nlc3NpbmcgPSBTeW1ib2woJ2lzU2VyaWFsUHJvY2Vzc2luZycpO1xuY29uc3QgaXNTZXJpYWxPcGVuID0gU3ltYm9sKCdpc1NlcmlhbE9wZW4nKTtcblxuY29uc3QgU0VSSUFMX0FDVElPTl9XUklURSA9ICdTRVJJQUxfQUNUSU9OX1dSSVRFJztcbmNvbnN0IFNFUklBTF9BQ1RJT05fQ0xPU0UgPSAnU0VSSUFMX0FDVElPTl9DTE9TRSc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX0ZMVVNIID0gJ1NFUklBTF9BQ1RJT05fRkxVU0gnO1xuY29uc3QgU0VSSUFMX0FDVElPTl9DT05GSUcgPSAnU0VSSUFMX0FDVElPTl9DT05GSUcnO1xuY29uc3QgU0VSSUFMX0FDVElPTl9SRUFEID0gJ1NFUklBTF9BQ1RJT05fUkVBRCc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX1NUT1AgPSAnU0VSSUFMX0FDVElPTl9TVE9QJztcblxuZnVuY3Rpb24gYnVmZmVyVG9BcnJheShidWZmZXIpIHtcbiAgY29uc3QgYXJyYXkgPSBBcnJheShidWZmZXIubGVuZ3RoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpKyspIHtcbiAgICBhcnJheVtpXSA9IGJ1ZmZlcltpXTtcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbmNsYXNzIFJhc3BpIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgbmFtZToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogJ1Jhc3BiZXJyeVBpLUlPJ1xuICAgICAgfSxcblxuICAgICAgW2luc3RhbmNlc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcblxuICAgICAgW2lzUmVhZHldOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG4gICAgICBpc1JlYWR5OiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1tpc1JlYWR5XTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW3BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBwaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1twaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2FuYWxvZ1BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBhbmFsb2dQaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1thbmFsb2dQaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2kyY106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBuZXcgSTJDKClcbiAgICAgIH0sXG5cbiAgICAgIFtpMmNEZWxheV06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiAwXG4gICAgICB9LFxuXG4gICAgICBbc2VyaWFsXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IG5ldyBTZXJpYWwoKVxuICAgICAgfSxcblxuICAgICAgW3NlcmlhbFF1ZXVlXToge1xuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG5cbiAgICAgIFtpc1NlcmlhbFByb2Nlc3NpbmddOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG5cbiAgICAgIFtpc1NlcmlhbE9wZW5dOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG5cbiAgICAgIE1PREVTOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICBJTlBVVDogSU5QVVRfTU9ERSxcbiAgICAgICAgICBPVVRQVVQ6IE9VVFBVVF9NT0RFLFxuICAgICAgICAgIEFOQUxPRzogQU5BTE9HX01PREUsXG4gICAgICAgICAgUFdNOiBQV01fTU9ERSxcbiAgICAgICAgICBTRVJWTzogU0VSVk9fTU9ERVxuICAgICAgICB9KVxuICAgICAgfSxcblxuICAgICAgSElHSDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogSElHSFxuICAgICAgfSxcbiAgICAgIExPVzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTE9XXG4gICAgICB9LFxuXG4gICAgICBkZWZhdWx0TGVkOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBMRURfUElOXG4gICAgICB9LFxuXG4gICAgICBTRVJJQUxfUE9SVF9JRHM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgIEhXX1NFUklBTDA6IERFRkFVTFRfUE9SVCxcbiAgICAgICAgICBERUZBVUxUOiBERUZBVUxUX1BPUlRcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGluaXQoKCkgPT4ge1xuICAgICAgY29uc3QgcGluTWFwcGluZ3MgPSBnZXRQaW5zKCk7XG4gICAgICB0aGlzW3BpbnNdID0gW107XG5cbiAgICAgIC8vIFNsaWdodCBoYWNrIHRvIGdldCB0aGUgTEVEIGluIHRoZXJlLCBzaW5jZSBpdCdzIG5vdCBhY3R1YWxseSBhIHBpblxuICAgICAgcGluTWFwcGluZ3NbTEVEX1BJTl0gPSB7XG4gICAgICAgIHBpbnM6IFsgTEVEX1BJTiBdLFxuICAgICAgICBwZXJpcGhlcmFsczogWyAnZ3BpbycgXVxuICAgICAgfTtcblxuICAgICAgT2JqZWN0LmtleXMocGluTWFwcGluZ3MpLmZvckVhY2goKHBpbikgPT4ge1xuICAgICAgICBjb25zdCBwaW5JbmZvID0gcGluTWFwcGluZ3NbcGluXTtcbiAgICAgICAgY29uc3Qgc3VwcG9ydGVkTW9kZXMgPSBbXTtcbiAgICAgICAgLy8gV2UgZG9uJ3Qgd2FudCBJMkMgdG8gYmUgdXNlZCBmb3IgYW55dGhpbmcgZWxzZSwgc2luY2UgY2hhbmdpbmcgdGhlXG4gICAgICAgIC8vIHBpbiBtb2RlIG1ha2VzIGl0IHVuYWJsZSB0byBldmVyIGRvIEkyQyBhZ2Fpbi5cbiAgICAgICAgaWYgKHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZignaTJjJykgPT0gLTEgJiYgcGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCd1YXJ0JykgPT0gLTEpIHtcbiAgICAgICAgICBpZiAocGluID09IExFRF9QSU4pIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goT1VUUFVUX01PREUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdncGlvJykgIT0gLTEpIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goSU5QVVRfTU9ERSwgT1VUUFVUX01PREUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdwd20nKSAhPSAtMSkge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChQV01fTU9ERSwgU0VSVk9fTU9ERSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl0gPSB7XG4gICAgICAgICAgcGVyaXBoZXJhbDogbnVsbCxcbiAgICAgICAgICBtb2RlOiBzdXBwb3J0ZWRNb2Rlcy5pbmRleE9mKE9VVFBVVF9NT0RFKSA9PSAtMSA/IFVOS05PV05fTU9ERSA6IE9VVFBVVF9NT0RFLFxuXG4gICAgICAgICAgLy8gVXNlZCB0byBjYWNoZSB0aGUgcHJldmlvdXNseSB3cml0dGVuIHZhbHVlIGZvciByZWFkaW5nIGJhY2sgaW4gT1VUUFVUIG1vZGVcbiAgICAgICAgICBwcmV2aW91c1dyaXR0ZW5WYWx1ZTogTE9XLFxuXG4gICAgICAgICAgLy8gVXNlZCB0byBzZXQgdGhlIGRlZmF1bHQgbWluIGFuZCBtYXggdmFsdWVzXG4gICAgICAgICAgbWluOiBERUZBVUxUX1NFUlZPX01JTixcbiAgICAgICAgICBtYXg6IERFRkFVTFRfU0VSVk9fTUFYXG4gICAgICAgIH07XG4gICAgICAgIHRoaXNbcGluc11bcGluXSA9IE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgIHN1cHBvcnRlZE1vZGVzOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoc3VwcG9ydGVkTW9kZXMpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBtb2RlOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UubW9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICBzd2l0Y2ggKGluc3RhbmNlLm1vZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICAgICAgICAgICAgY2FzZSBPVVRQVVRfTU9ERTpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLm1vZGUgPT0gT1VUUFVUX01PREUpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVwb3J0OiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFuYWxvZ0NoYW5uZWw6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMTI3XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGluc3RhbmNlLm1vZGUgPT0gT1VUUFVUX01PREUpIHtcbiAgICAgICAgICB0aGlzLnBpbk1vZGUocGluLCBPVVRQVVRfTU9ERSk7XG4gICAgICAgICAgdGhpcy5kaWdpdGFsV3JpdGUocGluLCBMT1cpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gRmlsbCBpbiB0aGUgaG9sZXMsIHNpbnMgcGlucyBhcmUgc3BhcnNlIG9uIHRoZSBBKy9CKy8yXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXNbcGluc10ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCF0aGlzW3BpbnNdW2ldKSB7XG4gICAgICAgICAgdGhpc1twaW5zXVtpXSA9IE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXM6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoW10pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFVOS05PV05fTU9ERTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc2V0KCkge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXBvcnQ6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbmFsb2dDaGFubmVsOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiAxMjdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNlcmlhbENvbmZpZyh7XG4gICAgICAgIHBvcnRJZDogREVGQVVMVF9QT1JULFxuICAgICAgICBiYXVkOiA5NjAwXG4gICAgICB9KTtcblxuICAgICAgdGhpc1tpc1JlYWR5XSA9IHRydWU7XG4gICAgICB0aGlzLmVtaXQoJ3JlYWR5Jyk7XG4gICAgICB0aGlzLmVtaXQoJ2Nvbm5lY3QnKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVzZXQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBub3JtYWxpemUocGluKSB7XG4gICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IGdldFBpbk51bWJlcihwaW4pO1xuICAgIGlmICh0eXBlb2Ygbm9ybWFsaXplZFBpbiAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwaW4gXCIke3Bpbn1cImApO1xuICAgIH1cbiAgICByZXR1cm4gbm9ybWFsaXplZFBpbjtcbiAgfVxuXG4gIFtnZXRQaW5JbnN0YW5jZV0ocGluKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXTtcbiAgICBpZiAoIXBpbkluc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcGluIFwiJHtwaW59XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIHBpbkluc3RhbmNlO1xuICB9XG5cbiAgcGluTW9kZShwaW4sIG1vZGUpIHtcbiAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlIH0pO1xuICB9XG5cbiAgW3Bpbk1vZGVdKHsgcGluLCBtb2RlLCBwdWxsUmVzaXN0b3IgPSBQVUxMX05PTkUgfSkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSB0aGlzLm5vcm1hbGl6ZShwaW4pO1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0obm9ybWFsaXplZFBpbik7XG4gICAgcGluSW5zdGFuY2UucHVsbFJlc2lzdG9yID0gcHVsbFJlc2lzdG9yO1xuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgIHBpbjogbm9ybWFsaXplZFBpbixcbiAgICAgIHB1bGxSZXNpc3RvcjogcGluSW5zdGFuY2UucHVsbFJlc2lzdG9yXG4gICAgfTtcbiAgICBjb25zdCBpc01vZGVTdXBwb3J0ZWQgPSB0aGlzW3BpbnNdW25vcm1hbGl6ZWRQaW5dLnN1cHBvcnRlZE1vZGVzLmluZGV4T2YobW9kZSkgPiAtMTtcblxuICAgIGlmIChtb2RlID09PSBQV01fTU9ERSAmJiBpc01vZGVTdXBwb3J0ZWQgPT09IGZhbHNlKSB7XG4gICAgICBtb2RlID0gU09GVF9QV01fTU9ERTtcbiAgICB9IGVsc2UgaWYgKGlzTW9kZVN1cHBvcnRlZCA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUGluIFwiJHtwaW59XCIgZG9lcyBub3Qgc3VwcG9ydCBtb2RlIFwiJHttb2RlfVwiYCk7XG4gICAgfVxuXG4gICAgaWYgKHBpbiA9PSBMRURfUElOKSB7XG4gICAgICBpZiAocGluSW5zdGFuY2UucGVyaXBoZXJhbCBpbnN0YW5jZW9mIExFRCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IExFRCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKG1vZGUpIHtcbiAgICAgICAgY2FzZSBJTlBVVF9NT0RFOlxuICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbElucHV0KGNvbmZpZyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgT1VUUFVUX01PREU6XG4gICAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBEaWdpdGFsT3V0cHV0KGNvbmZpZyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUFdNX01PREU6XG4gICAgICAgIGNhc2UgU0VSVk9fTU9ERTpcbiAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IFBXTShub3JtYWxpemVkUGluKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTT0ZUX1BXTV9NT0RFOlxuICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgU29mdFBXTSh7XG4gICAgICAgICAgICBwaW46IG5vcm1hbGl6ZWRQaW4sIHZhbHVlOiAwLCByYW5nZTogMjU1XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS53YXJuKGBVbmtub3duIHBpbiBtb2RlOiAke21vZGV9YCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLm1vZGUgPSBtb2RlO1xuICB9XG5cbiAgYW5hbG9nUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2FuYWxvZ1JlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBhbmFsb2dXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgdGhpcy5wd21Xcml0ZShwaW4sIHZhbHVlKTtcbiAgfVxuXG4gIHB3bVdyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFBXTV9NT0RFIHx8IHBpbkluc3RhbmNlLm1vZGUgIT0gU09GVF9QV01fTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgUFdNX01PREUpO1xuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKE1hdGgucm91bmQodmFsdWUgKiBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJhbmdlIC8gMjU1KSk7XG4gIH1cblxuICBkaWdpdGFsUmVhZChwaW4sIGhhbmRsZXIpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IElOUFVUX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIElOUFVUX01PREUpO1xuICAgIH1cbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGxldCB2YWx1ZTtcbiAgICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09IElOUFVUX01PREUpIHtcbiAgICAgICAgdmFsdWUgPSBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAoaGFuZGxlcikge1xuICAgICAgICBoYW5kbGVyKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdChgZGlnaXRhbC1yZWFkLSR7cGlufWAsIHZhbHVlKTtcbiAgICB9LCBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUpO1xuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwub24oJ2Rlc3Ryb3llZCcsICgpID0+IHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgZGlnaXRhbFdyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09PSBJTlBVVF9NT0RFICYmIHZhbHVlID09PSBISUdIKSB7XG4gICAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlOiBJTlBVVF9NT0RFLCBwdWxsUmVzaXN0b3I6IFBVTExfVVAgfSk7XG4gICAgfSBlbHNlIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IE9VVFBVVF9NT0RFKSB7XG4gICAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlOiBPVVRQVVRfTU9ERSB9KTtcbiAgICB9XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgPT09IE9VVFBVVF9NT0RFICYmIHZhbHVlICE9IHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlKSB7XG4gICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlID8gSElHSCA6IExPVyk7XG4gICAgICBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHNlcnZvQ29uZmlnKHBpbiwgbWluLCBtYXgpIHtcbiAgICBsZXQgY29uZmlnID0gcGluO1xuICAgIGlmICh0eXBlb2YgY29uZmlnICE9PSAnb2JqZWN0Jykge1xuICAgICAgY29uZmlnID0geyBwaW4sIG1pbiwgbWF4IH07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY29uZmlnLm1pbiAhPT0gJ251bWJlcicpIHtcbiAgICAgIGNvbmZpZy5taW4gPSBERUZBVUxUX1NFUlZPX01JTjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb25maWcubWF4ICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uZmlnLm1heCA9IERFRkFVTFRfU0VSVk9fTUFYO1xuICAgIH1cbiAgICBjb25zdCBub3JtYWxpemVkUGluID0gdGhpcy5ub3JtYWxpemUocGluKTtcbiAgICB0aGlzW3Bpbk1vZGVdKHtcbiAgICAgIHBpbjogbm9ybWFsaXplZFBpbixcbiAgICAgIG1vZGU6IFNFUlZPX01PREVcbiAgICB9KTtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKG5vcm1hbGl6ZWRQaW4pKTtcbiAgICBwaW5JbnN0YW5jZS5taW4gPSBjb25maWcubWluO1xuICAgIHBpbkluc3RhbmNlLm1heCA9IGNvbmZpZy5tYXg7XG4gIH1cblxuICBzZXJ2b1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFNFUlZPX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIFNFUlZPX01PREUpO1xuICAgIH1cbiAgICBjb25zdCBkdXR5Q3ljbGUgPSAocGluSW5zdGFuY2UubWluICsgKHZhbHVlIC8gMTgwKSAqIChwaW5JbnN0YW5jZS5tYXggLSBwaW5JbnN0YW5jZS5taW4pKSAvIDIwMDAwO1xuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUoZHV0eUN5Y2xlICogcGluSW5zdGFuY2UucGVyaXBoZXJhbC5yYW5nZSk7XG4gIH1cblxuICBxdWVyeUNhcGFiaWxpdGllcyhjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBxdWVyeUFuYWxvZ01hcHBpbmcoY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcXVlcnlQaW5TdGF0ZShwaW4sIGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIFtpMmNDaGVja0FsaXZlXSgpIHtcbiAgICBpZiAoIXRoaXNbaTJjXS5hbGl2ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJMkMgcGlucyBub3QgaW4gSTJDIG1vZGUnKTtcbiAgICB9XG4gIH1cblxuICBpMmNDb25maWcob3B0aW9ucykge1xuICAgIGxldCBkZWxheTtcblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ251bWJlcicpIHtcbiAgICAgIGRlbGF5ID0gb3B0aW9ucztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJiBvcHRpb25zICE9PSBudWxsKSB7XG4gICAgICAgIGRlbGF5ID0gb3B0aW9ucy5kZWxheTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICB0aGlzW2kyY0RlbGF5XSA9IGRlbGF5IHx8IDA7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGkyY1dyaXRlKGFkZHJlc3MsIGNtZFJlZ09yRGF0YSwgaW5CeXRlcykge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIC8vIElmIGkyY1dyaXRlIHdhcyB1c2VkIGZvciBhbiBpMmNXcml0ZVJlZyBjYWxsLi4uXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgJiZcbiAgICAgICAgIUFycmF5LmlzQXJyYXkoY21kUmVnT3JEYXRhKSAmJlxuICAgICAgICAhQXJyYXkuaXNBcnJheShpbkJ5dGVzKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaTJjV3JpdGVSZWcoYWRkcmVzcywgY21kUmVnT3JEYXRhLCBpbkJ5dGVzKTtcbiAgICB9XG5cbiAgICAvLyBGaXggYXJndW1lbnRzIGlmIGNhbGxlZCB3aXRoIEZpcm1hdGEuanMgQVBJXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGNtZFJlZ09yRGF0YSkpIHtcbiAgICAgICAgaW5CeXRlcyA9IGNtZFJlZ09yRGF0YS5zbGljZSgpO1xuICAgICAgICBjbWRSZWdPckRhdGEgPSBpbkJ5dGVzLnNoaWZ0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbkJ5dGVzID0gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYnVmZmVyID0gbmV3IEJ1ZmZlcihbY21kUmVnT3JEYXRhXS5jb25jYXQoaW5CeXRlcykpO1xuXG4gICAgLy8gT25seSB3cml0ZSBpZiBieXRlcyBwcm92aWRlZFxuICAgIGlmIChidWZmZXIubGVuZ3RoKSB7XG4gICAgICB0aGlzW2kyY10ud3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNXcml0ZVJlZyhhZGRyZXNzLCByZWdpc3RlciwgdmFsdWUpIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICB0aGlzW2kyY10ud3JpdGVCeXRlU3luYyhhZGRyZXNzLCByZWdpc3RlciwgdmFsdWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBbaTJjUmVhZF0oY29udGludW91cywgYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGVzVG9SZWFkLCBjYWxsYmFjaykge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIC8vIEZpeCBhcmd1bWVudHMgaWYgY2FsbGVkIHdpdGggRmlybWF0YS5qcyBBUElcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSA0ICYmXG4gICAgICB0eXBlb2YgcmVnaXN0ZXIgPT0gJ251bWJlcicgJiZcbiAgICAgIHR5cGVvZiBieXRlc1RvUmVhZCA9PSAnZnVuY3Rpb24nXG4gICAgKSB7XG4gICAgICBjYWxsYmFjayA9IGJ5dGVzVG9SZWFkO1xuICAgICAgYnl0ZXNUb1JlYWQgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gbnVsbDtcbiAgICB9XG5cbiAgICBjYWxsYmFjayA9IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogKCkgPT4ge307XG5cbiAgICBsZXQgZXZlbnQgPSBgaTJjLXJlcGx5LSR7YWRkcmVzc30tYDtcbiAgICBldmVudCArPSByZWdpc3RlciAhPT0gbnVsbCA/IHJlZ2lzdGVyIDogMDtcblxuICAgIGNvbnN0IHJlYWQgPSAoKSA9PiB7XG4gICAgICBjb25zdCBhZnRlclJlYWQgPSAoZXJyLCBidWZmZXIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnZlcnQgYnVmZmVyIHRvIEFycmF5IGJlZm9yZSBlbWl0XG4gICAgICAgIHRoaXMuZW1pdChldmVudCwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYnVmZmVyKSk7XG5cbiAgICAgICAgaWYgKGNvbnRpbnVvdXMpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KHJlYWQsIHRoaXNbaTJjRGVsYXldKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdGhpcy5vbmNlKGV2ZW50LCBjYWxsYmFjayk7XG5cbiAgICAgIGlmIChyZWdpc3RlciAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzW2kyY10ucmVhZChhZGRyZXNzLCByZWdpc3RlciwgYnl0ZXNUb1JlYWQsIGFmdGVyUmVhZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzW2kyY10ucmVhZChhZGRyZXNzLCBieXRlc1RvUmVhZCwgYWZ0ZXJSZWFkKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc2V0VGltZW91dChyZWFkLCB0aGlzW2kyY0RlbGF5XSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGkyY1JlYWQoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzW2kyY1JlYWRdKHRydWUsIC4uLnJlc3QpO1xuICB9XG5cbiAgaTJjUmVhZE9uY2UoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzW2kyY1JlYWRdKGZhbHNlLCAuLi5yZXN0KTtcbiAgfVxuXG4gIHNlbmRJMkNDb25maWcoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzLmkyY0NvbmZpZyguLi5yZXN0KTtcbiAgfVxuXG4gIHNlbmRJMkNXcml0ZVJlcXVlc3QoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzLmkyY1dyaXRlKC4uLnJlc3QpO1xuICB9XG5cbiAgc2VuZEkyQ1JlYWRSZXF1ZXN0KC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNSZWFkT25jZSguLi5yZXN0KTtcbiAgfVxuXG4gIHNlcmlhbENvbmZpZyh7IHBvcnRJZCwgYmF1ZCB9KSB7XG4gICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0gfHwgKGJhdWQgJiYgYmF1ZCAhPT0gdGhpc1tzZXJpYWxdLmJhdWRSYXRlKSkge1xuICAgICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fQ09ORklHLFxuICAgICAgICBwb3J0SWQsXG4gICAgICAgIGJhdWRcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNlcmlhbFdyaXRlKHBvcnRJZCwgaW5CeXRlcykge1xuICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgdHlwZTogU0VSSUFMX0FDVElPTl9XUklURSxcbiAgICAgIHBvcnRJZCxcbiAgICAgIGluQnl0ZXNcbiAgICB9KTtcbiAgfVxuXG4gIHNlcmlhbFJlYWQocG9ydElkLCBtYXhCeXRlc1RvUmVhZCwgaGFuZGxlcikge1xuICAgIGlmICh0eXBlb2YgbWF4Qnl0ZXNUb1JlYWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGhhbmRsZXIgPSBtYXhCeXRlc1RvUmVhZDtcbiAgICAgIG1heEJ5dGVzVG9SZWFkID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fUkVBRCxcbiAgICAgIHBvcnRJZCxcbiAgICAgIG1heEJ5dGVzVG9SZWFkLFxuICAgICAgaGFuZGxlclxuICAgIH0pO1xuICB9XG5cbiAgc2VyaWFsU3RvcChwb3J0SWQpIHtcbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fU1RPUCxcbiAgICAgIHBvcnRJZFxuICAgIH0pO1xuICB9XG5cbiAgc2VyaWFsQ2xvc2UocG9ydElkKSB7XG4gICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX0NMT1NFLFxuICAgICAgcG9ydElkXG4gICAgfSk7XG4gIH1cblxuICBzZXJpYWxGbHVzaChwb3J0SWQpIHtcbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fRkxVU0gsXG4gICAgICBwb3J0SWRcbiAgICB9KTtcbiAgfVxuXG4gIFthZGRUb1NlcmlhbFF1ZXVlXShhY3Rpb24pIHtcbiAgICBpZiAoYWN0aW9uLnBvcnRJZCAhPT0gREVGQVVMVF9QT1JUKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgc2VyaWFsIHBvcnQgXCIke3BvcnRJZH1cImApO1xuICAgIH1cbiAgICB0aGlzW3NlcmlhbFF1ZXVlXS5wdXNoKGFjdGlvbik7XG4gICAgdGhpc1tzZXJpYWxQdW1wXSgpO1xuICB9XG5cbiAgW3NlcmlhbFB1bXBdKCkge1xuICAgIGlmICh0aGlzW2lzU2VyaWFsUHJvY2Vzc2luZ10gfHwgIXRoaXNbc2VyaWFsUXVldWVdLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzW2lzU2VyaWFsUHJvY2Vzc2luZ10gPSB0cnVlO1xuICAgIGNvbnN0IGFjdGlvbiA9IHRoaXNbc2VyaWFsUXVldWVdLnNoaWZ0KCk7XG4gICAgY29uc3QgZmluYWxpemUgPSAoKSA9PiB7XG4gICAgICB0aGlzW2lzU2VyaWFsUHJvY2Vzc2luZ10gPSBmYWxzZTtcbiAgICAgIHRoaXNbc2VyaWFsUHVtcF0oKTtcbiAgICB9O1xuICAgIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9XUklURTpcbiAgICAgICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCB3cml0ZSB0byBjbG9zZWQgc2VyaWFsIHBvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzW3NlcmlhbF0ud3JpdGUoYWN0aW9uLmluQnl0ZXMsIGZpbmFsaXplKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9SRUFEOlxuICAgICAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHJlYWQgZnJvbSBjbG9zZWQgc2VyaWFsIHBvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPOiBhZGQgc3VwcG9ydCBmb3IgYWN0aW9uLm1heEJ5dGVzVG9SZWFkXG4gICAgICAgIHRoaXNbc2VyaWFsXS5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgYWN0aW9uLmhhbmRsZXIoYnVmZmVyVG9BcnJheShkYXRhKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZpbmFsaXplKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9TVE9QOlxuICAgICAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHN0b3AgY2xvc2VkIHNlcmlhbCBwb3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpc1tzZXJpYWxdLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZpbmFsaXplKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9DT05GSUc6XG4gICAgICAgIHRoaXNbc2VyaWFsXS5jbG9zZSgoKSA9PiB7XG4gICAgICAgICAgdGhpc1tzZXJpYWxdID0gbmV3IFNlcmlhbCh7XG4gICAgICAgICAgICBiYXVkUmF0ZTogYWN0aW9uLmJhdWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzW3NlcmlhbF0ub3BlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzW3NlcmlhbF0ub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmVtaXQoYHNlcmlhbC1kYXRhLSR7YWN0aW9uLnBvcnRJZH1gLCBidWZmZXJUb0FycmF5KGRhdGEpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpc1tpc1NlcmlhbE9wZW5dID0gdHJ1ZTtcbiAgICAgICAgICAgIGZpbmFsaXplKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX0NMT1NFOlxuICAgICAgICB0aGlzW3NlcmlhbF0uY2xvc2UoKCkgPT4ge1xuICAgICAgICAgIHRoaXNbaXNTZXJpYWxPcGVuXSA9IGZhbHNlO1xuICAgICAgICAgIGZpbmFsaXplKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX0ZMVVNIOlxuICAgICAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZsdXNoIGNsb3NlZCBzZXJpYWwgcG9ydCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXNbc2VyaWFsXS5mbHVzaChmaW5hbGl6ZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludGVybmFsIGVycm9yOiB1bmtub3duIHNlcmlhbCBhY3Rpb24gdHlwZScpO1xuICAgIH1cbiAgfVxuXG4gIHNlbmRPbmVXaXJlQ29uZmlnKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVDb25maWcgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVNlYXJjaCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlU2VhcmNoIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVBbGFybXNTZWFyY2goKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZUFsYXJtc1NlYXJjaCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlUmVzZXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZUNvbmZpZyBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlV3JpdGUoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVdyaXRlIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVEZWxheSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlRGVsYXkgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlV3JpdGVBbmRSZWFkIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2V0U2FtcGxpbmdJbnRlcnZhbCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFNhbXBsaW5nSW50ZXJ2YWwgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcmVwb3J0QW5hbG9nUGluKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVwb3J0QW5hbG9nUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHJlcG9ydERpZ2l0YWxQaW4oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZXBvcnREaWdpdGFsUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHBpbmdSZWFkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncGluZ1JlYWQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcHVsc2VJbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3B1bHNlSW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgc3RlcHBlckNvbmZpZygpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0ZXBwZXJDb25maWcgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgc3RlcHBlclN0ZXAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzdGVwcGVyU3RlcCBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFJhc3BpLCAnaXNSYXNwYmVycnlQaScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgdmFsdWU6ICgpID0+IHtcbiAgICAvLyBEZXRlcm1pbmluZyBpZiBhIHN5c3RlbSBpcyBhIFJhc3BiZXJyeSBQaSBpc24ndCBwb3NzaWJsZSB0aHJvdWdoXG4gICAgLy8gdGhlIG9zIG1vZHVsZSBvbiBSYXNwYmlhbiwgc28gd2UgcmVhZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbSBpbnN0ZWFkXG4gICAgbGV0IGlzUmFzcGJlcnJ5UGkgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgaXNSYXNwYmVycnlQaSA9IGZzLnJlYWRGaWxlU3luYygnL2V0Yy9vcy1yZWxlYXNlJykudG9TdHJpbmcoKS5pbmRleE9mKCdSYXNwYmlhbicpICE9PSAtMTtcbiAgICB9IGNhdGNoIChlKSB7fS8vIFNxdWFzaCBmaWxlIG5vdCBmb3VuZCwgZXRjIGVycm9yc1xuICAgIHJldHVybiBpc1Jhc3BiZXJyeVBpO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXNwaTtcbiJdfQ==