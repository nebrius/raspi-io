"use strict";
var $__8;
var $__fs__,
    $__events__,
    $__raspi_45_core__,
    $__raspi_45_board__,
    $__raspi_45_gpio__,
    $__raspi_45_pwm__;
var fs = ($__fs__ = require("fs"), $__fs__ && $__fs__.__esModule && $__fs__ || {default: $__fs__}).default;
var events = ($__events__ = require("events"), $__events__ && $__events__.__esModule && $__events__ || {default: $__events__}).default;
var init = ($__raspi_45_core__ = require("raspi-core"), $__raspi_45_core__ && $__raspi_45_core__.__esModule && $__raspi_45_core__ || {default: $__raspi_45_core__}).init;
var $__3 = ($__raspi_45_board__ = require("raspi-board"), $__raspi_45_board__ && $__raspi_45_board__.__esModule && $__raspi_45_board__ || {default: $__raspi_45_board__}),
    getPins = $__3.getPins,
    getPinNumber = $__3.getPinNumber;
var $__4 = ($__raspi_45_gpio__ = require("raspi-gpio"), $__raspi_45_gpio__ && $__raspi_45_gpio__.__esModule && $__raspi_45_gpio__ || {default: $__raspi_45_gpio__}),
    DigitalOutput = $__4.DigitalOutput,
    DigitalInput = $__4.DigitalInput;
