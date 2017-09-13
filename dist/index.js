'use strict';

var _raspiIoCore = require('raspi-io-core');

module.exports = function RaspiIO() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      includePins = _ref.includePins,
      excludePins = _ref.excludePins,
      _ref$enableSoftPwm = _ref.enableSoftPwm,
      enableSoftPwm = _ref$enableSoftPwm === undefined ? false : _ref$enableSoftPwm,
      enableSerial = _ref.enableSerial;

  var board = require('raspi-board');

  var platform = {
    'raspi': require('raspi'),
    'raspi-board': board,
    'raspi-gpio': require('raspi-gpio'),
    'raspi-i2c': require('raspi-i2c'),
    'raspi-led': require('raspi-led'),
    'raspi-pwm': require('raspi-pwm')
  };

  if (typeof enableSerial === 'undefined') {
    enableSerial = board.getBoardRevision() !== board.VERSION_3_MODEL_B && board.getBoardRevision() !== board.VERSION_1_MODEL_ZERO_W;
  }
  if (enableSerial) {
    platform['raspi-serial'] = require('raspi-serial');
  }

  if (enableSoftPwm) {
    platform['raspi-soft-pwm'] = require('raspi-soft-pwm');
  }

  return new _raspiIoCore.RaspiIOCore({
    includePins: includePins,
    excludePins: excludePins,
    enableSerial: enableSerial,
    enableSoftPwm: enableSoftPwm,
    platform: platform
  });
}; /*
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

//# sourceMappingURL=index.js.map