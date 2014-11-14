Raspi-io
========

Raspi-io is a Firmata API compatible library for Raspbian running on the [Raspberry Pi](http://www.raspberrypi.org/) that
can be used as an I/O plugin with [Johnny-Five](https://github.com/rwaldron/johnny-five). The official API docs can be
found on the [Johnny-Five Wiki](https://github.com/rwaldron/johnny-five/wiki/IO-Plugins)

## Installation

```
npm install raspi-io
```

## Usage with Johnny-Five

Using raspi-io inside of Johnny-Five is pretty straightforward, although does take an extra step compared to the Arduino Uno:

```JavaScript
var raspi = require('raspi-io'),
    five = require('johnny-five'),
    board = new five.Board({
      io: new raspi()
    });

board.on('ready', function() {

  // Create an Led on pin 7 (GPIO4) and strobe it on/off
  // Optionally set the speed; defaults to 100ms
  (new five.Led(7)).strobe();

});
```

The ```io``` property must be specified explicitly to differentiate from trying to control an Arduino Uno that is plugged
into the Raspberry Pi.

## Direct Usage

```JavaScript
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

Pin numbers are identified by their pin number on the P1 header, so if you want to use GPIO 17, specify pin 11.
Read [here](http://elinux.org/Rpi_Low-level_peripherals) for the full pinout of the P1 header.

## API

### Static Methods

#### bool _constructor_.isRaspberryPi()

Returns whether or not the host device is a Raspberry Pi or not. This method only works if you are running Raspbian for now.

#### instance _constructor_()

Instantiates a new instance of the board and kicks off initialization. The board will not be fully initialized when the constructor returns. Be sure to wait for the ```ready``` event before calling any other methods on the instance.

### Instance Properties

#### _instance_.MODES

A dictionary containing the pin mode constants ```INPUT```, ```OUTPUT```, ```ANALOG```, ```PWM```, and ```SERVO```.
Not all pins support all modes.

#### _instance_.HIGH

A constant for logic high

#### _instance_.LOW

A constant for logic low

#### _instance_.defaultLed

A constant that represents the Activity LED on the Raspberry Pi. This constant can be passed as the ```pin``` value to
```pinMode```, ```digitalWrite```, etc.

#### _instance_.isReady

Indicates if the board is ready for use or not. This value is ```false``` until the ```ready``` event is fired, at which
point it is set to ```true``` for the remainder of the program's life.

#### _instance_.pins

An array of pin descriptors that corresponds to each pin on the P1 header.

### Pin Descriptors

#### _descriptor_.supportedModes

An array of the modes supported by this pin. Modes are one of the entries in ```MODES```. An empty array means this pin 
is not available for use.

#### _descriptor_.mode

The current mode of the pin, and is one of the entries in ```MODES```. The default is ```INPUT```.

#### _descriptor_.value

The value of the pin, either ```HIGH``` or ```LOW```. If the pin is in ```INPUT``` mode, reading ```value``` will invoke
a read operation on the pin and give you the current value. If the pin is in ```OUTPUT``` mode, reading ```value``` will
return the last value written to the pin, or ```LOW``` (the default). Writing to ```value``` in ```OUTPUT``` mode will set
the value of the pin. Writing to ```value``` when not in ```OUTPUT``` mode will throw an exception.

#### _descriptor_.analogChannel

The corresponding analog channel. This is Arduino specific and is always ```127``` on the Raspberry Pi.

### Instance Methods

#### _instance_.pinMode(pin, mode)

Sets the specified pin's mode. Mode must be one of _instance_.MODES.

#### _instance_.digitalRead(pin, callback(value))

Starts a read loop on the given pin and calls ```callback``` once every 1ms or so. Calling this method will also cause a
```data-read-[pin]``` event to be fired, where ```[pin]``` is the pin number. This method should be used with care because it is
CPU intensive on the Raspberry Pi.

#### _instance_.digitalWrite(pin, value)

Writes the given value to the given pin. Value must be one of ```HIGH``` or ```LOW```. Calling this method when the
input mode is not ```OUTPUT``` will throw an exception.

#### number _instance_.normalize(pin)

Takes a representation of a pin and normalizes it to a pin number. For example, passing ```'GPIO4'``` to ```normalize```
will return ```7```.

### Instance Events

#### ready ()

Fired when the board has been initialized and is ready for use. ```ready``` is fired before ```connect```.

#### connect ()

Fired when the board has been initialized and is ready for use

#### data-read-[pin] (value)

Data is available for reading on the pin number identified by p. This event is only fired if you first call ```digitalRead```.

## Further Reading

You may also be interested in the [Raspi LLIO](https://github.com/bryan-m-hughes/raspi-llio)
library, which provides access to more of the Raspberry Pi's peripherals, but is lower-level and a little harder to use.

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
