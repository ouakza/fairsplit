const test = require("node:test");
const assert = require("node:assert/strict");
const { calculate } = require("../settlement.js");

test("no transfers are needed when everyone paid an equal share", () => {
  const result = calculate([
    { id: 1, name: "A", paidCents: 2500 },
    { id: 2, name: "B", paidCents: 2500 },
    { id: 3, name: "C", paidCents: 2500 }
  ]);

  assert.equal(result.totalCents, 7500);
  assert.deepEqual(result.people.map((person) => person.shareCents), [2500, 2500, 2500]);
  assert.deepEqual(result.transfers, []);
});

test("debtors pay the person who covered the bill", () => {
  const result = calculate([
    { id: 1, name: "A", paidCents: 12000 },
    { id: 2, name: "B", paidCents: 0 },
    { id: 3, name: "C", paidCents: 0 }
  ]);

  assert.deepEqual(result.transfers, [
    { from: "B", to: "A", amountCents: 4000 },
    { from: "C", to: "A", amountCents: 4000 }
  ]);
});

test("leftover cents are allocated one at a time and all balances settle", () => {
  const result = calculate([
    { id: 1, name: "A", paidCents: 1000 },
    { id: 2, name: "B", paidCents: 0 },
    { id: 3, name: "C", paidCents: 0 }
  ]);

  assert.deepEqual(result.people.map((person) => person.shareCents), [334, 333, 333]);
  assert.equal(result.people.reduce((sum, person) => sum + person.shareCents, 0), 1000);
  assert.equal(result.transfers.reduce((sum, transfer) => sum + transfer.amountCents, 0), 666);
});

test("mixed payments produce transfers that clear every net balance", () => {
  const result = calculate([
    { id: 1, name: "A", paidCents: 5000 },
    { id: 2, name: "B", paidCents: 1500 },
    { id: 3, name: "C", paidCents: 0 },
    { id: 4, name: "D", paidCents: 3500 }
  ]);
  const net = new Map(result.people.map((person) => [person.name, person.balanceCents]));

  for (const transfer of result.transfers) {
    net.set(transfer.from, net.get(transfer.from) + transfer.amountCents);
    net.set(transfer.to, net.get(transfer.to) - transfer.amountCents);
  }
  assert.ok([...net.values()].every((balance) => balance === 0));
});

test("requires at least two people", () => {
  assert.throws(() => calculate([]), /At least two people/);
});
