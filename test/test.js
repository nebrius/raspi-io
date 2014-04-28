/*
Copyright (c) 2014 Bryan Hughes <bryan@theoreticalideations.com> (http://theoreticalideations.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var async = require('async');
var GPIO = require('../lib/gpio');
var numPassed = 0;
var numFailed = 0;

console.log('Connect pin 7 (GPIO 4) to pin 11 (GPIO 17) and hit ENTER when done');

var pollInterval = setInterval(function () {
  if (process.stdin.read() !== null) {
    clearInterval(pollInterval);
    testGPIO(function () {
      if (numPassed && numFailed) {
        console.log('\n' + numPassed + ' tests passed and ' + numFailed + ' tests failed\n');
      } else if (numPassed) {
        console.log('\n' + numPassed + ' tests passed\n');
      } else if (numFailed) {
        console.log('\n' + numFailed + ' tests failed\n');
      } else {
        console.log('\nNo tests finished\n');
      }
      process.exit();
    });
  }
}, 10);

function testGPIO(cb) {
  // Initialize pin 7
  var pin7 = new GPIO(4);
  var pin11 = new GPIO(17);

  async.parallel([
    function (next) {
      pin7.init(function () {
        pin7.setDirectionSync('out');
        next();
      });
    },

    function (next) {
      // Initialize pin 11
      pin11.init(function () {
        pin11.setDirectionSync('in');
        next();
      });
    }
  ], function () {
    pin7.writeValueSync(1);
    process.stdout.write('Writing 1 to GPIO 4 and reading it back on GPIO 17...');
    if (pin11.readValueSync() !== 1) {
      numFailed++;
      process.stdout.write('Failed\n');
    } else {
      numPassed++;
      process.stdout.write('Passed\n');
    }

    pin7.writeValueSync(0);
    process.stdout.write('Writing 0 to GPIO 4 and reading it back on GPIO 17...');
    if (pin11.readValueSync() !== 0) {
      numFailed++;
      process.stdout.write('Failed\n');
    } else {
      numPassed++;
      process.stdout.write('Passed\n');
    }

    var setValue = 0;
    var testFailed = false;
    var lastToggled = Date.now();
    process.stdout.write('Watching GPIO 17 and toggling it from GPIO 4...');
    pin11.watchValue(function (readValue) {
      // Due to the asynchronous nature of watching, this test inherintly has a
      // race condition in it, so we need to ignore the time right after setting
      // to allow read loop to get back in sync
      if (Date.now() - lastToggled > 30 && setValue !== readValue) {
        testFailed = true;
      }
    });
    var tests = [1, 0, 1, 0];
    function toggle() {
      setValue = tests.shift();
      if (testFailed) {
        process.stdout.write('Failed\n');
        numFailed++;
        cb();
      } else if (typeof setValue != 'undefined') {
        lastToggled = Date.now();
        pin7.writeValueSync(setValue);
        setTimeout(toggle, 100);
      } else {
        process.stdout.write('Passed\n');
        numPassed++;
        cb();
      }
    }
    setTimeout(toggle, 100);
  });
}