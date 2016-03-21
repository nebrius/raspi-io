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
      if (typeof normalizedPin == 'undefined') {
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
      if (this[pins][normalizedPin].supportedModes.indexOf(mode) == -1) {
        throw new Error('Pin "' + pin + '" does not support mode "' + mode + '"');
      }
      if (pin == LED_PIN && !(pinInstance.peripheral instanceof _raspiLed.LED)) {
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

      var event = 'I2C-reply' + address + '-';
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

//# sourceMappingURL=data:application/json;base64,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QUFJLEtBQUosQ0FBVSw0Q0FBVixDQUFOLENBRG9COzs7O3NDQUlKO0FBQ2hCLFlBQU0sSUFBSSxLQUFKLENBQVUsd0NBQVYsQ0FBTixDQURnQjs7Ozt1Q0FJQztBQUNqQixZQUFNLElBQUksS0FBSixDQUFVLHlDQUFWLENBQU4sQ0FEaUI7Ozs7K0JBSVI7QUFDVCxZQUFNLElBQUksS0FBSixDQUFVLGlDQUFWLENBQU4sQ0FEUzs7Ozs4QkFJRDtBQUNSLFlBQU0sSUFBSSxLQUFKLENBQVUsZ0NBQVYsQ0FBTixDQURROzs7O29DQUlNO0FBQ2QsWUFBTSxJQUFJLEtBQUosQ0FBVSxzQ0FBVixDQUFOLENBRGM7Ozs7a0NBSUY7QUFDWixZQUFNLElBQUksS0FBSixDQUFVLG9DQUFWLENBQU4sQ0FEWTs7OztTQXpzQlY7OztBQThzQk4sT0FBTyxjQUFQLENBQXNCLEtBQXRCLEVBQTZCLGVBQTdCLEVBQThDO0FBQzVDLGNBQVksSUFBWjtBQUNBLFNBQU8saUJBQU07OztBQUdYLFFBQUksZ0JBQWdCLEtBQWhCLENBSE87QUFJWCxRQUFJO0FBQ0Ysc0JBQWdCLGFBQUcsWUFBSCxDQUFnQixpQkFBaEIsRUFBbUMsUUFBbkMsR0FBOEMsT0FBOUMsQ0FBc0QsVUFBdEQsTUFBc0UsQ0FBQyxDQUFELENBRHBGO0tBQUosQ0FFRSxPQUFPLENBQVAsRUFBVSxFQUFWO0FBTlMsV0FPSixhQUFQLENBUFc7R0FBTjtDQUZUOztBQWFBLE9BQU8sT0FBUCxHQUFpQixLQUFqQiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgKGMpIDIwMTQgQnJ5YW4gSHVnaGVzIDxicnlhbkB0aGVvcmV0aWNhbGlkZWF0aW9ucy5jb20+XG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uXG5vYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvblxuZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dFxucmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsXG5jb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlXG5Tb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZ1xuY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFU1xuT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbk5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUXG5IT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSxcbldIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lOR1xuRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUlxuT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBpbml0IH0gZnJvbSAncmFzcGknO1xuaW1wb3J0IHsgZ2V0UGlucywgZ2V0UGluTnVtYmVyIH0gZnJvbSAncmFzcGktYm9hcmQnO1xuaW1wb3J0IHsgUFVMTF9OT05FLCBQVUxMX1VQLCBQVUxMX0RPV04sIERpZ2l0YWxPdXRwdXQsIERpZ2l0YWxJbnB1dCB9IGZyb20gJ3Jhc3BpLWdwaW8nO1xuaW1wb3J0IHsgUFdNIH0gZnJvbSAncmFzcGktcHdtJztcbmltcG9ydCB7IEkyQyB9IGZyb20gJ3Jhc3BpLWkyYyc7XG5pbXBvcnQgeyBMRUQgfSBmcm9tICdyYXNwaS1sZWQnO1xuaW1wb3J0IHsgU2VyaWFsLCBERUZBVUxUX1BPUlQgfSBmcm9tICdyYXNwaS1zZXJpYWwnO1xuXG4vLyBDb25zdGFudHNcbmNvbnN0IElOUFVUX01PREUgPSAwO1xuY29uc3QgT1VUUFVUX01PREUgPSAxO1xuY29uc3QgQU5BTE9HX01PREUgPSAyO1xuY29uc3QgUFdNX01PREUgPSAzO1xuY29uc3QgU0VSVk9fTU9ERSA9IDQ7XG5jb25zdCBVTktOT1dOX01PREUgPSA5OTtcblxuY29uc3QgTE9XID0gMDtcbmNvbnN0IEhJR0ggPSAxO1xuXG5jb25zdCBMRURfUElOID0gLTE7XG5cbi8vIFNldHRpbmdzXG5jb25zdCBERUZBVUxUX1NFUlZPX01JTiA9IDEwMDA7XG5jb25zdCBERUZBVUxUX1NFUlZPX01BWCA9IDIwMDA7XG5jb25zdCBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUgPSAxOTtcblxuLy8gUHJpdmF0ZSBzeW1ib2xzXG5jb25zdCBpc1JlYWR5ID0gU3ltYm9sKCdpc1JlYWR5Jyk7XG5jb25zdCBwaW5zID0gU3ltYm9sKCdwaW5zJyk7XG5jb25zdCBpbnN0YW5jZXMgPSBTeW1ib2woJ2luc3RhbmNlcycpO1xuY29uc3QgYW5hbG9nUGlucyA9IFN5bWJvbCgnYW5hbG9nUGlucycpO1xuY29uc3QgZ2V0UGluSW5zdGFuY2UgPSBTeW1ib2woJ2dldFBpbkluc3RhbmNlJyk7XG5jb25zdCBpMmMgPSBTeW1ib2woJ2kyYycpO1xuY29uc3QgaTJjRGVsYXkgPSBTeW1ib2woJ2kyY0RlbGF5Jyk7XG5jb25zdCBpMmNSZWFkID0gU3ltYm9sKCdpMmNSZWFkJyk7XG5jb25zdCBpMmNDaGVja0FsaXZlID0gU3ltYm9sKCdpMmNDaGVja0FsaXZlJyk7XG5jb25zdCBwaW5Nb2RlID0gU3ltYm9sKCdwaW5Nb2RlJyk7XG5jb25zdCBzZXJpYWwgPSBTeW1ib2woJ3NlcmlhbCcpO1xuY29uc3Qgc2VyaWFsUXVldWUgPSBTeW1ib2woJ3NlcmlhbFF1ZXVlJyk7XG5jb25zdCBhZGRUb1NlcmlhbFF1ZXVlID0gU3ltYm9sKCdhZGRUb1NlcmlhbFF1ZXVlJyk7XG5jb25zdCBzZXJpYWxQdW1wID0gU3ltYm9sKCdzZXJpYWxQdW1wJyk7XG5jb25zdCBpc1NlcmlhbFByb2Nlc3NpbmcgPSBTeW1ib2woJ2lzU2VyaWFsUHJvY2Vzc2luZycpO1xuY29uc3QgaXNTZXJpYWxPcGVuID0gU3ltYm9sKCdpc1NlcmlhbE9wZW4nKTtcblxuY29uc3QgU0VSSUFMX0FDVElPTl9XUklURSA9ICdTRVJJQUxfQUNUSU9OX1dSSVRFJztcbmNvbnN0IFNFUklBTF9BQ1RJT05fQ0xPU0UgPSAnU0VSSUFMX0FDVElPTl9DTE9TRSc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX0ZMVVNIID0gJ1NFUklBTF9BQ1RJT05fRkxVU0gnO1xuY29uc3QgU0VSSUFMX0FDVElPTl9DT05GSUcgPSAnU0VSSUFMX0FDVElPTl9DT05GSUcnO1xuY29uc3QgU0VSSUFMX0FDVElPTl9SRUFEID0gJ1NFUklBTF9BQ1RJT05fUkVBRCc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX1NUT1AgPSAnU0VSSUFMX0FDVElPTl9TVE9QJztcblxuZnVuY3Rpb24gYnVmZmVyVG9BcnJheShidWZmZXIpIHtcbiAgY29uc3QgYXJyYXkgPSBBcnJheShidWZmZXIubGVuZ3RoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpKyspIHtcbiAgICBhcnJheVtpXSA9IGJ1ZmZlcltpXTtcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbmNsYXNzIFJhc3BpIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgbmFtZToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogJ1Jhc3BiZXJyeVBpLUlPJ1xuICAgICAgfSxcblxuICAgICAgW2luc3RhbmNlc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcblxuICAgICAgW2lzUmVhZHldOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG4gICAgICBpc1JlYWR5OiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1tpc1JlYWR5XTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW3BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBwaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1twaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2FuYWxvZ1BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBhbmFsb2dQaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1thbmFsb2dQaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2kyY106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBuZXcgSTJDKClcbiAgICAgIH0sXG5cbiAgICAgIFtpMmNEZWxheV06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiAwXG4gICAgICB9LFxuXG4gICAgICBbc2VyaWFsXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IG5ldyBTZXJpYWwoKVxuICAgICAgfSxcblxuICAgICAgW3NlcmlhbFF1ZXVlXToge1xuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG5cbiAgICAgIFtpc1NlcmlhbFByb2Nlc3NpbmddOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG5cbiAgICAgIFtpc1NlcmlhbE9wZW5dOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG5cbiAgICAgIE1PREVTOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICBJTlBVVDogSU5QVVRfTU9ERSxcbiAgICAgICAgICBPVVRQVVQ6IE9VVFBVVF9NT0RFLFxuICAgICAgICAgIEFOQUxPRzogQU5BTE9HX01PREUsXG4gICAgICAgICAgUFdNOiBQV01fTU9ERSxcbiAgICAgICAgICBTRVJWTzogU0VSVk9fTU9ERVxuICAgICAgICB9KVxuICAgICAgfSxcblxuICAgICAgSElHSDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogSElHSFxuICAgICAgfSxcbiAgICAgIExPVzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTE9XXG4gICAgICB9LFxuXG4gICAgICBkZWZhdWx0TGVkOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBMRURfUElOXG4gICAgICB9LFxuXG4gICAgICBTRVJJQUxfUE9SVF9JRHM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgIEhXX1NFUklBTDA6IERFRkFVTFRfUE9SVCxcbiAgICAgICAgICBERUZBVUxUOiBERUZBVUxUX1BPUlRcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGluaXQoKCkgPT4ge1xuICAgICAgY29uc3QgcGluTWFwcGluZ3MgPSBnZXRQaW5zKCk7XG4gICAgICB0aGlzW3BpbnNdID0gW107XG5cbiAgICAgIC8vIFNsaWdodCBoYWNrIHRvIGdldCB0aGUgTEVEIGluIHRoZXJlLCBzaW5jZSBpdCdzIG5vdCBhY3R1YWxseSBhIHBpblxuICAgICAgcGluTWFwcGluZ3NbTEVEX1BJTl0gPSB7XG4gICAgICAgIHBpbnM6IFsgTEVEX1BJTiBdLFxuICAgICAgICBwZXJpcGhlcmFsczogWyAnZ3BpbycgXVxuICAgICAgfTtcblxuICAgICAgT2JqZWN0LmtleXMocGluTWFwcGluZ3MpLmZvckVhY2goKHBpbikgPT4ge1xuICAgICAgICBjb25zdCBwaW5JbmZvID0gcGluTWFwcGluZ3NbcGluXTtcbiAgICAgICAgY29uc3Qgc3VwcG9ydGVkTW9kZXMgPSBbXTtcbiAgICAgICAgLy8gV2UgZG9uJ3Qgd2FudCBJMkMgdG8gYmUgdXNlZCBmb3IgYW55dGhpbmcgZWxzZSwgc2luY2UgY2hhbmdpbmcgdGhlXG4gICAgICAgIC8vIHBpbiBtb2RlIG1ha2VzIGl0IHVuYWJsZSB0byBldmVyIGRvIEkyQyBhZ2Fpbi5cbiAgICAgICAgaWYgKHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZignaTJjJykgPT0gLTEgJiYgcGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCd1YXJ0JykgPT0gLTEpIHtcbiAgICAgICAgICBpZiAocGluID09IExFRF9QSU4pIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goT1VUUFVUX01PREUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdncGlvJykgIT0gLTEpIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goSU5QVVRfTU9ERSwgT1VUUFVUX01PREUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdwd20nKSAhPSAtMSkge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChQV01fTU9ERSwgU0VSVk9fTU9ERSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl0gPSB7XG4gICAgICAgICAgcGVyaXBoZXJhbDogbnVsbCxcbiAgICAgICAgICBtb2RlOiBzdXBwb3J0ZWRNb2Rlcy5pbmRleE9mKE9VVFBVVF9NT0RFKSA9PSAtMSA/IFVOS05PV05fTU9ERSA6IE9VVFBVVF9NT0RFLFxuXG4gICAgICAgICAgLy8gVXNlZCB0byBjYWNoZSB0aGUgcHJldmlvdXNseSB3cml0dGVuIHZhbHVlIGZvciByZWFkaW5nIGJhY2sgaW4gT1VUUFVUIG1vZGVcbiAgICAgICAgICBwcmV2aW91c1dyaXR0ZW5WYWx1ZTogTE9XLFxuXG4gICAgICAgICAgLy8gVXNlZCB0byBzZXQgdGhlIGRlZmF1bHQgbWluIGFuZCBtYXggdmFsdWVzXG4gICAgICAgICAgbWluOiBERUZBVUxUX1NFUlZPX01JTixcbiAgICAgICAgICBtYXg6IERFRkFVTFRfU0VSVk9fTUFYXG4gICAgICAgIH07XG4gICAgICAgIHRoaXNbcGluc11bcGluXSA9IE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgIHN1cHBvcnRlZE1vZGVzOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoc3VwcG9ydGVkTW9kZXMpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBtb2RlOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UubW9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICBzd2l0Y2ggKGluc3RhbmNlLm1vZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICAgICAgICAgICAgY2FzZSBPVVRQVVRfTU9ERTpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLm1vZGUgPT0gT1VUUFVUX01PREUpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVwb3J0OiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFuYWxvZ0NoYW5uZWw6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMTI3XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGluc3RhbmNlLm1vZGUgPT0gT1VUUFVUX01PREUpIHtcbiAgICAgICAgICB0aGlzLnBpbk1vZGUocGluLCBPVVRQVVRfTU9ERSk7XG4gICAgICAgICAgdGhpcy5kaWdpdGFsV3JpdGUocGluLCBMT1cpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gRmlsbCBpbiB0aGUgaG9sZXMsIHNpbnMgcGlucyBhcmUgc3BhcnNlIG9uIHRoZSBBKy9CKy8yXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXNbcGluc10ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCF0aGlzW3BpbnNdW2ldKSB7XG4gICAgICAgICAgdGhpc1twaW5zXVtpXSA9IE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXM6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoW10pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFVOS05PV05fTU9ERTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc2V0KCkge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXBvcnQ6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbmFsb2dDaGFubmVsOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiAxMjdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNlcmlhbENvbmZpZyh7XG4gICAgICAgIHBvcnRJZDogREVGQVVMVF9QT1JULFxuICAgICAgICBiYXVkOiA5NjAwXG4gICAgICB9KTtcblxuICAgICAgdGhpc1tpc1JlYWR5XSA9IHRydWU7XG4gICAgICB0aGlzLmVtaXQoJ3JlYWR5Jyk7XG4gICAgICB0aGlzLmVtaXQoJ2Nvbm5lY3QnKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVzZXQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBub3JtYWxpemUocGluKSB7XG4gICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IGdldFBpbk51bWJlcihwaW4pO1xuICAgIGlmICh0eXBlb2Ygbm9ybWFsaXplZFBpbiA9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHBpbiBcIicgKyBwaW4gKyAnXCInKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRQaW47XG4gIH1cblxuICBbZ2V0UGluSW5zdGFuY2VdKHBpbikge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl07XG4gICAgaWYgKCFwaW5JbnN0YW5jZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHBpbiBcIicgKyBwaW4gKyAnXCInKTtcbiAgICB9XG4gICAgcmV0dXJuIHBpbkluc3RhbmNlO1xuICB9XG5cbiAgcGluTW9kZShwaW4sIG1vZGUpIHtcbiAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlIH0pO1xuICB9XG5cbiAgW3Bpbk1vZGVdKHsgcGluLCBtb2RlLCBwdWxsUmVzaXN0b3IgPSBQVUxMX05PTkUgfSkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSB0aGlzLm5vcm1hbGl6ZShwaW4pO1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0obm9ybWFsaXplZFBpbik7XG4gICAgcGluSW5zdGFuY2UucHVsbFJlc2lzdG9yID0gcHVsbFJlc2lzdG9yO1xuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgIHBpbjogbm9ybWFsaXplZFBpbixcbiAgICAgIHB1bGxSZXNpc3RvcjogcGluSW5zdGFuY2UucHVsbFJlc2lzdG9yXG4gICAgfTtcbiAgICBpZiAodGhpc1twaW5zXVtub3JtYWxpemVkUGluXS5zdXBwb3J0ZWRNb2Rlcy5pbmRleE9mKG1vZGUpID09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BpbiBcIicgKyBwaW4gKyAnXCIgZG9lcyBub3Qgc3VwcG9ydCBtb2RlIFwiJyArIG1vZGUgKyAnXCInKTtcbiAgICB9XG4gICAgaWYgKHBpbiA9PSBMRURfUElOICYmICEocGluSW5zdGFuY2UucGVyaXBoZXJhbCBpbnN0YW5jZW9mIExFRCkpIHtcbiAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgTEVEKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBEaWdpdGFsSW5wdXQoY29uZmlnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBPVVRQVVRfTU9ERTpcbiAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IERpZ2l0YWxPdXRwdXQoY29uZmlnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBQV01fTU9ERTpcbiAgICAgICAgY2FzZSBTRVJWT19NT0RFOlxuICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgUFdNKG5vcm1hbGl6ZWRQaW4pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnNvbGUud2FybignVW5rbm93biBwaW4gbW9kZTogJyArIG1vZGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5tb2RlID0gbW9kZTtcbiAgfVxuXG4gIGFuYWxvZ1JlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhbmFsb2dSZWFkIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgYW5hbG9nV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIHRoaXMucHdtV3JpdGUocGluLCB2YWx1ZSk7XG4gIH1cblxuICBwd21Xcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBQV01fTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgUFdNX01PREUpO1xuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKE1hdGgucm91bmQodmFsdWUgKiBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJhbmdlIC8gMjU1KSk7XG4gIH1cblxuICBkaWdpdGFsUmVhZChwaW4sIGhhbmRsZXIpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IElOUFVUX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIElOUFVUX01PREUpO1xuICAgIH1cbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGxldCB2YWx1ZTtcbiAgICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09IElOUFVUX01PREUpIHtcbiAgICAgICAgdmFsdWUgPSBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAoaGFuZGxlcikge1xuICAgICAgICBoYW5kbGVyKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdCgnZGlnaXRhbC1yZWFkLScgKyBwaW4sIHZhbHVlKTtcbiAgICB9LCBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUpO1xuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwub24oJ2Rlc3Ryb3llZCcsICgpID0+IHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgZGlnaXRhbFdyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09PSBJTlBVVF9NT0RFICYmIHZhbHVlID09PSBISUdIKSB7XG4gICAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlOiBJTlBVVF9NT0RFLCBwdWxsUmVzaXN0b3I6IFBVTExfVVAgfSk7XG4gICAgfSBlbHNlIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IE9VVFBVVF9NT0RFKSB7XG4gICAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlOiBPVVRQVVRfTU9ERSB9KTtcbiAgICB9XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgPT09IE9VVFBVVF9NT0RFICYmIHZhbHVlICE9IHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlKSB7XG4gICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlID8gSElHSCA6IExPVyk7XG4gICAgICBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHNlcnZvQ29uZmlnKHBpbiwgbWluLCBtYXgpIHtcbiAgICBsZXQgY29uZmlnID0gcGluO1xuICAgIGlmICh0eXBlb2YgY29uZmlnICE9PSAnb2JqZWN0Jykge1xuICAgICAgY29uZmlnID0geyBwaW4sIG1pbiwgbWF4IH07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY29uZmlnLm1pbiAhPT0gJ251bWJlcicpIHtcbiAgICAgIGNvbmZpZy5taW4gPSBERUZBVUxUX1NFUlZPX01JTjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb25maWcubWF4ICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uZmlnLm1heCA9IERFRkFVTFRfU0VSVk9fTUFYO1xuICAgIH1cbiAgICBjb25zdCBub3JtYWxpemVkUGluID0gdGhpcy5ub3JtYWxpemUocGluKTtcbiAgICB0aGlzW3Bpbk1vZGVdKHtcbiAgICAgIHBpbjogbm9ybWFsaXplZFBpbixcbiAgICAgIG1vZGU6IFNFUlZPX01PREVcbiAgICB9KTtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKG5vcm1hbGl6ZWRQaW4pKTtcbiAgICBwaW5JbnN0YW5jZS5taW4gPSBjb25maWcubWluO1xuICAgIHBpbkluc3RhbmNlLm1heCA9IGNvbmZpZy5tYXg7XG4gIH1cblxuICBzZXJ2b1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFNFUlZPX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIFNFUlZPX01PREUpO1xuICAgIH1cbiAgICBjb25zdCBkdXR5Q3ljbGUgPSAocGluSW5zdGFuY2UubWluICsgKHZhbHVlIC8gMTgwKSAqIChwaW5JbnN0YW5jZS5tYXggLSBwaW5JbnN0YW5jZS5taW4pKSAvIDIwMDAwO1xuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUoZHV0eUN5Y2xlICogcGluSW5zdGFuY2UucGVyaXBoZXJhbC5yYW5nZSk7XG4gIH1cblxuICBxdWVyeUNhcGFiaWxpdGllcyhjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBxdWVyeUFuYWxvZ01hcHBpbmcoY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcXVlcnlQaW5TdGF0ZShwaW4sIGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIFtpMmNDaGVja0FsaXZlXSgpIHtcbiAgICBpZiAoIXRoaXNbaTJjXS5hbGl2ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJMkMgcGlucyBub3QgaW4gSTJDIG1vZGUnKTtcbiAgICB9XG4gIH1cblxuICBpMmNDb25maWcob3B0aW9ucykge1xuICAgIGxldCBkZWxheTtcblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ251bWJlcicpIHtcbiAgICAgIGRlbGF5ID0gb3B0aW9ucztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJiBvcHRpb25zICE9PSBudWxsKSB7XG4gICAgICAgIGRlbGF5ID0gb3B0aW9ucy5kZWxheTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICB0aGlzW2kyY0RlbGF5XSA9IGRlbGF5IHx8IDA7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGkyY1dyaXRlKGFkZHJlc3MsIGNtZFJlZ09yRGF0YSwgaW5CeXRlcykge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIC8vIElmIGkyY1dyaXRlIHdhcyB1c2VkIGZvciBhbiBpMmNXcml0ZVJlZyBjYWxsLi4uXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgJiZcbiAgICAgICAgIUFycmF5LmlzQXJyYXkoY21kUmVnT3JEYXRhKSAmJlxuICAgICAgICAhQXJyYXkuaXNBcnJheShpbkJ5dGVzKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaTJjV3JpdGVSZWcoYWRkcmVzcywgY21kUmVnT3JEYXRhLCBpbkJ5dGVzKTtcbiAgICB9XG5cbiAgICAvLyBGaXggYXJndW1lbnRzIGlmIGNhbGxlZCB3aXRoIEZpcm1hdGEuanMgQVBJXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGNtZFJlZ09yRGF0YSkpIHtcbiAgICAgICAgaW5CeXRlcyA9IGNtZFJlZ09yRGF0YS5zbGljZSgpO1xuICAgICAgICBjbWRSZWdPckRhdGEgPSBpbkJ5dGVzLnNoaWZ0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbkJ5dGVzID0gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYnVmZmVyID0gbmV3IEJ1ZmZlcihbY21kUmVnT3JEYXRhXS5jb25jYXQoaW5CeXRlcykpO1xuXG4gICAgLy8gT25seSB3cml0ZSBpZiBieXRlcyBwcm92aWRlZFxuICAgIGlmIChidWZmZXIubGVuZ3RoKSB7XG4gICAgICB0aGlzW2kyY10ud3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNXcml0ZVJlZyhhZGRyZXNzLCByZWdpc3RlciwgdmFsdWUpIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICB0aGlzW2kyY10ud3JpdGVCeXRlU3luYyhhZGRyZXNzLCByZWdpc3RlciwgdmFsdWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBbaTJjUmVhZF0oY29udGludW91cywgYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGVzVG9SZWFkLCBjYWxsYmFjaykge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIC8vIEZpeCBhcmd1bWVudHMgaWYgY2FsbGVkIHdpdGggRmlybWF0YS5qcyBBUElcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSA0ICYmXG4gICAgICB0eXBlb2YgcmVnaXN0ZXIgPT0gJ251bWJlcicgJiZcbiAgICAgIHR5cGVvZiBieXRlc1RvUmVhZCA9PSAnZnVuY3Rpb24nXG4gICAgKSB7XG4gICAgICBjYWxsYmFjayA9IGJ5dGVzVG9SZWFkO1xuICAgICAgYnl0ZXNUb1JlYWQgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gbnVsbDtcbiAgICB9XG5cbiAgICBjYWxsYmFjayA9IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogKCkgPT4ge307XG5cbiAgICBsZXQgZXZlbnQgPSAnSTJDLXJlcGx5JyArIGFkZHJlc3MgKyAnLSc7XG4gICAgZXZlbnQgKz0gcmVnaXN0ZXIgIT09IG51bGwgPyByZWdpc3RlciA6IDA7XG5cbiAgICBjb25zdCByZWFkID0gKCkgPT4ge1xuICAgICAgY29uc3QgYWZ0ZXJSZWFkID0gKGVyciwgYnVmZmVyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb252ZXJ0IGJ1ZmZlciB0byBBcnJheSBiZWZvcmUgZW1pdFxuICAgICAgICB0aGlzLmVtaXQoZXZlbnQsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGJ1ZmZlcikpO1xuXG4gICAgICAgIGlmIChjb250aW51b3VzKSB7XG4gICAgICAgICAgc2V0VGltZW91dChyZWFkLCB0aGlzW2kyY0RlbGF5XSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRoaXMub25jZShldmVudCwgY2FsbGJhY2spO1xuXG4gICAgICBpZiAocmVnaXN0ZXIgIT09IG51bGwpIHtcbiAgICAgICAgdGhpc1tpMmNdLnJlYWQoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGVzVG9SZWFkLCBhZnRlclJlYWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1tpMmNdLnJlYWQoYWRkcmVzcywgYnl0ZXNUb1JlYWQsIGFmdGVyUmVhZCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNldFRpbWVvdXQocmVhZCwgdGhpc1tpMmNEZWxheV0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNSZWFkKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpc1tpMmNSZWFkXSh0cnVlLCAuLi5yZXN0KTtcbiAgfVxuXG4gIGkyY1JlYWRPbmNlKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpc1tpMmNSZWFkXShmYWxzZSwgLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDQ29uZmlnKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNDb25maWcoLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDV3JpdGVSZXF1ZXN0KC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNXcml0ZSguLi5yZXN0KTtcbiAgfVxuXG4gIHNlbmRJMkNSZWFkUmVxdWVzdCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjUmVhZE9uY2UoLi4ucmVzdCk7XG4gIH1cblxuICBzZXJpYWxDb25maWcoeyBwb3J0SWQsIGJhdWQgfSkge1xuICAgIGlmICghdGhpc1tpc1NlcmlhbE9wZW5dIHx8IChiYXVkICYmIGJhdWQgIT09IHRoaXNbc2VyaWFsXS5iYXVkUmF0ZSkpIHtcbiAgICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX0NPTkZJRyxcbiAgICAgICAgcG9ydElkLFxuICAgICAgICBiYXVkXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBzZXJpYWxXcml0ZShwb3J0SWQsIGluQnl0ZXMpIHtcbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fV1JJVEUsXG4gICAgICBwb3J0SWQsXG4gICAgICBpbkJ5dGVzXG4gICAgfSk7XG4gIH1cblxuICBzZXJpYWxSZWFkKHBvcnRJZCwgbWF4Qnl0ZXNUb1JlYWQsIGhhbmRsZXIpIHtcbiAgICBpZiAodHlwZW9mIG1heEJ5dGVzVG9SZWFkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBoYW5kbGVyID0gbWF4Qnl0ZXNUb1JlYWQ7XG4gICAgICBtYXhCeXRlc1RvUmVhZCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX1JFQUQsXG4gICAgICBwb3J0SWQsXG4gICAgICBtYXhCeXRlc1RvUmVhZCxcbiAgICAgIGhhbmRsZXJcbiAgICB9KTtcbiAgfVxuXG4gIHNlcmlhbFN0b3AocG9ydElkKSB7XG4gICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX1NUT1AsXG4gICAgICBwb3J0SWRcbiAgICB9KTtcbiAgfVxuXG4gIHNlcmlhbENsb3NlKHBvcnRJZCkge1xuICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgdHlwZTogU0VSSUFMX0FDVElPTl9DTE9TRSxcbiAgICAgIHBvcnRJZFxuICAgIH0pO1xuICB9XG5cbiAgc2VyaWFsRmx1c2gocG9ydElkKSB7XG4gICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX0ZMVVNILFxuICAgICAgcG9ydElkXG4gICAgfSk7XG4gIH1cblxuICBbYWRkVG9TZXJpYWxRdWV1ZV0oYWN0aW9uKSB7XG4gICAgaWYgKGFjdGlvbi5wb3J0SWQgIT09IERFRkFVTFRfUE9SVCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHNlcmlhbCBwb3J0IFwiJHtwb3J0SWR9XCJgKTtcbiAgICB9XG4gICAgdGhpc1tzZXJpYWxRdWV1ZV0ucHVzaChhY3Rpb24pO1xuICAgIHRoaXNbc2VyaWFsUHVtcF0oKTtcbiAgfVxuXG4gIFtzZXJpYWxQdW1wXSgpIHtcbiAgICBpZiAodGhpc1tpc1NlcmlhbFByb2Nlc3NpbmddIHx8ICF0aGlzW3NlcmlhbFF1ZXVlXS5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpc1tpc1NlcmlhbFByb2Nlc3NpbmddID0gdHJ1ZTtcbiAgICBjb25zdCBhY3Rpb24gPSB0aGlzW3NlcmlhbFF1ZXVlXS5zaGlmdCgpO1xuICAgIGNvbnN0IGZpbmFsaXplID0gKCkgPT4ge1xuICAgICAgdGhpc1tpc1NlcmlhbFByb2Nlc3NpbmddID0gZmFsc2U7XG4gICAgICB0aGlzW3NlcmlhbFB1bXBdKCk7XG4gICAgfTtcbiAgICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fV1JJVEU6XG4gICAgICAgIGlmICghdGhpc1tpc1NlcmlhbE9wZW5dKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgd3JpdGUgdG8gY2xvc2VkIHNlcmlhbCBwb3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpc1tzZXJpYWxdLndyaXRlKGFjdGlvbi5pbkJ5dGVzLCBmaW5hbGl6ZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fUkVBRDpcbiAgICAgICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCByZWFkIGZyb20gY2xvc2VkIHNlcmlhbCBwb3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETzogYWRkIHN1cHBvcnQgZm9yIGFjdGlvbi5tYXhCeXRlc1RvUmVhZFxuICAgICAgICB0aGlzW3NlcmlhbF0ub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgIGFjdGlvbi5oYW5kbGVyKGJ1ZmZlclRvQXJyYXkoZGF0YSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmaW5hbGl6ZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fU1RPUDpcbiAgICAgICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzdG9wIGNsb3NlZCBzZXJpYWwgcG9ydCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXNbc2VyaWFsXS5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmaW5hbGl6ZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFNFUklBTF9BQ1RJT05fQ09ORklHOlxuICAgICAgICB0aGlzW3NlcmlhbF0uY2xvc2UoKCkgPT4ge1xuICAgICAgICAgIHRoaXNbc2VyaWFsXSA9IG5ldyBTZXJpYWwoe1xuICAgICAgICAgICAgYmF1ZFJhdGU6IGFjdGlvbi5iYXVkXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpc1tzZXJpYWxdLm9wZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpc1tzZXJpYWxdLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5lbWl0KGBzZXJpYWwtZGF0YS0ke2FjdGlvbi5wb3J0SWR9YCwgYnVmZmVyVG9BcnJheShkYXRhKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXNbaXNTZXJpYWxPcGVuXSA9IHRydWU7XG4gICAgICAgICAgICBmaW5hbGl6ZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9DTE9TRTpcbiAgICAgICAgdGhpc1tzZXJpYWxdLmNsb3NlKCgpID0+IHtcbiAgICAgICAgICB0aGlzW2lzU2VyaWFsT3Blbl0gPSBmYWxzZTtcbiAgICAgICAgICBmaW5hbGl6ZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9GTFVTSDpcbiAgICAgICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmbHVzaCBjbG9zZWQgc2VyaWFsIHBvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzW3NlcmlhbF0uZmx1c2goZmluYWxpemUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnRlcm5hbCBlcnJvcjogdW5rbm93biBzZXJpYWwgYWN0aW9uIHR5cGUnKTtcbiAgICB9XG4gIH1cblxuICBzZW5kT25lV2lyZUNvbmZpZygpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlQ29uZmlnIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVTZWFyY2goKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVNlYXJjaCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlQWxhcm1zU2VhcmNoKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVBbGFybXNTZWFyY2ggaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVJlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlc2V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVDb25maWcgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVXcml0ZSBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlRGVsYXkoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZURlbGF5IGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNldFNhbXBsaW5nSW50ZXJ2YWwoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRTYW1wbGluZ0ludGVydmFsIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHJlcG9ydEFuYWxvZ1BpbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlcG9ydEFuYWxvZ1BpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICByZXBvcnREaWdpdGFsUGluKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVwb3J0RGlnaXRhbFBpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBwaW5nUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3BpbmdSZWFkIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHB1bHNlSW4oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwdWxzZUluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHN0ZXBwZXJDb25maWcoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzdGVwcGVyQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHN0ZXBwZXJTdGVwKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc3RlcHBlclN0ZXAgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShSYXNwaSwgJ2lzUmFzcGJlcnJ5UGknLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIHZhbHVlOiAoKSA9PiB7XG4gICAgLy8gRGV0ZXJtaW5pbmcgaWYgYSBzeXN0ZW0gaXMgYSBSYXNwYmVycnkgUGkgaXNuJ3QgcG9zc2libGUgdGhyb3VnaFxuICAgIC8vIHRoZSBvcyBtb2R1bGUgb24gUmFzcGJpYW4sIHNvIHdlIHJlYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0gaW5zdGVhZFxuICAgIGxldCBpc1Jhc3BiZXJyeVBpID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIGlzUmFzcGJlcnJ5UGkgPSBmcy5yZWFkRmlsZVN5bmMoJy9ldGMvb3MtcmVsZWFzZScpLnRvU3RyaW5nKCkuaW5kZXhPZignUmFzcGJpYW4nKSAhPT0gLTE7XG4gICAgfSBjYXRjaCAoZSkge30vLyBTcXVhc2ggZmlsZSBub3QgZm91bmQsIGV0YyBlcnJvcnNcbiAgICByZXR1cm4gaXNSYXNwYmVycnlQaTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFzcGk7XG4iXX0=