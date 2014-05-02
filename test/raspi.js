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

var Raspi = require('../lib/raspi');
var numPassed = 0;
var numFailed = 0;
var isManaged = process.argv[2] == '--managed';

if (isManaged) {
  runTests();
} else {
  console.log('Connect pin 7 (GPIO 4) to pin 11 (GPIO 17) and hit ENTER when done');
  var pollInterval = setInterval(function () {
    if (process.stdin.read() !== null) {
      clearInterval(pollInterval);
      runTests();
    }
  }, 10);
}

function runTests() {
  testRaspi(function () {
    if (isManaged) {
      process.send({
        numPassed: numPassed,
        numFailed: numFailed
      });
    } else {
      if (numPassed && numFailed) {
        console.log('\n' + numPassed + ' tests passed and ' + numFailed + ' tests failed\n');
      } else if (numPassed) {
        console.log('\n' + numPassed + ' tests passed\n');
      } else if (numFailed) {
        console.log('\n' + numFailed + ' tests failed\n');
      } else {
        console.log('\nNo tests finished\n');
      }
    }
    process.exit();
  });
}

function testRaspi(cb) {
  var board = new Raspi();
  board.on('ready', function () {
    board.pinMode(7, board.MODES.OUTPUT);
    board.pinMode(11, board.MODES.INPUT);

    board.digitalWrite(7, 1);
    process.stdout.write('Writing 1 to pin 7 and reading it back on pin 11...');
    if (board.pins[11].value !== 1) {
      numFailed++;
      process.stdout.write('Failed\n');
    } else {
      numPassed++;
      process.stdout.write('Passed\n');
    }

    board.pins[7].value = 0;
    process.stdout.write('Writing 0 to pin 7 and reading it back on pin 11...');
    if (board.pins[11].value !== 0) {
      numFailed++;
      process.stdout.write('Failed\n');
    } else {
      numPassed++;
      process.stdout.write('Passed\n');
    }

    var setValue = 0;
    var testFailed = false;
    var lastToggled = Date.now();
    process.stdout.write('Continuously reading pin 11 and toggling it from pin 7...');
    board.digitalRead(11, function (readValue) {
      // Due to the asynchronous nature of watching, this test inherently has a
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
        board.pins[7].value = setValue;
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