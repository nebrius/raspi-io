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

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var Raspi = (function (_EventEmitter) {
  _inherits(Raspi, _EventEmitter);

  function Raspi() {
    var _Object$defineProperties,
        _this = this;

    _classCallCheck(this, Raspi);

    _get(Object.getPrototypeOf(Raspi.prototype), 'constructor', this).call(this);

    Object.defineProperties(this, (_Object$defineProperties = {
      name: {
        enumerable: true,
        value: 'RaspberryPi-IO'
      }

    }, _defineProperty(_Object$defineProperties, instances, {
      writable: true,
      value: []
    }), _defineProperty(_Object$defineProperties, isReady, {
      writable: true,
      value: false
    }), _defineProperty(_Object$defineProperties, 'isReady', {
      enumerable: true,
      get: function get() {
        return this[isReady];
      }
    }), _defineProperty(_Object$defineProperties, pins, {
      writable: true,
      value: []
    }), _defineProperty(_Object$defineProperties, 'pins', {
      enumerable: true,
      get: function get() {
        return this[pins];
      }
    }), _defineProperty(_Object$defineProperties, analogPins, {
      writable: true,
      value: []
    }), _defineProperty(_Object$defineProperties, 'analogPins', {
      enumerable: true,
      get: function get() {
        return this[analogPins];
      }
    }), _defineProperty(_Object$defineProperties, i2c, {
      writable: true,
      value: new _raspiI2c.I2C()
    }), _defineProperty(_Object$defineProperties, i2cDelay, {
      writable: true,
      value: 0
    }), _defineProperty(_Object$defineProperties, serial, {
      writable: true,
      value: new _raspiSerial.Serial()
    }), _defineProperty(_Object$defineProperties, serialQueue, {
      value: []
    }), _defineProperty(_Object$defineProperties, isSerialProcessing, {
      writable: true,
      value: false
    }), _defineProperty(_Object$defineProperties, isSerialOpen, {
      writable: true,
      value: false
    }), _defineProperty(_Object$defineProperties, 'MODES', {
      enumerable: true,
      value: Object.freeze({
        INPUT: INPUT_MODE,
        OUTPUT: OUTPUT_MODE,
        ANALOG: ANALOG_MODE,
        PWM: PWM_MODE,
        SERVO: SERVO_MODE
      })
    }), _defineProperty(_Object$defineProperties, 'HIGH', {
      enumerable: true,
      value: HIGH
    }), _defineProperty(_Object$defineProperties, 'LOW', {
      enumerable: true,
      value: LOW
    }), _defineProperty(_Object$defineProperties, 'defaultLed', {
      enumerable: true,
      value: LED_PIN
    }), _defineProperty(_Object$defineProperties, 'SERIAL_PORT_IDs', {
      enumerable: true,
      value: Object.freeze({
        HW_SERIAL0: _raspiSerial.DEFAULT_PORT,
        DEFAULT: _raspiSerial.DEFAULT_PORT
      })
    }), _Object$defineProperties));

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
        var value = undefined;
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
      if (typeof config !== 'object') {
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
      var delay = undefined;

      if (typeof options === 'number') {
        delay = options;
      } else {
        if (typeof options === 'object' && options !== null) {
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
})(_events.EventEmitter);

Object.defineProperty(Raspi, 'isRaspberryPi', {
  enumerable: true,
  value: function value() {
    // Determining if a system is a Raspberry Pi isn't possible through
    // the os module on Raspbian, so we read it from the file system instead
    var isRaspberryPi = false;
    try {
      isRaspberryPi = _fs2['default'].readFileSync('/etc/os-release').toString().indexOf('Raspbian') !== -1;
    } catch (e) {} // Squash file not found, etc errors
    return isRaspberryPi;
  }
});

module.exports = Raspi;
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxDQUFDO0tBQ2pGOzs7V0FFa0IsK0JBQUc7QUFDcEIsWUFBTSxJQUFJLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0tBQy9EOzs7V0FFYywyQkFBRztBQUNoQixZQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7S0FDM0Q7OztXQUVlLDRCQUFHO0FBQ2pCLFlBQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztLQUM1RDs7O1dBRU8sb0JBQUc7QUFDVCxZQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7S0FDcEQ7OztXQUVNLG1CQUFHO0FBQ1IsWUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0tBQ25EOzs7V0FFWSx5QkFBRztBQUNkLFlBQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztLQUN6RDs7O1dBRVUsdUJBQUc7QUFDWixZQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7S0FDdkQ7OztTQTNzQkcsS0FBSzs7O0FBOHNCWCxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxlQUFlLEVBQUU7QUFDNUMsWUFBVSxFQUFFLElBQUk7QUFDaEIsT0FBSyxFQUFFLGlCQUFNOzs7QUFHWCxRQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7QUFDMUIsUUFBSTtBQUNGLG1CQUFhLEdBQUcsZ0JBQUcsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQzFGLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtBQUNkLFdBQU8sYUFBYSxDQUFDO0dBQ3RCO0NBQ0YsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAoYykgMjAxNCBCcnlhbiBIdWdoZXMgPGJyeWFuQHRoZW9yZXRpY2FsaWRlYXRpb25zLmNvbT5cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb25cbm9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uXG5maWxlcyAodGhlICdTb2Z0d2FyZScpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0XG5yZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSxcbmNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGVcblNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nXG5jb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTXG5PRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxuTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFRcbkhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLFxuV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HXG5GUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SXG5PVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7IGluaXQgfSBmcm9tICdyYXNwaSc7XG5pbXBvcnQgeyBnZXRQaW5zLCBnZXRQaW5OdW1iZXIgfSBmcm9tICdyYXNwaS1ib2FyZCc7XG5pbXBvcnQgeyBQVUxMX05PTkUsIFBVTExfVVAsIFBVTExfRE9XTiwgRGlnaXRhbE91dHB1dCwgRGlnaXRhbElucHV0IH0gZnJvbSAncmFzcGktZ3Bpbyc7XG5pbXBvcnQgeyBQV00gfSBmcm9tICdyYXNwaS1wd20nO1xuaW1wb3J0IHsgSTJDIH0gZnJvbSAncmFzcGktaTJjJztcbmltcG9ydCB7IExFRCB9IGZyb20gJ3Jhc3BpLWxlZCc7XG5pbXBvcnQgeyBTZXJpYWwsIERFRkFVTFRfUE9SVCB9IGZyb20gJ3Jhc3BpLXNlcmlhbCc7XG5cbi8vIENvbnN0YW50c1xuY29uc3QgSU5QVVRfTU9ERSA9IDA7XG5jb25zdCBPVVRQVVRfTU9ERSA9IDE7XG5jb25zdCBBTkFMT0dfTU9ERSA9IDI7XG5jb25zdCBQV01fTU9ERSA9IDM7XG5jb25zdCBTRVJWT19NT0RFID0gNDtcbmNvbnN0IFVOS05PV05fTU9ERSA9IDk5O1xuXG5jb25zdCBMT1cgPSAwO1xuY29uc3QgSElHSCA9IDE7XG5cbmNvbnN0IExFRF9QSU4gPSAtMTtcblxuLy8gU2V0dGluZ3NcbmNvbnN0IERFRkFVTFRfU0VSVk9fTUlOID0gMTAwMDtcbmNvbnN0IERFRkFVTFRfU0VSVk9fTUFYID0gMjAwMDtcbmNvbnN0IERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSA9IDE5O1xuXG4vLyBQcml2YXRlIHN5bWJvbHNcbmNvbnN0IGlzUmVhZHkgPSBTeW1ib2woJ2lzUmVhZHknKTtcbmNvbnN0IHBpbnMgPSBTeW1ib2woJ3BpbnMnKTtcbmNvbnN0IGluc3RhbmNlcyA9IFN5bWJvbCgnaW5zdGFuY2VzJyk7XG5jb25zdCBhbmFsb2dQaW5zID0gU3ltYm9sKCdhbmFsb2dQaW5zJyk7XG5jb25zdCBnZXRQaW5JbnN0YW5jZSA9IFN5bWJvbCgnZ2V0UGluSW5zdGFuY2UnKTtcbmNvbnN0IGkyYyA9IFN5bWJvbCgnaTJjJyk7XG5jb25zdCBpMmNEZWxheSA9IFN5bWJvbCgnaTJjRGVsYXknKTtcbmNvbnN0IGkyY1JlYWQgPSBTeW1ib2woJ2kyY1JlYWQnKTtcbmNvbnN0IGkyY0NoZWNrQWxpdmUgPSBTeW1ib2woJ2kyY0NoZWNrQWxpdmUnKTtcbmNvbnN0IHBpbk1vZGUgPSBTeW1ib2woJ3Bpbk1vZGUnKTtcbmNvbnN0IHNlcmlhbCA9IFN5bWJvbCgnc2VyaWFsJyk7XG5jb25zdCBzZXJpYWxRdWV1ZSA9IFN5bWJvbCgnc2VyaWFsUXVldWUnKTtcbmNvbnN0IGFkZFRvU2VyaWFsUXVldWUgPSBTeW1ib2woJ2FkZFRvU2VyaWFsUXVldWUnKTtcbmNvbnN0IHNlcmlhbFB1bXAgPSBTeW1ib2woJ3NlcmlhbFB1bXAnKTtcbmNvbnN0IGlzU2VyaWFsUHJvY2Vzc2luZyA9IFN5bWJvbCgnaXNTZXJpYWxQcm9jZXNzaW5nJyk7XG5jb25zdCBpc1NlcmlhbE9wZW4gPSBTeW1ib2woJ2lzU2VyaWFsT3BlbicpO1xuXG5jb25zdCBTRVJJQUxfQUNUSU9OX1dSSVRFID0gJ1NFUklBTF9BQ1RJT05fV1JJVEUnO1xuY29uc3QgU0VSSUFMX0FDVElPTl9DTE9TRSA9ICdTRVJJQUxfQUNUSU9OX0NMT1NFJztcbmNvbnN0IFNFUklBTF9BQ1RJT05fRkxVU0ggPSAnU0VSSUFMX0FDVElPTl9GTFVTSCc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX0NPTkZJRyA9ICdTRVJJQUxfQUNUSU9OX0NPTkZJRyc7XG5jb25zdCBTRVJJQUxfQUNUSU9OX1JFQUQgPSAnU0VSSUFMX0FDVElPTl9SRUFEJztcbmNvbnN0IFNFUklBTF9BQ1RJT05fU1RPUCA9ICdTRVJJQUxfQUNUSU9OX1NUT1AnO1xuXG5mdW5jdGlvbiBidWZmZXJUb0FycmF5KGJ1ZmZlcikge1xuICBjb25zdCBhcnJheSA9IEFycmF5KGJ1ZmZlci5sZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGJ1ZmZlci5sZW5ndGg7IGkrKykge1xuICAgIGFycmF5W2ldID0gYnVmZmVyW2ldO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuY2xhc3MgUmFzcGkgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICBuYW1lOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiAnUmFzcGJlcnJ5UGktSU8nXG4gICAgICB9LFxuXG4gICAgICBbaW5zdGFuY2VzXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuXG4gICAgICBbaXNSZWFkeV06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIGlzUmVhZHk6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW2lzUmVhZHldO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBbcGluc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcbiAgICAgIHBpbnM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW3BpbnNdO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBbYW5hbG9nUGluc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcbiAgICAgIGFuYWxvZ1BpbnM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW2FuYWxvZ1BpbnNdO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBbaTJjXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IG5ldyBJMkMoKVxuICAgICAgfSxcblxuICAgICAgW2kyY0RlbGF5XToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IDBcbiAgICAgIH0sXG5cbiAgICAgIFtzZXJpYWxdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogbmV3IFNlcmlhbCgpXG4gICAgICB9LFxuXG4gICAgICBbc2VyaWFsUXVldWVdOiB7XG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcblxuICAgICAgW2lzU2VyaWFsUHJvY2Vzc2luZ106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgfSxcblxuICAgICAgW2lzU2VyaWFsT3Blbl06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgfSxcblxuICAgICAgTU9ERVM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgIElOUFVUOiBJTlBVVF9NT0RFLFxuICAgICAgICAgIE9VVFBVVDogT1VUUFVUX01PREUsXG4gICAgICAgICAgQU5BTE9HOiBBTkFMT0dfTU9ERSxcbiAgICAgICAgICBQV006IFBXTV9NT0RFLFxuICAgICAgICAgIFNFUlZPOiBTRVJWT19NT0RFXG4gICAgICAgIH0pXG4gICAgICB9LFxuXG4gICAgICBISUdIOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBISUdIXG4gICAgICB9LFxuICAgICAgTE9XOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBMT1dcbiAgICAgIH0sXG5cbiAgICAgIGRlZmF1bHRMZWQ6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IExFRF9QSU5cbiAgICAgIH0sXG5cbiAgICAgIFNFUklBTF9QT1JUX0lEczoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgSFdfU0VSSUFMMDogREVGQVVMVF9QT1JULFxuICAgICAgICAgIERFRkFVTFQ6IERFRkFVTFRfUE9SVFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaW5pdCgoKSA9PiB7XG4gICAgICBjb25zdCBwaW5NYXBwaW5ncyA9IGdldFBpbnMoKTtcbiAgICAgIHRoaXNbcGluc10gPSBbXTtcblxuICAgICAgLy8gU2xpZ2h0IGhhY2sgdG8gZ2V0IHRoZSBMRUQgaW4gdGhlcmUsIHNpbmNlIGl0J3Mgbm90IGFjdHVhbGx5IGEgcGluXG4gICAgICBwaW5NYXBwaW5nc1tMRURfUElOXSA9IHtcbiAgICAgICAgcGluczogWyBMRURfUElOIF0sXG4gICAgICAgIHBlcmlwaGVyYWxzOiBbICdncGlvJyBdXG4gICAgICB9O1xuXG4gICAgICBPYmplY3Qua2V5cyhwaW5NYXBwaW5ncykuZm9yRWFjaCgocGluKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbkluZm8gPSBwaW5NYXBwaW5nc1twaW5dO1xuICAgICAgICBjb25zdCBzdXBwb3J0ZWRNb2RlcyA9IFtdO1xuICAgICAgICAvLyBXZSBkb24ndCB3YW50IEkyQyB0byBiZSB1c2VkIGZvciBhbnl0aGluZyBlbHNlLCBzaW5jZSBjaGFuZ2luZyB0aGVcbiAgICAgICAgLy8gcGluIG1vZGUgbWFrZXMgaXQgdW5hYmxlIHRvIGV2ZXIgZG8gSTJDIGFnYWluLlxuICAgICAgICBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdpMmMnKSA9PSAtMSAmJiBwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ3VhcnQnKSA9PSAtMSkge1xuICAgICAgICAgIGlmIChwaW4gPT0gTEVEX1BJTikge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChPVVRQVVRfTU9ERSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ2dwaW8nKSAhPSAtMSkge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChJTlBVVF9NT0RFLCBPVVRQVVRfTU9ERSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ3B3bScpICE9IC0xKSB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlcy5wdXNoKFBXTV9NT0RFLCBTRVJWT19NT0RFKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXSA9IHtcbiAgICAgICAgICBwZXJpcGhlcmFsOiBudWxsLFxuICAgICAgICAgIG1vZGU6IHN1cHBvcnRlZE1vZGVzLmluZGV4T2YoT1VUUFVUX01PREUpID09IC0xID8gVU5LTk9XTl9NT0RFIDogT1VUUFVUX01PREUsXG5cbiAgICAgICAgICAvLyBVc2VkIHRvIGNhY2hlIHRoZSBwcmV2aW91c2x5IHdyaXR0ZW4gdmFsdWUgZm9yIHJlYWRpbmcgYmFjayBpbiBPVVRQVVQgbW9kZVxuICAgICAgICAgIHByZXZpb3VzV3JpdHRlblZhbHVlOiBMT1csXG5cbiAgICAgICAgICAvLyBVc2VkIHRvIHNldCB0aGUgZGVmYXVsdCBtaW4gYW5kIG1heCB2YWx1ZXNcbiAgICAgICAgICBtaW46IERFRkFVTFRfU0VSVk9fTUlOLFxuICAgICAgICAgIG1heDogREVGQVVMVF9TRVJWT19NQVhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpc1twaW5zXVtwaW5dID0gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgICAgc3VwcG9ydGVkTW9kZXM6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZShzdXBwb3J0ZWRNb2RlcylcbiAgICAgICAgICB9LFxuICAgICAgICAgIG1vZGU6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5tb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHN3aXRjaCAoaW5zdGFuY2UubW9kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgICAgICAgICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UubW9kZSA9PSBPVVRQVVRfTU9ERSkge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUodmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZXBvcnQ6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgYW5hbG9nQ2hhbm5lbDoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiAxMjdcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaW5zdGFuY2UubW9kZSA9PSBPVVRQVVRfTU9ERSkge1xuICAgICAgICAgIHRoaXMucGluTW9kZShwaW4sIE9VVFBVVF9NT0RFKTtcbiAgICAgICAgICB0aGlzLmRpZ2l0YWxXcml0ZShwaW4sIExPVyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBGaWxsIGluIHRoZSBob2xlcywgc2lucyBwaW5zIGFyZSBzcGFyc2Ugb24gdGhlIEErL0IrLzJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpc1twaW5zXS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXRoaXNbcGluc11baV0pIHtcbiAgICAgICAgICB0aGlzW3BpbnNdW2ldID0gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlczoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZShbXSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb2RlOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVU5LTk9XTl9NT0RFO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBzZXQoKSB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcG9ydDoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFuYWxvZ0NoYW5uZWw6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IDEyN1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2VyaWFsQ29uZmlnKHtcbiAgICAgICAgcG9ydElkOiBERUZBVUxUX1BPUlQsXG4gICAgICAgIGJhdWQ6IDk2MDBcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzW2lzUmVhZHldID0gdHJ1ZTtcbiAgICAgIHRoaXMuZW1pdCgncmVhZHknKTtcbiAgICAgIHRoaXMuZW1pdCgnY29ubmVjdCcpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZXNldCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIG5vcm1hbGl6ZShwaW4pIHtcbiAgICBjb25zdCBub3JtYWxpemVkUGluID0gZ2V0UGluTnVtYmVyKHBpbik7XG4gICAgaWYgKHR5cGVvZiBub3JtYWxpemVkUGluID09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcGluIFwiJyArIHBpbiArICdcIicpO1xuICAgIH1cbiAgICByZXR1cm4gbm9ybWFsaXplZFBpbjtcbiAgfVxuXG4gIFtnZXRQaW5JbnN0YW5jZV0ocGluKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXTtcbiAgICBpZiAoIXBpbkluc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcGluIFwiJyArIHBpbiArICdcIicpO1xuICAgIH1cbiAgICByZXR1cm4gcGluSW5zdGFuY2U7XG4gIH1cblxuICBwaW5Nb2RlKHBpbiwgbW9kZSkge1xuICAgIHRoaXNbcGluTW9kZV0oeyBwaW4sIG1vZGUgfSk7XG4gIH1cblxuICBbcGluTW9kZV0oeyBwaW4sIG1vZGUsIHB1bGxSZXNpc3RvciA9IFBVTExfTk9ORSB9KSB7XG4gICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IHRoaXMubm9ybWFsaXplKHBpbik7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXShub3JtYWxpemVkUGluKTtcbiAgICBwaW5JbnN0YW5jZS5wdWxsUmVzaXN0b3IgPSBwdWxsUmVzaXN0b3I7XG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgcGluOiBub3JtYWxpemVkUGluLFxuICAgICAgcHVsbFJlc2lzdG9yOiBwaW5JbnN0YW5jZS5wdWxsUmVzaXN0b3JcbiAgICB9O1xuICAgIGlmICh0aGlzW3BpbnNdW25vcm1hbGl6ZWRQaW5dLnN1cHBvcnRlZE1vZGVzLmluZGV4T2YobW9kZSkgPT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGluIFwiJyArIHBpbiArICdcIiBkb2VzIG5vdCBzdXBwb3J0IG1vZGUgXCInICsgbW9kZSArICdcIicpO1xuICAgIH1cbiAgICBpZiAocGluID09IExFRF9QSU4gJiYgIShwaW5JbnN0YW5jZS5wZXJpcGhlcmFsIGluc3RhbmNlb2YgTEVEKSkge1xuICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBMRUQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3dpdGNoIChtb2RlKSB7XG4gICAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IERpZ2l0YWxJbnB1dChjb25maWcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbE91dHB1dChjb25maWcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFBXTV9NT0RFOlxuICAgICAgICBjYXNlIFNFUlZPX01PREU6XG4gICAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBQV00obm9ybWFsaXplZFBpbik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS53YXJuKCdVbmtub3duIHBpbiBtb2RlOiAnICsgbW9kZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLm1vZGUgPSBtb2RlO1xuICB9XG5cbiAgYW5hbG9nUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2FuYWxvZ1JlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBhbmFsb2dXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgdGhpcy5wd21Xcml0ZShwaW4sIHZhbHVlKTtcbiAgfVxuXG4gIHB3bVdyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFBXTV9NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBQV01fTU9ERSk7XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUoTWF0aC5yb3VuZCh2YWx1ZSAqIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwucmFuZ2UgLyAyNTUpKTtcbiAgfVxuXG4gIGRpZ2l0YWxSZWFkKHBpbiwgaGFuZGxlcikge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gSU5QVVRfTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgSU5QVVRfTU9ERSk7XG4gICAgfVxuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgbGV0IHZhbHVlO1xuICAgICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgPT0gSU5QVVRfTU9ERSkge1xuICAgICAgICB2YWx1ZSA9IHBpbkluc3RhbmNlLnBlcmlwaGVyYWwucmVhZCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgIGhhbmRsZXIodmFsdWUpO1xuICAgICAgfVxuICAgICAgdGhpcy5lbWl0KCdkaWdpdGFsLXJlYWQtJyArIHBpbiwgdmFsdWUpO1xuICAgIH0sIERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSk7XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC5vbignZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgfSk7XG4gIH1cblxuICBkaWdpdGFsV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgPT09IElOUFVUX01PREUgJiYgdmFsdWUgPT09IEhJR0gpIHtcbiAgICAgIHRoaXNbcGluTW9kZV0oeyBwaW4sIG1vZGU6IElOUFVUX01PREUsIHB1bGxSZXNpc3RvcjogUFVMTF9VUCB9KTtcbiAgICB9IGVsc2UgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gT1VUUFVUX01PREUpIHtcbiAgICAgIHRoaXNbcGluTW9kZV0oeyBwaW4sIG1vZGU6IE9VVFBVVF9NT0RFIH0pO1xuICAgIH1cbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSA9PT0gT1VUUFVUX01PREUgJiYgdmFsdWUgIT0gcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWUpIHtcbiAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUodmFsdWUgPyBISUdIIDogTE9XKTtcbiAgICAgIHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgc2Vydm9Db25maWcocGluLCBtaW4sIG1heCkge1xuICAgIGxldCBjb25maWcgPSBwaW47XG4gICAgaWYgKHR5cGVvZiBjb25maWcgIT09ICdvYmplY3QnKSB7XG4gICAgICBjb25maWcgPSB7IHBpbiwgbWluLCBtYXggfTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb25maWcubWluICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uZmlnLm1pbiA9IERFRkFVTFRfU0VSVk9fTUlOO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNvbmZpZy5tYXggIT09ICdudW1iZXInKSB7XG4gICAgICBjb25maWcubWF4ID0gREVGQVVMVF9TRVJWT19NQVg7XG4gICAgfVxuICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSB0aGlzLm5vcm1hbGl6ZShwaW4pO1xuICAgIHRoaXNbcGluTW9kZV0oe1xuICAgICAgcGluOiBub3JtYWxpemVkUGluLFxuICAgICAgbW9kZTogU0VSVk9fTU9ERVxuICAgIH0pO1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUobm9ybWFsaXplZFBpbikpO1xuICAgIHBpbkluc3RhbmNlLm1pbiA9IGNvbmZpZy5taW47XG4gICAgcGluSW5zdGFuY2UubWF4ID0gY29uZmlnLm1heDtcbiAgfVxuXG4gIHNlcnZvV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gU0VSVk9fTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgU0VSVk9fTU9ERSk7XG4gICAgfVxuICAgIGNvbnN0IGR1dHlDeWNsZSA9IChwaW5JbnN0YW5jZS5taW4gKyAodmFsdWUgLyAxODApICogKHBpbkluc3RhbmNlLm1heCAtIHBpbkluc3RhbmNlLm1pbikpIC8gMjAwMDA7XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZShkdXR5Q3ljbGUgKiBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJhbmdlKTtcbiAgfVxuXG4gIHF1ZXJ5Q2FwYWJpbGl0aWVzKGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHF1ZXJ5QW5hbG9nTWFwcGluZyhjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBxdWVyeVBpblN0YXRlKHBpbiwgY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgW2kyY0NoZWNrQWxpdmVdKCkge1xuICAgIGlmICghdGhpc1tpMmNdLmFsaXZlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0kyQyBwaW5zIG5vdCBpbiBJMkMgbW9kZScpO1xuICAgIH1cbiAgfVxuXG4gIGkyY0NvbmZpZyhvcHRpb25zKSB7XG4gICAgbGV0IGRlbGF5O1xuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnbnVtYmVyJykge1xuICAgICAgZGVsYXkgPSBvcHRpb25zO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIG9wdGlvbnMgIT09IG51bGwpIHtcbiAgICAgICAgZGVsYXkgPSBvcHRpb25zLmRlbGF5O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIHRoaXNbaTJjRGVsYXldID0gZGVsYXkgfHwgMDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaTJjV3JpdGUoYWRkcmVzcywgY21kUmVnT3JEYXRhLCBpbkJ5dGVzKSB7XG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgLy8gSWYgaTJjV3JpdGUgd2FzIHVzZWQgZm9yIGFuIGkyY1dyaXRlUmVnIGNhbGwuLi5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMyAmJlxuICAgICAgICAhQXJyYXkuaXNBcnJheShjbWRSZWdPckRhdGEpICYmXG4gICAgICAgICFBcnJheS5pc0FycmF5KGluQnl0ZXMpKSB7XG4gICAgICByZXR1cm4gdGhpcy5pMmNXcml0ZVJlZyhhZGRyZXNzLCBjbWRSZWdPckRhdGEsIGluQnl0ZXMpO1xuICAgIH1cblxuICAgIC8vIEZpeCBhcmd1bWVudHMgaWYgY2FsbGVkIHdpdGggRmlybWF0YS5qcyBBUElcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY21kUmVnT3JEYXRhKSkge1xuICAgICAgICBpbkJ5dGVzID0gY21kUmVnT3JEYXRhLnNsaWNlKCk7XG4gICAgICAgIGNtZFJlZ09yRGF0YSA9IGluQnl0ZXMuc2hpZnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluQnl0ZXMgPSBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKFtjbWRSZWdPckRhdGFdLmNvbmNhdChpbkJ5dGVzKSk7XG5cbiAgICAvLyBPbmx5IHdyaXRlIGlmIGJ5dGVzIHByb3ZpZGVkXG4gICAgaWYgKGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgIHRoaXNbaTJjXS53cml0ZVN5bmMoYWRkcmVzcywgYnVmZmVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGkyY1dyaXRlUmVnKGFkZHJlc3MsIHJlZ2lzdGVyLCB2YWx1ZSkge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIHRoaXNbaTJjXS53cml0ZUJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCB2YWx1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIFtpMmNSZWFkXShjb250aW51b3VzLCBhZGRyZXNzLCByZWdpc3RlciwgYnl0ZXNUb1JlYWQsIGNhbGxiYWNrKSB7XG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgLy8gRml4IGFyZ3VtZW50cyBpZiBjYWxsZWQgd2l0aCBGaXJtYXRhLmpzIEFQSVxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDQgJiZcbiAgICAgIHR5cGVvZiByZWdpc3RlciA9PSAnbnVtYmVyJyAmJlxuICAgICAgdHlwZW9mIGJ5dGVzVG9SZWFkID09ICdmdW5jdGlvbidcbiAgICApIHtcbiAgICAgIGNhbGxiYWNrID0gYnl0ZXNUb1JlYWQ7XG4gICAgICBieXRlc1RvUmVhZCA9IHJlZ2lzdGVyO1xuICAgICAgcmVnaXN0ZXIgPSBudWxsO1xuICAgIH1cblxuICAgIGNhbGxiYWNrID0gdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nID8gY2FsbGJhY2sgOiAoKSA9PiB7fTtcblxuICAgIGxldCBldmVudCA9ICdJMkMtcmVwbHknICsgYWRkcmVzcyArICctJztcbiAgICBldmVudCArPSByZWdpc3RlciAhPT0gbnVsbCA/IHJlZ2lzdGVyIDogMDtcblxuICAgIGNvbnN0IHJlYWQgPSAoKSA9PiB7XG4gICAgICBjb25zdCBhZnRlclJlYWQgPSAoZXJyLCBidWZmZXIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnZlcnQgYnVmZmVyIHRvIEFycmF5IGJlZm9yZSBlbWl0XG4gICAgICAgIHRoaXMuZW1pdChldmVudCwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYnVmZmVyKSk7XG5cbiAgICAgICAgaWYgKGNvbnRpbnVvdXMpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KHJlYWQsIHRoaXNbaTJjRGVsYXldKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdGhpcy5vbmNlKGV2ZW50LCBjYWxsYmFjayk7XG5cbiAgICAgIGlmIChyZWdpc3RlciAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzW2kyY10ucmVhZChhZGRyZXNzLCByZWdpc3RlciwgYnl0ZXNUb1JlYWQsIGFmdGVyUmVhZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzW2kyY10ucmVhZChhZGRyZXNzLCBieXRlc1RvUmVhZCwgYWZ0ZXJSZWFkKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc2V0VGltZW91dChyZWFkLCB0aGlzW2kyY0RlbGF5XSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGkyY1JlYWQoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzW2kyY1JlYWRdKHRydWUsIC4uLnJlc3QpO1xuICB9XG5cbiAgaTJjUmVhZE9uY2UoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzW2kyY1JlYWRdKGZhbHNlLCAuLi5yZXN0KTtcbiAgfVxuXG4gIHNlbmRJMkNDb25maWcoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzLmkyY0NvbmZpZyguLi5yZXN0KTtcbiAgfVxuXG4gIHNlbmRJMkNXcml0ZVJlcXVlc3QoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzLmkyY1dyaXRlKC4uLnJlc3QpO1xuICB9XG5cbiAgc2VuZEkyQ1JlYWRSZXF1ZXN0KC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNSZWFkT25jZSguLi5yZXN0KTtcbiAgfVxuXG4gIHNlcmlhbENvbmZpZyh7IHBvcnRJZCwgYmF1ZCB9KSB7XG4gICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0gfHwgKGJhdWQgJiYgYmF1ZCAhPT0gdGhpc1tzZXJpYWxdLmJhdWRSYXRlKSkge1xuICAgICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fQ09ORklHLFxuICAgICAgICBwb3J0SWQsXG4gICAgICAgIGJhdWRcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNlcmlhbFdyaXRlKHBvcnRJZCwgaW5CeXRlcykge1xuICAgIHRoaXNbYWRkVG9TZXJpYWxRdWV1ZV0oe1xuICAgICAgdHlwZTogU0VSSUFMX0FDVElPTl9XUklURSxcbiAgICAgIHBvcnRJZCxcbiAgICAgIGluQnl0ZXNcbiAgICB9KTtcbiAgfVxuXG4gIHNlcmlhbFJlYWQocG9ydElkLCBtYXhCeXRlc1RvUmVhZCwgaGFuZGxlcikge1xuICAgIGlmICh0eXBlb2YgbWF4Qnl0ZXNUb1JlYWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGhhbmRsZXIgPSBtYXhCeXRlc1RvUmVhZDtcbiAgICAgIG1heEJ5dGVzVG9SZWFkID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fUkVBRCxcbiAgICAgIHBvcnRJZCxcbiAgICAgIG1heEJ5dGVzVG9SZWFkLFxuICAgICAgaGFuZGxlclxuICAgIH0pO1xuICB9XG5cbiAgc2VyaWFsU3RvcChwb3J0SWQpIHtcbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fU1RPUCxcbiAgICAgIHBvcnRJZFxuICAgIH0pO1xuICB9XG5cbiAgc2VyaWFsQ2xvc2UocG9ydElkKSB7XG4gICAgdGhpc1thZGRUb1NlcmlhbFF1ZXVlXSh7XG4gICAgICB0eXBlOiBTRVJJQUxfQUNUSU9OX0NMT1NFLFxuICAgICAgcG9ydElkXG4gICAgfSk7XG4gIH1cblxuICBzZXJpYWxGbHVzaChwb3J0SWQpIHtcbiAgICB0aGlzW2FkZFRvU2VyaWFsUXVldWVdKHtcbiAgICAgIHR5cGU6IFNFUklBTF9BQ1RJT05fRkxVU0gsXG4gICAgICBwb3J0SWRcbiAgICB9KTtcbiAgfVxuXG4gIFthZGRUb1NlcmlhbFF1ZXVlXShhY3Rpb24pIHtcbiAgICBpZiAoYWN0aW9uLnBvcnRJZCAhPT0gREVGQVVMVF9QT1JUKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgc2VyaWFsIHBvcnQgXCIke3BvcnRJZH1cImApO1xuICAgIH1cbiAgICB0aGlzW3NlcmlhbFF1ZXVlXS5wdXNoKGFjdGlvbik7XG4gICAgdGhpc1tzZXJpYWxQdW1wXSgpO1xuICB9XG5cbiAgW3NlcmlhbFB1bXBdKCkge1xuICAgIGlmICh0aGlzW2lzU2VyaWFsUHJvY2Vzc2luZ10gfHwgIXRoaXNbc2VyaWFsUXVldWVdLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzW2lzU2VyaWFsUHJvY2Vzc2luZ10gPSB0cnVlO1xuICAgIGNvbnN0IGFjdGlvbiA9IHRoaXNbc2VyaWFsUXVldWVdLnNoaWZ0KCk7XG4gICAgY29uc3QgZmluYWxpemUgPSAoKSA9PiB7XG4gICAgICB0aGlzW2lzU2VyaWFsUHJvY2Vzc2luZ10gPSBmYWxzZTtcbiAgICAgIHRoaXNbc2VyaWFsUHVtcF0oKTtcbiAgICB9O1xuICAgIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9XUklURTpcbiAgICAgICAgaWYgKCF0aGlzW2lzU2VyaWFsT3Blbl0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCB3cml0ZSB0byBjbG9zZWQgc2VyaWFsIHBvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzW3NlcmlhbF0ud3JpdGUoYWN0aW9uLmluQnl0ZXMsIGZpbmFsaXplKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9SRUFEOlxuICAgICAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHJlYWQgZnJvbSBjbG9zZWQgc2VyaWFsIHBvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPOiBhZGQgc3VwcG9ydCBmb3IgYWN0aW9uLm1heEJ5dGVzVG9SZWFkXG4gICAgICAgIHRoaXNbc2VyaWFsXS5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgYWN0aW9uLmhhbmRsZXIoYnVmZmVyVG9BcnJheShkYXRhKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZpbmFsaXplKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9TVE9QOlxuICAgICAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHN0b3AgY2xvc2VkIHNlcmlhbCBwb3J0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpc1tzZXJpYWxdLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZpbmFsaXplKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU0VSSUFMX0FDVElPTl9DT05GSUc6XG4gICAgICAgIHRoaXNbc2VyaWFsXS5jbG9zZSgoKSA9PiB7XG4gICAgICAgICAgdGhpc1tzZXJpYWxdID0gbmV3IFNlcmlhbCh7XG4gICAgICAgICAgICBiYXVkUmF0ZTogYWN0aW9uLmJhdWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzW3NlcmlhbF0ub3BlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzW3NlcmlhbF0ub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmVtaXQoYHNlcmlhbC1kYXRhLSR7YWN0aW9uLnBvcnRJZH1gLCBidWZmZXJUb0FycmF5KGRhdGEpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpc1tpc1NlcmlhbE9wZW5dID0gdHJ1ZTtcbiAgICAgICAgICAgIGZpbmFsaXplKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX0NMT1NFOlxuICAgICAgICB0aGlzW3NlcmlhbF0uY2xvc2UoKCkgPT4ge1xuICAgICAgICAgIHRoaXNbaXNTZXJpYWxPcGVuXSA9IGZhbHNlO1xuICAgICAgICAgIGZpbmFsaXplKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTRVJJQUxfQUNUSU9OX0ZMVVNIOlxuICAgICAgICBpZiAoIXRoaXNbaXNTZXJpYWxPcGVuXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZsdXNoIGNsb3NlZCBzZXJpYWwgcG9ydCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXNbc2VyaWFsXS5mbHVzaChmaW5hbGl6ZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludGVybmFsIGVycm9yOiB1bmtub3duIHNlcmlhbCBhY3Rpb24gdHlwZScpO1xuICAgIH1cbiAgfVxuXG4gIHNlbmRPbmVXaXJlQ29uZmlnKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVDb25maWcgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVNlYXJjaCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlU2VhcmNoIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVBbGFybXNTZWFyY2goKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZUFsYXJtc1NlYXJjaCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlUmVzZXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZUNvbmZpZyBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlV3JpdGUoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVdyaXRlIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVEZWxheSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlRGVsYXkgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlV3JpdGVBbmRSZWFkIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2V0U2FtcGxpbmdJbnRlcnZhbCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFNhbXBsaW5nSW50ZXJ2YWwgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcmVwb3J0QW5hbG9nUGluKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVwb3J0QW5hbG9nUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHJlcG9ydERpZ2l0YWxQaW4oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZXBvcnREaWdpdGFsUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHBpbmdSZWFkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncGluZ1JlYWQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcHVsc2VJbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3B1bHNlSW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgc3RlcHBlckNvbmZpZygpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0ZXBwZXJDb25maWcgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgc3RlcHBlclN0ZXAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzdGVwcGVyU3RlcCBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFJhc3BpLCAnaXNSYXNwYmVycnlQaScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgdmFsdWU6ICgpID0+IHtcbiAgICAvLyBEZXRlcm1pbmluZyBpZiBhIHN5c3RlbSBpcyBhIFJhc3BiZXJyeSBQaSBpc24ndCBwb3NzaWJsZSB0aHJvdWdoXG4gICAgLy8gdGhlIG9zIG1vZHVsZSBvbiBSYXNwYmlhbiwgc28gd2UgcmVhZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbSBpbnN0ZWFkXG4gICAgbGV0IGlzUmFzcGJlcnJ5UGkgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgaXNSYXNwYmVycnlQaSA9IGZzLnJlYWRGaWxlU3luYygnL2V0Yy9vcy1yZWxlYXNlJykudG9TdHJpbmcoKS5pbmRleE9mKCdSYXNwYmlhbicpICE9PSAtMTtcbiAgICB9IGNhdGNoIChlKSB7fS8vIFNxdWFzaCBmaWxlIG5vdCBmb3VuZCwgZXRjIGVycm9yc1xuICAgIHJldHVybiBpc1Jhc3BiZXJyeVBpO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXNwaTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
