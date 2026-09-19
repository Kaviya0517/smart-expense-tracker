const assert = require('node:assert/strict');
const { parseReceiptWithRegex } = require('../services/parseService');

const cases = [
  {
    name: 'prefers net amount over paid amount',
    input: `ITEMS\nRice 850.00\nOil 1050.00\nNet 2005.00\nPaid 2500.00`,
    expected: 2005,
  },
  {
    name: 'prefers grand total over subtotal and tax',
    input: `RELIANCE SMART\nDate: 18/09/2026\nRice 48.00\nOil 120.00\nSubtotal 203.00\nGST 16.24\nGrand Total 219.24`,
    expected: 219.24,
  },
  {
    name: 'prefers amount due over balance',
    input: `Myntra\nQty  Price\n1  599\n2  799\nAmount Due 1,398.00\nCash 1,500.00\nBalance 102.00`,
    expected: 1398,
  }
];

for (const testCase of cases) {
  const actual = parseReceiptWithRegex(testCase.input).amount;
  assert.equal(actual, testCase.expected, `${testCase.name}: expected ${testCase.expected} but got ${actual}`);
}

console.log(`parseService tests passed: ${cases.length} cases`);
