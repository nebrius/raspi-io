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
