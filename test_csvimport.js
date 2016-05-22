describe('importCsv', function() {
  
  var dataset;

  beforeEach(function() {
    dataset = new konto.Dataset();
  });

  it('should import data from Bawag Psk', function() {
    var csvContent = 
      'AT586000000012345678;Bezahlung Karte MC/000001234 BILLA DANKT  1223  ' +
      'K003 30.04. 16:31 BILLA \\\\WIEN\\1060;02.05.2016;01.05.2016;-3,98;EUR' +
      '\n' +
      'AT586000000077895248;Bezahlung Karte MC/000001233 1300  K003 01.06. ' +
      '11:46 SPAR DANKT 4188\\\\WIEN\\ 1030 04003400E;2.06.2016;01.06.2016;' +
      '-3,35;EUR' +
      '\n' +
      'AT586000000077895248;Bezahlung Karte MC/000001232 1489  K003 26.04. ' +
      '14:30 OEBB 1040 FSA\\\\WIEN\\7 04;27.04.2016;26.04.2016;-8,80;EUR';
    var importedTransactions = konto.csvToKonto(csvContent, 'bawagpsk');
    expect(importedTransactions[0].amount).toBe(-8.8);
    expect(importedTransactions[1].date).toBe('2016-06-02');
  });
});
