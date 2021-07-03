# Binocular
An opinionated Binance desktop client for crypto trading. Available for Windows, macOs and Linux.

Where to download? Find the latest release on [the release page](https://github.com/diruuu/binocular/releases).

| Latest                                                                                                                                                                                  | Beta                                                                                                                                                                                   | Alpha                                                                                                                                                                                   |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [![Latest](https://github.com/diruuu/binocular/actions/workflows/publish.yml/badge.svg?branch=main)](https://github.com/diruuu/binocular/actions/workflows/publish.yml)                 | [![Beta build](https://github.com/diruuu/binocular/actions/workflows/publish.yml/badge.svg?branch=beta)](https://github.com/diruuu/binocular/actions/workflows/publish.yml)            | [![Alpha build](https://github.com/diruuu/binocular/actions/workflows/publish.yml/badge.svg?branch=alpha)](https://github.com/diruuu/binocular/actions/workflows/publish.yml)           |

![Screenshot 2021-07-03 184715](https://user-images.githubusercontent.com/6884679/124353186-3ecb0c00-dc2f-11eb-8ee4-093474910418.png)

## Documentation
Open wiki to see the complete documentation of this software.

## Why this app? Why not the Binance official app?
The main reason for me to develop this app is to solve a lot of trading problems that I have when I am using Binance app and Tradingview. Binance official desktop app is amazing, don't get me wrong. But sometimes when doing day trading, it can be a pain in the ass just to enter a position and setup my stop loss and take profit order. There are many extra steps I need to do just to put one trade position. Basically in Binance app, I have to:
  1. Create buy order
  2. Calculate my stop loss and take profit position based on ATR indicator
  3. Create OCO order for my stop loss and take profit limit
  4. If I want to change my stop loss limit, I need to cancel my OCO order and create a new one

Those extra steps could cost me losing trading momentum and it is something I couldn't afford. That's why I create Binocular to address this problem.

With this app, you will basically have these features:

-----
### Auto stop loss and take profit limit calculation
Stop loss and take profit limit are by default calculated based on average true range (ATR) indicator. The ratio can easily be customized on settings. You can even disable the calculation if you want to put your own stop loss or take profit limit. Not only that, when entering a position, you can also see how much profit and loss you will get with the trade based on your stop loss and take profit position.

![Screenshot 2021-07-03 185152a](https://user-images.githubusercontent.com/6884679/124353771-ac2c6c00-dc32-11eb-80ad-bf11e8ea1082.png)


-----


## How to run this project on your local development machine
This is for developers / contributors who want to contribute to this project. If you just want to use this app, this section is not for you. See documentation about [Instalation](https://github.com/diruuu/binocular/wiki/Installation) here if you want to know how to install this software on Windows, macOs or Linux.
