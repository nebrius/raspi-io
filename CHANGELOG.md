## 9.0.0

- Updated dependencies
- BREAKING CHANGE: Dropped support for Node.js 4

## 8.1.1 (2018-04-02)

- Switched to including a range for raspi-io-core to pull in latest changes

## 8.1.0 (2017-9-12)

- Enforced support for Node.js < 4.0.0 via package.json "engines" field.
    - This does not change the actual supported platforms for Raspi IO, just makes it more explicit
- Dropped support for attempting to install on non-arm platforms via package.json's "cpu" field.
    - Attempting to install this on a non-Raspberry Pi platform before gave a bunch of obtuse errors, so this doesn't _actually_ change the ability to install raspi-io, but does make it fail earlier, harder, and more obviously
- Updated dependencies that had breaking changes in prep for adding 1-wire support.
    - The breaking changes in dependencies are not surfaced as breaking changes in Raspi IO itself.

## 8.0.1(2017-4-29)

- Pulled in a dependency change that fixes a bug in servo duty cycle calculation

## 8.0.0 (2017-4-23)

- Updated dependencies that gets rid of Wiring Pi in favor of pigpio.
  - POTENTIALLY BREAKING CHANGE: there are no _known_ breakages with this update, but there are a lot of under the hood changes, and better safe than sorry.
- Disabled serial on the Raspberry Pi Zero W by default because it suffers from the same serial limitations as the Raspberry Pi 3

## 7.4.0 (2017-4-19)

- Added proper Raspberry Pi Zero W support, which sets `enableSerial` to false

## 7.3.1 (2017-4-7)

- Dependency bump

## 7.3.0 (2017-4-7)

- Added `enableSerial` property to get around crashing on the Raspberry Pi 3

## 7.2.4 (2017-2-17)

- Updated raspi-io-core to bring in better error messaging around pin modes

## 7.2.3 (2017-22-1)

- Publishing a new version to update the README on npmjs.com
- Removed outdated and broken unit tests, they weren't even remotely comprehensive anyways.

## 7.2.2 (2017-1-9)

- Updated dependencies to pull in a bug fix

## 7.2.1 (2017-1-5)

- Bumped the raspi-gpio dependency. There is a potentially breaking change in raspi-gpio, but because of how this module uses it, there is no breaking change here.

## 7.2.0 (2016-12-30)

