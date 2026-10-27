const test = require("node:test");
const assert = require("node:assert/strict");
const CurrencySupport = require("../currency.js");

test("currency catalog includes global currencies without duplicate codes", () => {
  const codes = CurrencySupport.codes();
  assert.ok(codes.length >= 100, `expected at least 100 currencies, found ${codes.length}`);
  assert.equal(new Set(codes).size, codes.length);
  for (const expected of ["MAD", "USD", "EUR", "JPY", "KWD", "INR", "BRL", "XOF"]) {
    assert.ok(codes.includes(expected), `${expected} should be available`);
  }
});

test("selector options keep MAD first and include localized names", () => {
  for (const locale of ["en", "ar"]) {
    const options = CurrencySupport.options(locale);
    assert.equal(options[0].code, "MAD");
    assert.equal(options.length, CurrencySupport.codes().length);
    assert.ok(options.every((option) => option.label.startsWith(`${option.code} — `)));
  }
});

test("minor-unit precision follows each currency’s standard digits", () => {
  assert.equal(CurrencySupport.fractionDigits("JPY"), 0);
  assert.equal(CurrencySupport.fractionDigits("USD"), 2);
  assert.equal(CurrencySupport.fractionDigits("KWD"), 3);
});
