Raspi-io
========

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nebrius/raspi-io?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Raspi-io is a Firmata API compatible library for Raspbian running on the [Raspberry Pi](http://www.raspberrypi.org/) that can be used as an I/O plugin with [Johnny-Five](https://github.com/rwaldron/johnny-five). The API docs for this module can be found on the [Johnny-Five Wiki](https://github.com/rwaldron/io-plugins), except for the constructor which is documented below. Raspi IO supports all models of the Raspberry Pi, except for the Model A.

If you have a bug report, feature request, or wish to contribute code, please be sure to check out the [Contributing Guide](/CONTRIBUTING.md).

## System Requirements

- Raspberry Pi Model B Rev 1 or newer (sorry Model A users)
- Raspbian Jessie
  - [Node-RED](http://nodered.org/) works, but can be finicky and difficult to debug.
  - See https://github.com/nebrius/raspi-io/issues/24 for more info about support for other OSes
- GCC 4.8 or newer
  - This should come with Raspbian Jesse or newer
- Node 4.0.0 or newer
  - Raspi IO _may_ work on Node 0.12, but it is not tested nor supported. Bug reports will be ignored.
  - Raspi IO is known not to work on Node 0.10. Bug reports will be ignored.
- [Wiring Pi](http://wiringpi.com/)
  - If you are running the full version of Raspbian, this should come pre-installed.
  - If you are running the lite version of Raspbain, install it with `sudo apt-get install wiringpi`

Detailed instructions for getting a Raspberry Pi ready for NodeBots, including how to install Node.js, can be found in the [wiki](https://github.com/nebrius/raspi-io/wiki/Getting-a-Raspberry-Pi-ready-for-NodeBots)

**Warning:** this module must be installed as a normal user, but run as the root user

## Installation

Install with npm:

```Shell
npm install raspi-io
```

**Warning**: this module requires GCC 4.8 or newer. This means that you should be running Raspbian Jessie or newer, released in September of 2015. The package should be installed with an unprivileged user account as the installation as root is likely to fail with an [build error](https://github.com/nebrius/raspi-io/issues/40).

## Usage

Using raspi-io inside of Johnny-Five is pretty straightforward, although does take an extra step compared to the Arduino Uno:

```JavaScript
const Raspi = require('raspi-io');
const five = require('johnny-five');
const board = new five.Board({
  io: new Raspi()
});

board.on('ready', () => {

  // Create an Led on pin 7 (GPIO4) on P1 and strobe it on/off
  // Optionally set the speed; defaults to 100ms
  (new five.Led('P1-7')).strobe();

});
```

The ```io``` property must be specified explicitly to differentiate from trying to control, say, an Arduino Uno that is plugged into the Raspberry Pi. Note that we specify the pin as ```"P1-7"```, not ```7```. See the [section on pins](#pin-naming) below for an explanation of the pin numbering scheme on the Raspberry Pi.

**Warning:** this module _must_ be run as root, even though it cannot be installed as root.

**Note:** This module is not intended to be used directly. If you do not want to use Johnny-Five, I recommend taking a look at [Raspi.js](https://github.com/nebrius/raspi), which underpins this library and is a little more straight-forward to use than using raspi-io directly.

## Pin Naming

The pins on the Raspberry Pi are a little complicated. There are multiple headers on some Raspberry Pis with extra pins, and the pin numbers are not consistent between Raspberry Pi board versions.

To help make it easier, you can specify pins in three ways. The first is to specify the pin by function, e.g. ```'GPIO18'```. The second way is to specify by pin number, which is specified in the form "P[header]-[pin]", e.g. ```'P1-7'```. The final way is specify the [Wiring Pi virtual pin number](http://wiringpi.com/pins/), e.g. ```7```. If you specify a number instead of a string, it is assumed to be a Wiring Pi number.

Be sure to read the [full list of pins](https://github.com/nebrius/raspi-io/wiki/Pin-Information) on the supported models of the Raspberry Pi.

## I2C notes

There are a few limitations and extra steps to be aware of when using I2C on the Raspberry Pi.

First, note that the I2C pins can _only_ be used for I2C with Raspi IO, even though they are capable of GPIO at the hardware level.

Also note that you will need to edit ```/boot/config.txt``` in order to change the I2C baud rate from the default, if you need to. If you notice that behavior is unstable while trying to communicate with another microcontroller, try setting the baudrate to 10000 from the default 100000. This instability has been observed on the Arduino Nano before.

After you install Raspi IO for the first time, you _must_ reboot your Raspberry Pi. I2C support is not enabled by default, and this module runs a script to enable it automatically and adjust a few I2C settings. These settings will not take effect until you reboot your Pi.

Finally, if you try to access a device that doesn't exist, you will get an error stating ```EIO, i/o error``` (sorry it's not very descriptive).

## Serial notes

There are also a few limtations and extra steps to be aware of when using Serial (UART) on the Raspberry Pi.

As with I2C, the serial pins can _only_ be used for serial with Raspi IO, even though they are capable of GPIO at the hardware level.

Also as with I2C, you _must_ reboot your Raspberry Pi after install Raspi IO. Serial support is not enabled by default, and this module runs a script to enable it automatically and adjust a few serial settings. Notably, serial login is _disabled_ by this module. Be aware that having serial login enabled will cause conflicts when using serial with this module. These settings will not take effect until you reboot your Pi.

## API

### new raspi(options)

Instantiates a new Raspi IO instance with the given options

_Arguments_:

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tr>
    <td>options (optional)</td>
    <td>Object</td>
    <td>The configuration options.</td>
  </tr>
  <tr>
    <td></td>
    <td colspan="2">
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tr>
          <td>enableSoftPwm (optional)</td>
          <td>boolean</td>
          <td>Use a software-based approach to PWM on GPIO pins that do not support hardware PWM. The <a href="https://github.com/tralves/raspi-soft-pwm"><code>raspi-soft-pwm</code> library</a> is used to enable this.
          <br/><br/>
          The default value is <code>false</code>.
          <br/><br/>
          <strong>Note:</strong> the timing of software PWM may not be as accurate as hardware PWM.
          </td>
        </tr>
        <tr>
          <td>includePins (optional)</td>
          <td>Array&lt;Number|String&gt;</td>
          <td>A list of pins to include in initialization. Any pins not listed here will not be initialized or available for use by Raspi IO</td>
        </tr>
        <tr>
          <td>excludePins (optional)</td>
          <td>Array&lt;Number|String&gt;</td>
          <td>A list of pins to exclude from initialization. Any pins listed here will not be initialized or available for use by Raspi IO</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

License
=======

The MIT License (MIT)

Copyright (c) 2013-2016 Bryan Hughes bryan@nebri.us

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