- Split off almost all functionality of this module into [Raspi IO Core](https://github.com/nebrius/raspi-io-core)
  - Note: there should be no functionality change from this package, but giving it a minor version bump anyways
  - By splitting this off, it should be possible to create variants of raspi-io that target different OSes and configurations, e.g. Windows 10 IoT Core

## 7.1.0 (2016-11-29)

- Added support for software-based PWM

## 7.0.0 (2016-11-25)

- Fixed a bug where writing 0 to GPIO pins on startup wasn't actually writing 0
- Updated dependencies
  - POTENTIALLY BREAKING CHANGE: removed dependency on raspi-wiringpi because Raspbian now ships with Wiring Pi by default. This _may_ break other OSes
  - POTENTIALLY BREAKING CHANGE: I2C introduced a breaking change around write size limits, see the [raspi-i2c changelog](https://github.com/nebrius/raspi-i2c/blob/master/CHANGELOG.md) for more info.

## 6.2.0 (2016-11-22)

- Added the ability to specify pins to include or exclude in initialization

## 6.1.1 (2016-10-29)

- Updated dependencies to bring in new functionality
- Fixed a bug where `i2cConfig` treated the delay as milliseconds instead of seconds
- Added support for enabling pull down resistors

## 6.1.0 (2016-7-7)

- Switched dependency ranges to ^
- Bumped dependencies to bring in support for a new Raspberry Pi Zero revision

## 6.0.1 (2016-3-20)

- Fixed a bug where unknown pins threw the error 'Unknown pin "null"', which wasn't very helpful

## 6.0.0 (2016-3-20)

- Added support for the `serial*` methods
  - BREAKING CHANGE: `GPIO14` and `GPIO15` are no longer accessible from raspi-io
- Removed the Symbol shim
  - BREAKING CHANGE: Node 0.10 is no longer supported
- Fixed a bug where I2C reads emitted the wrong event name
  - It was `I2C-reply${address}-${register}`, but is now `i2c-reply-${address}-${register}`
- Fixed a bug where the built-in LED no longer worked

## 5.4.1 (2016-3-7)

- Dependency update to add missing Raspberry Pi 3 Model B revision

## 5.4.0 (2016-3-4)

- Updated dependencies to add Raspberry Pi 3 Model B support

## 5.3.0 (2016-2-19)

- Added support for the `servoConfig` and `servoWrite` methods
- Stubbed out the `serialWrite`, `serialRead`, and `serialConfig`
    - For now, they throw a "not implemented" error

## 5.2.0 (2016-1-6)

- Added support for enabling pull up resistors by writing HIGH to the pin while in INPUT mode
- Updated dependencies to add Ubuntu support

## 5.1.0 (2015-12-8)

- Updated dependencies to add Raspberry Pi Zero support

## 5.0.0 (2015-10-27)

- Upgraded to NAN 2
  - POTENTIAL BREAKING CHANGE
  - The API has not changed, but the build requirements have
  - Make sure you are running Raspbian Jessie because this module no longer builds on stock Raspbian Wheezy
  - See https://github.com/fivdi/onoff/wiki/Node.js-v4-and-native-addons for more information

## 4.1.0 (2015-10-13)

- Updated dependencies and build systems to fix a few bugs

## 4.0.0 (2015-9-4)

- Updated the default pin mode to be output instead of unknown
- Reworked the I2C pins so that they CANNOT be used for GPIO.
  - This is to work around an issue where we can't change the pin mode back to
    I2C once we change it to GPIO
- WARNING: BOTH OF THESE CHANGES ARE POTENTIALLY BREAKING!

## 3.4.0 (2015-9-1)

- Updated the i2cConfig method to take a config option as well as number

## 3.3.5 (2015-8-12)

- Updated dependencies to fix a crash on Node 0.10
- Internal code cleanup

## 3.3.4 (2015-7-18)

- Updated dependencies

## 3.3.3 (2015-7-14)

- Updated the repository links to point to their new location

## 3.3.2 (2015-7-14)

- Updated raspi-board dependency to pull in fix for overclocked board detection

## 3.3.1 (2015-7-13)

- Added missing es6-symbol shim
- Marked certain unimplemented methods as won't implement
- Added a contributing guide
- Added code linter
- Update code style to use newer best practices

## 3.3.0 (2015-7-2)

- Added pingRead stub. It's currently unimplemented, but will at least throw a nice error.

## 3.2.2 (2015-6-1)

- Added a shim for Symbol to get raspi-io working on Node.js 0.10 again

## 3.2.1 (2015-5-26)

- Updated I2C dependency to pull in the latest raspi-i2c

## 3.2.0 (2015-5-18)

- Updated I2C dependency to pull in the latest raspi-i2c
- Added support for controlling the status LED (set as the default LED)

## 3.1.1 (2015-3-25)

- I2C support!!!

## 3.0.1 (2015-3-17)

- Dependency update to fix a bug with destroying peripherals

## 3.0.0 (2015-3-9)

- POTENTIALLY BREAKING CHANGE. Changed the default mode for each pin from INPUT to UNKNOWN
  - This is a necessary change for incorporating I2C support, which is coming very soon

## 2.2.3 (2015-3-8)

- Added pin normalization to all instance lookups

## 2.2.2 (2015-2-28)

- Fixed a method name typo, causing new five.Pin(1) to crash

## 2.2.1 (2015-2-21)

- Fixed a bug with board.pins[mypin].mode not reporting the correct value

## 2.2.0 (2015-2-21)

- Switched from traceur to babel for ES6->ES5 compilation

## 2.1.0 (2015-2-20)

- Upgraded dependencies to add support for Node 0.12
  - io.js support is theoretically there too, but won't work until https://github.com/TooTallNate/node-gyp/pull/564 is landed


## 2.0.7 (2015-2-17)

- Fixed a pin normalization bug with pinMode
- Updated dependencies

## 2.0.6 (2015-2-12)

- Fixed a bug with pin numbering on the B+/A+

## 2.0.5 (2015-2-11)

- Refactored raspi-core usage to match the new name
- README updates

## 2.0.4 (2015-2-8)

- Relaxed restrictions on calling methods with mismatched modes.

## 2.0.3 (2015-1-7)

- Fixed a bug with mode checking in digitalRead

## 2.0.2 (2014-2-30)

- Added error checking to the ```normalize``` method to make exceptions more readable

## 2.0.1 (2014-12-8)

- Added support for the capability queries

## 2.0.0 (2014-12-6)

- Total rewrite! Now uses wiringPi under the hood
- PWM support included
- New pin mapping scheme, see README. The pin numbering scheme has CHANGED!

## 1.0.3 (2014-11-14)

- Cleaned up the README

## 1.0.1-1.0.2 (2014-10-06)

- Migrated repo to GitHub

## 1.0.0 (2014-08-20)

- Added support for the Raspberry Pi B+
- Bumped the version to 1.0.0. NO BREAKING API CHANGES, but switching the version to better conform with semver. See https://twitter.com/izs/status/494980144197402625

## 0.1.14 (2014-07-25)

- Added proper API documentation

## 0.1.12 (2014-07-16)

- Fleshed out default LED access from Johnny Five

## 0.1.11 (2014-07-14)

- Fixed a bug with LEDs on Arch Linux

## 0.1.10 (2014-07-14)

- Fixed a super embarrassing typo

## 0.1.9 (2014-06-09)

- Fixed a bug where if you passed in a number as an alias, it caused a crash

## 0.1.8 (2014-05-22)

- Added support for ```normalize()``` and ```defautLed```

## 0.1.7 (2014-05-15)

- Re-added the root user check, but this time left it as a warning, not a hard error

Note: there was an error publishing 0.1.6 which prevented using that version number

## 0.1.5 (2014-05-15)

- Removed the root user check because it's causing resin.io to break. Will fix later.

## 0.1.4 (2014-05-13)

- Fixed a publishing problem (functionality same as 0.1.3)

## 0.1.3 (2014-05-13)

- Added a check for superuser access

## 0.1.2 (2014-05-12)

- Fleshed out error messaging for initial inclusion in Johnny-Five

## 0.1.1 (2014-05-04)

- API compatibility fixes
    - Reading values while in OUTPUT mode
    - ```data-read-#``` event added

## 0.1.0 (2014-05-03)

- Initial release including support for GPIO
