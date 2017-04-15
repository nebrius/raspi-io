# Contributing to Raspi-IO

So you're interested in contributing to Raspi IO. That's awesome, go you! This document provides information on various ways that you can help out the project.

## Issues and Feature Requests

If you run into a bug, or would like to see a new feature added to Raspi-IO, please [open an issue](https://github.com/nebrius/raspi-io/issues).

When submitting a bug report, please include the following information:

- Which Raspberry Pi you are using, e.g. Raspberry Pi 2 Model B
- Which version of Raspbian you are using, e.g. 2015-05-05-raspbian-wheezy
- Which version of Node.js or io.js you are using, e.g. Node.js 0.12.6
- A minimum reproducible test case, i.e. a short snippet that demonstrates the bug, if applicable

## Submitting Code

Code is written either in ECMAScript 2015 (previously known as ECMAscript 6 or ES6) or TypeScript 2.0. We use ESLint and TSLint to lint the code, and Babel or TypeScript to compile the code to ES5.

To build the project, run ```npm run build``` from the top level directory of each repository.

The first step in the compile process lints the code to check for issues and to ensure code style conformity. The goal of code linting is to make the pull request process easier (and make sure that Bryan doesn't do something silly 😄).

If you are unfamiliar with ES2015, take a look at [Babel's Learn EES2015 page](https://babeljs.io/docs/learn-es2015/). If you are unfamiliar with TypeScript, take a look at the [TypeScript homepage](http://typescriptlang.org/).

### Raspi IO and Raspi.js modular architecture

Raspi IO uses a modular architecture, and is composed of several different npm packages. These packages are split into two groups: Raspi IO and Raspi.js. Raspi.js provides a Raspberry Pi specific API for working with the Raspberry Pi's hardware, and Raspi IO acts as a translation layer between Johnny-Five and Raspi.js. Raspi IO is composed of two packages, raspi-io (this repository) and [raspi-io-core](https://github.com/nebrius/raspi-io-core), and everything else constitutes Raspi.js. This diagram shows the relationship between all of the packages:

![Raspi IO Architecture Diagram](https://cloud.githubusercontent.com/assets/1141386/25059714/38f4d274-2140-11e7-8d90-0a2f051f11fc.png)

[Raspi IO Core](https://github.com/nebrius/raspi-io-core) is an abstract library that converts between the Raspi.js API and the [Johnny-Five IO plugin](https://github.com/rwaldron/io-plugins) API. Raspi IO provides an implementation of Raspi.js to Raspi IO Core. This is broken into two packages to make it easier to port Raspi IO to multiple operating systems for the Raspberry Pi.

Check out the [Raspi.js](https://github.com/nebrius/raspi) repository for more information on Raspi.js.

There are 9 packages total that make up Raspi.js:

- [raspi](https://github.com/nebrius/raspi): This is the main package, analagous to the `express` package. It doesn't actually control any hardware on its own, it's only purpose is to handle initialization.
- [raspi-board](https://github.com/nebrius/raspi-board): This package can be used independently of Raspi.js, and provides pin mapping services and board detection capabilities.
- [raspi-peripheral](https://github.com/nebrius/raspi-peripheral): This package provides a base class that all other concrete peripherals inherit from. Any module that provides a way for interacting with hardware _must_ inherit from this class, as it handles pin contention (i.e. when someone tries to do, say, PWM and GPIO on the same pin, which isn't possible).
- [raspi-gpio](https://github.com/nebrius/raspi-gpio): This peripheral package provides access to GPIO.
- [raspi-pwm](https://github.com/nebrius/raspi-pwm): This peripheral package provides access to PWM.
- [raspi-soft-pwm](https://github.com/tralves/raspi-soft-pwm): This peripheral package provides access to software emulated PWM.
- [raspi-i2c](https://github.com/nebrius/raspi-i2c): This peripheral package provides access to I2C.
- [raspi-led](https://github.com/nebrius/raspi-led): This peripheral package provides access to the on board status LED.
- [raspi-serial](https://github.com/nebrius/raspi-serial): This peripheral package provides access to the UART.

Note: Raspi.js is written in TypeScript, and Raspi IO is written in ES2015.

## Submitting Docs

If you would like to help create better documentation, then that is seriously awesome! Documentation is the heart and soul of any good open source project, and the docs for Raspi IO can always be improved.

The documentation for this project is split between the READMEs for Raspi IO and it's dependencies, and the wiki for Raspi IO. If you would like to help with any of the READMEs, create a pull request and submit it! If you would like to edit the wiki, drop into the gitter chat, or open an issue, and we'll grant you access so you can edit the wiki.

## Open Open Source

This project follows the [open open source philosophy](http://openopensource.org/). To quote the Open Open Source project:

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

In other words, you get automatic commit access to this project when you're first non-trivial pull request or wiki edit is landed, and are automatically considered a core contributor. This applies to both code contributions AND documentation contributions.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](./CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
