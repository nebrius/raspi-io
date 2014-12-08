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
      throw new Error('Cannot servoWrite to pin "' + pin + '" unless it is in PWM mode');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF5QkE7Ozs7Ozs7O0VBQU8sR0FBQyxFQ3pCUixFQUFDLFNBQW9CLENBQUEsT0FBTSxBQUFDLE1BQWtCLENBQ3RDLENBQUEsVUFBcUIsbUJBQTJCLENBQUEsVUFBcUIsR0FBSyxFQUFDLE9BQU0sU0FBbUIsQ0FEOUQsQUFDK0QsQ0FBQztFRHlCdkcsT0FBSyxFQzFCWixFQUFDLGFBQW9CLENBQUEsT0FBTSxBQUFDLFVBQWtCLENBQ3RDLENBQUEsY0FBcUIsdUJBQTJCLENBQUEsY0FBcUIsR0FBSyxFQUFDLE9BQU0sYUFBbUIsQ0FEOUQsQUFDK0QsQ0FBQztFRDBCckcsS0FBRyxFQzNCWixFQUFDLG9CQUFvQixDQUFBLE9BQU0sQUFBQyxjQUFrQixDQUN0QyxDQUFBLHFCQUFxQiw4QkFBMkIsQ0FBQSxxQkFBcUIsR0FBSyxFQUFDLE9BQU0sb0JBQW1CLENBRDlELEFBQytELENBQUM7U0FEOUcsRUFBQyxxQkFBb0IsQ0FBQSxPQUFNLEFBQUMsZUFBa0IsQ0FDdEMsQ0FBQSxzQkFBcUIsK0JBQTJCLENBQUEsc0JBQXFCLEdBQUssRUFBQyxPQUFNLHFCQUFtQixDQUQ5RCxBQUMrRCxDQUFDO0FEMkJyRyxVQUFNO0FBQUcsZUFBVztTQzVCN0IsRUFBQyxvQkFBb0IsQ0FBQSxPQUFNLEFBQUMsY0FBa0IsQ0FDdEMsQ0FBQSxxQkFBcUIsOEJBQTJCLENBQUEscUJBQXFCLEdBQUssRUFBQyxPQUFNLG9CQUFtQixDQUQ5RCxBQUMrRCxDQUFDO0FENEJyRyxnQkFBWTtB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QUFHWCxBQUFJLE1BQUEsQ0FBQSxhQUFZLEVBQUksTUFBSSxDQUFDO0FBQ3pCLE1BQUk7QUFDRixrQkFBWSxFQUFJLENBQUEsRUFBQyxhQUFhLEFBQUMsQ0FBQyxpQkFBZ0IsQ0FBQyxTQUFTLEFBQUMsRUFBQyxRQUFRLEFBQUMsQ0FBQyxVQUFTLENBQUMsQ0FBQSxHQUFNLEVBQUMsQ0FBQSxDQUFDO0lBQzFGLENBQUUsT0FBTSxDQUFBLENBQUcsR0FBQztBQUFBLEFBQ1osU0FBTyxjQUFZLENBQUM7RUFDdEIsQ0FBQTtBQUNGLENBQUMsQ0FBQztBQUVGLEtBQUssUUFBUSxFQUFJLE1BQUksQ0FBQztBQUFBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAoYykgMjAxNCBCcnlhbiBIdWdoZXMgPGJyeWFuQHRoZW9yZXRpY2FsaWRlYXRpb25zLmNvbT5cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb25cbm9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uXG5maWxlcyAodGhlICdTb2Z0d2FyZScpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0XG5yZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSxcbmNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGVcblNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nXG5jb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTXG5PRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxuTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFRcbkhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLFxuV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HXG5GUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SXG5PVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IGV2ZW50cyBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgaW5pdCB9IGZyb20gJ3Jhc3BpLWNvcmUnO1xuaW1wb3J0IHsgZ2V0UGlucywgZ2V0UGluTnVtYmVyIH0gZnJvbSAncmFzcGktYm9hcmQnO1xuaW1wb3J0IHsgRGlnaXRhbE91dHB1dCwgRGlnaXRhbElucHV0IH0gZnJvbSAncmFzcGktZ3Bpbyc7XG5pbXBvcnQgeyBQV00gfSBmcm9tICdyYXNwaS1wd20nO1xuXG4vLyBDaGVjayBmb3Igcm9vdCBhY2Nlc3NcbmlmIChwcm9jZXNzLmVudi5VU0VSICE9ICdyb290Jykge1xuICBjb25zb2xlLndhcm4oJ1dBUk5JTkc6IFJhc3BpLUlPIHVzdWFsbHkgbmVlZHMgdG8gYmUgcnVuIHdpdGggcm9vdCBwcml2aWxlZ2VzIHRvIGFjY2VzcyBoYXJkd2FyZSwgYnV0IGl0IGRvZXNuXFwndCBhcHBlYXIgdG8gYmUgcnVubmluZyBhcyByb290IGN1cnJlbnRseScpO1xufVxuXG4vLyBDb25zdGFudHNcbnZhciBJTlBVVF9NT0RFID0gMDtcbnZhciBPVVRQVVRfTU9ERSA9IDE7XG52YXIgQU5BTE9HX01PREUgPSAyO1xudmFyIFBXTV9NT0RFID0gMztcbnZhciBTRVJWT19NT0RFID0gNDtcbnZhciBVTktOT1dOX01PREUgPSA5OTtcblxudmFyIExPVyA9IDA7XG52YXIgSElHSCA9IDE7XG5cbnZhciBMRUQgPSAnbGVkMCc7XG5cbi8vIFNldHRpbmdzXG5cbnZhciBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUgPSAxOTtcblxuLy8gSGFja3kgYnV0IGZhc3QgZW11bGF0aW9uIG9mIHN5bWJvbHMsIGVsaW1pbmF0aW5nIHRoZSBuZWVkIGZvciAkdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eSBjYWxsc1xudmFyIGlzUmVhZHkgPSAnX19yJDI3MTgyOF8wJF9fJztcbnZhciBwaW5zID0gJ19fciQyNzE4MjhfMSRfXyc7XG52YXIgaW5zdGFuY2VzID0gJ19fciQyNzE4MjhfMiRfXyc7XG52YXIgYW5hbG9nUGlucyA9ICdfX3IkMjcxODI4XzMkX18nO1xudmFyIG1vZGUgPSAnX18kMjcxODI4XzQkX18nO1xudmFyIGdldFBpbkluc3RhbmNlID0gJ19fJDI3MTgyOF81JF9fJztcblxuY2xhc3MgUmFzcGkgZXh0ZW5kcyBldmVudHMuRXZlbnRFbWl0dGVyIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgbmFtZToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogJ1Jhc3BiZXJyeVBpLUlPJ1xuICAgICAgfSxcblxuICAgICAgW2luc3RhbmNlc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcblxuICAgICAgW2lzUmVhZHldOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG4gICAgICBpc1JlYWR5OiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1tpc1JlYWR5XTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW3BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBwaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1twaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2FuYWxvZ1BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBhbmFsb2dQaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1thbmFsb2dQaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgTU9ERVM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgIElOUFVUOiBJTlBVVF9NT0RFLFxuICAgICAgICAgIE9VVFBVVDogT1VUUFVUX01PREUsXG4gICAgICAgICAgQU5BTE9HOiBBTkFMT0dfTU9ERSxcbiAgICAgICAgICBQV006IFBXTV9NT0RFLFxuICAgICAgICAgIFNFUlZPOiBTRVJWT19NT0RFXG4gICAgICAgIH0pXG4gICAgICB9LFxuXG4gICAgICBISUdIOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBISUdIXG4gICAgICB9LFxuICAgICAgTE9XOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBMT1dcbiAgICAgIH0sXG5cbiAgICAgIGRlZmF1bHRMZWQ6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IExFRFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaW5pdCgoKSA9PiB7XG4gICAgICB2YXIgcGluTWFwcGluZ3MgPSBnZXRQaW5zKCk7XG4gICAgICB0aGlzW3BpbnNdID0gKE9iamVjdC5rZXlzKHBpbk1hcHBpbmdzKS5tYXAoKHBpbikgPT4ge1xuICAgICAgICB2YXIgcGluSW5mbyA9IHBpbk1hcHBpbmdzW3Bpbl07XG4gICAgICAgIHZhciBzdXBwb3J0ZWRNb2RlcyA9IFsgSU5QVVRfTU9ERSwgT1VUUFVUX01PREUgXTtcbiAgICAgICAgaWYgKHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZigncHdtJykgIT0gLTEpIHtcbiAgICAgICAgICBzdXBwb3J0ZWRNb2Rlcy5wdXNoKFBXTV9NT0RFLCBTRVJWT19NT0RFKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXSA9IHtcbiAgICAgICAgICBwZXJpcGhlcmFsOiBuZXcgRGlnaXRhbElucHV0KHBpbiksXG4gICAgICAgICAgbW9kZTogSU5QVVRfTU9ERSxcbiAgICAgICAgICBwcmV2aW91c1dyaXR0ZW5WYWx1ZTogTE9XXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICBzdXBwb3J0ZWRNb2Rlczoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHN1cHBvcnRlZE1vZGVzKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLm1vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgc3dpdGNoKGluc3RhbmNlLm1vZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLm1vZGUgPT0gT1VUUFVUX01PREUpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVwb3J0OiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFuYWxvZ0NoYW5uZWw6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMTI3XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pKTtcblxuICAgICAgdGhpc1tpc1JlYWR5XSA9IHRydWU7XG4gICAgICB0aGlzLmVtaXQoJ3JlYWR5Jyk7XG4gICAgICB0aGlzLmVtaXQoJ2Nvbm5lY3QnKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRocm93ICdyZXNldCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknO1xuICB9XG5cbiAgbm9ybWFsaXplKHBpbikge1xuICAgIHJldHVybiBnZXRQaW5OdW1iZXIocGluKTtcbiAgfVxuXG4gIFtnZXRQaW5JbnN0YW5jZV0ocGluKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl07XG4gICAgaWYgKCFwaW5JbnN0YW5jZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHBpbiBcIicgKyBwaW4gKyAnXCInKTtcbiAgICB9XG4gICAgcmV0dXJuIHBpbkluc3RhbmNlO1xuICB9XG5cbiAgcGluTW9kZShwaW4sIG1vZGUpIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXShwaW4pO1xuICAgIGlmICh0aGlzW3BpbnNdW3Bpbl0uc3VwcG9ydGVkTW9kZXMuaW5kZXhPZihtb2RlKSA9PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQaW4gXCInICsgcGluICsgJ1wiIGRvZXMgbm90IHN1cHBvcnQgbW9kZSBcIicgKyBtb2RlICsgJ1wiJyk7XG4gICAgfVxuICAgIHN3aXRjaChtb2RlKSB7XG4gICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbElucHV0KHBpbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBPVVRQVVRfTU9ERTpcbiAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBEaWdpdGFsT3V0cHV0KHBpbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBQV01fTU9ERTpcbiAgICAgIGNhc2UgU0VSVk9fTU9ERTpcbiAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBQV00ocGluKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLm1vZGUgPSBtb2RlO1xuICB9XG5cbiAgYW5hbG9nUmVhZChwaW4sIGhhbmRsZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2FuYWxvZ1JlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBhbmFsb2dXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0ocGluKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBQV01fTU9ERSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgYW5hbG9nV3JpdGUgdG8gcGluIFwiJyArIHBpbiArICdcIiB1bmxlc3MgaXQgaXMgaW4gUFdNIG1vZGUnKTtcbiAgICB9XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZShNYXRoLnJvdW5kKHZhbHVlICogMTAwMCAvIDI1NSkpO1xuICB9XG5cbiAgZGlnaXRhbFJlYWQocGluLCBoYW5kbGVyKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0ocGluKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBJTlBVVF9NT0RFKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBkaWdpdGFsUmVhZCBmcm9tIHBpbiBcIicgKyBwaW4gKyAnXCIgdW5sZXNzIGl0IGlzIGluIElOUFVUIG1vZGUnKTtcbiAgICB9XG4gICAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgdmFyIHZhbHVlID0gcGluSW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICBoYW5kbGVyICYmIGhhbmRsZXIodmFsdWUpO1xuICAgICAgdGhpcy5lbWl0KCdkaWdpdGFsLXJlYWQtJyArIHBpbiwgdmFsdWUpO1xuICAgIH0sIERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSk7XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC5vbignZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgfSk7XG4gIH1cblxuICBkaWdpdGFsV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHBpbik7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gT1VUUFVUX01PREUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGRpZ2l0YWxXcml0ZSB0byBwaW4gXCInICsgcGluICsgJ1wiIHVubGVzcyBpdCBpcyBpbiBPVVRQVVQgbW9kZScpO1xuICAgIH1cbiAgICBpZiAodmFsdWUgIT0gcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWUpIHtcbiAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUodmFsdWUgPyBISUdIIDogTE9XKTtcbiAgICAgIHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgc2Vydm9Xcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0ocGluKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBTRVJWT19NT0RFKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzZXJ2b1dyaXRlIHRvIHBpbiBcIicgKyBwaW4gKyAnXCIgdW5sZXNzIGl0IGlzIGluIFBXTSBtb2RlJyk7XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUoNDggKyBNYXRoLnJvdW5kKHZhbHVlICogNDgvIDE4MCkpO1xuICB9XG5cbiAgcXVlcnlDYXBhYmlsaXRpZXMoY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcXVlcnlBbmFsb2dNYXBwaW5nKGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHF1ZXJ5UGluU3RhdGUocGluLCBjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBzZW5kSTJDQ29uZmlnKCkge1xuICAgIHRocm93ICdzZW5kSTJDQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZEkyQ1dyaXRlUmVxdWVzdCgpIHtcbiAgICB0aHJvdyAnc2VuZEkyQ1dyaXRlUmVxdWVzdCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRJMkNSZWFkUmVxdWVzdCgpIHtcbiAgICB0aHJvdyAnc2VuZEkyQ1JlYWRSZXF1ZXN0IGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2V0U2FtcGxpbmdJbnRlcnZhbCgpIHtcbiAgICB0aHJvdyAnc2V0U2FtcGxpbmdJbnRlcnZhbCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHJlcG9ydEFuYWxvZ1BpbigpIHtcbiAgICB0aHJvdyAncmVwb3J0QW5hbG9nUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgcmVwb3J0RGlnaXRhbFBpbigpIHtcbiAgICB0aHJvdyAncmVwb3J0RGlnaXRhbFBpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHB1bHNlSW4oKSB7XG4gICAgdGhyb3cgJ3B1bHNlSW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzdGVwcGVyQ29uZmlnKCkge1xuICAgIHRocm93ICdzdGVwcGVyQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc3RlcHBlclN0ZXAoKSB7XG4gICAgdGhyb3cgJ3N0ZXBwZXJTdGVwIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVDb25maWcoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVTZWFyY2goKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlU2VhcmNoIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVBbGFybXNTZWFyY2goKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlQWxhcm1zU2VhcmNoIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVSZWFkKCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVJlYWQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlc2V0KCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVJlc2V0IGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZSgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVXcml0ZSBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlRGVsYXkoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlRGVsYXkgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFJhc3BpLCAnaXNSYXNwYmVycnlQaScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgdmFsdWU6ICgpID0+IHtcbiAgICAvLyBEZXRlcm1pbmluZyBpZiBhIHN5c3RlbSBpcyBhIFJhc3BiZXJyeSBQaSBpc24ndCBwb3NzaWJsZSB0aHJvdWdoXG4gICAgLy8gdGhlIG9zIG1vZHVsZSBvbiBSYXNwYmlhbiwgc28gd2UgcmVhZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbSBpbnN0ZWFkXG4gICAgdmFyIGlzUmFzcGJlcnJ5UGkgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgaXNSYXNwYmVycnlQaSA9IGZzLnJlYWRGaWxlU3luYygnL2V0Yy9vcy1yZWxlYXNlJykudG9TdHJpbmcoKS5pbmRleE9mKCdSYXNwYmlhbicpICE9PSAtMTtcbiAgICB9IGNhdGNoKGUpIHt9Ly8gU3F1YXNoIGZpbGUgbm90IGZvdW5kLCBldGMgZXJyb3JzXG4gICAgcmV0dXJuIGlzUmFzcGJlcnJ5UGk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhc3BpOyIsIigkX19wbGFjZWhvbGRlcl9fMCA9IHJlcXVpcmUoJF9fcGxhY2Vob2xkZXJfXzEpLCBcbiAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgJiYgJF9fcGxhY2Vob2xkZXJfXzMuX19lc01vZHVsZSAmJiAkX19wbGFjZWhvbGRlcl9fNCB8fCB7ZGVmYXVsdDogJF9fcGxhY2Vob2xkZXJfXzV9KSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiJHRyYWNldXJSdW50aW1lLnN1cGVyQ2FsbCgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=