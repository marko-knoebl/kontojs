var konto;

(function() {

  "use strict";

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
        balance: 0
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
      if (parameters[parameter]) {
        account[parameter] = parameters[parameter];
      }
    });
    this.accounts.push(account);
    return account;
  };

  konto.Dataset.prototype.createSampleTransactionData = function() {
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
    while (date < now) {
      if (Math.random() < 0.15) {
        transactions.push({
          id: id,
          date: date.toISOString().slice(0, 10),
          amount: Math.pow(Math.random(), 0.3) * 2000,
          details: 'Gehalt'
        });
      } else {
        transactions.push({
          id: id,
          date: date.toISOString().slice(0, 10),
          amount: -Math.pow(Math.random(), 5) * 1300,
          details: sampleDetails[Math.floor(Math.random() * sampleDetails.length)]
        });
      }
      var delta = Math.random() * 8;
      var date = new Date(date);
      date.setDate(date.getDate() + delta);
      id ++;
    }
    return transactions;
  };

})();
