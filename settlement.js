((root) => {
  "use strict";

  function calculate(people) {
    if (!Array.isArray(people) || people.length < 2) {
      throw new Error("At least two people are required.");
    }

    const normalizedPeople = people.map((person) => ({
      id: person.id,
      name: String(person.name ?? ""),
      paidCents: Math.max(0, Math.round(Number(person.paidCents) || 0))
    }));
    const totalCents = normalizedPeople.reduce((sum, person) => sum + person.paidCents, 0);
    const baseShare = Math.floor(totalCents / normalizedPeople.length);
    const extraCents = totalCents % normalizedPeople.length;

    const balances = normalizedPeople.map((person, index) => {
      const shareCents = baseShare + (index < extraCents ? 1 : 0);
      return {
        ...person,
        shareCents,
        balanceCents: person.paidCents - shareCents
      };
    });

    const debtors = balances
      .filter((person) => person.balanceCents < 0)
      .map((person) => ({ ...person, remainingCents: -person.balanceCents }));
    const creditors = balances
      .filter((person) => person.balanceCents > 0)
      .map((person) => ({ ...person, remainingCents: person.balanceCents }));

    const transfers = [];
    let debtorIndex = 0;
    let creditorIndex = 0;
    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      const amountCents = Math.min(debtor.remainingCents, creditor.remainingCents);
      if (amountCents > 0) {
        transfers.push({
          from: debtor.name,
          to: creditor.name,
          amountCents
        });
      }
      debtor.remainingCents -= amountCents;
      creditor.remainingCents -= amountCents;
      if (debtor.remainingCents === 0) debtorIndex += 1;
      if (creditor.remainingCents === 0) creditorIndex += 1;
    }

    return {
      totalCents,
      people: balances,
      transfers
    };
  }

  const api = { calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.SplitLogic = api;
})(typeof window !== "undefined" ? window : globalThis);
