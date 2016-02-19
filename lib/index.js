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

<<<<<<< HEAD
=======
var _raspiSonar = require('raspi-sonar');

// Hacky quick Symbol polyfill, since es6-symbol refuses to install with Node 0.10 from http://node-arm.herokuapp.com/
if (typeof global.Symbol != 'function') {
  global.Symbol = function (name) {
    return '__$raspi_symbol_' + name + '_' + Math.round(Math.random() * 0xFFFFFFF) + '$__';
  };
}

>>>>>>> Added pingRead implementation.
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
<<<<<<< HEAD
    value: function pingRead() {
      throw new Error('pingRead is not yet implemented on the Raspberry Pi');
=======
    value: function pingRead(config, handler) {
      var pulseOut = config.pulseOut;
      var pin = config.pin;
      var sonar = new _raspiSonar.Sonar(config.pin);

      var pinInstance = this[getPinInstance](this.normalize(pin));
      if (pinInstance.mode != INPUT_MODE) {
        this.pinMode(pin, INPUT_MODE);
      }

      var interval = setInterval(function () {
        sonar.read(handler);
      }, pulseOut);

      pinInstance.peripheral.on('destroyed', function () {
        clearInterval(interval);
      });
>>>>>>> Added pingRead implementation.
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
<<<<<<< HEAD
//# sourceMappingURL=data:application/json;base64,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LEtBQUssQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO0tBQzNFOzs7V0FFZSw0QkFBRztBQUNqQixZQUFNLElBQUksS0FBSyxDQUFDLHVEQUF1RCxDQUFDLENBQUM7S0FDMUU7OztXQUVlLDRCQUFHO0FBQ2pCLFlBQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELENBQUMsQ0FBQztLQUMxRTs7O1dBRXNCLG1DQUFHO0FBQ3hCLFlBQU0sSUFBSSxLQUFLLENBQUMsOERBQThELENBQUMsQ0FBQztLQUNqRjs7O1dBRWtCLCtCQUFHO0FBQ3BCLFlBQU0sSUFBSSxLQUFLLENBQUMsZ0VBQWdFLENBQUMsQ0FBQztLQUNuRjs7O1dBRWMsMkJBQUc7QUFDaEIsWUFBTSxJQUFJLEtBQUssQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO0tBQy9FOzs7V0FFZSw0QkFBRztBQUNqQixZQUFNLElBQUksS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUM7S0FDaEY7OztXQUVPLG9CQUFHO0FBQ1QsWUFBTSxJQUFJLEtBQUssQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO0tBQ3hFOzs7V0FFTSxtQkFBRztBQUNSLFlBQU0sSUFBSSxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQztLQUN2RTs7O1dBRVkseUJBQUc7QUFDZCxZQUFNLElBQUksS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7S0FDN0U7OztXQUVVLHVCQUFHO0FBQ1osWUFBTSxJQUFJLEtBQUssQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO0tBQzNFOzs7U0FwakJHLEtBQUs7OztBQXVqQlgsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IChjKSAyMDE0IEJyeWFuIEh1Z2hlcyA8YnJ5YW5AdGhlb3JldGljYWxpZGVhdGlvbnMuY29tPlxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvblxub2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb25cbmZpbGVzICh0aGUgJ1NvZnR3YXJlJyksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXRcbnJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLFxuY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZVxuU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmdcbmNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG5FWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVNcbk9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXG5OT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVFxuSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksXG5XSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkdcbkZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1Jcbk9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgaW5pdCB9IGZyb20gJ3Jhc3BpJztcbmltcG9ydCB7IGdldFBpbnMsIGdldFBpbk51bWJlciB9IGZyb20gJ3Jhc3BpLWJvYXJkJztcbmltcG9ydCB7IFBVTExfTk9ORSwgUFVMTF9VUCwgUFVMTF9ET1dOLCBEaWdpdGFsT3V0cHV0LCBEaWdpdGFsSW5wdXQgfSBmcm9tICdyYXNwaS1ncGlvJztcbmltcG9ydCB7IFBXTSB9IGZyb20gJ3Jhc3BpLXB3bSc7XG5pbXBvcnQgeyBJMkMgfSBmcm9tICdyYXNwaS1pMmMnO1xuaW1wb3J0IHsgTEVEIH0gZnJvbSAncmFzcGktbGVkJztcblxuLy8gQ29uc3RhbnRzXG5jb25zdCBJTlBVVF9NT0RFID0gMDtcbmNvbnN0IE9VVFBVVF9NT0RFID0gMTtcbmNvbnN0IEFOQUxPR19NT0RFID0gMjtcbmNvbnN0IFBXTV9NT0RFID0gMztcbmNvbnN0IFNFUlZPX01PREUgPSA0O1xuY29uc3QgVU5LTk9XTl9NT0RFID0gOTk7XG5cbmNvbnN0IExPVyA9IDA7XG5jb25zdCBISUdIID0gMTtcblxuY29uc3QgTEVEX1BJTiA9IC0xO1xuXG5jb25zdCBERUZBVUxUX1NFUlZPX01JTiA9IDEwMDA7XG5jb25zdCBERUZBVUxUX1NFUlZPX01BWCA9IDIwMDA7XG5cbi8vIFNldHRpbmdzXG5jb25zdCBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUgPSAxOTtcblxuLy8gUHJpdmF0ZSBzeW1ib2xzXG5jb25zdCBpc1JlYWR5ID0gU3ltYm9sKCdpc1JlYWR5Jyk7XG5jb25zdCBwaW5zID0gU3ltYm9sKCdwaW5zJyk7XG5jb25zdCBpbnN0YW5jZXMgPSBTeW1ib2woJ2luc3RhbmNlcycpO1xuY29uc3QgYW5hbG9nUGlucyA9IFN5bWJvbCgnYW5hbG9nUGlucycpO1xuY29uc3QgZ2V0UGluSW5zdGFuY2UgPSBTeW1ib2woJ2dldFBpbkluc3RhbmNlJyk7XG5jb25zdCBpMmMgPSBTeW1ib2woJ2kyYycpO1xuY29uc3QgaTJjRGVsYXkgPSBTeW1ib2woJ2kyY0RlbGF5Jyk7XG5jb25zdCBpMmNSZWFkID0gU3ltYm9sKCdpMmNSZWFkJyk7XG5jb25zdCBpMmNDaGVja0FsaXZlID0gU3ltYm9sKCdpMmNDaGVja0FsaXZlJyk7XG5jb25zdCBwaW5Nb2RlID0gU3ltYm9sKCdwaW5Nb2RlJyk7XG5cbmNsYXNzIFJhc3BpIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgbmFtZToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogJ1Jhc3BiZXJyeVBpLUlPJ1xuICAgICAgfSxcblxuICAgICAgW2luc3RhbmNlc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcblxuICAgICAgW2lzUmVhZHldOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG4gICAgICBpc1JlYWR5OiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1tpc1JlYWR5XTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW3BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBwaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1twaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2FuYWxvZ1BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBhbmFsb2dQaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1thbmFsb2dQaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2kyY106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBuZXcgSTJDKClcbiAgICAgIH0sXG5cbiAgICAgIFtpMmNEZWxheV06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiAwXG4gICAgICB9LFxuXG4gICAgICBNT0RFUzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgSU5QVVQ6IElOUFVUX01PREUsXG4gICAgICAgICAgT1VUUFVUOiBPVVRQVVRfTU9ERSxcbiAgICAgICAgICBBTkFMT0c6IEFOQUxPR19NT0RFLFxuICAgICAgICAgIFBXTTogUFdNX01PREUsXG4gICAgICAgICAgU0VSVk86IFNFUlZPX01PREVcbiAgICAgICAgfSlcbiAgICAgIH0sXG5cbiAgICAgIEhJR0g6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IEhJR0hcbiAgICAgIH0sXG4gICAgICBMT1c6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IExPV1xuICAgICAgfSxcblxuICAgICAgZGVmYXVsdExlZDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTEVEX1BJTlxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaW5pdCgoKSA9PiB7XG4gICAgICBjb25zdCBwaW5NYXBwaW5ncyA9IGdldFBpbnMoKTtcbiAgICAgIHRoaXNbcGluc10gPSBbXTtcblxuICAgICAgLy8gU2xpZ2h0IGhhY2sgdG8gZ2V0IHRoZSBMRUQgaW4gdGhlcmUsIHNpbmNlIGl0J3Mgbm90IGFjdHVhbGx5IGEgcGluXG4gICAgICBwaW5NYXBwaW5nc1tMRURfUElOXSA9IHtcbiAgICAgICAgcGluczogWyBMRURfUElOIF0sXG4gICAgICAgIHBlcmlwaGVyYWxzOiBbICdncGlvJyBdXG4gICAgICB9O1xuXG4gICAgICBPYmplY3Qua2V5cyhwaW5NYXBwaW5ncykuZm9yRWFjaCgocGluKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbkluZm8gPSBwaW5NYXBwaW5nc1twaW5dO1xuICAgICAgICBjb25zdCBzdXBwb3J0ZWRNb2RlcyA9IFtdO1xuICAgICAgICAvLyBXZSBkb24ndCB3YW50IEkyQyB0byBiZSB1c2VkIGZvciBhbnl0aGluZyBlbHNlLCBzaW5jZSBjaGFuZ2luZyB0aGVcbiAgICAgICAgLy8gcGluIG1vZGUgbWFrZXMgaXQgdW5hYmxlIHRvIGV2ZXIgZG8gSTJDIGFnYWluLlxuICAgICAgICBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdpMmMnKSA9PSAtMSkge1xuICAgICAgICAgIGlmIChwaW4gPT0gTEVEX1BJTikge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChPVVRQVVRfTU9ERSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ2dwaW8nKSAhPSAtMSkge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChJTlBVVF9NT0RFLCBPVVRQVVRfTU9ERSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ3B3bScpICE9IC0xKSB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlcy5wdXNoKFBXTV9NT0RFLCBTRVJWT19NT0RFKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXSA9IHtcbiAgICAgICAgICBwZXJpcGhlcmFsOiBudWxsLFxuICAgICAgICAgIG1vZGU6IHN1cHBvcnRlZE1vZGVzLmluZGV4T2YoT1VUUFVUX01PREUpID09IC0xID8gVU5LTk9XTl9NT0RFIDogT1VUUFVUX01PREUsXG5cbiAgICAgICAgICAvLyBVc2VkIHRvIGNhY2hlIHRoZSBwcmV2aW91c2x5IHdyaXR0ZW4gdmFsdWUgZm9yIHJlYWRpbmcgYmFjayBpbiBPVVRQVVQgbW9kZVxuICAgICAgICAgIHByZXZpb3VzV3JpdHRlblZhbHVlOiBMT1csXG5cbiAgICAgICAgICAvLyBVc2VkIHRvIHNldCB0aGUgZGVmYXVsdCBtaW4gYW5kIG1heCB2YWx1ZXNcbiAgICAgICAgICBtaW46IERFRkFVTFRfU0VSVk9fTUlOLFxuICAgICAgICAgIG1heDogREVGQVVMVF9TRVJWT19NQVhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpc1twaW5zXVtwaW5dID0gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgICAgc3VwcG9ydGVkTW9kZXM6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZShzdXBwb3J0ZWRNb2RlcylcbiAgICAgICAgICB9LFxuICAgICAgICAgIG1vZGU6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5tb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHN3aXRjaCAoaW5zdGFuY2UubW9kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgICAgICAgICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UubW9kZSA9PSBPVVRQVVRfTU9ERSkge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUodmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZXBvcnQ6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgYW5hbG9nQ2hhbm5lbDoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiAxMjdcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaW5zdGFuY2UubW9kZSA9PSBPVVRQVVRfTU9ERSkge1xuICAgICAgICAgIHRoaXMucGluTW9kZShwaW4sIE9VVFBVVF9NT0RFKTtcbiAgICAgICAgICB0aGlzLmRpZ2l0YWxXcml0ZShwaW4sIExPVyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBGaWxsIGluIHRoZSBob2xlcywgc2lucyBwaW5zIGFyZSBzcGFyc2Ugb24gdGhlIEErL0IrLzJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpc1twaW5zXS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXRoaXNbcGluc11baV0pIHtcbiAgICAgICAgICB0aGlzW3BpbnNdW2ldID0gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlczoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZShbXSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb2RlOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVU5LTk9XTl9NT0RFO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBzZXQoKSB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcG9ydDoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFuYWxvZ0NoYW5uZWw6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IDEyN1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXNbaXNSZWFkeV0gPSB0cnVlO1xuICAgICAgdGhpcy5lbWl0KCdyZWFkeScpO1xuICAgICAgdGhpcy5lbWl0KCdjb25uZWN0Jyk7XG4gICAgfSk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Jlc2V0IGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgbm9ybWFsaXplKHBpbikge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSBnZXRQaW5OdW1iZXIocGluKTtcbiAgICBpZiAodHlwZW9mIG5vcm1hbGl6ZWRQaW4gPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBwaW4gXCInICsgcGluICsgJ1wiJyk7XG4gICAgfVxuICAgIHJldHVybiBub3JtYWxpemVkUGluO1xuICB9XG5cbiAgW2dldFBpbkluc3RhbmNlXShwaW4pIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbaW5zdGFuY2VzXVtwaW5dO1xuICAgIGlmICghcGluSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBwaW4gXCInICsgcGluICsgJ1wiJyk7XG4gICAgfVxuICAgIHJldHVybiBwaW5JbnN0YW5jZTtcbiAgfVxuXG4gIHBpbk1vZGUocGluLCBtb2RlKSB7XG4gICAgdGhpc1twaW5Nb2RlXSh7IHBpbiwgbW9kZSB9KTtcbiAgfVxuXG4gIFtwaW5Nb2RlXSh7IHBpbiwgbW9kZSwgcHVsbFJlc2lzdG9yID0gUFVMTF9OT05FIH0pIHtcbiAgICBjb25zdCBub3JtYWxpemVkUGluID0gdGhpcy5ub3JtYWxpemUocGluKTtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKG5vcm1hbGl6ZWRQaW4pO1xuICAgIHBpbkluc3RhbmNlLnB1bGxSZXNpc3RvciA9IHB1bGxSZXNpc3RvcjtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICBwaW46IG5vcm1hbGl6ZWRQaW4sXG4gICAgICBwdWxsUmVzaXN0b3I6IHBpbkluc3RhbmNlLnB1bGxSZXNpc3RvclxuICAgIH07XG4gICAgaWYgKHRoaXNbcGluc11bbm9ybWFsaXplZFBpbl0uc3VwcG9ydGVkTW9kZXMuaW5kZXhPZihtb2RlKSA9PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQaW4gXCInICsgcGluICsgJ1wiIGRvZXMgbm90IHN1cHBvcnQgbW9kZSBcIicgKyBtb2RlICsgJ1wiJyk7XG4gICAgfVxuICAgIGlmIChwaW4gPT0gTEVEX1BJTiAmJiAhKHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgaW5zdGFuY2VvZiBMRUQpKSB7XG4gICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IExFRCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKG1vZGUpIHtcbiAgICAgICAgY2FzZSBJTlBVVF9NT0RFOlxuICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbElucHV0KGNvbmZpZyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgT1VUUFVUX01PREU6XG4gICAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBEaWdpdGFsT3V0cHV0KGNvbmZpZyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUFdNX01PREU6XG4gICAgICAgIGNhc2UgU0VSVk9fTU9ERTpcbiAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IFBXTShub3JtYWxpemVkUGluKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1Vua25vd24gcGluIG1vZGU6ICcgKyBtb2RlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcGluSW5zdGFuY2UubW9kZSA9IG1vZGU7XG4gIH1cblxuICBhbmFsb2dSZWFkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignYW5hbG9nUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIGFuYWxvZ1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICB0aGlzLnB3bVdyaXRlKHBpbiwgdmFsdWUpO1xuICB9XG5cbiAgcHdtV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gUFdNX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIFBXTV9NT0RFKTtcbiAgICB9XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZShNYXRoLnJvdW5kKHZhbHVlICogcGluSW5zdGFuY2UucGVyaXBoZXJhbC5yYW5nZSAvIDI1NSkpO1xuICB9XG5cbiAgZGlnaXRhbFJlYWQocGluLCBoYW5kbGVyKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBJTlBVVF9NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBJTlBVVF9NT0RFKTtcbiAgICB9XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBsZXQgdmFsdWU7XG4gICAgICBpZiAocGluSW5zdGFuY2UubW9kZSA9PSBJTlBVVF9NT0RFKSB7XG4gICAgICAgIHZhbHVlID0gcGluSW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgICAgaGFuZGxlcih2YWx1ZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoJ2RpZ2l0YWwtcmVhZC0nICsgcGluLCB2YWx1ZSk7XG4gICAgfSwgRElHSVRBTF9SRUFEX1VQREFURV9SQVRFKTtcbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLm9uKCdkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpZ2l0YWxXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSA9PT0gSU5QVVRfTU9ERSAmJiB2YWx1ZSA9PT0gSElHSCkge1xuICAgICAgdGhpc1twaW5Nb2RlXSh7IHBpbiwgbW9kZTogSU5QVVRfTU9ERSwgcHVsbFJlc2lzdG9yOiBQVUxMX1VQIH0pO1xuICAgIH0gZWxzZSBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBPVVRQVVRfTU9ERSkge1xuICAgICAgdGhpc1twaW5Nb2RlXSh7IHBpbiwgbW9kZTogT1VUUFVUX01PREUgfSk7XG4gICAgfVxuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09PSBPVVRQVVRfTU9ERSAmJiB2YWx1ZSAhPSBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSkge1xuICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSh2YWx1ZSA/IEhJR0ggOiBMT1cpO1xuICAgICAgcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBzZXJ2b0NvbmZpZyhwaW4sIG1pbiwgbWF4KSB7XG4gICAgbGV0IGNvbmZpZyA9IHBpbjtcbiAgICBpZiAodHlwZW9mIGNvbmZpZyAhPT0gJ29iamVjdCcpIHtcbiAgICAgIGNvbmZpZyA9IHsgcGluLCBtaW4sIG1heCB9O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNvbmZpZy5taW4gIT09ICdudW1iZXInKSB7XG4gICAgICBjb25maWcubWluID0gREVGQVVMVF9TRVJWT19NSU47XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY29uZmlnLm1heCAhPT0gJ251bWJlcicpIHtcbiAgICAgIGNvbmZpZy5tYXggPSBERUZBVUxUX1NFUlZPX01BWDtcbiAgICB9XG4gICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IHRoaXMubm9ybWFsaXplKHBpbik7XG4gICAgdGhpc1twaW5Nb2RlXSh7XG4gICAgICBwaW46IG5vcm1hbGl6ZWRQaW4sXG4gICAgICBtb2RlOiBTRVJWT19NT0RFXG4gICAgfSk7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShub3JtYWxpemVkUGluKSk7XG4gICAgcGluSW5zdGFuY2UubWluID0gY29uZmlnLm1pbjtcbiAgICBwaW5JbnN0YW5jZS5tYXggPSBjb25maWcubWF4O1xuICB9XG5cbiAgc2Vydm9Xcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBTRVJWT19NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBTRVJWT19NT0RFKTtcbiAgICB9XG4gICAgY29uc3QgZHV0eUN5Y2xlID0gKHBpbkluc3RhbmNlLm1pbiArICh2YWx1ZSAvIDE4MCkgKiAocGluSW5zdGFuY2UubWF4IC0gcGluSW5zdGFuY2UubWluKSkgLyAyMDAwMDtcbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKGR1dHlDeWNsZSAqIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwucmFuZ2UpO1xuICB9XG5cbiAgcXVlcnlDYXBhYmlsaXRpZXMoY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcXVlcnlBbmFsb2dNYXBwaW5nKGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHF1ZXJ5UGluU3RhdGUocGluLCBjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBbaTJjQ2hlY2tBbGl2ZV0oKSB7XG4gICAgaWYgKCF0aGlzW2kyY10uYWxpdmUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSTJDIHBpbnMgbm90IGluIEkyQyBtb2RlJyk7XG4gICAgfVxuICB9XG5cbiAgaTJjQ29uZmlnKG9wdGlvbnMpIHtcbiAgICBsZXQgZGVsYXk7XG5cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdudW1iZXInKSB7XG4gICAgICBkZWxheSA9IG9wdGlvbnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgb3B0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICBkZWxheSA9IG9wdGlvbnMuZGVsYXk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgdGhpc1tpMmNEZWxheV0gPSBkZWxheSB8fCAwO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNXcml0ZShhZGRyZXNzLCBjbWRSZWdPckRhdGEsIGluQnl0ZXMpIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICAvLyBJZiBpMmNXcml0ZSB3YXMgdXNlZCBmb3IgYW4gaTJjV3JpdGVSZWcgY2FsbC4uLlxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzICYmXG4gICAgICAgICFBcnJheS5pc0FycmF5KGNtZFJlZ09yRGF0YSkgJiZcbiAgICAgICAgIUFycmF5LmlzQXJyYXkoaW5CeXRlcykpIHtcbiAgICAgIHJldHVybiB0aGlzLmkyY1dyaXRlUmVnKGFkZHJlc3MsIGNtZFJlZ09yRGF0YSwgaW5CeXRlcyk7XG4gICAgfVxuXG4gICAgLy8gRml4IGFyZ3VtZW50cyBpZiBjYWxsZWQgd2l0aCBGaXJtYXRhLmpzIEFQSVxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShjbWRSZWdPckRhdGEpKSB7XG4gICAgICAgIGluQnl0ZXMgPSBjbWRSZWdPckRhdGEuc2xpY2UoKTtcbiAgICAgICAgY21kUmVnT3JEYXRhID0gaW5CeXRlcy5zaGlmdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5CeXRlcyA9IFtdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIoW2NtZFJlZ09yRGF0YV0uY29uY2F0KGluQnl0ZXMpKTtcblxuICAgIC8vIE9ubHkgd3JpdGUgaWYgYnl0ZXMgcHJvdmlkZWRcbiAgICBpZiAoYnVmZmVyLmxlbmd0aCkge1xuICAgICAgdGhpc1tpMmNdLndyaXRlU3luYyhhZGRyZXNzLCBidWZmZXIpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaTJjV3JpdGVSZWcoYWRkcmVzcywgcmVnaXN0ZXIsIHZhbHVlKSB7XG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgdGhpc1tpMmNdLndyaXRlQnl0ZVN5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIHZhbHVlKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgW2kyY1JlYWRdKGNvbnRpbnVvdXMsIGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlc1RvUmVhZCwgY2FsbGJhY2spIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICAvLyBGaXggYXJndW1lbnRzIGlmIGNhbGxlZCB3aXRoIEZpcm1hdGEuanMgQVBJXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gNCAmJlxuICAgICAgdHlwZW9mIHJlZ2lzdGVyID09ICdudW1iZXInICYmXG4gICAgICB0eXBlb2YgYnl0ZXNUb1JlYWQgPT0gJ2Z1bmN0aW9uJ1xuICAgICkge1xuICAgICAgY2FsbGJhY2sgPSBieXRlc1RvUmVhZDtcbiAgICAgIGJ5dGVzVG9SZWFkID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IG51bGw7XG4gICAgfVxuXG4gICAgY2FsbGJhY2sgPSB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBjYWxsYmFjayA6ICgpID0+IHt9O1xuXG4gICAgbGV0IGV2ZW50ID0gJ0kyQy1yZXBseScgKyBhZGRyZXNzICsgJy0nO1xuICAgIGV2ZW50ICs9IHJlZ2lzdGVyICE9PSBudWxsID8gcmVnaXN0ZXIgOiAwO1xuXG4gICAgY29uc3QgcmVhZCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGFmdGVyUmVhZCA9IChlcnIsIGJ1ZmZlcikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29udmVydCBidWZmZXIgdG8gQXJyYXkgYmVmb3JlIGVtaXRcbiAgICAgICAgdGhpcy5lbWl0KGV2ZW50LCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChidWZmZXIpKTtcblxuICAgICAgICBpZiAoY29udGludW91cykge1xuICAgICAgICAgIHNldFRpbWVvdXQocmVhZCwgdGhpc1tpMmNEZWxheV0pO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLm9uY2UoZXZlbnQsIGNhbGxiYWNrKTtcblxuICAgICAgaWYgKHJlZ2lzdGVyICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXNbaTJjXS5yZWFkKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlc1RvUmVhZCwgYWZ0ZXJSZWFkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXNbaTJjXS5yZWFkKGFkZHJlc3MsIGJ5dGVzVG9SZWFkLCBhZnRlclJlYWQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBzZXRUaW1lb3V0KHJlYWQsIHRoaXNbaTJjRGVsYXldKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaTJjUmVhZCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXNbaTJjUmVhZF0odHJ1ZSwgLi4ucmVzdCk7XG4gIH1cblxuICBpMmNSZWFkT25jZSguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXNbaTJjUmVhZF0oZmFsc2UsIC4uLnJlc3QpO1xuICB9XG5cbiAgc2VuZEkyQ0NvbmZpZyguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjQ29uZmlnKC4uLnJlc3QpO1xuICB9XG5cbiAgc2VuZEkyQ1dyaXRlUmVxdWVzdCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjV3JpdGUoLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDUmVhZFJlcXVlc3QoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzLmkyY1JlYWRPbmNlKC4uLnJlc3QpO1xuICB9XG5cbiAgc2VyaWFsV3JpdGUoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXJpYWxXcml0ZSBpcyBub3QgeWV0IGltcGxlbWVudGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlcmlhbFJlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXJpYWxSZWFkIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VyaWFsQ29uZmlnKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VyaWFsQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVDb25maWcoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZUNvbmZpZyBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlU2VhcmNoKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVTZWFyY2ggaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZUFsYXJtc1NlYXJjaCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlQWxhcm1zU2VhcmNoIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVSZWFkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVSZWFkIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVSZXNldCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlQ29uZmlnIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlV3JpdGUgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZURlbGF5KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVEZWxheSBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlV3JpdGVBbmRSZWFkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZXRTYW1wbGluZ0ludGVydmFsKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0U2FtcGxpbmdJbnRlcnZhbCBpcyBub3QgeWV0IGltcGxlbWVudGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHJlcG9ydEFuYWxvZ1BpbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlcG9ydEFuYWxvZ1BpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHJlcG9ydERpZ2l0YWxQaW4oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZXBvcnREaWdpdGFsUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgcGluZ1JlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwaW5nUmVhZCBpcyBub3QgeWV0IGltcGxlbWVudGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHB1bHNlSW4oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwdWxzZUluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc3RlcHBlckNvbmZpZygpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0ZXBwZXJDb25maWcgaXMgbm90IHlldCBpbXBsZW1lbnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzdGVwcGVyU3RlcCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0ZXBwZXJTdGVwIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmFzcGk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
=======
//# sourceMappingURL=data:application/json;base64,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LENBQUMsZ0NBQWdDLENBQUMsQ0FBQztLQUNuRDs7O1dBRVkseUJBQUc7QUFDZCxZQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7S0FDekQ7OztXQUVVLHVCQUFHO0FBQ1osWUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0tBQ3ZEOzs7U0F2aEJHLEtBQUs7OztBQTBoQlgsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFO0FBQzVDLFlBQVUsRUFBRSxJQUFJO0FBQ2hCLE9BQUssRUFBRSxpQkFBTTs7O0FBR1gsUUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQzFCLFFBQUk7QUFDRixtQkFBYSxHQUFHLGdCQUFHLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUMxRixDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUU7QUFDZCxXQUFPLGFBQWEsQ0FBQztHQUN0QjtDQUNGLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgKGMpIDIwMTQgQnJ5YW4gSHVnaGVzIDxicnlhbkB0aGVvcmV0aWNhbGlkZWF0aW9ucy5jb20+XG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uXG5vYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvblxuZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dFxucmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsXG5jb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlXG5Tb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZ1xuY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFU1xuT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbk5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUXG5IT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSxcbldIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lOR1xuRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUlxuT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBpbml0IH0gZnJvbSAncmFzcGknO1xuaW1wb3J0IHsgZ2V0UGlucywgZ2V0UGluTnVtYmVyIH0gZnJvbSAncmFzcGktYm9hcmQnO1xuaW1wb3J0IHsgUFVMTF9OT05FLCBQVUxMX1VQLCBQVUxMX0RPV04sIERpZ2l0YWxPdXRwdXQsIERpZ2l0YWxJbnB1dCB9IGZyb20gJ3Jhc3BpLWdwaW8nO1xuaW1wb3J0IHsgUFdNIH0gZnJvbSAncmFzcGktcHdtJztcbmltcG9ydCB7IEkyQyB9IGZyb20gJ3Jhc3BpLWkyYyc7XG5pbXBvcnQgeyBMRUQgfSBmcm9tICdyYXNwaS1sZWQnO1xuaW1wb3J0IHsgU29uYXIgfSBmcm9tICdyYXNwaS1zb25hcic7XG5cbi8vIEhhY2t5IHF1aWNrIFN5bWJvbCBwb2x5ZmlsbCwgc2luY2UgZXM2LXN5bWJvbCByZWZ1c2VzIHRvIGluc3RhbGwgd2l0aCBOb2RlIDAuMTAgZnJvbSBodHRwOi8vbm9kZS1hcm0uaGVyb2t1YXBwLmNvbS9cbmlmICh0eXBlb2YgZ2xvYmFsLlN5bWJvbCAhPSAnZnVuY3Rpb24nKSB7XG4gIGdsb2JhbC5TeW1ib2wgPSAobmFtZSkgPT4ge1xuICAgIHJldHVybiAnX18kcmFzcGlfc3ltYm9sXycgKyBuYW1lICsgJ18nICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMHhGRkZGRkZGKSArICckX18nO1xuICB9O1xufVxuXG4vLyBDb25zdGFudHNcbmNvbnN0IElOUFVUX01PREUgPSAwO1xuY29uc3QgT1VUUFVUX01PREUgPSAxO1xuY29uc3QgQU5BTE9HX01PREUgPSAyO1xuY29uc3QgUFdNX01PREUgPSAzO1xuY29uc3QgU0VSVk9fTU9ERSA9IDQ7XG5jb25zdCBVTktOT1dOX01PREUgPSA5OTtcblxuY29uc3QgTE9XID0gMDtcbmNvbnN0IEhJR0ggPSAxO1xuXG5jb25zdCBMRURfUElOID0gLTE7XG5cbi8vIFNldHRpbmdzXG5jb25zdCBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUgPSAxOTtcblxuLy8gUHJpdmF0ZSBzeW1ib2xzXG5jb25zdCBpc1JlYWR5ID0gU3ltYm9sKCdpc1JlYWR5Jyk7XG5jb25zdCBwaW5zID0gU3ltYm9sKCdwaW5zJyk7XG5jb25zdCBpbnN0YW5jZXMgPSBTeW1ib2woJ2luc3RhbmNlcycpO1xuY29uc3QgYW5hbG9nUGlucyA9IFN5bWJvbCgnYW5hbG9nUGlucycpO1xuY29uc3QgZ2V0UGluSW5zdGFuY2UgPSBTeW1ib2woJ2dldFBpbkluc3RhbmNlJyk7XG5jb25zdCBpMmMgPSBTeW1ib2woJ2kyYycpO1xuY29uc3QgaTJjRGVsYXkgPSBTeW1ib2woJ2kyY0RlbGF5Jyk7XG5jb25zdCBpMmNSZWFkID0gU3ltYm9sKCdpMmNSZWFkJyk7XG5jb25zdCBpMmNDaGVja0FsaXZlID0gU3ltYm9sKCdpMmNDaGVja0FsaXZlJyk7XG5jb25zdCBwaW5Nb2RlID0gU3ltYm9sKCdwaW5Nb2RlJyk7XG5cbmNsYXNzIFJhc3BpIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgbmFtZToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogJ1Jhc3BiZXJyeVBpLUlPJ1xuICAgICAgfSxcblxuICAgICAgW2luc3RhbmNlc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcblxuICAgICAgW2lzUmVhZHldOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG4gICAgICBpc1JlYWR5OiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1tpc1JlYWR5XTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW3BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBwaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1twaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2FuYWxvZ1BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBhbmFsb2dQaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1thbmFsb2dQaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2kyY106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBuZXcgSTJDKClcbiAgICAgIH0sXG5cbiAgICAgIFtpMmNEZWxheV06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiAwXG4gICAgICB9LFxuXG4gICAgICBNT0RFUzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgSU5QVVQ6IElOUFVUX01PREUsXG4gICAgICAgICAgT1VUUFVUOiBPVVRQVVRfTU9ERSxcbiAgICAgICAgICBBTkFMT0c6IEFOQUxPR19NT0RFLFxuICAgICAgICAgIFBXTTogUFdNX01PREUsXG4gICAgICAgICAgU0VSVk86IFNFUlZPX01PREVcbiAgICAgICAgfSlcbiAgICAgIH0sXG5cbiAgICAgIEhJR0g6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IEhJR0hcbiAgICAgIH0sXG4gICAgICBMT1c6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IExPV1xuICAgICAgfSxcblxuICAgICAgZGVmYXVsdExlZDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTEVEX1BJTlxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaW5pdCgoKSA9PiB7XG4gICAgICBjb25zdCBwaW5NYXBwaW5ncyA9IGdldFBpbnMoKTtcbiAgICAgIHRoaXNbcGluc10gPSBbXTtcblxuICAgICAgLy8gU2xpZ2h0IGhhY2sgdG8gZ2V0IHRoZSBMRUQgaW4gdGhlcmUsIHNpbmNlIGl0J3Mgbm90IGFjdHVhbGx5IGEgcGluXG4gICAgICBwaW5NYXBwaW5nc1tMRURfUElOXSA9IHtcbiAgICAgICAgcGluczogWyBMRURfUElOIF0sXG4gICAgICAgIHBlcmlwaGVyYWxzOiBbICdncGlvJyBdXG4gICAgICB9O1xuXG4gICAgICBPYmplY3Qua2V5cyhwaW5NYXBwaW5ncykuZm9yRWFjaCgocGluKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbkluZm8gPSBwaW5NYXBwaW5nc1twaW5dO1xuICAgICAgICBjb25zdCBzdXBwb3J0ZWRNb2RlcyA9IFtdO1xuICAgICAgICAvLyBXZSBkb24ndCB3YW50IEkyQyB0byBiZSB1c2VkIGZvciBhbnl0aGluZyBlbHNlLCBzaW5jZSBjaGFuZ2luZyB0aGVcbiAgICAgICAgLy8gcGluIG1vZGUgbWFrZXMgaXQgdW5hYmxlIHRvIGV2ZXIgZG8gSTJDIGFnYWluLlxuICAgICAgICBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdpMmMnKSA9PSAtMSkge1xuICAgICAgICAgIGlmIChwaW4gPT0gTEVEX1BJTikge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChPVVRQVVRfTU9ERSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ2dwaW8nKSAhPSAtMSkge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChJTlBVVF9NT0RFLCBPVVRQVVRfTU9ERSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ3B3bScpICE9IC0xKSB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlcy5wdXNoKFBXTV9NT0RFLCBTRVJWT19NT0RFKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXSA9IHtcbiAgICAgICAgICBwZXJpcGhlcmFsOiBudWxsLFxuICAgICAgICAgIG1vZGU6IHN1cHBvcnRlZE1vZGVzLmluZGV4T2YoT1VUUFVUX01PREUpID09IC0xID8gVU5LTk9XTl9NT0RFIDogT1VUUFVUX01PREUsXG4gICAgICAgICAgcHJldmlvdXNXcml0dGVuVmFsdWU6IExPV1xuICAgICAgICB9O1xuICAgICAgICB0aGlzW3BpbnNdW3Bpbl0gPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICBzdXBwb3J0ZWRNb2Rlczoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHN1cHBvcnRlZE1vZGVzKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLm1vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgc3dpdGNoIChpbnN0YW5jZS5tb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBJTlBVVF9NT0RFOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnBlcmlwaGVyYWwucmVhZCgpO1xuICAgICAgICAgICAgICAgIGNhc2UgT1VUUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0KHZhbHVlKSB7XG4gICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5tb2RlID09IE9VVFBVVF9NT0RFKSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlcG9ydDoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhbmFsb2dDaGFubmVsOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IDEyN1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpbnN0YW5jZS5tb2RlID09IE9VVFBVVF9NT0RFKSB7XG4gICAgICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgT1VUUFVUX01PREUpO1xuICAgICAgICAgIHRoaXMuZGlnaXRhbFdyaXRlKHBpbiwgTE9XKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEZpbGwgaW4gdGhlIGhvbGVzLCBzaW5zIHBpbnMgYXJlIHNwYXJzZSBvbiB0aGUgQSsvQisvMlxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzW3BpbnNdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghdGhpc1twaW5zXVtpXSkge1xuICAgICAgICAgIHRoaXNbcGluc11baV0gPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKFtdKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZGU6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBVTktOT1dOX01PREU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHNldCgpIHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVwb3J0OiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYW5hbG9nQ2hhbm5lbDoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogMTI3XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpc1tpc1JlYWR5XSA9IHRydWU7XG4gICAgICB0aGlzLmVtaXQoJ3JlYWR5Jyk7XG4gICAgICB0aGlzLmVtaXQoJ2Nvbm5lY3QnKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVzZXQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBub3JtYWxpemUocGluKSB7XG4gICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IGdldFBpbk51bWJlcihwaW4pO1xuICAgIGlmICh0eXBlb2Ygbm9ybWFsaXplZFBpbiA9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHBpbiBcIicgKyBwaW4gKyAnXCInKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRQaW47XG4gIH1cblxuICBbZ2V0UGluSW5zdGFuY2VdKHBpbikge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl07XG4gICAgaWYgKCFwaW5JbnN0YW5jZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHBpbiBcIicgKyBwaW4gKyAnXCInKTtcbiAgICB9XG4gICAgcmV0dXJuIHBpbkluc3RhbmNlO1xuICB9XG5cbiAgcGluTW9kZShwaW4sIG1vZGUpIHtcbiAgICB0aGlzW3Bpbk1vZGVdKHsgcGluLCBtb2RlIH0pO1xuICB9XG5cbiAgW3Bpbk1vZGVdKHsgcGluLCBtb2RlLCBwdWxsUmVzaXN0b3IgPSBQVUxMX05PTkUgfSkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSB0aGlzLm5vcm1hbGl6ZShwaW4pO1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0obm9ybWFsaXplZFBpbik7XG4gICAgcGluSW5zdGFuY2UucHVsbFJlc2lzdG9yID0gcHVsbFJlc2lzdG9yO1xuICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgIHBpbjogbm9ybWFsaXplZFBpbixcbiAgICAgIHB1bGxSZXNpc3RvcjogcGluSW5zdGFuY2UucHVsbFJlc2lzdG9yXG4gICAgfTtcbiAgICBpZiAodGhpc1twaW5zXVtub3JtYWxpemVkUGluXS5zdXBwb3J0ZWRNb2Rlcy5pbmRleE9mKG1vZGUpID09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BpbiBcIicgKyBwaW4gKyAnXCIgZG9lcyBub3Qgc3VwcG9ydCBtb2RlIFwiJyArIG1vZGUgKyAnXCInKTtcbiAgICB9XG4gICAgaWYgKHBpbiA9PSBMRURfUElOICYmICEocGluSW5zdGFuY2UucGVyaXBoZXJhbCBpbnN0YW5jZW9mIExFRCkpIHtcbiAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgTEVEKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBEaWdpdGFsSW5wdXQoY29uZmlnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBPVVRQVVRfTU9ERTpcbiAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IERpZ2l0YWxPdXRwdXQoY29uZmlnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBQV01fTU9ERTpcbiAgICAgICAgY2FzZSBTRVJWT19NT0RFOlxuICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgUFdNKG5vcm1hbGl6ZWRQaW4pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnNvbGUud2FybignVW5rbm93biBwaW4gbW9kZTogJyArIG1vZGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5tb2RlID0gbW9kZTtcbiAgfVxuXG4gIGFuYWxvZ1JlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhbmFsb2dSZWFkIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgYW5hbG9nV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gUFdNX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIFBXTV9NT0RFKTtcbiAgICB9XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZShNYXRoLnJvdW5kKHZhbHVlICogMTAwMCAvIDI1NSkpO1xuICB9XG5cbiAgZGlnaXRhbFJlYWQocGluLCBoYW5kbGVyKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBJTlBVVF9NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBJTlBVVF9NT0RFKTtcbiAgICB9XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBsZXQgdmFsdWU7XG4gICAgICBpZiAocGluSW5zdGFuY2UubW9kZSA9PSBJTlBVVF9NT0RFKSB7XG4gICAgICAgIHZhbHVlID0gcGluSW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgICAgaGFuZGxlcih2YWx1ZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoJ2RpZ2l0YWwtcmVhZC0nICsgcGluLCB2YWx1ZSk7XG4gICAgfSwgRElHSVRBTF9SRUFEX1VQREFURV9SQVRFKTtcbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLm9uKCdkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpZ2l0YWxXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSA9PT0gSU5QVVRfTU9ERSAmJiB2YWx1ZSA9PT0gSElHSCkge1xuICAgICAgdGhpc1twaW5Nb2RlXSh7IHBpbiwgbW9kZTogSU5QVVRfTU9ERSwgcHVsbFJlc2lzdG9yOiBQVUxMX1VQIH0pO1xuICAgIH0gZWxzZSBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBPVVRQVVRfTU9ERSkge1xuICAgICAgdGhpc1twaW5Nb2RlXSh7IHBpbiwgbW9kZTogT1VUUFVUX01PREUgfSk7XG4gICAgfVxuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09PSBPVVRQVVRfTU9ERSAmJiB2YWx1ZSAhPSBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSkge1xuICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSh2YWx1ZSA/IEhJR0ggOiBMT1cpO1xuICAgICAgcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBzZXJ2b1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFNFUlZPX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIFNFUlZPX01PREUpO1xuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKDQ4ICsgTWF0aC5yb3VuZCh2YWx1ZSAqIDQ4IC8gMTgwKSk7XG4gIH1cblxuICBxdWVyeUNhcGFiaWxpdGllcyhjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBxdWVyeUFuYWxvZ01hcHBpbmcoY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcXVlcnlQaW5TdGF0ZShwaW4sIGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIFtpMmNDaGVja0FsaXZlXSgpIHtcbiAgICBpZiAoIXRoaXNbaTJjXS5hbGl2ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJMkMgcGlucyBub3QgaW4gSTJDIG1vZGUnKTtcbiAgICB9XG4gIH1cblxuICBpMmNDb25maWcob3B0aW9ucykge1xuICAgIGxldCBkZWxheTtcblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ251bWJlcicpIHtcbiAgICAgIGRlbGF5ID0gb3B0aW9ucztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJiBvcHRpb25zICE9PSBudWxsKSB7XG4gICAgICAgIGRlbGF5ID0gb3B0aW9ucy5kZWxheTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICB0aGlzW2kyY0RlbGF5XSA9IGRlbGF5IHx8IDA7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGkyY1dyaXRlKGFkZHJlc3MsIGNtZFJlZ09yRGF0YSwgaW5CeXRlcykge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIC8vIElmIGkyY1dyaXRlIHdhcyB1c2VkIGZvciBhbiBpMmNXcml0ZVJlZyBjYWxsLi4uXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgJiZcbiAgICAgICAgIUFycmF5LmlzQXJyYXkoY21kUmVnT3JEYXRhKSAmJlxuICAgICAgICAhQXJyYXkuaXNBcnJheShpbkJ5dGVzKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaTJjV3JpdGVSZWcoYWRkcmVzcywgY21kUmVnT3JEYXRhLCBpbkJ5dGVzKTtcbiAgICB9XG5cbiAgICAvLyBGaXggYXJndW1lbnRzIGlmIGNhbGxlZCB3aXRoIEZpcm1hdGEuanMgQVBJXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGNtZFJlZ09yRGF0YSkpIHtcbiAgICAgICAgaW5CeXRlcyA9IGNtZFJlZ09yRGF0YS5zbGljZSgpO1xuICAgICAgICBjbWRSZWdPckRhdGEgPSBpbkJ5dGVzLnNoaWZ0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbkJ5dGVzID0gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYnVmZmVyID0gbmV3IEJ1ZmZlcihbY21kUmVnT3JEYXRhXS5jb25jYXQoaW5CeXRlcykpO1xuXG4gICAgLy8gT25seSB3cml0ZSBpZiBieXRlcyBwcm92aWRlZFxuICAgIGlmIChidWZmZXIubGVuZ3RoKSB7XG4gICAgICB0aGlzW2kyY10ud3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNXcml0ZVJlZyhhZGRyZXNzLCByZWdpc3RlciwgdmFsdWUpIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICB0aGlzW2kyY10ud3JpdGVCeXRlU3luYyhhZGRyZXNzLCByZWdpc3RlciwgdmFsdWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBbaTJjUmVhZF0oY29udGludW91cywgYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGVzVG9SZWFkLCBjYWxsYmFjaykge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIC8vIEZpeCBhcmd1bWVudHMgaWYgY2FsbGVkIHdpdGggRmlybWF0YS5qcyBBUElcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSA0ICYmXG4gICAgICB0eXBlb2YgcmVnaXN0ZXIgPT0gJ251bWJlcicgJiZcbiAgICAgIHR5cGVvZiBieXRlc1RvUmVhZCA9PSAnZnVuY3Rpb24nXG4gICAgKSB7XG4gICAgICBjYWxsYmFjayA9IGJ5dGVzVG9SZWFkO1xuICAgICAgYnl0ZXNUb1JlYWQgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gbnVsbDtcbiAgICB9XG5cbiAgICBjYWxsYmFjayA9IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogKCkgPT4ge307XG5cbiAgICBsZXQgZXZlbnQgPSAnSTJDLXJlcGx5JyArIGFkZHJlc3MgKyAnLSc7XG4gICAgZXZlbnQgKz0gcmVnaXN0ZXIgIT09IG51bGwgPyByZWdpc3RlciA6IDA7XG5cbiAgICBjb25zdCByZWFkID0gKCkgPT4ge1xuICAgICAgY29uc3QgYWZ0ZXJSZWFkID0gKGVyciwgYnVmZmVyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb252ZXJ0IGJ1ZmZlciB0byBBcnJheSBiZWZvcmUgZW1pdFxuICAgICAgICB0aGlzLmVtaXQoZXZlbnQsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGJ1ZmZlcikpO1xuXG4gICAgICAgIGlmIChjb250aW51b3VzKSB7XG4gICAgICAgICAgc2V0VGltZW91dChyZWFkLCB0aGlzW2kyY0RlbGF5XSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRoaXMub25jZShldmVudCwgY2FsbGJhY2spO1xuXG4gICAgICBpZiAocmVnaXN0ZXIgIT09IG51bGwpIHtcbiAgICAgICAgdGhpc1tpMmNdLnJlYWQoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGVzVG9SZWFkLCBhZnRlclJlYWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1tpMmNdLnJlYWQoYWRkcmVzcywgYnl0ZXNUb1JlYWQsIGFmdGVyUmVhZCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNldFRpbWVvdXQocmVhZCwgdGhpc1tpMmNEZWxheV0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNSZWFkKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpc1tpMmNSZWFkXSh0cnVlLCAuLi5yZXN0KTtcbiAgfVxuXG4gIGkyY1JlYWRPbmNlKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpc1tpMmNSZWFkXShmYWxzZSwgLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDQ29uZmlnKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNDb25maWcoLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDV3JpdGVSZXF1ZXN0KC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNXcml0ZSguLi5yZXN0KTtcbiAgfVxuXG4gIHNlbmRJMkNSZWFkUmVxdWVzdCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjUmVhZE9uY2UoLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kT25lV2lyZUNvbmZpZygpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlQ29uZmlnIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVTZWFyY2goKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVNlYXJjaCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlQWxhcm1zU2VhcmNoKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVBbGFybXNTZWFyY2ggaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVJlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlc2V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVDb25maWcgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVXcml0ZSBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlRGVsYXkoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZURlbGF5IGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNldFNhbXBsaW5nSW50ZXJ2YWwoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRTYW1wbGluZ0ludGVydmFsIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHJlcG9ydEFuYWxvZ1BpbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlcG9ydEFuYWxvZ1BpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICByZXBvcnREaWdpdGFsUGluKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVwb3J0RGlnaXRhbFBpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBwaW5nUmVhZChjb25maWcsIGhhbmRsZXIpIHtcbiAgICBjb25zdCBwdWxzZU91dCA9IGNvbmZpZy5wdWxzZU91dDtcbiAgICBjb25zdCBwaW4gPSBjb25maWcucGluO1xuICAgIGNvbnN0IHNvbmFyID0gbmV3IFNvbmFyKGNvbmZpZy5waW4pO1xuICAgIFxuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gSU5QVVRfTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgSU5QVVRfTU9ERSk7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgc29uYXIucmVhZChoYW5kbGVyKTtcbiAgICB9LCBwdWxzZU91dCk7XG4gICAgXG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC5vbignZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgfSk7XG4gIH1cblxuICBwdWxzZUluKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHVsc2VJbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBzdGVwcGVyQ29uZmlnKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc3RlcHBlckNvbmZpZyBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBzdGVwcGVyU3RlcCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0ZXBwZXJTdGVwIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoUmFzcGksICdpc1Jhc3BiZXJyeVBpJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICB2YWx1ZTogKCkgPT4ge1xuICAgIC8vIERldGVybWluaW5nIGlmIGEgc3lzdGVtIGlzIGEgUmFzcGJlcnJ5IFBpIGlzbid0IHBvc3NpYmxlIHRocm91Z2hcbiAgICAvLyB0aGUgb3MgbW9kdWxlIG9uIFJhc3BiaWFuLCBzbyB3ZSByZWFkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtIGluc3RlYWRcbiAgICBsZXQgaXNSYXNwYmVycnlQaSA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICBpc1Jhc3BiZXJyeVBpID0gZnMucmVhZEZpbGVTeW5jKCcvZXRjL29zLXJlbGVhc2UnKS50b1N0cmluZygpLmluZGV4T2YoJ1Jhc3BiaWFuJykgIT09IC0xO1xuICAgIH0gY2F0Y2ggKGUpIHt9Ly8gU3F1YXNoIGZpbGUgbm90IGZvdW5kLCBldGMgZXJyb3JzXG4gICAgcmV0dXJuIGlzUmFzcGJlcnJ5UGk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhc3BpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
>>>>>>> Added pingRead implementation.
