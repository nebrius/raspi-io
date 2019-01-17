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
const core_io_1 = require("core-io");
const raspi_board_1 = require("raspi-board");
const raspi_1 = require("raspi");
const raspi_gpio_1 = require("raspi-gpio");
const raspi_i2c_1 = require("raspi-i2c");
const raspi_led_1 = require("raspi-led");
const raspi_soft_pwm_1 = require("raspi-soft-pwm");
const raspi_serial_1 = require("raspi-serial");
module.exports = function RaspiIO({ includePins, excludePins, enableSerial } = {}) {
    const options = {
        pluginName: 'Raspi IO',
        pinInfo: raspi_board_1.getPins(),
        platform: {
            base: raspi_1.module,
            gpio: raspi_gpio_1.module,
            i2c: raspi_i2c_1.module,
            led: raspi_led_1.module,
            pwm: raspi_soft_pwm_1.module
        }
    };
    if (typeof enableSerial === 'undefined') {
        enableSerial =
            raspi_board_1.getBoardRevision() !== raspi_board_1.VERSION_3_MODEL_A_PLUS &&
                raspi_board_1.getBoardRevision() !== raspi_board_1.VERSION_3_MODEL_B_PLUS &&
                raspi_board_1.getBoardRevision() !== raspi_board_1.VERSION_3_MODEL_B &&
                raspi_board_1.getBoardRevision() !== raspi_board_1.VERSION_1_MODEL_ZERO_W;
    }
    if (enableSerial) {
        options.platform.serial = raspi_serial_1.module;
        options.serialIds = {
            DEFAULT: raspi_serial_1.DEFAULT_PORT
        };
    }
    // TODO
    // if (Array.isArray(includePins)) {
    //   const newPinMappings = {};
    //   for (const pin of includePins) {
    //     const normalizedPin = this[raspiBoardModule].getPinNumber(pin);
    //     if (normalizedPin === null) {
    //       throw new Error(`Invalid pin "${pin}" specified in includePins`);
    //     }
    //     newPinMappings[normalizedPin] = pinMappings[normalizedPin];
    //   }
    //   pinMappings = newPinMappings;
    // } else if (Array.isArray(excludePins)) {
    //   pinMappings = Object.assign({}, pinMappings);
    //   for (const pin of excludePins) {
    //     const normalizedPin = this[raspiBoardModule].getPinNumber(pin);
    //     if (normalizedPin === null) {
    //       throw new Error(`Invalid pin "${pin}" specified in excludePins`);
    //     }
    //     delete pinMappings[normalizedPin];
    //   }
    // }
    return new core_io_1.CoreIO(options);
};
//# sourceMappingURL=index.js.map