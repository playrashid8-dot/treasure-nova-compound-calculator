import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MULTIPLIER_LABEL,
  computeCompound,
  projectionTable,
  validateInputs,
} from "./calc.js";

test("multiplier label is 75/60 = 1.25", () => {
  assert.equal(MULTIPLIER_LABEL, "1.25");
  assert.equal(computeCompound(1, 30).multiplierLabel, "1.25");
});


test("10 accounts at 5, 10, and 30 days", () => {
  const five = computeCompound(10, 5);
  assert.equal(five.initialLabel, "$600.00");
  assert.equal(five.finalLabel, "$750.00");
  assert.equal(five.profitLabel, "$150.00");
  assert.equal(computeCompound(10, 10).finalLabel, "$937.50");
  assert.equal(computeCompound(10, 30).finalLabel, "$2,288.82");
});

test("1 account at 30, 60, and 90 days", () => {
  assert.equal(computeCompound(1, 30).finalLabel, "$228.88");
  assert.equal(computeCompound(1, 60).finalLabel, "$873.11");
  assert.equal(computeCompound(1, 90).finalLabel, "$3,330.67");
});

test("2 accounts at 30, 60, and 90 days", () => {
  assert.equal(computeCompound(2, 30).finalLabel, "$457.76");
  assert.equal(computeCompound(2, 60).finalLabel, "$1,746.23");
  assert.equal(computeCompound(2, 90).finalLabel, "$6,661.34");
});

test("3 accounts and 45 days", () => {
  const result = computeCompound(3, 45);
  assert.equal(result.initialLabel, "$180.00");
  assert.equal(result.cycles, 9n);
  assert.equal(result.finalLabel, "$1,341.10");
  assert.equal(result.profitLabel, "$1,161.10");
  assert.equal(result.finalCents - result.initialCents, result.profitCents);
});

test("50 accounts at 30, 60, and 90 days", () => {
  assert.equal(computeCompound(50, 30).finalLabel, "$11,444.09");
  assert.equal(computeCompound(50, 60).finalLabel, "$43,655.75");
  assert.equal(computeCompound(50, 90).finalLabel, "$166,533.45");
});

test("100 accounts at 30, 60, and 90 days", () => {
  assert.equal(computeCompound(100, 30).finalLabel, "$22,888.18");
  assert.equal(computeCompound(100, 60).finalLabel, "$87,311.49");
  assert.equal(computeCompound(100, 90).finalLabel, "$333,066.91");
});

test("profit is final minus initial at two decimals", () => {
  const one = computeCompound(1, 30);
  assert.equal(one.initialLabel, "$60.00");
  assert.equal(one.profitLabel, "$168.88");
  assert.equal(one.cycles, 6n);

  const zeroDays = computeCompound(3, 0);
  assert.equal(zeroDays.cycles, 0n);
  assert.equal(zeroDays.finalLabel, "$180.00");
  assert.equal(zeroDays.profitLabel, "$0.00");
});

test("projection table is generated for accounts 1 through 100", () => {
  const rows = projectionTable(100);
  assert.equal(rows.length, 100);
  assert.deepEqual(
    rows.map((row) => row.accounts),
    Array.from({ length: 100 }, (_, index) => index + 1),
  );
  assert.equal(rows[0].initialLabel, "$60.00");
  assert.equal(rows[0].days30, "$228.88");
  assert.equal(rows[0].days60, "$873.11");
  assert.equal(rows[0].days90, "$3,330.67");
  assert.equal(rows[2].days30, computeCompound(3, 30).finalLabel);
  assert.equal(rows[49].days90, "$166,533.45");
  assert.equal(rows[99].initialLabel, "$6,000.00");
  assert.equal(rows[99].days30, "$22,888.18");
  assert.equal(rows[99].days60, "$87,311.49");
  assert.equal(rows[99].days90, "$333,066.91");
});

test("validation rejects empty, decimal, and negative input", () => {
  assert.equal(validateInputs("", "").ok, false);
  assert.equal(validateInputs("1", "").ok, false);
  assert.equal(validateInputs("", "30").ok, false);
  assert.match(validateInputs("", "30").error, /Enter both/i);

  for (const bad of ["1.5", "1.0", "-1", "-0", "1e2", "abc", "1 0", "+2"]) {
    assert.equal(validateInputs(bad, "30").ok, false, bad);
  }
  for (const bad of ["1.5", "-5", "3.0", "1e1"]) {
    assert.equal(validateInputs("2", bad).ok, false, bad);
  }

  const ok = validateInputs("03", "0045");
  assert.equal(ok.ok, true);
  assert.equal(ok.accounts, 3n);
  assert.equal(ok.days, 45n);

  const zeroAccounts = validateInputs("0", "10");
  assert.equal(zeroAccounts.ok, false);
  assert.match(zeroAccounts.error, /at least 1/i);

  const zeroDays = validateInputs("1", "0");
  assert.equal(zeroDays.ok, true);
  assert.equal(zeroDays.days, 0n);
});
