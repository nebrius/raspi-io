Raspi IO
========

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nebrius/raspi-io?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Raspi IO is an I/O plugin for the [Johnny-Five](https://github.com/rwaldron/johnny-five) Node.js robotics platform that enables Johnny-Five to control the hardware on a Raspberry Pi. The API docs for this module can be found on the [Johnny-Five I/O Plugin specification page](https://github.com/rwaldron/io-plugins), except for the constructor which is documented below. Raspi IO supports all models of the Raspberry Pi, except for the Model A and compute modules.

If you have a bug report, feature request, or wish to contribute code, please be sure to check out the [Contributing Guide](/CONTRIBUTING.md).

## System Requirements

- Raspberry Pi Model B Rev 1 or newer (sorry Model A users), except compute modules
- Raspbian Jessie or newer
  - [Node-RED](http://nodered.org/) works, but can be finicky and difficult to debug.
  - See https://github.com/nebrius/raspi-io/issues/24 for more info about support for other OSes
- Node 6.4.0 or newer

Detailed instructions for getting a Raspberry Pi ready for NodeBots, including how to install Node.js, can be found in the [wiki](https://github.com/nebrius/raspi-io/wiki/Getting-a-Raspberry-Pi-ready-for-NodeBots)

**Warning:** this module must be installed as a normal user, but run as the root user

## Installation

Install with npm on a Raspberry Pi (not a laptop):

```Shell
npm install raspi-io
```

**Note:** You must reboot your Raspberry Pi the first time you install Raspi IO on it!

## Usage

Using Raspi IO inside of Johnny-Five is fairly straightforward, although does take an extra step compared to using Johnny-Five on the Arduino Uno:

```JavaScript
const Raspi = require('raspi-io').RaspiIO;
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

Then, run your code with:

```bash
sudo node index.js
```

The `io` property must be specified explicitly to differentiate from trying to control, say, an Arduino Uno that is plugged into the Raspberry Pi. Note that we specify the pin as `"P1-7"`, not `7`. See the [section on pins](#pin-naming) below for an explanation of the pin numbering scheme on the Raspberry Pi, which can be a bit confusing.

**Warning:** this module _must_ be run as root, even though it cannot be installed as root.

**Note:** This module is not intended to be used directly. If you do not want to use Johnny-Five, I recommend taking a look at [Raspi.js](https://github.com/nebrius/raspi), which underpins this library and is a little more straight-forward to use than using Raspi IO directly.

## Important Notes

### Pin Naming

The pins on the Raspberry Pi are a little complicated. There are multiple headers on some Raspberry Pis with extra pins, and the pin numbers are not consistent between Raspberry Pi board versions.

To help make it easier, you can specify pins in three ways. The first is to specify the pin by function, e.g. `'GPIO18'`. The second way is to specify by pin number, which is specified in the form "P[header]-[pin]", e.g. `'P1-7'`. The final way is specify the [Wiring Pi virtual pin number](http://wiringpi.com/pins/), e.g. `7`. If you specify a number instead of a string, it is assumed to be a Wiring Pi number.

Be sure to read the [full list of pins](https://github.com/nebrius/raspi-io/wiki/Pin-Information) on the supported models of the Raspberry Pi.

### I2C notes

There are a few limitations and extra steps to be aware of when using I2C on the Raspberry Pi.

First, note that the I2C pins can _only_ be used for I2C with Raspi IO, even though they are capable of GPIO at the hardware level.

Also note that you will need to edit `/boot/config.txt` in order to change the I2C baud rate from the default, if you need to. If you notice that behavior is unstable while trying to communicate with another microcontroller, try setting the baudrate to 10000 from the default 100000. This instability has been observed on the Arduino Nano before.

After you install Raspi IO for the first time, you _must_ reboot your Raspberry Pi. I2C support is not enabled by default, and this module runs a script to enable it automatically and adjust a few I2C settings. These settings will not take effect until you reboot your Pi.

Finally, if you try to access a device that doesn't exist, you will get an error stating `EIO, i/o error` (sorry it's not very descriptive, but it comes from the operating system and I can't change it).

### Serial notes

There are also a few limtations and extra steps to be aware of when using Serial (UART) on the Raspberry Pi.

As with I2C, the serial pins can _only_ be used for serial with Raspi IO, even though they are capable of GPIO at the hardware level.

**If you _are not_ running a Raspberry Pi without WiFi:**

All older versions of the Raspberry Pi enable a TTY console over serial, meaning that you can use the `screen` command on *NIX computers to log in to the Raspberry Pi over serial. This can get in the way of using the serial port for robotics, however. To disable TTY over serial, do the following:

1. Run `sudo raspi-config` to start the Raspberry Pi configuration utility
2. Select `5 Interface Options`
3. Select `P6 Serial Options`
4. Select `No` when asked `Would you like a login shell to be accessible over serial?`
5. Select `Yes` when asked `Would you like the serial port hardware to be enabled?`
6. Select `OK`
7. Select `Finish` and select `Yes` to reboot when prompted

**WARNING: If you _are_ running a Raspberry Pi with WiFi:**

The Bluetooth module on these Raspberry Pis is controlled using the serial port, meaning it cannot be used directly while also using Bluetooth. Using this module with the default serial port will _disable_ bluetooth!

For an in-depth discussion on why and how to work around it, read https://raspberrypi.stackexchange.com/questions/45570/how-do-i-make-serial-work-on-the-raspberry-pi3.

## API

### new RaspiIO(options)

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
          <td>enableSerial (optional)</td>
          <td>boolean</td>
          <td>Enables the use of the serial port by Johnny-Five. The default is <code>true</code>, except on models with Bluetooth where it is <code>false</code> (currently the Raspberry Pi 3 Model B, Raspberry Pi 3 Model B+, and Raspbery Pi Zero W)</td>
        </tr>
        <tr>
          <td>enableI2C (optional)</td>
          <td>boolean</td>
          <td>Enables the use of the I2C port by Johnny-Five. The default is <code>true</code></td>
        </tr>
        <tr>
          <td>includePins (optional)</td>
          <td>Array&lt;Number|String&gt;</td>
          <td>A list of pins to include in initialization. If specified, any pins <em>not</em> listed here will not be initialized or available for use by Raspi IO. If not specified, all pins will be available for use by Raspi IO.</td>
        </tr>
        <tr>
          <td>excludePins (optional)</td>
          <td>Array&lt;Number|String&gt;</td>
          <td>A list of pins to exclude from initialization. If specified, any pins listed here will not be initialized or available for use by Raspi IO. If not specified, all pins will be available for use by Raspi IO.</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

License
=======

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
