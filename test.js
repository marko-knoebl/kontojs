describe('Dataset', function() {
  
  var dataset;

  beforeEach(function() {
    // create new dataset for each test
    dataset = new konto.Dataset();
  });

  it('should have an empty transactions array defined', function() {
    expect(dataset.transactions.length).toBe(0);
  });
  it('should have one account predefined', function() {
    expect(dataset.accounts.length).toBe(1);
  });

  describe('addAccount', function() {
    it('should fail if not given parameters', function() {
      expect(dataset.addAccount).toThrow(
        new Error("addAccount cannot be called without arguments")
      );
    });
    it('should add and return an account', function() {
      var account = dataset.addAccount({
        id: 'main',
        openDate: '2015-02-02'
      });
      expect(account.id).toBe('main');
      expect(account.openDate).toBe('2015-02-02');
      expect(dataset.accounts.length).toBe(2);
    });
  });

  describe('addTransaction', function() {
    beforeEach(function() {
      // create a second account
      dataset.addAccount({
        id: 'main',
        openDate: '2015-02-02'
      });
    });
    it('should add a transaction between two accounts', function() {
      dataset.addTransaction({
        origin: 'world',
        destination: 'main',
        amount: 23.45,
        date: '2010-04-20'
      });
      expect(dataset.transactions.length).toBe(1);
    });
    it('should raise an exception if one of the accounts does not exist',
          function() {
      var nonExistantOrigin = function() {
        dataset.addTransaction({origin: 'nonexistant1', destination: 'main',
          amount: 20, date: '2010-04-20'});
      };
      expect(nonExistantOrigin).toThrow(
        new Error('account not found: nonexistant1')
      );
    });
    it('should raise an exception if the amount is negative', function() {
      var negativeAmountTransaction = function() {
        dataset.addTransaction({
          origin: 'world',
          destination: 'main',
          amount: -3,
          date: '2010-03-25'
        });
      };
      expect(negativeAmountTransaction).toThrow(
        new Error('Transaction amounts must be positive.' +
                  'Switch origin and destination')
      );
    });
    it('should raise an exception if one of the accounts or the amount' +
       'is not specified', function() {
      var noAmountTransaction = function() {
        dataset.addTransaction({origin: 'world', destination: 'main'});
      };
      expect(noAmountTransaction).toThrow(
        new Error("'origin', 'destination', 'amount' and 'date' must be" +
                      'specified for all transactions')
      );
    });
  });

  describe('Random dataset', function() {
    beforeEach(function() {
      dataset.transactions = dataset.getRandomTransactionData(30);
    });
    it('should contain some data', function() {
      expect(dataset.transactions).toBeDefined();
    });
    it('should contain a transaction for 2013-07-02', function() {
      expect(dataset.transactions[0].date).toBe('2013-07-02');
    });
  });

  describe('getTransactions', function() {
    beforeEach(function() {
      dataset.transactions = dataset.getRandomTransactionData(30);
    });
    it('should return all (2) matching transactions', function() {
      var result = dataset.getTransactions({details: 'Gehalt'});
      expect(result.length).toBe(2);
    });
  });

  describe('getBalance', function() {
    beforeEach(function() {
      dataset.transactions = dataset.getRandomTransactionData(30);
    });
    it('should return the current balance', function() {
      var result = dataset.getBalance('main');
      expect(result).toBeGreaterThan(-1769);
      expect(result).toBeLessThan(-1768);
    });
    it('should return the balance for a specific date', function() {
      var result = dataset.getBalance('main', '2013-09-01');
      expect(result).toBeGreaterThan(-4309);
      expect(result).toBeLessThan(-4308);
    });
  });
  
  describe('getDailyBalances', function() {
    beforeEach(function() {
      dataset.transactions = dataset.getRandomTransactionData(30);
    });
    it('should return the daily balances for all time', function() {
      var result = dataset.getDailyBalances('main');
      expect(result[2].balance).toBeGreaterThan(-634);
      expect(result[2].balance).toBeLessThan(-633);
    });
    it('should return the balance for a specific date range', function() {
      var result = dataset.getDailyBalances('cash', '2013-08-12', '2013-08-16');
      expect(result[0].balance).toBeGreaterThan(1368);
      expect(result[0].balance).toBeLessThan(1369);
    });
  });

  describe('getTransactionsByAccount', function() {
    beforeEach(function() {
      dataset.transactions = dataset.getRandomTransactionData(30);
    });
    it('should return all transactions for a specified account', function() {
      var transactions = dataset.getTransactionsByAccount('cash');
      expect(transactions.length).toBe(18);
      for (var i = 0; i <= transactions.length-2; i ++) {
        expect(transactions[i].date).toBeLessThan(transactions[i+1].date);
      }
    });
  });

  describe('setCurrentAccountBalance', function() {
    beforeEach(function() {
      dataset.addAccount({id: 'main'})
      dataset.transactions = dataset.getRandomTransactionData(30);
    });
    it('should add an initial transaction in order to adjust the resulting balance', function() {
      dataset.setCurrentAccountBalance('main', 123);
      var transactions = dataset.getTransactionsByAccount('main');
      var sum = 0;
      transactions.forEach(function(transaction) {
        if (transaction.destination === 'main') {
          sum += transaction.amount;
        } else {
          sum -= transaction.amount;
        }
      });
      expect(Math.round(sum)).toBe(123);
    });
  });
});
