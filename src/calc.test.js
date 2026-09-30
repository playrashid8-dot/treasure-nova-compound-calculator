import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MULTIPLIER_LABEL,
  computeCompound,
  projectionTable,
  validateInputs,
} from "./calc.js";

test("multiplier label is the stated 80/60 figure", () => {
  assert.equal(MULTIPLIER_LABEL, "1.3333333333");
  assert.equal(computeCompound(1, 30).multiplierLabel, "1.3333333333");
});

test("1 account at 30, 60, and 90 days", () => {
  assert.equal(computeCompound(1, 30).finalLabel, "$337.12");
  assert.equal(computeCompound(1, 60).finalLabel, "$1,894.16");
  assert.equal(computeCompound(1, 90).finalLabel, "$10,642.62");
});

test("2 accounts at 30, 60, and 90 days", () => {
  assert.equal(computeCompound(2, 30).finalLabel, "$674.24");
  assert.equal(computeCompound(2, 60).finalLabel, "$3,788.32");
  assert.equal(computeCompound(2, 90).finalLabel, "$21,285.24");
});

test("3 accounts and 45 days", () => {
  const result = computeCompound(3, 45);
  assert.equal(result.initialLabel, "$180.00");
  assert.equal(result.cycles, 9n);
  assert.equal(result.finalLabel, "$2,397.29");
  assert.equal(result.profitLabel, "$2,217.29");
  assert.equal(result.finalCents - result.initialCents, result.profitCents);
});

test("50 accounts at 30, 60, and 90 days", () => {
  assert.equal(computeCompound(50, 30).finalLabel, "$16,855.97");
  assert.equal(computeCompound(50, 60).finalLabel, "$94,707.88");
  assert.equal(computeCompound(50, 90).finalLabel, "$532,130.94");
});

test("100 accounts at 30, 60, and 90 days", () => {
  assert.equal(computeCompound(100, 30).finalLabel, "$33,711.93");
  assert.equal(computeCompound(100, 60).finalLabel, "$189,415.75");
  assert.equal(computeCompound(100, 90).finalLabel, "$1,064,261.89");
});

test("profit is final minus initial at two decimals", () => {
  const one = computeCompound(1, 30);
  assert.equal(one.initialLabel, "$60.00");
  assert.equal(one.profitLabel, "$277.12");
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
  assert.equal(rows[0].days30, "$337.12");
  assert.equal(rows[0].days60, "$1,894.16");
  assert.equal(rows[0].days90, "$10,642.62");
  assert.equal(rows[2].days30, computeCompound(3, 30).finalLabel);
  assert.equal(rows[49].days90, "$532,130.94");
  assert.equal(rows[99].initialLabel, "$6,000.00");
  assert.equal(rows[99].days30, "$33,711.93");
  assert.equal(rows[99].days60, "$189,415.75");
  assert.equal(rows[99].days90, "$1,064,261.89");
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
