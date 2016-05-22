(function() {

  "use strict";

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
      detailsKey: 1,
      // replace repeated spaces with just one space
      detailsNormalizer:
        function(details) {return details.replace(/  +/g, ' ');},
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
      detailsKey: 1
    },
    hellobank: {
      name: 'Hello Bank',
      encoding: 'ISO-8859-1',
      delimiter: ';',
      header: true,
      dateKey: 'Valutadatum',
      amountKey: 'Betrag',
      detailsKey: 'Umsatztext',
      reverse: true
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
      detailsKey: ' Name',
      //otherParty: 3,
      reverse: true
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
      var amount = parseFloat(item[config.amountKey].replace('.', '')
        .replace(',', '.'));
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
    var transactions = Papa.parse(csvString, config).data;
    transactions = konto._prepareTransactionData(transactions, config);
    return transactions;
  };

})()
