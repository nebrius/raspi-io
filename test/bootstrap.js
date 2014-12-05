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

var fork = require('child_process').fork;
var path = require('path');
var startTime;

console.log('Connect pin 7 (GPIO 4) to pin 11 (GPIO 17) and hit ENTER when done');
var pollInterval = setInterval(function () {
  if (process.stdin.read() !== null) {
    clearInterval(pollInterval);
    startTime = Date.now();
    runRaspiTests();
  }
}, 10);

function runRaspiTests() {
  console.log('\nRunning Raspi-IO tests');
  var raspiTestProcess = fork(path.join(__dirname, 'raspi'), [ '--managed' ]);
  raspiTestProcess.on('message', function (results) {
    var numPassed = results.numPassed;
    var numFailed = results.numFailed;
    if (numPassed && numFailed) {
        console.log('\n' + numPassed + ' tests passed and ' + numFailed + ' tests failed\n');
      } else if (numPassed) {
        console.log('\n' + numPassed + ' tests passed\n');
      } else if (numFailed) {
        console.log('\n' + numFailed + ' tests failed\n');
      } else {
        console.log('\nNo tests finished\n');
      }
  });
  raspiTestProcess.on('exit', function () {
    console.log('\nFinished running tests in ' + (Date.now() - startTime) + ' ms\n');
    process.exit();
  });
}