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
    beforeEach(function() {
      dataset.accounts = [dataset.accounts[0]];
    });
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

  describe('Sample dataset', function() {
    beforeEach(function() {
      dataset.transactions.push({id: 'test', amount: 23});
      dataset.transactions = dataset.createSampleTransactionData();
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

});
