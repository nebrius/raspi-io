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

/*global
describe, it, waitsFor, runs, expect
*/

var GPIO = require('./gpio');

describe('GPIO Tests', function() {
  it('GPIO library can read-write in loopback', function() {

    // Initialize pin 7
    var pin7 = new GPIO(7);
    var pin7Initialized = false;
    pin7.init(function () {
      pin7Initialized = true;
    });

    // Initialize pin 11
    var pin11 = new GPIO(11);
    var pin11Initialized = false;
    pin11.init(function () {
      pin11Initialized = true;
    });

    // Wait for the pins to initialize
    waitsFor(function () {
      return pin7Initialized && pin11Initialized;
    });

    runs(function () {
      pin7.setDirectionSync('out');
      pin7.writeValueSync(1);
      expect(pin11.readValueSync()).toEqual(1);
      pin7.writeValueSync(0);
      expect(pin11.readValueSync()).toEqual(0);
    });
  });
});