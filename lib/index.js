"use strict";
var $__8;
var $__fs__,
    $__events__,
    $__raspi__,
    $__raspi_45_board__,
    $__raspi_45_gpio__,
    $__raspi_45_pwm__;
var fs = ($__fs__ = require("fs"), $__fs__ && $__fs__.__esModule && $__fs__ || {default: $__fs__}).default;
var events = ($__events__ = require("events"), $__events__ && $__events__.__esModule && $__events__ || {default: $__events__}).default;
var init = ($__raspi__ = require("raspi"), $__raspi__ && $__raspi__.__esModule && $__raspi__ || {default: $__raspi__}).init;
var $__3 = ($__raspi_45_board__ = require("raspi-board"), $__raspi_45_board__ && $__raspi_45_board__.__esModule && $__raspi_45_board__ || {default: $__raspi_45_board__}),
    getPins = $__3.getPins,
    getPinNumber = $__3.getPinNumber;
var $__4 = ($__raspi_45_gpio__ = require("raspi-gpio"), $__raspi_45_gpio__ && $__raspi_45_gpio__.__esModule && $__raspi_45_gpio__ || {default: $__raspi_45_gpio__}),
    DigitalOutput = $__4.DigitalOutput,
    DigitalInput = $__4.DigitalInput;
var PWM = ($__raspi_45_pwm__ = require("raspi-pwm"), $__raspi_45_pwm__ && $__raspi_45_pwm__.__esModule && $__raspi_45_pwm__ || {default: $__raspi_45_pwm__}).PWM;
var INPUT_MODE = 0;
var OUTPUT_MODE = 1;
var ANALOG_MODE = 2;
var PWM_MODE = 3;
var SERVO_MODE = 4;
var UNKNOWN_MODE = 99;
var LOW = 0;
var HIGH = 1;
var LED = 'led0';
var DIGITAL_READ_UPDATE_RATE = 19;
var isReady = '__r$271828_0$__';
var pins = '__r$271828_1$__';
var instances = '__r$271828_2$__';
var analogPins = '__r$271828_3$__';
var mode = '__$271828_4$__';
var getPinInstance = '__$271828_5$__';
var Raspi = function Raspi() {
  var $__8;
  var $__6 = this;
  $traceurRuntime.superCall(this, $Raspi.prototype, "constructor", []);
  Object.defineProperties(this, ($__8 = {}, Object.defineProperty($__8, "name", {
    value: {
      enumerable: true,
      value: 'RaspberryPi-IO'
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, instances, {
    value: {
      writable: true,
      value: []
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, isReady, {
    value: {
      writable: true,
      value: false
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, "isReady", {
    value: {
      enumerable: true,
      get: function() {
        return this[isReady];
      }
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, pins, {
    value: {
      writable: true,
      value: []
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, "pins", {
    value: {
      enumerable: true,
      get: function() {
        return this[pins];
      }
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, analogPins, {
    value: {
      writable: true,
      value: []
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, "analogPins", {
    value: {
      enumerable: true,
      get: function() {
        return this[analogPins];
      }
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, "MODES", {
    value: {
      enumerable: true,
      value: Object.freeze({
        INPUT: INPUT_MODE,
        OUTPUT: OUTPUT_MODE,
        ANALOG: ANALOG_MODE,
        PWM: PWM_MODE,
        SERVO: SERVO_MODE
      })
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, "HIGH", {
    value: {
      enumerable: true,
      value: HIGH
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, "LOW", {
    value: {
      enumerable: true,
      value: LOW
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, "defaultLed", {
    value: {
      enumerable: true,
      value: LED
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__8));
  init((function() {
    var pinMappings = getPins();
    $__6[pins] = [];
    for (var $__9 = Object.keys(pinMappings)[Symbol.iterator](),
        $__10; !($__10 = $__9.next()).done; ) {
      var pin = $__10.value;
      {
        var pinInfo = pinMappings[pin];
        var supportedModes = [INPUT_MODE, OUTPUT_MODE];
        if (pinInfo.peripherals.indexOf('pwm') != -1) {
          supportedModes.push(PWM_MODE, SERVO_MODE);
        }
        var instance = $__6[instances][pin] = {
          peripheral: new DigitalInput(pin),
          mode: INPUT_MODE,
          previousWrittenValue: LOW
        };
        $__6[pins][pin] = Object.create(null, {
          supportedModes: {
            enumerable: true,
            value: Object.freeze(supportedModes)
          },
          mode: {
            enumerable: true,
            get: function() {
              return instance.mode;
            }
          },
          value: {
            enumerable: true,
            get: function() {
              switch (instance.mode) {
                case INPUT_MODE:
                  return instance.peripheral.read();
                  break;
                case OUTPUT_MODE:
                  return instance.previousWrittenValue;
                  break;
              }
            },
            set: function(value) {
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
      }
    }
    for (var i = 0; i < $__6[pins].length; i++) {
      if (!$__6[pins][i]) {
        $__6[pins][i] = Object.create(null, {
          supportedModes: {
            enumerable: true,
            value: Object.freeze([])
          },
          mode: {
            enumerable: true,
            get: function() {
              return UNKNOWN_MODE;
            }
          },
          value: {
            enumerable: true,
            get: function() {
              return 0;
            },
            set: function() {}
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
    $__6[isReady] = true;
    $__6.emit('ready');
    $__6.emit('connect');
  }));
};
var $Raspi = Raspi;
($traceurRuntime.createClass)(Raspi, ($__8 = {}, Object.defineProperty($__8, "reset", {
  value: function() {
    throw 'reset is not supported on the Raspberry Pi';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "normalize", {
  value: function(pin) {
    var normalizedPin = getPinNumber(pin);
    if (typeof normalizedPin == 'undefined') {
      throw new Error('Unknown pin "' + pin + '"');
    }
    return normalizedPin;
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, getPinInstance, {
  value: function(pin) {
    var pinInstance = this[instances][pin];
    if (!pinInstance) {
      throw new Error('Unknown pin "' + pin + '"');
    }
    return pinInstance;
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "pinMode", {
  value: function(pin, mode) {
    var normalizedPin = this.normalize(pin);
    var pinInstance = this[getPinInstance](normalizedPin);
    if (this[pins][normalizedPin].supportedModes.indexOf(mode) == -1) {
      throw new Error('Pin "' + pin + '" does not support mode "' + mode + '"');
    }
    switch (mode) {
      case INPUT_MODE:
        pinInstance.peripheral = new DigitalInput(normalizedPin);
        break;
      case OUTPUT_MODE:
        pinInstance.peripheral = new DigitalOutput(normalizedPin);
        break;
      case PWM_MODE:
      case SERVO_MODE:
        pinInstance.peripheral = new PWM(normalizedPin);
        break;
    }
    pinInstance.mode = mode;
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "analogRead", {
  value: function(pin, handler) {
    throw new Error('analogRead is not supported on the Raspberry Pi');
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "analogWrite", {
  value: function(pin, value) {
    var pinInstance = this[getPinInstance](pin);
    if (pinInstance.mode != PWM_MODE) {
      this.pinMode(pin, PWM_MODE);
    }
    pinInstance.peripheral.write(Math.round(value * 1000 / 255));
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "digitalRead", {
  value: function(pin, handler) {
    var $__6 = this;
    var pinInstance = this[getPinInstance](pin);
    if (pinInstance.mode != INPUT_MODE) {
      this.mode(pin, INPUT_MODE);
    }
    var interval = setInterval((function() {
      var value;
      if (pinInstance.mode == INPUT_MODE) {
        value = pinInstance.peripheral.read();
      } else {
        value = pinInstance.previousWrittenValue;
      }
      handler && handler(value);
      $__6.emit('digital-read-' + pin, value);
    }), DIGITAL_READ_UPDATE_RATE);
    pinInstance.peripheral.on('destroyed', (function() {
      clearInterval(interval);
    }));
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "digitalWrite", {
  value: function(pin, value) {
    var pinInstance = this[getPinInstance](pin);
    if (pinInstance.mode != OUTPUT_MODE) {
      this.pinMode(pin, OUTPUT_MODE);
    }
    if (value != pinInstance.previousWrittenValue) {
      pinInstance.peripheral.write(value ? HIGH : LOW);
      pinInstance.previousWrittenValue = value;
    }
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "servoWrite", {
  value: function(pin, value) {
    var pinInstance = this[getPinInstance](pin);
    if (pinInstance.mode != SERVO_MODE) {
      this.pinMode(pin, SERVO_MODE);
    }
    pinInstance.peripheral.write(48 + Math.round(value * 48 / 180));
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "queryCapabilities", {
  value: function(cb) {
    if (this.isReady) {
      process.nextTick(cb);
    } else {
      this.on('ready', cb);
    }
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "queryAnalogMapping", {
  value: function(cb) {
    if (this.isReady) {
      process.nextTick(cb);
    } else {
      this.on('ready', cb);
    }
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "queryPinState", {
  value: function(pin, cb) {
    if (this.isReady) {
      process.nextTick(cb);
    } else {
      this.on('ready', cb);
    }
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendI2CConfig", {
  value: function() {
    throw 'sendI2CConfig is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendI2CWriteRequest", {
  value: function() {
    throw 'sendI2CWriteRequest is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendI2CReadRequest", {
  value: function() {
    throw 'sendI2CReadRequest is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "setSamplingInterval", {
  value: function() {
    throw 'setSamplingInterval is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "reportAnalogPin", {
  value: function() {
    throw 'reportAnalogPin is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "reportDigitalPin", {
  value: function() {
    throw 'reportDigitalPin is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "pulseIn", {
  value: function() {
    throw 'pulseIn is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "stepperConfig", {
  value: function() {
    throw 'stepperConfig is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "stepperStep", {
  value: function() {
    throw 'stepperStep is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireConfig", {
  value: function() {
    throw 'sendOneWireConfig is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireSearch", {
  value: function() {
    throw 'sendOneWireSearch is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireAlarmsSearch", {
  value: function() {
    throw 'sendOneWireAlarmsSearch is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireRead", {
  value: function() {
    throw 'sendOneWireRead is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireReset", {
  value: function() {
    throw 'sendOneWireReset is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireWrite", {
  value: function() {
    throw 'sendOneWireWrite is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireDelay", {
  value: function() {
    throw 'sendOneWireDelay is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireWriteAndRead", {
  value: function() {
    throw 'sendOneWireWriteAndRead is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), $__8), {}, events.EventEmitter);
Object.defineProperty(Raspi, 'isRaspberryPi', {
  enumerable: true,
  value: (function() {
    var isRaspberryPi = false;
    try {
      isRaspberryPi = fs.readFileSync('/etc/os-release').toString().indexOf('Raspbian') !== -1;
    } catch (e) {}
    return isRaspberryPi;
  })
});
module.exports = Raspi;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci80Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQXlCQTs7Ozs7Ozs7RUFBTyxHQUFDLEVDekJSLEVBQUMsU0FBb0IsQ0FBQSxPQUFNLEFBQUMsTUFBa0IsQ0FDdEMsQ0FBQSxVQUFxQixtQkFBMkIsQ0FBQSxVQUFxQixHQUFLLEVBQUMsT0FBTSxTQUFtQixDQUQ5RCxBQUMrRCxDQUFDO0VEeUJ2RyxPQUFLLEVDMUJaLEVBQUMsYUFBb0IsQ0FBQSxPQUFNLEFBQUMsVUFBa0IsQ0FDdEMsQ0FBQSxjQUFxQix1QkFBMkIsQ0FBQSxjQUFxQixHQUFLLEVBQUMsT0FBTSxhQUFtQixDQUQ5RCxBQUMrRCxDQUFDO0VEMEJyRyxLQUFHLEVDM0JaLEVBQUMsWUFBb0IsQ0FBQSxPQUFNLEFBQUMsU0FBa0IsQ0FDdEMsQ0FBQSxhQUFxQixzQkFBMkIsQ0FBQSxhQUFxQixHQUFLLEVBQUMsT0FBTSxZQUFtQixDQUQ5RCxBQUMrRCxDQUFDO1NBRDlHLEVBQUMscUJBQW9CLENBQUEsT0FBTSxBQUFDLGVBQWtCLENBQ3RDLENBQUEsc0JBQXFCLCtCQUEyQixDQUFBLHNCQUFxQixHQUFLLEVBQUMsT0FBTSxxQkFBbUIsQ0FEOUQsQUFDK0QsQ0FBQztBRDJCckcsVUFBTTtBQUFHLGVBQVc7U0M1QjdCLEVBQUMsb0JBQW9CLENBQUEsT0FBTSxBQUFDLGNBQWtCLENBQ3RDLENBQUEscUJBQXFCLDhCQUEyQixDQUFBLHFCQUFxQixHQUFLLEVBQUMsT0FBTSxvQkFB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Q0FBQztFQUNqRDs7Ozs7T0FFQSxVQUF1QixBQUFDLENBQUU7QUFDeEIsUUFBTSxpREFBK0MsQ0FBQztFQUN4RDs7OzthQTlWa0IsQ0FBQSxNQUFLLGFBQWEsQ014RGtCO0FOeVp4RCxLQUFLLGVBQWUsQUFBQyxDQUFDLEtBQUksQ0FBRyxnQkFBYyxDQUFHO0FBQzVDLFdBQVMsQ0FBRyxLQUFHO0FBQ2YsTUFBSSxHQUFHLFNBQUEsQUFBQyxDQUFLO0FBR1gsQUFBSSxNQUFBLENBQUEsYUFBWSxFQUFJLE1BQUksQ0FBQztBQUN6QixNQUFJO0FBQ0Ysa0JBQVksRUFBSSxDQUFBLEVBQUMsYUFBYSxBQUFDLENBQUMsaUJBQWdCLENBQUMsU0FBUyxBQUFDLEVBQUMsUUFBUSxBQUFDLENBQUMsVUFBUyxDQUFDLENBQUEsR0FBTSxFQUFDLENBQUEsQ0FBQztJQUMxRixDQUFFLE9BQU0sQ0FBQSxDQUFHLEdBQUM7QUFBQSxBQUNaLFNBQU8sY0FBWSxDQUFDO0VBQ3RCLENBQUE7QUFDRixDQUFDLENBQUM7QUFFRixLQUFLLFFBQVEsRUFBSSxNQUFJLENBQUM7QUFBQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgKGMpIDIwMTQgQnJ5YW4gSHVnaGVzIDxicnlhbkB0aGVvcmV0aWNhbGlkZWF0aW9ucy5jb20+XG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uXG5vYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvblxuZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dFxucmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsXG5jb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlXG5Tb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZ1xuY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFU1xuT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbk5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUXG5IT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSxcbldIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lOR1xuRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUlxuT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBldmVudHMgZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7IGluaXQgfSBmcm9tICdyYXNwaSc7XG5pbXBvcnQgeyBnZXRQaW5zLCBnZXRQaW5OdW1iZXIgfSBmcm9tICdyYXNwaS1ib2FyZCc7XG5pbXBvcnQgeyBEaWdpdGFsT3V0cHV0LCBEaWdpdGFsSW5wdXQgfSBmcm9tICdyYXNwaS1ncGlvJztcbmltcG9ydCB7IFBXTSB9IGZyb20gJ3Jhc3BpLXB3bSc7XG5cbi8vIENvbnN0YW50c1xudmFyIElOUFVUX01PREUgPSAwO1xudmFyIE9VVFBVVF9NT0RFID0gMTtcbnZhciBBTkFMT0dfTU9ERSA9IDI7XG52YXIgUFdNX01PREUgPSAzO1xudmFyIFNFUlZPX01PREUgPSA0O1xudmFyIFVOS05PV05fTU9ERSA9IDk5O1xuXG52YXIgTE9XID0gMDtcbnZhciBISUdIID0gMTtcblxudmFyIExFRCA9ICdsZWQwJztcblxuLy8gU2V0dGluZ3NcblxudmFyIERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSA9IDE5O1xuXG4vLyBIYWNreSBidXQgZmFzdCBlbXVsYXRpb24gb2Ygc3ltYm9scywgZWxpbWluYXRpbmcgdGhlIG5lZWQgZm9yICR0cmFjZXVyUnVudGltZS50b1Byb3BlcnR5IGNhbGxzXG52YXIgaXNSZWFkeSA9ICdfX3IkMjcxODI4XzAkX18nO1xudmFyIHBpbnMgPSAnX19yJDI3MTgyOF8xJF9fJztcbnZhciBpbnN0YW5jZXMgPSAnX19yJDI3MTgyOF8yJF9fJztcbnZhciBhbmFsb2dQaW5zID0gJ19fciQyNzE4MjhfMyRfXyc7XG52YXIgbW9kZSA9ICdfXyQyNzE4MjhfNCRfXyc7XG52YXIgZ2V0UGluSW5zdGFuY2UgPSAnX18kMjcxODI4XzUkX18nO1xuXG5jbGFzcyBSYXNwaSBleHRlbmRzIGV2ZW50cy5FdmVudEVtaXR0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICBuYW1lOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiAnUmFzcGJlcnJ5UGktSU8nXG4gICAgICB9LFxuXG4gICAgICBbaW5zdGFuY2VzXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuXG4gICAgICBbaXNSZWFkeV06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIGlzUmVhZHk6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW2lzUmVhZHldO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBbcGluc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcbiAgICAgIHBpbnM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW3BpbnNdO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBbYW5hbG9nUGluc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcbiAgICAgIGFuYWxvZ1BpbnM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW2FuYWxvZ1BpbnNdO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBNT0RFUzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgSU5QVVQ6IElOUFVUX01PREUsXG4gICAgICAgICAgT1VUUFVUOiBPVVRQVVRfTU9ERSxcbiAgICAgICAgICBBTkFMT0c6IEFOQUxPR19NT0RFLFxuICAgICAgICAgIFBXTTogUFdNX01PREUsXG4gICAgICAgICAgU0VSVk86IFNFUlZPX01PREVcbiAgICAgICAgfSlcbiAgICAgIH0sXG5cbiAgICAgIEhJR0g6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IEhJR0hcbiAgICAgIH0sXG4gICAgICBMT1c6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IExPV1xuICAgICAgfSxcblxuICAgICAgZGVmYXVsdExlZDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTEVEXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpbml0KCgpID0+IHtcbiAgICAgIHZhciBwaW5NYXBwaW5ncyA9IGdldFBpbnMoKTtcbiAgICAgIHRoaXNbcGluc10gPSBbXTtcbiAgICAgIGZvciAodmFyIHBpbiBvZiBPYmplY3Qua2V5cyhwaW5NYXBwaW5ncykpIHtcbiAgICAgICAgdmFyIHBpbkluZm8gPSBwaW5NYXBwaW5nc1twaW5dO1xuICAgICAgICB2YXIgc3VwcG9ydGVkTW9kZXMgPSBbIElOUFVUX01PREUsIE9VVFBVVF9NT0RFIF07XG4gICAgICAgIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ3B3bScpICE9IC0xKSB7XG4gICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChQV01fTU9ERSwgU0VSVk9fTU9ERSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl0gPSB7XG4gICAgICAgICAgcGVyaXBoZXJhbDogbmV3IERpZ2l0YWxJbnB1dChwaW4pLFxuICAgICAgICAgIG1vZGU6IElOUFVUX01PREUsXG4gICAgICAgICAgcHJldmlvdXNXcml0dGVuVmFsdWU6IExPV1xuICAgICAgICB9O1xuICAgICAgICB0aGlzW3BpbnNdW3Bpbl0gPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICBzdXBwb3J0ZWRNb2Rlczoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHN1cHBvcnRlZE1vZGVzKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLm1vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgc3dpdGNoKGluc3RhbmNlLm1vZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLm1vZGUgPT0gT1VUUFVUX01PREUpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVwb3J0OiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFuYWxvZ0NoYW5uZWw6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMTI3XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gRmlsbCBpbiB0aGUgaG9sZXNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpc1twaW5zXS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXRoaXNbcGluc11baV0pIHtcbiAgICAgICAgICB0aGlzW3BpbnNdW2ldID0gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlczoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZShbXSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb2RlOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVU5LTk9XTl9NT0RFO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBzZXQoKSB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcG9ydDoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFuYWxvZ0NoYW5uZWw6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IDEyN1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXNbaXNSZWFkeV0gPSB0cnVlO1xuICAgICAgdGhpcy5lbWl0KCdyZWFkeScpO1xuICAgICAgdGhpcy5lbWl0KCdjb25uZWN0Jyk7XG4gICAgfSk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aHJvdyAncmVzZXQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJztcbiAgfVxuXG4gIG5vcm1hbGl6ZShwaW4pIHtcbiAgICB2YXIgbm9ybWFsaXplZFBpbiA9IGdldFBpbk51bWJlcihwaW4pO1xuICAgIGlmICh0eXBlb2Ygbm9ybWFsaXplZFBpbiA9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHBpbiBcIicgKyBwaW4gKyAnXCInKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRQaW47XG4gIH1cblxuICBbZ2V0UGluSW5zdGFuY2VdKHBpbikge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbaW5zdGFuY2VzXVtwaW5dO1xuICAgIGlmICghcGluSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBwaW4gXCInICsgcGluICsgJ1wiJyk7XG4gICAgfVxuICAgIHJldHVybiBwaW5JbnN0YW5jZTtcbiAgfVxuXG4gIHBpbk1vZGUocGluLCBtb2RlKSB7XG4gICAgdmFyIG5vcm1hbGl6ZWRQaW4gPSB0aGlzLm5vcm1hbGl6ZShwaW4pO1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKG5vcm1hbGl6ZWRQaW4pO1xuICAgIGlmICh0aGlzW3BpbnNdW25vcm1hbGl6ZWRQaW5dLnN1cHBvcnRlZE1vZGVzLmluZGV4T2YobW9kZSkgPT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGluIFwiJyArIHBpbiArICdcIiBkb2VzIG5vdCBzdXBwb3J0IG1vZGUgXCInICsgbW9kZSArICdcIicpO1xuICAgIH1cbiAgICBzd2l0Y2gobW9kZSkge1xuICAgICAgY2FzZSBJTlBVVF9NT0RFOlxuICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IERpZ2l0YWxJbnB1dChub3JtYWxpemVkUGluKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IERpZ2l0YWxPdXRwdXQobm9ybWFsaXplZFBpbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBQV01fTU9ERTpcbiAgICAgIGNhc2UgU0VSVk9fTU9ERTpcbiAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBQV00obm9ybWFsaXplZFBpbik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5tb2RlID0gbW9kZTtcbiAgfVxuXG4gIGFuYWxvZ1JlYWQocGluLCBoYW5kbGVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhbmFsb2dSZWFkIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgYW5hbG9nV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHBpbik7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gUFdNX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIFBXTV9NT0RFKTtcbiAgICB9XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZShNYXRoLnJvdW5kKHZhbHVlICogMTAwMCAvIDI1NSkpO1xuICB9XG5cbiAgZGlnaXRhbFJlYWQocGluLCBoYW5kbGVyKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0ocGluKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBJTlBVVF9NT0RFKSB7XG4gICAgICB0aGlzLm1vZGUocGluLCBJTlBVVF9NT0RFKTtcbiAgICB9XG4gICAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgdmFyIHZhbHVlO1xuICAgICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgPT0gSU5QVVRfTU9ERSkge1xuICAgICAgICB2YWx1ZSA9IHBpbkluc3RhbmNlLnBlcmlwaGVyYWwucmVhZCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZTtcbiAgICAgIH1cbiAgICAgIGhhbmRsZXIgJiYgaGFuZGxlcih2YWx1ZSk7XG4gICAgICB0aGlzLmVtaXQoJ2RpZ2l0YWwtcmVhZC0nICsgcGluLCB2YWx1ZSk7XG4gICAgfSwgRElHSVRBTF9SRUFEX1VQREFURV9SQVRFKTtcbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLm9uKCdkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpZ2l0YWxXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0ocGluKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBPVVRQVVRfTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgT1VUUFVUX01PREUpO1xuICAgIH1cbiAgICBpZiAodmFsdWUgIT0gcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWUpIHtcbiAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUodmFsdWUgPyBISUdIIDogTE9XKTtcbiAgICAgIHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgc2Vydm9Xcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0ocGluKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBTRVJWT19NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBTRVJWT19NT0RFKTtcbiAgICB9XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSg0OCArIE1hdGgucm91bmQodmFsdWUgKiA0OC8gMTgwKSk7XG4gIH1cblxuICBxdWVyeUNhcGFiaWxpdGllcyhjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBxdWVyeUFuYWxvZ01hcHBpbmcoY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcXVlcnlQaW5TdGF0ZShwaW4sIGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHNlbmRJMkNDb25maWcoKSB7XG4gICAgdGhyb3cgJ3NlbmRJMkNDb25maWcgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kSTJDV3JpdGVSZXF1ZXN0KCkge1xuICAgIHRocm93ICdzZW5kSTJDV3JpdGVSZXF1ZXN0IGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZEkyQ1JlYWRSZXF1ZXN0KCkge1xuICAgIHRocm93ICdzZW5kSTJDUmVhZFJlcXVlc3QgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZXRTYW1wbGluZ0ludGVydmFsKCkge1xuICAgIHRocm93ICdzZXRTYW1wbGluZ0ludGVydmFsIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgcmVwb3J0QW5hbG9nUGluKCkge1xuICAgIHRocm93ICdyZXBvcnRBbmFsb2dQaW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICByZXBvcnREaWdpdGFsUGluKCkge1xuICAgIHRocm93ICdyZXBvcnREaWdpdGFsUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgcHVsc2VJbigpIHtcbiAgICB0aHJvdyAncHVsc2VJbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHN0ZXBwZXJDb25maWcoKSB7XG4gICAgdGhyb3cgJ3N0ZXBwZXJDb25maWcgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzdGVwcGVyU3RlcCgpIHtcbiAgICB0aHJvdyAnc3RlcHBlclN0ZXAgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZUNvbmZpZygpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVDb25maWcgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVNlYXJjaCgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVTZWFyY2ggaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZUFsYXJtc1NlYXJjaCgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVBbGFybXNTZWFyY2ggaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlYWQoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlUmVhZCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlUmVzZXQoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlUmVzZXQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlKCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVdyaXRlIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVEZWxheSgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVEZWxheSBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlV3JpdGVBbmRSZWFkKCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoUmFzcGksICdpc1Jhc3BiZXJyeVBpJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICB2YWx1ZTogKCkgPT4ge1xuICAgIC8vIERldGVybWluaW5nIGlmIGEgc3lzdGVtIGlzIGEgUmFzcGJlcnJ5IFBpIGlzbid0IHBvc3NpYmxlIHRocm91Z2hcbiAgICAvLyB0aGUgb3MgbW9kdWxlIG9uIFJhc3BiaWFuLCBzbyB3ZSByZWFkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtIGluc3RlYWRcbiAgICB2YXIgaXNSYXNwYmVycnlQaSA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICBpc1Jhc3BiZXJyeVBpID0gZnMucmVhZEZpbGVTeW5jKCcvZXRjL29zLXJlbGVhc2UnKS50b1N0cmluZygpLmluZGV4T2YoJ1Jhc3BiaWFuJykgIT09IC0xO1xuICAgIH0gY2F0Y2goZSkge30vLyBTcXVhc2ggZmlsZSBub3QgZm91bmQsIGV0YyBlcnJvcnNcbiAgICByZXR1cm4gaXNSYXNwYmVycnlQaTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFzcGk7IiwiKCRfX3BsYWNlaG9sZGVyX18wID0gcmVxdWlyZSgkX19wbGFjZWhvbGRlcl9fMSksIFxuICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiAmJiAkX19wbGFjZWhvbGRlcl9fMy5fX2VzTW9kdWxlICYmICRfX3BsYWNlaG9sZGVyX180IHx8IHtkZWZhdWx0OiAkX19wbGFjZWhvbGRlcl9fNX0pIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIkdHJhY2V1clJ1bnRpbWUuc3VwZXJDYWxsKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSIsIlxuICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgICAgICAgISgkX19wbGFjZWhvbGRlcl9fMyA9ICRfX3BsYWNlaG9sZGVyX180Lm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzU7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzY7XG4gICAgICAgIH0iLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=