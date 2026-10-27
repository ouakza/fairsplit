(function (root, factory) {
  const api = factory(Intl);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FairSplitCurrency = api;
})(typeof window !== "undefined" ? window : globalThis, function (IntlApi) {
  const fallbackCodes = `AED AFN ALL AMD ANG AOA ARS AUD AWG AZN BAM BBD BDT BGN BHD BIF BMD BND BOB BRL BSD BTN BWP BYN BZD CAD CDF CHF CLP CNY COP CRC CUC CUP CVE CZK DJF DKK DOP DZD EGP ERN ETB EUR FJD FKP GBP GEL GHS GIP GMD GNF GTQ GYD HKD HNL HRK HTG HUF IDR ILS INR IQD IRR ISK JMD JOD JPY KES KGS KHR KMF KPW KRW KWD KYD KZT LAK LBP LKR LRD LSL LYD MAD MDL MGA MKD MMK MNT MOP MRU MUR MVR MWK MXN MYR MZN NAD NGN NIO NOK NPR NZD OMR PAB PEN PGK PHP PKR PLN PYG QAR RON RSD RUB RWF SAR SBD SCR SDG SEK SGD SHP SLE SLL SOS SRD SSP STN SVC SYP SZL THB TJS TMT TND TOP TRY TTD TWD TZS UAH UGX USD UYU UZS VES VND VUV WST XAF XCD XCG XDR XOF XPF XSU YER ZAR ZMW ZWG ZWL`.split(/\s+/);

  function codes() {
    const available = typeof IntlApi.supportedValuesOf === "function"
      ? IntlApi.supportedValuesOf("currency")
      : fallbackCodes;
    return [...new Set(["MAD", ...available])].sort();
  }

  function fractionDigits(currency) {
    try {
      return new IntlApi.NumberFormat("en", { style: "currency", currency })
        .resolvedOptions().maximumFractionDigits;
    } catch {
      return 2;
    }
  }

  function options(locale) {
    const names = typeof IntlApi.DisplayNames === "function"
      ? new IntlApi.DisplayNames(locale, { type: "currency" })
      : null;
    const collator = new IntlApi.Collator(locale, { sensitivity: "base" });
    return codes().map((code) => {
      const name = names?.of(code) || "";
      return { code, name, label: name ? `${code} — ${name}` : code };
    }).sort((a, b) => {
      if (a.code === "MAD") return -1;
      if (b.code === "MAD") return 1;
      return collator.compare(a.name || a.code, b.name || b.code) || a.code.localeCompare(b.code);
    });
  }

  return { codes, fractionDigits, options };
});
