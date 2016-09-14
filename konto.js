// Collect and manage data from financial accounts

var konto = {};

// define basic functionality
(function() {

  "use strict";

  /**
   * Returns a deterministic random number generator based on a seed
   */
  var makeRand = function(seed) {
    return function() {
      seed ++;
      return ((Math.sin(seed) * 10000) % 0.5) + 0.5;
    }
  };

  /**
   * A dataset that describes related bank accounts
   * and transactions
   * If prototype is removed this will be a nice JSON
   * representation of the data
   */
  konto.Dataset = function() {
    this.transactions = [];
    // always include one account representing "the rest of the world"
    this.accounts = [
      {
        id: "world",
        initialBalance: 0
      }
    ];
  };

  /**
   * Add a new account to the dataset
   * dataset.addAccount({
   *   id: 'main', name: 'Main Account',
   *   openDate: '2015-03-04', accountType: 'bawagpsk'});
   */
  konto.Dataset.prototype.addAccount = function(parameters) {
    if (parameters === undefined) {
      throw new Error("addAccount cannot be called without arguments");
    }
    if (!parameters.id) {
      throw new Error("cannot create account without assigning an id");
    }
    var account = {};
    for (var parameter in parameters) {
      account[parameter] = parameters[parameter];
    }
    this.accounts.push(account);
    return account;
  };

  /**
   * Add a new transaction to the dataset
   * dataset.addTransaction({date: '2015-02-03', origin: 'main',
                             destination: 'world'});
   */
  konto.Dataset.prototype.addTransaction = function(parameters) {
    if (parameters.amount === undefined || parameters.origin === undefined ||
        parameters.destination === undefined || parameters.date === undefined) {
      throw new Error("'origin', 'destination', 'amount' and 'date' must be" +
                      'specified for all transactions');
    }
    if (parameters.amount < 0) {
      throw new Error('Transaction amounts must be positive.' +
                      'Switch origin and destination');
    }
    try {this.getAccount({id: parameters.origin})}
    catch (e) {throw new Error('account not found: ' + parameters.origin);}
    try {this.getAccount({id: parameters.destination})}
    catch (e) {throw new Error('account not found: ' + parameters.destination);}
    var transaction = {
      amount: parameters.amount,
      origin: parameters.origin,
      destination: parameters.destination,
      date: parameters.date
    };
    if (parameters.details !== undefined) {
      transaction.details = parameters.details;
    }
    this.transactions.push(transaction);
    return transaction;
  };

  /**
   * Get an array of random transactions.
   * This will use random details and amounts and use the two
   * accounts 'world' and 'main'
   */
  konto.Dataset.prototype.getRandomTransactionData = function(number, seed) {
    seed = seed || 1;
    var sampleDetails = [
      'mcDonalds',
      'Billa dankt',
      'Zielpunkt dankt',
      'Miete',
      'OMV',
      'Hofer',
      'Investmentdepot',
      'Wiener Linien',
      'Versicherung',
      'Subway',
      'Strom',
      'A1',
      'Trafik',
      'Ikea',
      'Amazon',
      'H&M',
      'Konzert',
      'Geschenk'
    ];
    var date = new Date('2013-07-02');
    var transactions = [];
    var rand = makeRand(seed);
    for (var i = 0; i < number; i ++) {
      var r = rand()
      if (r < 0.125) {
        transactions.push({
          id: i,
          date: date.toISOString().slice(0, 10),
          origin: 'world',
          destination: 'main',
          amount: Math.pow(rand(), 0.3) * 2000,
          details: 'Gehalt'
        });
      } else if (r < 0.3){
        transactions.push({
          id: i,
          date: date.toISOString().slice(0, 10),
          origin: 'main',
          destination: 'cash',
          amount: 200,
          details: 'Bankomat'
        });
      } else if (r < 0.7){
        transactions.push({
          id: i,
          date: date.toISOString().slice(0, 10),
          origin: 'main',
          destination: 'world',
          amount: Math.pow(rand(), 5) * 1300,
          details: sampleDetails[Math.floor(rand()*sampleDetails.length)]
        });
      } else {
        transactions.push({
          id: i,
          date: date.toISOString().slice(0, 10),
          origin: 'cash',
          destination: 'world',
          amount: Math.pow(rand(), 5) * 100,
          details: sampleDetails[Math.floor(rand()*sampleDetails.length)]
        });
      }
      var delta = rand() * 8;
      var date = new Date(date);
      date.setDate(date.getDate() + delta);
    }
    return transactions;
  };

  /**
   * retrieve an account (e.g. by id)
   * dataset.getAccount({id: 'world'});
   */
  konto.Dataset.prototype.getAccount = function(query) {
    for (var i in this.accounts) {
      var account = this.accounts[i];
      if (query[Object.keys(query)[0]] === account[Object.keys(query)[0]]) {
        return account;
      }
    }
    throw new Error('query did not match any account: ' +
                    JSON.stringify(query));
  };

  /**
   * get the balance of an account for a specific date
   */
  konto.Dataset.prototype.getBalance = function(account, date) {
    if (account === undefined) {
      throw new Error('account must be specified')
    }
    if (!date) {
      // by default, include all transactions
      // date should be 'greater' than any other date
      date = 'a';
    }
    var balance = 0;
    this.transactions.forEach(function(transaction) {
      if (transaction.date <= date) {
        if (transaction.destination === account) {
          balance += transaction.amount;
        } else if (transaction.origin === account) {
          balance -= transaction.amount;
        }
      }
    });
    return balance;
  };
  
  var getNextDay = function(day) {
    // given an ISO date string (eg '2014-02-10'), return the next day
    var date = new Date(day);
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().slice(0, 10);
  };
  
  /**
   * get the balances of an account for a specific date range
   */
  konto.Dataset.prototype.getDailyBalances = function(account, startDate, endDate) {
    if (account === undefined) {
      throw new Error('account must be specified');
    }
    var dailyBalances = [];
    var transactions = this.getTransactionsByAccount(account);
    if (transactions.length === 0) {
      return [];
    }
    if (!startDate) {
      startDate = transactions[0].date;
    }
    if (!endDate) {
      endDate = transactions[transactions.length-1].date;
    }
    var date = startDate;
    var previousBalance = 0;
    var unprocessedTransactionIndex = 0;
    while (date <= endDate) {
      // increase "date" and add all unprocessed transactions that occur before it
      // copy the date
      date = getNextDay(date);
      while (unprocessedTransactionIndex < transactions.length && transactions[unprocessedTransactionIndex].date < date) {
        var unprocessedTransaction = transactions[unprocessedTransactionIndex];
        if (unprocessedTransaction.origin === account) {
          previousBalance -= unprocessedTransaction.amount;
        } else if (unprocessedTransaction.destination === account){
          previousBalance += unprocessedTransaction.amount;
        }
        unprocessedTransactionIndex ++;
      }
      dailyBalances.push({date: date, balance: previousBalance});
    }
    return dailyBalances;
  };

  /**
   * retrieve a set of transactions that match a single query
   * dataset.getTransactions({destination: 'world'});
   */
  konto.Dataset.prototype.getTransactions = function(query) {
    var result = [];
    this.transactions.forEach(function(transaction) {
      if (query[Object.keys(query)[0]] === transaction[Object.keys(query)[0]]) {
        result.push(transaction);
      }
    });
    return result;
  };

  /**
   * retrieve a set of transactions from a specified account
   * The transactions will be in chronological order
   */
  konto.Dataset.prototype.getTransactionsByAccount = function(account) {
    return this.transactions.filter(function(transaction) {
      return transaction.origin === account || transaction.destination === account;
    }).sort(function(a, b) {
      if (a.date > b.date) {return 1;}
      else if (a.date === b.date) {return 0;}
      else {return -1;}
    });
  }

  /**
   * set the (current) balance
   * adds a new initial transaction which accounts for the difference;
   * this initial transaction will have 'details': 'start tracking' and
   * 'startTracking': true
   */
  konto.Dataset.prototype.setCurrentAccountBalance = function(accountId, balance) {
    var transactions = this.getTransactionsByAccount(accountId);
    var transactionSum = 0;
    transactions.forEach(function(transaction) {
      if (transaction.destination === accountId) {
        transactionSum += transaction.amount;
      } else {
        transactionSum -= transaction.amount;
      }
    });
    var initialBalance = balance - transactionSum;
    var account = this.getAccount({id: accountId});
    var firstTransactionDate = transactions[0].date;
    var initialTransaction = {
      origin: 'world',
      destination: account.id,
      amount: initialBalance,
      date: firstTransactionDate,
      startTracking: true,
      details: 'start tracking'
    };
    this.transactions.push(initialTransaction);
  };
})();

