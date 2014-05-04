Raspi-io
========

Raspi-io is a Firmata API compatible library for the [Raspberry Pi](http://www.raspberrypi.org/) that can be used as an I/O plugin with [Johnny-Five](https://github.com/rwaldron/johnny-five). The official API docs can be found on the [Johnny-Five Wiki](https://github.com/rwaldron/johnny-five/wiki/IO-Plugins)

## Installation

```
npm install raspi-io
```

## Usage

```
var raspi = require('raspi-io');
var board = new raspi();

// Initialize the board
board.on('ready', function () {

  // Set pin 7 (GPIO 4) as an output
  board.pinMode(7, board.MODES.OUTPUT);

  // Set pin 7's output to logic high
  board.pins[7].value = board.HIGH;

  // Read a pin value
  console.log(board.pins[7].value); // outputs "1"

});
```

In addition to the base Minimum Plugin Class Requirements as specified in the I/O plugin API for Johnny-Five, the following methods are supported: pinMode, digitalRead, and digitalWrite

License
=======

The MIT License (MIT)

Copyright (c) 2014 Bryan Hughes bryan@theoreticalideations.com (https://theoreticalideations.com)

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