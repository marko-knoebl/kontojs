#Kontojs

Kontojs is a library that lets you track transactions and balances of financial accounts (e.g. bank accounts).

Transactions can be added individually or imported from the content of a csv file.

##Installation

You can `npm-install kontojs` or download the konto.js file from the GitHub repository.

##Usage

Create a new dataset of financial data

    ds = new kontojs.Dataset();

Add a bank account

    ds.addAccount({id: 'mainAccount', openDate: '2016-08-30', initialBalance: 320.34});

Add a transaction

    ds.addTransaction({amount: 100, date: '2016-09-01', origin: 'world', destination: 'mainAccount'});

Get balance

    ds.getBalance('mainAccount');
    > 420.34

Import csv data (supports several Austrian banks for now)

    var newTransactions = kontojs.csvToKonto(someCsvString);
    ds.addTransaction(newTransactions[0]);
