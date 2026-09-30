/** 75/60 = 1.25 exactly. Money math uses 5/4 via BigInt. */
export const MULTIPLIER_LABEL = "1.25";

/**
 * Half-up cents:
 * cents = (accounts * 60 * 5^cycles * 100 + den/2) / den
 * den = 4^cycles
 * cycles = floor(days / 5)
 */
export function computeCompound(accounts, days) {
  const acc = toBigInt(accounts, "accounts");
  const d = toBigInt(days, "days");
  if (acc < 1n) {
    throw new Error("Accounts must be at least 1.");
  }
  if (d < 0n) {
    throw new Error("Days cannot be negative.");
  }

  const cycles = d / 5n;
  const den = 4n ** cycles;
  const finalCents = (acc * 60n * 5n ** cycles * 100n + den / 2n) / den;
  const initialCents = acc * 60n * 100n;
  const profitCents = finalCents - initialCents;

  return {
    accounts: acc,
    days: d,
    cycles,
    initialCents,
    finalCents,
    profitCents,
    multiplierLabel: MULTIPLIER_LABEL,
    initialLabel: formatMoney(initialCents),
    finalLabel: formatMoney(finalCents),
    profitLabel: formatMoney(profitCents),
  };
}

export function formatMoney(cents) {
  const value = typeof cents === "bigint" ? cents : toBigInt(cents, "cents");
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const dollars = abs / 100n;
  const rem = (abs % 100n).toString().padStart(2, "0");
  const withCommas = dollars.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}$${withCommas}.${rem}`;
}

/** Same calculator, one row per account count. Not a hardcoded table. */
export function projectionTable(maxAccounts = 100) {
  const limit = Number(maxAccounts);
  const rows = [];
  for (let accounts = 1; accounts <= limit; accounts += 1) {
    const initial = computeCompound(accounts, 0);
    rows.push({
      accounts,
      initialLabel: initial.initialLabel,
      days30: computeCompound(accounts, 30).finalLabel,
      days60: computeCompound(accounts, 60).finalLabel,
      days90: computeCompound(accounts, 90).finalLabel,
    });
  }
  return rows;
}

export function validateInputs(accountsRaw, daysRaw) {
  const accountsText = String(accountsRaw ?? "").trim();
  const daysText = String(daysRaw ?? "").trim();

  if (accountsText === "" || daysText === "") {
    return {
      ok: false,
      error: "Enter both the number of accounts and the number of days.",
    };
  }

  const accountsBad = !/^\d+$/.test(accountsText);
  const daysBad = !/^\d+$/.test(daysText);

  if (accountsBad || daysBad) {
    return {
      ok: false,
      error:
        "Use whole numbers only. Accounts must be at least 1. Days must be at least 0. Decimals and negatives are not allowed.",
    };
  }

  const accounts = BigInt(accountsText.replace(/^0+(?=\d)/, ""));
  const days = BigInt(daysText.replace(/^0+(?=\d)/, ""));

  if (accounts < 1n) {
    return { ok: false, error: "Accounts must be a whole number of at least 1." };
  }

  // Keep the page responsive. BigInt itself does not overflow; this only
  // rejects inputs large enough to stall the browser on every keystroke.
  if (accounts > 1000000000000n || days > 100000n) {
    return {
      ok: false,
      error: "That value is too large. Enter a smaller whole number.",
    };
  }

  return { ok: true, accounts, days };
}

function toBigInt(value, label) {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new Error(`${label} must be a whole number.`);
    }
    return BigInt(value);
  }
  const text = String(value).trim();
  if (!/^\d+$/.test(text)) {
    throw new Error(`${label} must be a whole number.`);
  }
  return BigInt(text.replace(/^0+(?=\d)/, ""));
}
