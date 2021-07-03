# Binocular
An opinionated Binance desktop client for crypto trading. Available for Windows, macOs and Linux.
1. It's 100% free. Everyone can use it without limitation
2. It's open source, everyone can see the full source codes and contribute or audit the project. (I figured this is the only way to gain trust from the community since many trading app out there will just scam you and steal your data)
3. No additional server included. This is pure 3rd party client for Binance API. So this app is communicating directly to Binance without any additional server that can potentially steal your data.

Where to download? Find the latest release on [the release page](https://github.com/diruuu/binocular/releases).

| Latest                                                                                                                                                                                  | Beta                                                                                                                                                                                   | Alpha                                                                                                                                                                                   |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [![Latest](https://github.com/diruuu/binocular/actions/workflows/publish.yml/badge.svg?branch=main)](https://github.com/diruuu/binocular/releases)                 | [![Beta build](https://github.com/diruuu/binocular/actions/workflows/publish.yml/badge.svg?branch=beta)](https://github.com/diruuu/binocular/releases)            | [![Alpha build](https://github.com/diruuu/binocular/actions/workflows/publish.yml/badge.svg?branch=alpha)](https://github.com/diruuu/binocular/releases)           |

![Screenshot 2021-07-03 184715](https://user-images.githubusercontent.com/6884679/124353186-3ecb0c00-dc2f-11eb-8ee4-093474910418.png)

## Getting started
Open [instalation documentation](https://github.com/diruuu/binocular/wiki/Installation) to see to see how to install it on your Windows, macOs, or Linux machine.

Or watch my video series on Youtube where I explain anything about the app and how to get started using it.

<a href="https://www.youtube.com/watch?v=pH4TQ20CQF0&list=PLp3fpHrBrLgw76tHCSzEJeRIoeQz5QtpV" target="_blank" rel="nofollow"><img src="http://img.youtube.com/vi/pH4TQ20CQF0/0.jpg" 
alt="IMAGE ALT TEXT HERE" width="350" border="10" /></a>

## Documentation
Open [wiki](https://github.com/diruuu/binocular/wiki) to see the complete documentation of this software.

## Why this app? Why not the Binance official app?
Two words, simplicity and risk management. Okay that's four words.

The main reason for me to develop this app is to solve a lot of trading problems that I have when I am using Binance app and Tradingview. Binance official desktop app is amazing, don't get me wrong. But sometimes when doing day trading, it can be a pain in the ass just to enter a position and setup my stop loss and take profit order. There are many extra steps I need to do just to put one trade position. Basically in Binance app, I have to:
  1. Create buy order
  2. Calculate my stop loss and take profit position based on ATR indicator
  3. Create OCO order for my stop loss and take profit limit
  4. If I want to change my stop loss limit, I need to cancel my OCO order and create a new one

Those extra steps could cost me losing trading momentum and it is something I couldn't afford. That's why I create Binocular to address those problems.

With this app, you will basically have these features on your hand:

-----
### Auto stop loss and take profit limit calculation
Stop loss and take profit limit are by default calculated based on average true range (ATR) indicator. The ratio can easily be customized on settings. You can even disable the calculation if you want to put your own stop loss or take profit limit. Not only that, when entering a position, you can also see how much profit and loss you will get with the trade based on your stop loss and take profit position.

![Screenshot 2021-07-03 185152a](https://user-images.githubusercontent.com/6884679/124353771-ac2c6c00-dc32-11eb-80ad-bf11e8ea1082.png)

-----
### Adjustable stop loss and take profit order
With this app, if you want to change your stop loss or even your take profit position, you don't have to worry about canceling your OCO order and then create a new one anymore. This app will handle it for you. The stop loss and take profit position on the chart are draggable. You can basically move it anywhere you want and your OCO order in Binance will be automatically adjusted.

![Screenshot 2021-07-03 185248d](https://user-images.githubusercontent.com/6884679/124354396-fbc06700-dc35-11eb-98b0-86227c21a0cc.png)

-----
### Monitor your trade history in one place
Any trades that you made with Binocular can be monitored on the history section. You can see your past trades and your open positions. Not only that, on the history section you can also see how much profit or loss you made so you can keep track of all your positions.

![Screenshot 2021-07-03 185152b](https://user-images.githubusercontent.com/6884679/124354557-c5371c00-dc36-11eb-945e-99156b05c752.png)

-----
### See price changes in realtime
Price changes on all cryto pairs are displayed in realtime. You can favorite your favorite coins, you can sort them based on their prices, or even better, you can monitor their changes based on any klines intervals (1m, 5m, 15m, 1h, 1d, etc...) and then sort it by their changes. This is a good way for momentum trader to find crypto coins that are rising.

![Screenshot 2021-07-03 185152c](https://user-images.githubusercontent.com/6884679/124354537-aa64a780-dc36-11eb-80e7-85410ddd8d03.png)


## How to run this project on your local development machine
This is for developers / contributors who want to contribute to this project. If you just want to use this app, this section is not for you. See documentation about [Instalation](https://github.com/diruuu/binocular/wiki/Installation) here if you want to know how to install this software on Windows, macOs or Linux.

## How to support this project?
This is basically a non-profit one-man project. I dedicated my weekend to work on this project and I couldn't do this for a long time without your supports. To support this project, you have 2 options:
  1. If you are a Typescript / Electron developer, you can help me fix bugs or add new feature by sending pull request to this repo.
  2. You can also donate some BTC, ETH or BNB to my wallet to make sure that I always have a glass of coffee whenever I work on this project. To donate, you can find my wallet addressed on this [donation page](https://github.com/diruuu/binocular/wiki/How-to-Donate-to-This-Project)

## To do
### Software Certification
The Windows version and macOs version of this app haven't been certified. The cost of certificates for both platform are expensive and must be renewed every year. The impact of this is everyone who install this app will see warning from Windows and macOs before they began the installation. While you can basically bypass that warning, I think it's important for everyone to trust this app when they're not seeing the warning at all.

This is the point where I think donation could help. If you want to help me purchasing these certificates, consider to donate some money to my crypto wallet (BTC, ETH and BNB). You can find my wallet addressed on this [donation page](https://github.com/diruuu/binocular/wiki/How-to-Donate-to-This-Project)
