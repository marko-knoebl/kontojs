describe('Dataset', function() {
  
  var dataset;

  beforeEach(function() {
    document.body.innerHTML += "<script src='konto.js' " +
     "id='konto-script'></script>";
    dataset = new konto.Dataset();
  });

  afterEach(function() {
    document.body.removeChild(document.getElementById('konto-script'));
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
        amount: 23.45
      });
      expect(dataset.transactions.length).toBe(1);
    });
    it('should raise an exception if one of the accounts does not exist',
          function() {
      var nonExistantOrigin = function() {
        dataset.addTransaction({origin: 'nonexistant1', destination: 'main',
          amount: 20});
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
          amount: -3}
        );
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
        new Error("'origin', 'destination' and amount must be specified" +
                  'for all transactions')
      );
    });
  });

  describe('Random dataset', function() {
    beforeEach(function() {
      dataset.transactions = dataset.getRandomTransactionData(1);
    });
    afterEach(function() {
      dataset.transactions = [];
    });
    it('should contain some data', function() {
      expect(dataset.transactions).toBeDefined();
    });
    it('should contain a transaction for 2015-07-02', function() {
      expect(dataset.transactions[0].date).toBe('2015-07-02');
    });
  });

  describe('getTransactions', function() {
    beforeEach(function() {
      dataset.transactions = dataset.getRandomTransactionData(1);
    });
    afterEach(function() {
      dataset.transactions = [];
    });
    it('should return all (15) matching transactions', function() {
      var result = dataset.getTransactions({details: 'Gehalt'});
      expect(result.length).toBe(15);
    });
  });

});
