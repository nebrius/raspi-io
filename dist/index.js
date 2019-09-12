"use strict";
/*
The MIT License (MIT)

Copyright (c) 2014-2017 Bryan Hughes <bryan@nebri.us>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
Object.defineProperty(exports, "__esModule", { value: true });
const j5_io_1 = require("j5-io");
const j5_io_types_1 = require("j5-io-types");
const raspi_board_1 = require("raspi-board");
const raspi_1 = require("raspi");
const raspi_gpio_1 = require("raspi-gpio");
const raspi_i2c_1 = require("raspi-i2c");
const raspi_led_1 = require("raspi-led");
const raspi_soft_pwm_1 = require("raspi-soft-pwm");
const raspi_serial_1 = require("raspi-serial");
const clone = require("clone");
function RaspiIO({ includePins, excludePins, enableSerial, enableI2C = true } = {}) {
    const options = {
        pluginName: 'Raspi IO',
        pinInfo: clone(raspi_board_1.getPins()),
        platform: {
            base: raspi_1.module,
            gpio: raspi_gpio_1.module,
            led: raspi_led_1.module,
            pwm: raspi_soft_pwm_1.module
        }
    };
    if (enableI2C) {
        options.platform.i2c = raspi_i2c_1.module;
        options.i2cIds = {
            DEFAULT: raspi_board_1.getBoardRevision() === raspi_board_1.VERSION_1_MODEL_B_REV_1 ? 0 : 1
        };
    }
    if (typeof enableSerial === 'undefined') {
        const boardRevision = raspi_board_1.getBoardRevision();
        enableSerial =
            boardRevision === raspi_board_1.VERSION_1_MODEL_B_REV_1 ||
                boardRevision === raspi_board_1.VERSION_1_MODEL_B_REV_2 ||
                boardRevision === raspi_board_1.VERSION_1_MODEL_B_PLUS ||
                boardRevision === raspi_board_1.VERSION_1_MODEL_A_PLUS ||
                boardRevision === raspi_board_1.VERSION_1_MODEL_ZERO ||
                boardRevision === raspi_board_1.VERSION_2_MODEL_B;
    }
    if (enableSerial) {
        options.platform.serial = raspi_serial_1.module;
        options.serialIds = {
            DEFAULT: raspi_serial_1.DEFAULT_PORT
        };
    }
    // Clone the pins so the internal object in raspi-board isn't mutated
    if (Array.isArray(includePins)) {
        const newPinMappings = {};
        for (const pin of includePins) {
            const normalizedPin = raspi_board_1.getPinNumber(pin);
            if (normalizedPin === null) {
                throw new Error(`Invalid pin "${pin}" specified in includePins`);
            }
            newPinMappings[normalizedPin] = options.pinInfo[normalizedPin];
        }
        options.pinInfo = newPinMappings;
    }
    else if (Array.isArray(excludePins)) {
        for (const pin of excludePins) {
            const normalizedPin = raspi_board_1.getPinNumber(pin);
            if (normalizedPin === null) {
                throw new Error(`Invalid pin "${pin}" specified in excludePins`);
            }
            delete options.pinInfo[normalizedPin];
        }
    }
    // We use software PWM for everything, so we need to modify the peripherals to reflect this
    for (const pin in options.pinInfo) {
        if (!options.pinInfo.hasOwnProperty(pin)) {
            continue;
        }
        const peripherals = options.pinInfo[pin].peripherals;
        if (peripherals.indexOf(j5_io_types_1.PeripheralType.GPIO) !== -1 && peripherals.indexOf(j5_io_types_1.PeripheralType.PWM) === -1) {
            peripherals.push(j5_io_types_1.PeripheralType.PWM);
        }
    }
    // I2C pins need to be dedicated in Raspi IO, so filter out any peripherals other than I2C on I2C pins
    if (enableI2C) {
        for (const pin in options.pinInfo) {
            if (!options.pinInfo.hasOwnProperty(pin)) {
                continue;
            }
            if (options.pinInfo[pin].peripherals.indexOf(j5_io_types_1.PeripheralType.I2C) !== -1) {
                options.pinInfo[pin].peripherals = [j5_io_types_1.PeripheralType.I2C];
            }
        }
    }
    // UART pins need to be dedicated in Raspi IO, so filter out any peripherals other than UART on UART pins
    if (enableSerial) {
        for (const pin in options.pinInfo) {
            if (!options.pinInfo.hasOwnProperty(pin)) {
                continue;
            }
            if (options.pinInfo[pin].peripherals.indexOf(j5_io_types_1.PeripheralType.UART) !== -1) {
                options.pinInfo[pin].peripherals = [j5_io_types_1.PeripheralType.UART];
            }
        }
    }
    return new j5_io_1.J5IO(options);
}
exports.RaspiIO = RaspiIO;
//# sourceMappingURL=index.js.map