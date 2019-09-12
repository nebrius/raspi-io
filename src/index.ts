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

import { J5IO, IOptions as IJ5IOOptions } from 'j5-io';
import { IPinInfo, PeripheralType } from 'j5-io-types';
import {
  getPins, getBoardRevision, getPinNumber,
  VERSION_1_MODEL_B_REV_1,
  VERSION_1_MODEL_B_REV_2,
  VERSION_1_MODEL_B_PLUS,
  VERSION_1_MODEL_A_PLUS,
  VERSION_1_MODEL_ZERO,
  VERSION_2_MODEL_B
} from 'raspi-board';
import { module as base } from 'raspi';
import { module as gpio } from 'raspi-gpio';
import { module as i2c } from 'raspi-i2c';
import { module as led } from 'raspi-led';
import { module as pwm } from 'raspi-soft-pwm';
import { module as serial, DEFAULT_PORT } from 'raspi-serial';
import * as clone from 'clone';

export interface IOptions {
  includePins?: Array<number | string>;
  excludePins?: Array<number | string>;
  enableSerial?: boolean;
  enableI2C?: boolean;
}

export function RaspiIO({ includePins, excludePins, enableSerial, enableI2C = true }: IOptions = {}) {
  const options: IJ5IOOptions = {
    pluginName: 'Raspi IO',
    pinInfo: clone(getPins()),
    platform: {
      base,
      gpio,
      led,
      pwm
    }
  };

  if (enableI2C) {
    options.platform.i2c = i2c;
    options.i2cIds = {
      DEFAULT: getBoardRevision() === VERSION_1_MODEL_B_REV_1 ? 0 : 1
    };
  }

  if (typeof enableSerial === 'undefined') {
    const boardRevision = getBoardRevision();
    enableSerial =
      boardRevision === VERSION_1_MODEL_B_REV_1 ||
      boardRevision === VERSION_1_MODEL_B_REV_2 ||
      boardRevision === VERSION_1_MODEL_B_PLUS ||
      boardRevision === VERSION_1_MODEL_A_PLUS ||
      boardRevision === VERSION_1_MODEL_ZERO ||
      boardRevision === VERSION_2_MODEL_B;
  }
  if (enableSerial) {
    options.platform.serial = serial;
    options.serialIds = {
      DEFAULT: DEFAULT_PORT
    };
  }

  // Clone the pins so the internal object in raspi-board isn't mutated
  if (Array.isArray(includePins)) {
    const newPinMappings: { [ pin: number ]: IPinInfo } = {};
    for (const pin of includePins) {
      const normalizedPin = getPinNumber(pin);
      if (normalizedPin === null) {
        throw new Error(`Invalid pin "${pin}" specified in includePins`);
      }
      newPinMappings[normalizedPin] = options.pinInfo[normalizedPin];
    }
    options.pinInfo = newPinMappings;
  } else if (Array.isArray(excludePins)) {
    for (const pin of excludePins) {
      const normalizedPin = getPinNumber(pin);
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
    if (peripherals.indexOf(PeripheralType.GPIO) !== -1 && peripherals.indexOf(PeripheralType.PWM) === -1) {
      peripherals.push(PeripheralType.PWM);
    }
  }

  // I2C pins need to be dedicated in Raspi IO, so filter out any peripherals other than I2C on I2C pins
  if (enableI2C) {
    for (const pin in options.pinInfo) {
      if (!options.pinInfo.hasOwnProperty(pin)) {
        continue;
      }
      if (options.pinInfo[pin].peripherals.indexOf(PeripheralType.I2C) !== -1) {
        options.pinInfo[pin].peripherals = [ PeripheralType.I2C ];
      }
    }
  }

  // UART pins need to be dedicated in Raspi IO, so filter out any peripherals other than UART on UART pins
  if (enableSerial) {
    for (const pin in options.pinInfo) {
      if (!options.pinInfo.hasOwnProperty(pin)) {
        continue;
      }
      if (options.pinInfo[pin].peripherals.indexOf(PeripheralType.UART) !== -1) {
        options.pinInfo[pin].peripherals = [ PeripheralType.UART ];
      }
    }
  }

  return new J5IO(options);
}
