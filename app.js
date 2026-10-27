(() => {
  const translations = {
    ar: {
      documentTitle: "قسمة عادلة — تقسيم المصاريف",
      description: "قسّم المصاريف المشتركة بسهولة، مباشرة في متصفحك وبلا حساب أو خادم.",
      languageButton: "English",
      languageLabel: "تغيير اللغة",
      eyebrow: "أداة مجانية وبسيطة",
      title: "قسمة عادلة",
      intro: "أدخل ما دفعه كل شخص، وسنحسب الحصة والتحويلات اللازمة لتسوية الحساب.",
      privacy: "حساباتك تبقى على هذا الجهاز — لا تسجيل ولا إرسال بيانات.",
      peopleHeading: "الأشخاص والمبالغ",
      peopleHint: "أضف كل شخص والمبلغ الذي دفعه. اترك المبلغ صفرًا إن لم يدفع.",
      currencyLabel: "العملة",
      currencyAria: "العملة",
      nameColumn: "الاسم",
      paidColumn: "المبلغ المدفوع",
      addPerson: "إضافة شخص",
      clearAll: "مسح الكل",
      resultsEyebrow: "النتيجة",
      resultsHeading: "الحساب والتسوية",
      copySummary: "نسخ الملخص",
      totalPaid: "إجمالي المصاريف",
      averageShare: "متوسط الحصة للشخص",
      breakdownHeading: "حصة كل شخص",
      roundingNote: "عند تعذّر تقسيم المبلغ إلى وحدات نقدية متساوية، تُوزّع الوحدات المتبقية حسب ترتيب القائمة.",
      settlementHeading: "التحويلات لتصفية الحساب",
      settlementHint: "تحويلات مقترحة لموازنة الحساب بين الجميع.",
      footer: "مشروع مفتوح المصدر — لا تُحفظ أي بيانات بعد إغلاق الصفحة.",
      personPlaceholder: "اسم الشخص",
      paidLabel: "ما دفعه",
      removePerson: "حذف الشخص",
      personFallback: "شخص",
      paidBy: "دفع",
      shareLabel: "الحصة",
      fromVerb: "يدفع",
      toConnector: "إلى",
      noTransfers: "الحساب متوازن — لا حاجة إلى تحويلات.",
      copied: "تم نسخ الملخص.",
      copyFailed: "تعذّر النسخ. يمكنك تحديد النتيجة ونسخها يدويًا."
    },
    en: {
      documentTitle: "FairSplit — shared expense splitter",
      description: "Split shared expenses in your browser. No account, server, or data collection.",
      languageButton: "العربية",
      languageLabel: "Change language",
      eyebrow: "A free, simple tool",
      title: "FairSplit",
      intro: "Enter what each person paid. See everyone’s share and the transfers that settle the bill.",
      privacy: "Your calculations stay on this device — no sign-in and no data sent.",
      peopleHeading: "People and payments",
      peopleHint: "Add everyone and how much they paid. Leave the amount at zero if they paid nothing.",
      currencyLabel: "Currency",
      currencyAria: "Currency",
      nameColumn: "Name",
      paidColumn: "Amount paid",
      addPerson: "Add person",
      clearAll: "Clear all",
      resultsEyebrow: "The result",
      resultsHeading: "Summary and settlement",
      copySummary: "Copy summary",
      totalPaid: "Total expenses",
      averageShare: "Average share per person",
      breakdownHeading: "Each person’s share",
      roundingNote: "If the total cannot be split into equal smallest currency units, leftover units are assigned in list order.",
      settlementHeading: "Transfers to settle up",
      settlementHint: "Suggested transfers to balance what everyone paid.",
      footer: "Open-source project — your data is not saved after you close the page.",
      personPlaceholder: "Person’s name",
      paidLabel: "Paid",
      removePerson: "Remove person",
      personFallback: "Person",
      paidBy: "Paid",
      shareLabel: "Share",
      fromVerb: "pays",
      toConnector: "to",
      noTransfers: "Everyone is settled — no transfers needed.",
      copied: "Summary copied.",
      copyFailed: "Could not copy. You can select and copy the results manually."
    }
  };

  const $ = (selector) => document.querySelector(selector);
  const participantsList = $("#participants-list");
  const currencySelect = $("#currency-select");
  const state = { language: "ar", nextId: 1, participants: [] };
  const moneyFormatters = new Map();

  function currencyFractionDigits() {
    return window.FairSplitCurrency.fractionDigits(currencySelect.value);
  }

  function formatMoney(minorUnits) {
    const currency = currencySelect.value;
    const locale = state.language === "ar" ? "ar-MA" : "en-US";
    const key = `${locale}:${currency}`;
    if (!moneyFormatters.has(key)) {
      const digits = currencyFractionDigits();
      moneyFormatters.set(key, new Intl.NumberFormat(locale, {
        style: "currency", currency, minimumFractionDigits: digits, maximumFractionDigits: digits
      }));
    }
    return moneyFormatters.get(key).format(minorUnits / (10 ** currencyFractionDigits()));
  }

  function minorUnitsFromInput(value) {
    const normalized = String(value).trim().replace(",", ".");
    if (!normalized) return 0;
    const amount = Number(normalized);
    return Number.isFinite(amount) && amount > 0
      ? Math.round(amount * (10 ** currencyFractionDigits()))
      : 0;
  }

  function participantNames() {
    const lang = translations[state.language];
    const baseNames = state.participants.map((person, index) =>
      person.name.trim() || `${lang.personFallback} ${index + 1}`
    );
    const counts = new Map();
    baseNames.forEach((name) => counts.set(name, (counts.get(name) || 0) + 1));
    const seen = new Map();
    return baseNames.map((name) => {
      if (counts.get(name) < 2) return name;
      const count = (seen.get(name) || 0) + 1;
      seen.set(name, count);
      return `${name} (${count})`;
    });
  }

  function createParticipantRow(person, index) {
    const lang = translations[state.language];
    const row = document.createElement("div");
    row.className = "participant-row";
    row.dataset.id = String(person.id);

    const nameLabel = document.createElement("label");
    nameLabel.className = "field name-field";
    const nameCaption = document.createElement("span");
    nameCaption.className = "mobile-caption";
    nameCaption.textContent = lang.nameColumn;
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.name = `person-${person.id}`;
    nameInput.autocomplete = "off";
    nameInput.maxLength = 50;
    nameInput.placeholder = lang.personPlaceholder;
    nameInput.value = person.name;
    nameInput.setAttribute("aria-label", `${lang.personPlaceholder} ${index + 1}`);
    nameInput.addEventListener("input", () => {
      person.name = nameInput.value;
      const personLabel = person.name.trim() || `${lang.personFallback} ${index + 1}`;
      amountInput.setAttribute("aria-label", `${lang.paidLabel} — ${personLabel}`);
      removeButton.setAttribute("aria-label", `${lang.removePerson} — ${personLabel}`);
      refreshResults();
    });
    nameLabel.append(nameCaption, nameInput);

    const amountLabel = document.createElement("label");
    amountLabel.className = "field amount-field";
    const amountCaption = document.createElement("span");
    amountCaption.className = "mobile-caption";
    amountCaption.textContent = lang.paidColumn;
    const amountInput = document.createElement("input");
    amountInput.type = "number";
    amountInput.min = "0";
    amountInput.step = String(10 ** -currencyFractionDigits());
    amountInput.inputMode = "decimal";
    amountInput.value = person.paid;
    amountInput.setAttribute("aria-label", `${lang.paidLabel} — ${person.name.trim() || `${lang.personFallback} ${index + 1}`}`);
    amountInput.addEventListener("input", () => {
      person.paid = amountInput.value;
      refreshResults();
    });
    amountLabel.append(amountCaption, amountInput);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-button";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", `${lang.removePerson} — ${person.name.trim() || `${lang.personFallback} ${index + 1}`}`);
    removeButton.disabled = state.participants.length <= 2;
    removeButton.addEventListener("click", () => removeParticipant(person.id));

    row.append(nameLabel, amountLabel, removeButton);
    return row;
  }

  function updateParticipantRows() {
    participantsList.replaceChildren(...state.participants.map(createParticipantRow));
  }

  function addParticipant() {
    const person = { id: state.nextId++, name: "", paid: "0" };
    state.participants.push(person);
    participantsList.append(createParticipantRow(person, state.participants.length - 1));
    updateParticipantRows();
    refreshResults();
    const lastInput = participantsList.lastElementChild?.querySelector("input[type='text']");
    if (lastInput) lastInput.focus();
  }

  function removeParticipant(id) {
    if (state.participants.length <= 2) return;
    state.participants = state.participants.filter((person) => person.id !== id);
    updateParticipantRows();
    refreshResults();
  }

  function refreshResults() {
    const names = participantNames();
    const people = state.participants.map((person, index) => ({
      id: person.id,
      name: names[index],
      paidCents: minorUnitsFromInput(person.paid)
    }));
    const result = window.SplitLogic.calculate(people);
    $("#total-value").textContent = formatMoney(result.totalCents);
    $("#average-value").textContent = formatMoney(result.totalCents / people.length);
    renderBreakdown(result);
    renderSettlements(result);
  }

  function renderBreakdown(result) {
    const list = $("#breakdown-list");
    const fragment = document.createDocumentFragment();
    result.people.forEach((person) => {
      const item = document.createElement("div");
      item.className = "breakdown-item";
      const identity = document.createElement("span");
      identity.className = "person-identity";
      const avatar = document.createElement("span");
      avatar.className = "avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = person.name.trim().charAt(0).toLocaleUpperCase() || "•";
      const name = document.createElement("span");
      name.textContent = person.name;
      identity.append(avatar, name);

      const amounts = document.createElement("span");
      amounts.className = "person-amounts";
      const paid = document.createElement("span");
      paid.textContent = `${translations[state.language].paidBy}: ${formatMoney(person.paidCents)}`;
      const share = document.createElement("strong");
      share.textContent = `${translations[state.language].shareLabel}: ${formatMoney(person.shareCents)}`;
      amounts.append(paid, share);
      item.append(identity, amounts);
      fragment.append(item);
    });
    list.replaceChildren(fragment);
  }

  function renderSettlements(result) {
    const list = $("#settlement-list");
    const lang = translations[state.language];
    if (result.transfers.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = lang.noTransfers;
      list.replaceChildren(empty);
      return;
    }
    const fragment = document.createDocumentFragment();
    result.transfers.forEach((transfer) => {
      const item = document.createElement("div");
      item.className = "transfer-item";
      const direction = document.createElement("p");
      direction.className = "transfer-direction";
      const from = document.createElement("strong");
      from.textContent = transfer.from;
      const verb = document.createTextNode(` ${lang.fromVerb} `);
      const to = document.createElement("strong");
      to.textContent = transfer.to;
      direction.append(from, verb, to);
      const amount = document.createElement("strong");
      amount.className = "transfer-amount";
      amount.textContent = formatMoney(transfer.amountCents);
      item.append(direction, amount);
      fragment.append(item);
    });
    list.replaceChildren(fragment);
  }

  function populateCurrencyOptions() {
    const selectedCurrency = currencySelect.value || "MAD";
    const options = window.FairSplitCurrency.options(state.language).map(({ code, label }) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = label;
      return option;
    });
    currencySelect.replaceChildren(...options);
    currencySelect.value = window.FairSplitCurrency.codes().includes(selectedCurrency)
      ? selectedCurrency
      : "MAD";
  }

  function updateLanguage() {
    const lang = translations[state.language];
    document.documentElement.lang = state.language;
    document.documentElement.dir = state.language === "ar" ? "rtl" : "ltr";
    document.title = lang.documentTitle;
    document.querySelector('meta[name="description"]').content = lang.description;
    $("#language-toggle").textContent = lang.languageButton;
    $("#language-toggle").setAttribute("aria-label", lang.languageLabel);
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      if (lang[key]) element.textContent = lang[key];
    });
    populateCurrencyOptions();
    currencySelect.setAttribute("aria-label", lang.currencyAria);
    updateParticipantRows();
    refreshResults();
  }

  async function copySummary() {
    const lang = translations[state.language];
    const result = window.SplitLogic.calculate(state.participants.map((person, index) => ({
      id: person.id,
      name: participantNames()[index],
      paidCents: minorUnitsFromInput(person.paid)
    })));
    const lines = [
      `${lang.resultsHeading}: ${formatMoney(result.totalCents)}`,
      ...result.people.map((person) => `${person.name} — ${lang.shareLabel}: ${formatMoney(person.shareCents)}`),
      ...result.transfers.map((transfer) => `${transfer.from} ${lang.fromVerb} ${transfer.to}: ${formatMoney(transfer.amountCents)}`)
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      $("#copy-status").textContent = lang.copied;
    } catch {
      $("#copy-status").textContent = lang.copyFailed;
    }
  }

  function clearAll() {
    state.participants = [
      { id: state.nextId++, name: "", paid: "0" },
      { id: state.nextId++, name: "", paid: "0" }
    ];
    currencySelect.value = "MAD";
    $("#copy-status").textContent = "";
    updateParticipantRows();
    refreshResults();
  }

  $("#add-person").addEventListener("click", addParticipant);
  $("#clear-all").addEventListener("click", clearAll);
  $("#copy-summary").addEventListener("click", copySummary);
  $("#language-toggle").addEventListener("click", () => {
    state.language = state.language === "ar" ? "en" : "ar";
    updateLanguage();
  });
  currencySelect.addEventListener("change", () => {
    const step = String(10 ** -currencyFractionDigits());
    participantsList.querySelectorAll('input[type="number"]').forEach((input) => {
      input.step = step;
    });
    refreshResults();
  });

  state.participants = [
    { id: state.nextId++, name: "", paid: "0" },
    { id: state.nextId++, name: "", paid: "0" }
  ];
  updateLanguage();
})();