// CSV import functionality
(function() {

  "use strict";

  konto.csvImportConfigIds = ['bawagpsk', 'easybank', 'erstebank', 'hellobank',
    'number26', 'number26-de', 'paypal', 'raiffeisen'];

  konto.csvImportConfig = {
    bawagpsk: {
      name: 'Bawag PSK',
      encoding: 'ISO-8859-1',
      delimiter: ';',
      header: false,
      dateKey: 2,
      dateNormalizer:
        function (date) {return date.split('.').reverse().join('-');},
      amountKey: 4,
      decimalMark: ',',
      detailsKey: 1,
      // replace repeated spaces with just one space
      detailsNormalizer:
        function(details) {return details.replace(/  +/g, ' ');},
      reverse: true
    },
    easybank: {
      name: 'easybank',
      encoding: 'ISO-8859-1',
      delimiter: ';',
      header: false,
      dateKey: 2,
      dateNormalizer: function(date) {return date.split('.').reverse().join('-');},
      amountKey: 4,
      decimalMark: ',',
      detailsKey: 1,
      reverse: true
    },
    erstebank: {
      name: 'Erste Bank',
      encoding: 'ISO-8859-1',
      delimiter: ';',
      header: true,
      dateKey: 'Buchungsdatum',
      dateNormalizer: function(date) {return date.split('.').reverse().join('-');},
      amountKey: 'Betrag',
      decimalMark: ',',
      detailsKey: 'Bezeichnung',
      reverse: true,
      preprocessor: function(csvString) {
        // remove last line
        return csvString.substring(0, csvString.lastIndexOf('\n', csvString.length-2));
      }
    },
    hellobank: {
      name: 'Hello Bank',
      encoding: 'ISO-8859-1',
      delimiter: ';',
      header: true,
      dateKey: 'Valutadatum',
      amountKey: 'Betrag',
      decimalMark: ',',
      detailsKey: 'Umsatztext',
      reverse: true
    },
    'number26-de': {
      name: 'Number26 (de)',
      encoding: 'ISO-8859-1',
      delimiter: ',',
      header: true,
      dateKey: 'Datum',
      amountKey: 'Betrag (EUR)',
      detailsKey: 'Empfänger',
    },
    number26: {
      name: 'Number26',
      encoding: 'ISO-8859-1',
      delimiter: ',',
      header: true,
      dateKey: 'Date',
      amountKey: 'Amount (EUR)',
      detailsKey: 'Payee',
    },
    paypal: {
      name: 'PayPal',
      encoding: 'ISO-8859-1',
      delimiter: ',',
      header: true,
      dateKey: 'Datum',
      dateNormalizer:
        function(date) {return date.split('.').reverse().join('-');},
      amountKey: ' Brutto',
      decimalMark: ',',
      detailsKey: ' Name',
      //otherParty: 3,
      reverse: true
    },
    raiffeisen: {
      name: 'Raiffeisen',
      encoding: 'ISO-8859-1',
      delimiter: ';',
      header: false,
      dateKey: 0,
      dateNormalizer:
        function(date) {return date.split('.').reverse().join('-');},
      amountKey: 3,
      decimalMark: ',',
      detailsKey: 1
    }
  };

  /**
   * Takes raw, bank-specific transaction data and returns a nicer format:
   *  [
   *    {id: 0, date: 2011-03-07, amount: 107.5, details: 'gas station ...'},
   *    {id: 1, date: 2011-03-10, amount: -23.05, details: 'LSR...'},...
   *  ]
   *  @param {Array} rawTransactionData - Transaction data in a bank-specific
   *    CSV form
   *  @param {object} config
   */
  konto._prepareTransactionData = function(rawTransactionData, config) {
    var transactionData = [];
    if (config.reverse) {
      rawTransactionData.reverse();
    }
    rawTransactionData.forEach(function(item, index) {
      var date = item[config.dateKey];
      if (config.dateNormalizer) {
        date = config.dateNormalizer(date);
      }
      // add leading zeros if not already present
      if (date[6] === '-') {
        date = date.slice(0, 6) + '0' + date.slice(6);
      }
      if (date.length === 9) {
        date = date.slice(0, 8) + '0' + date[8]
      }
      if (!date.match('[0-9]{4}-[0-9]{2}-[0-9]{2}')) {
        throw 'invalid input date:' + date;
      }
      if (config.decimalMark === ',') {
        var amount = parseFloat(item[config.amountKey].replace('.', '')
          .replace(',', '.'));
      } else {
        var amount = parseFloat(item[config.amountKey]);
      }
      var details = item[config.detailsKey];
      if (config.detailsNormalizer) {
        details = config.detailsNormalizer(details);
      }
      transactionData.push(
        {date: date, amount: amount, details: details, id: index}
      );
    });
    var invalid = (
      transactionData.length === 0 ||
      transactionData[0].date > transactionData[transactionData.length - 1].date
    );
    if (invalid) {
      throw 'invalid input'
    }
    return transactionData;
  };

  /**
   * Convert a csv data string to the standard konto format:
   * [
   *   {date: '2011-03-07', amount: -107.5, details: 'gas station ...'},
   *   {date: '2011-03-10', amount: -23.05, details: 'Tesco'}
   * ]
   */
  konto.csvToKonto = function(csvString, config) {
    if (config === undefined) {
      throw 'no config supplied'
    }
    // if 'config' is a string assume it's the name of a bank
    if (typeof config === 'string') {
      if (konto.csvImportConfig[config] === undefined) {
        throw 'No import config available for: ' + config;
      }
      config = konto.csvImportConfig[config];
      config.skipEmptyLines = true;
    }
    var Papa_;
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
      // node
      Papa_ = require('papaparse');
    } else {
      // browser
      Papa_ = Papa;
    }
    var transactions = Papa_.parse(csvString, config).data;
    transactions = konto._prepareTransactionData(transactions, config);
    return transactions;
  };

  /**
   * Add imported transactions to the dataset.
   * Warning: this modifies the input data for now.
   */
  konto.Dataset.prototype.addImportedTransactions =
      function(transactions, accountId) {
    // make all transactions happen between specified account and world
    // by default
    var account = this.getAccount({id: accountId});
    var world = this.getAccount({id: 'world'});
    var this_ = this;
    transactions.forEach(function(transaction) {
      if (transaction.amount <= 0) {
        transaction.origin = accountId;
        transaction.destination = 'world';
        transaction.amount = -transaction.amount;
      } else {
        transaction.origin = 'world';
        transaction.destination = accountId;
      }
      this_.transactions.push(transaction);
    });
  };
})();

// node
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = konto;
}
