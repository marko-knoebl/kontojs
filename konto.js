var konto;

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

  konto = {};

  konto.Dataset = function() {
    /**
     * A dataset that describes related bank accounts
     * and transactions
     * If prototype is removed this will be a nice JSON
     * representation of the data
     */
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
   * dataset.addAccount({id: 'main', openDate: '2015-03-04'});
   */
  konto.Dataset.prototype.addAccount = function(parameters) {
    if (parameters === undefined) {
      throw new Error("addAccount cannot be called without arguments");
    }
    if (!parameters.id) {
      throw new Error("cannot create account without assigning an id");
    }
    var account = {};
    ;['id', 'initialBalance', 'openDate'].forEach(function(parameter) {
      if (parameters[parameter] !== undefined) {
        account[parameter] = parameters[parameter];
      }
    });
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
        parameters.destination === undefined) {
      throw new Error("'origin', 'destination' and 'amount' must be specified" +
                  'for all transactions');
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
      destination: parameters.destination
    };
    this.transactions.push(transaction);
    return transaction;
  };

  konto.Dataset.prototype.getRandomTransactionData = function(seed) {
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
    var date = new Date('2015-07-02');
    var now = new Date();
    var id = 0;
    var transactions = [];
    var rand = makeRand(seed);
    while (date < now) {
      if (rand() < 0.15) {
        transactions.push({
          id: id,
          date: date.toISOString().slice(0, 10),
          origin: 'world',
          destination: 'main',
          amount: Math.pow(rand(), 0.3) * 2000,
          details: 'Gehalt'
        });
      } else {
        transactions.push({
          id: id,
          date: date.toISOString().slice(0, 10),
          origin: 'main',
          destination: 'world',
          amount: Math.pow(rand(), 5) * 1300,
          details: sampleDetails[Math.floor(rand()*sampleDetails.length)]
        });
      }
      var delta = rand() * 8;
      var date = new Date(date);
      date.setDate(date.getDate() + delta);
      id ++;
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
   * retrieve a set of transactions that match a single query
   * dataset.getTransactions({destination: 'world'});
   */
  konto.Dataset.prototype.getTransactions = function(query) {
    var result = [];
    for (var i in this.transactions) {
      var transaction = this.transactions[i];
      if (query[Object.keys(query)[0]] === transaction[Object.keys(query)[0]]) {
        result.push(transaction);
      }
    }
    return result;
  };

})();