var PWM = ($__raspi_45_pwm__ = require("raspi-pwm"), $__raspi_45_pwm__ && $__raspi_45_pwm__.__esModule && $__raspi_45_pwm__ || {default: $__raspi_45_pwm__}).PWM;
if (process.env.USER != 'root') {
  console.warn('WARNING: Raspi-IO usually needs to be run with root privileges to access hardware, but it doesn\'t appear to be running as root currently');
}
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
    $__6[pins] = (Object.keys(pinMappings).map((function(pin) {
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
      return Object.create(null, {
        supportedModes: {
          enumerable: true,
          value: Object.freeze(supportedModes)
        },
        mode: {
          enumerable: true,
          value: {get: function() {
              return instance.mode;
            }}
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
            if (instance.mode == OUTPUT_MODE && value != instance.previousWrittenValue) {
              instance.peripheral.write(value);
              instance.previousWrittenValue = value;
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
    })));
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
    return getPinNumber(pin);
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
    console.log('Setting pin "' + pin + '" to mode ' + mode);
    var pinInstance = this[getPinInstance](pin);
    if (this[pins][pin].supportedModes.indexOf(mode) == -1) {
      throw new Error('Pin "' + pin + '" does not support mode "' + mode + '"');
    }
    switch (mode) {
      case INPUT_MODE:
        pinInstance.peripheral = new DigitalInput(pin);
        break;
      case OUTPUT_MODE:
        pinInstance.peripheral = new DigitalOutput(pin);
        break;
      case PWM_MODE:
      case SERVO_MODE:
        pinInstance.peripheral = new PWM(pin);
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
      throw new Error('Cannot analogWrite to pin "' + pin + '" unless it is in PWM mode');
    }
    pinInstance.peripheral.write(Math.round(value * 1024 / 255));
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "digitalRead", {
  value: function(pin, handler) {
    var $__6 = this;
    var pinInstance = this[getPinInstance](pin);
    if (pinInstance.mode != INPUT_MODE) {
      throw new Error('Cannot digitalRead from pin "' + pin + '" unless it is in INPUT mode');
    }
    var interval = setInterval((function() {
      var value = pinInstance.peripheral.read();
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
      throw new Error('Cannot digitalWrite to pin "' + pin + '" unless it is in OUTPUT mode');
    }
    pinInstance.peripheral.write(value ? HIGH : LOW);
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "servoWrite", {
  value: function(pin, value) {
    var pinInstance = this[getPinInstance](pin);
    if (pinInstance.mode != SERVO_MODE) {
      throw new Error('Cannot servoWrite to pin "' + pin + '" unless it is in PWM mode');
    }
    pinInstance.peripheral.write(Math.round(value * 1024 / 255));
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "queryCapabilities", {
  value: function() {
    throw 'queryCapabilities is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "queryAnalogMapping", {
  value: function() {
    throw 'queryAnalogMapping is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "queryPinState", {
  value: function() {
    throw 'queryPinState is not yet implemented';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF5QkE7Ozs7Ozs7O0VBQU8sR0FBQyxFQ3pCUixFQUFDLFNBQW9CLENBQUEsT0FBTSxBQUFDLE1BQWtCLENBQ3RDLENBQUEsVUFBcUIsbUJBQTJCLENBQUEsVUFBcUIsR0FBSyxFQUFDLE9BQU0sU0FBbUIsQ0FEOUQsQUFDK0QsQ0FBQztFRHlCdkcsT0FBSyxFQzFCWixFQUFDLGFBQW9CLENBQUEsT0FBTSxBQUFDLFVBQWtCLENBQ3RDLENBQUEsY0FBcUIsdUJBQTJCLENBQUEsY0FBcUIsR0FBSyxFQUFDLE9BQU0sYUFBbUIsQ0FEOUQsQUFDK0QsQ0FBQztFRDBCckcsS0FBRyxFQzNCWixFQUFDLG9CQUFvQixDQUFBLE9BQU0sQUFBQyxjQUFrQixDQUN0QyxDQUFBLHFCQUFxQiw4QkFBMkIsQ0FBQSxxQkFBcUIsR0FBSyxFQUFDLE9BQU0sb0JBQW1CLENBRDlELEFBQytELENBQUM7U0FEOUcsRUFBQyxxQkFBb0IsQ0FBQSxPQUFNLEFBQUMsZUFBa0IsQ0FDdEMsQ0FBQSxzQkFBcUIsK0JBQTJCLENBQUEsc0JBQXFCLEdBQUssRUFBQyxPQUFNLHFCQUFtQixDQUQ5RCxBQUMrRCxDQUFDO0FEMkJyRyxVQUFNO0FBQUcsZUFBVztTQzVCN0IsRUFBQyxvQkFBb0IsQ0FBQSxPQUFNLEFBQUMsY0FBa0IsQ0FDdEMsQ0FBQSxxQkFBcUIsOEJBQTJCLENBQUEscUJBQXFCLEdBQUssRUFBQyxPQUFNLG9CQUFtQixDQUQ5RCxBQUMrRCxDQUFDO0FENEJyRyxnQkFBWTtB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ImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgKGMpIDIwMTQgQnJ5YW4gSHVnaGVzIDxicnlhbkB0aGVvcmV0aWNhbGlkZWF0aW9ucy5jb20+XG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uXG5vYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvblxuZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dFxucmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsXG5jb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlXG5Tb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZ1xuY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFU1xuT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbk5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUXG5IT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSxcbldIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lOR1xuRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUlxuT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBldmVudHMgZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7IGluaXQgfSBmcm9tICdyYXNwaS1jb3JlJztcbmltcG9ydCB7IGdldFBpbnMsIGdldFBpbk51bWJlciB9IGZyb20gJ3Jhc3BpLWJvYXJkJztcbmltcG9ydCB7IERpZ2l0YWxPdXRwdXQsIERpZ2l0YWxJbnB1dCB9IGZyb20gJ3Jhc3BpLWdwaW8nO1xuaW1wb3J0IHsgUFdNIH0gZnJvbSAncmFzcGktcHdtJztcblxuLy8gQ2hlY2sgZm9yIHJvb3QgYWNjZXNzXG5pZiAocHJvY2Vzcy5lbnYuVVNFUiAhPSAncm9vdCcpIHtcbiAgY29uc29sZS53YXJuKCdXQVJOSU5HOiBSYXNwaS1JTyB1c3VhbGx5IG5lZWRzIHRvIGJlIHJ1biB3aXRoIHJvb3QgcHJpdmlsZWdlcyB0byBhY2Nlc3MgaGFyZHdhcmUsIGJ1dCBpdCBkb2VzblxcJ3QgYXBwZWFyIHRvIGJlIHJ1bm5pbmcgYXMgcm9vdCBjdXJyZW50bHknKTtcbn1cblxuLy8gQ29uc3RhbnRzXG52YXIgSU5QVVRfTU9ERSA9IDA7XG52YXIgT1VUUFVUX01PREUgPSAxO1xudmFyIEFOQUxPR19NT0RFID0gMjtcbnZhciBQV01fTU9ERSA9IDM7XG52YXIgU0VSVk9fTU9ERSA9IDQ7XG52YXIgVU5LTk9XTl9NT0RFID0gOTk7XG5cbnZhciBMT1cgPSAwO1xudmFyIEhJR0ggPSAxO1xuXG52YXIgTEVEID0gJ2xlZDAnO1xuXG4vLyBTZXR0aW5nc1xuXG52YXIgRElHSVRBTF9SRUFEX1VQREFURV9SQVRFID0gMTk7XG5cbi8vIEhhY2t5IGJ1dCBmYXN0IGVtdWxhdGlvbiBvZiBzeW1ib2xzLCBlbGltaW5hdGluZyB0aGUgbmVlZCBmb3IgJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkgY2FsbHNcbnZhciBpc1JlYWR5ID0gJ19fciQyNzE4MjhfMCRfXyc7XG52YXIgcGlucyA9ICdfX3IkMjcxODI4XzEkX18nO1xudmFyIGluc3RhbmNlcyA9ICdfX3IkMjcxODI4XzIkX18nO1xudmFyIGFuYWxvZ1BpbnMgPSAnX19yJDI3MTgyOF8zJF9fJztcbnZhciBtb2RlID0gJ19fJDI3MTgyOF80JF9fJztcbnZhciBnZXRQaW5JbnN0YW5jZSA9ICdfXyQyNzE4MjhfNSRfXyc7XG5cbmNsYXNzIFJhc3BpIGV4dGVuZHMgZXZlbnRzLkV2ZW50RW1pdHRlciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIG5hbWU6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6ICdSYXNwYmVycnlQaS1JTydcbiAgICAgIH0sXG5cbiAgICAgIFtpbnN0YW5jZXNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG5cbiAgICAgIFtpc1JlYWR5XToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICB9LFxuICAgICAgaXNSZWFkeToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbaXNSZWFkeV07XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFtwaW5zXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuICAgICAgcGluczoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbcGluc107XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFthbmFsb2dQaW5zXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuICAgICAgYW5hbG9nUGluczoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbYW5hbG9nUGluc107XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIE1PREVTOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICBJTlBVVDogSU5QVVRfTU9ERSxcbiAgICAgICAgICBPVVRQVVQ6IE9VVFBVVF9NT0RFLFxuICAgICAgICAgIEFOQUxPRzogQU5BTE9HX01PREUsXG4gICAgICAgICAgUFdNOiBQV01fTU9ERSxcbiAgICAgICAgICBTRVJWTzogU0VSVk9fTU9ERVxuICAgICAgICB9KVxuICAgICAgfSxcblxuICAgICAgSElHSDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogSElHSFxuICAgICAgfSxcbiAgICAgIExPVzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTE9XXG4gICAgICB9LFxuXG4gICAgICBkZWZhdWx0TGVkOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBMRURcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGluaXQoKCkgPT4ge1xuICAgICAgdmFyIHBpbk1hcHBpbmdzID0gZ2V0UGlucygpO1xuICAgICAgdGhpc1twaW5zXSA9IChPYmplY3Qua2V5cyhwaW5NYXBwaW5ncykubWFwKChwaW4pID0+IHtcbiAgICAgICAgdmFyIHBpbkluZm8gPSBwaW5NYXBwaW5nc1twaW5dO1xuICAgICAgICB2YXIgc3VwcG9ydGVkTW9kZXMgPSBbIElOUFVUX01PREUsIE9VVFBVVF9NT0RFIF07XG4gICAgICAgIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ3B3bScpICE9IC0xKSB7XG4gICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChQV01fTU9ERSwgU0VSVk9fTU9ERSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl0gPSB7XG4gICAgICAgICAgcGVyaXBoZXJhbDogbmV3IERpZ2l0YWxJbnB1dChwaW4pLFxuICAgICAgICAgIG1vZGU6IElOUFVUX01PREUsXG4gICAgICAgICAgcHJldmlvdXNXcml0dGVuVmFsdWU6IExPV1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgICAgc3VwcG9ydGVkTW9kZXM6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZShzdXBwb3J0ZWRNb2RlcylcbiAgICAgICAgICB9LFxuICAgICAgICAgIG1vZGU6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLm1vZGU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICBzd2l0Y2goaW5zdGFuY2UubW9kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgT1VUUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWU7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UubW9kZSA9PSBPVVRQVVRfTU9ERSAmJiB2YWx1ZSAhPSBpbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSkge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUodmFsdWUpO1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlcG9ydDoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhbmFsb2dDaGFubmVsOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IDEyN1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KSk7XG5cbiAgICAgIHRoaXNbaXNSZWFkeV0gPSB0cnVlO1xuICAgICAgdGhpcy5lbWl0KCdyZWFkeScpO1xuICAgICAgdGhpcy5lbWl0KCdjb25uZWN0Jyk7XG4gICAgfSk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aHJvdyAncmVzZXQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJztcbiAgfVxuXG4gIG5vcm1hbGl6ZShwaW4pIHtcbiAgICByZXR1cm4gZ2V0UGluTnVtYmVyKHBpbik7XG4gIH1cblxuICBbZ2V0UGluSW5zdGFuY2VdKHBpbikge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbaW5zdGFuY2VzXVtwaW5dO1xuICAgIGlmICghcGluSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBwaW4gXCInICsgcGluICsgJ1wiJyk7XG4gICAgfVxuICAgIHJldHVybiBwaW5JbnN0YW5jZTtcbiAgfVxuXG4gIHBpbk1vZGUocGluLCBtb2RlKSB7XG4gICAgY29uc29sZS5sb2coJ1NldHRpbmcgcGluIFwiJyArIHBpbiArICdcIiB0byBtb2RlICcgKyBtb2RlKTtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXShwaW4pO1xuICAgIGlmICh0aGlzW3BpbnNdW3Bpbl0uc3VwcG9ydGVkTW9kZXMuaW5kZXhPZihtb2RlKSA9PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQaW4gXCInICsgcGluICsgJ1wiIGRvZXMgbm90IHN1cHBvcnQgbW9kZSBcIicgKyBtb2RlICsgJ1wiJyk7XG4gICAgfVxuICAgIHN3aXRjaChtb2RlKSB7XG4gICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbElucHV0KHBpbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBPVVRQVVRfTU9ERTpcbiAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBEaWdpdGFsT3V0cHV0KHBpbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBQV01fTU9ERTpcbiAgICAgIGNhc2UgU0VSVk9fTU9ERTpcbiAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBQV00ocGluKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLm1vZGUgPSBtb2RlO1xuICB9XG5cbiAgYW5hbG9nUmVhZChwaW4sIGhhbmRsZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2FuYWxvZ1JlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBhbmFsb2dXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0ocGluKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBQV01fTU9ERSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgYW5hbG9nV3JpdGUgdG8gcGluIFwiJyArIHBpbiArICdcIiB1bmxlc3MgaXQgaXMgaW4gUFdNIG1vZGUnKTtcbiAgICB9XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZShNYXRoLnJvdW5kKHZhbHVlICogMTAyNCAvIDI1NSkpO1xuICB9XG5cbiAgZGlnaXRhbFJlYWQocGluLCBoYW5kbGVyKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0ocGluKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBJTlBVVF9NT0RFKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBkaWdpdGFsUmVhZCBmcm9tIHBpbiBcIicgKyBwaW4gKyAnXCIgdW5sZXNzIGl0IGlzIGluIElOUFVUIG1vZGUnKTtcbiAgICB9XG4gICAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgdmFyIHZhbHVlID0gcGluSW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICBoYW5kbGVyICYmIGhhbmRsZXIodmFsdWUpO1xuICAgICAgdGhpcy5lbWl0KCdkaWdpdGFsLXJlYWQtJyArIHBpbiwgdmFsdWUpO1xuICAgIH0sIERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSk7XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC5vbignZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgfSk7XG4gIH1cblxuICBkaWdpdGFsV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHBpbik7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gT1VUUFVUX01PREUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGRpZ2l0YWxXcml0ZSB0byBwaW4gXCInICsgcGluICsgJ1wiIHVubGVzcyBpdCBpcyBpbiBPVVRQVVQgbW9kZScpO1xuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlID8gSElHSCA6IExPVyk7XG4gIH1cblxuICBzZXJ2b1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXShwaW4pO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFNFUlZPX01PREUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHNlcnZvV3JpdGUgdG8gcGluIFwiJyArIHBpbiArICdcIiB1bmxlc3MgaXQgaXMgaW4gUFdNIG1vZGUnKTtcbiAgICB9XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZShNYXRoLnJvdW5kKHZhbHVlICogMTAyNCAvIDI1NSkpO1xuICB9XG5cbiAgcXVlcnlDYXBhYmlsaXRpZXMoKSB7XG4gICAgdGhyb3cgJ3F1ZXJ5Q2FwYWJpbGl0aWVzIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgcXVlcnlBbmFsb2dNYXBwaW5nKCkge1xuICAgIHRocm93ICdxdWVyeUFuYWxvZ01hcHBpbmcgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBxdWVyeVBpblN0YXRlKCkge1xuICAgIHRocm93ICdxdWVyeVBpblN0YXRlIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZEkyQ0NvbmZpZygpIHtcbiAgICB0aHJvdyAnc2VuZEkyQ0NvbmZpZyBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRJMkNXcml0ZVJlcXVlc3QoKSB7XG4gICAgdGhyb3cgJ3NlbmRJMkNXcml0ZVJlcXVlc3QgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kSTJDUmVhZFJlcXVlc3QoKSB7XG4gICAgdGhyb3cgJ3NlbmRJMkNSZWFkUmVxdWVzdCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNldFNhbXBsaW5nSW50ZXJ2YWwoKSB7XG4gICAgdGhyb3cgJ3NldFNhbXBsaW5nSW50ZXJ2YWwgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICByZXBvcnRBbmFsb2dQaW4oKSB7XG4gICAgdGhyb3cgJ3JlcG9ydEFuYWxvZ1BpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHJlcG9ydERpZ2l0YWxQaW4oKSB7XG4gICAgdGhyb3cgJ3JlcG9ydERpZ2l0YWxQaW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBwdWxzZUluKCkge1xuICAgIHRocm93ICdwdWxzZUluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc3RlcHBlckNvbmZpZygpIHtcbiAgICB0aHJvdyAnc3RlcHBlckNvbmZpZyBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHN0ZXBwZXJTdGVwKCkge1xuICAgIHRocm93ICdzdGVwcGVyU3RlcCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlQ29uZmlnKCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZUNvbmZpZyBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlU2VhcmNoKCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVNlYXJjaCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlQWxhcm1zU2VhcmNoKCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZUFsYXJtc1NlYXJjaCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlUmVhZCgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVSZWFkIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVSZXNldCgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVSZXNldCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlV3JpdGUoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlV3JpdGUgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZURlbGF5KCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZURlbGF5IGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlV3JpdGVBbmRSZWFkIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShSYXNwaSwgJ2lzUmFzcGJlcnJ5UGknLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIHZhbHVlOiAoKSA9PiB7XG4gICAgLy8gRGV0ZXJtaW5pbmcgaWYgYSBzeXN0ZW0gaXMgYSBSYXNwYmVycnkgUGkgaXNuJ3QgcG9zc2libGUgdGhyb3VnaFxuICAgIC8vIHRoZSBvcyBtb2R1bGUgb24gUmFzcGJpYW4sIHNvIHdlIHJlYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0gaW5zdGVhZFxuICAgIHZhciBpc1Jhc3BiZXJyeVBpID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIGlzUmFzcGJlcnJ5UGkgPSBmcy5yZWFkRmlsZVN5bmMoJy9ldGMvb3MtcmVsZWFzZScpLnRvU3RyaW5nKCkuaW5kZXhPZignUmFzcGJpYW4nKSAhPT0gLTE7XG4gICAgfSBjYXRjaChlKSB7fS8vIFNxdWFzaCBmaWxlIG5vdCBmb3VuZCwgZXRjIGVycm9yc1xuICAgIHJldHVybiBpc1Jhc3BiZXJyeVBpO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXNwaTsiLCIoJF9fcGxhY2Vob2xkZXJfXzAgPSByZXF1aXJlKCRfX3BsYWNlaG9sZGVyX18xKSwgXG4gICAgICAgICRfX3BsYWNlaG9sZGVyX18yICYmICRfX3BsYWNlaG9sZGVyX18zLl9fZXNNb2R1bGUgJiYgJF9fcGxhY2Vob2xkZXJfXzQgfHwge2RlZmF1bHQ6ICRfX3BsYWNlaG9sZGVyX181fSkiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIiR0cmFjZXVyUnVudGltZS5zdXBlckNhbGwoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9