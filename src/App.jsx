import { useMemo, useState } from "react";
import {
  MULTIPLIER_LABEL,
  computeCompound,
  projectionTable,
  validateInputs,
} from "./calc.js";

const EMPTY_ERROR = "Enter both the number of accounts and the number of days.";

export default function App() {
  const [accounts, setAccounts] = useState("");
  const [days, setDays] = useState("");
  const [error, setError] = useState(EMPTY_ERROR);
  const [result, setResult] = useState(null);

  const rows = useMemo(() => projectionTable(100), []);

  function calculate(nextAccounts = accounts, nextDays = days) {
    const parsed = validateInputs(nextAccounts, nextDays);
    if (!parsed.ok) {
      setResult(null);
      setError(parsed.error);
      return;
    }
    setError("");
    setResult(computeCompound(parsed.accounts, parsed.days));
  }

  function onAccountsChange(event) {
    const value = event.target.value;
    setAccounts(value);
    calculate(value, days);
  }

  function onDaysChange(event) {
    const value = event.target.value;
    setDays(value);
    calculate(accounts, value);
  }

  function onSubmit(event) {
    event.preventDefault();
    calculate();
  }

  function onReset() {
    setAccounts("");
    setDays("");
    setResult(null);
    setError(EMPTY_ERROR);
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="brand">TREASURE NOVA</p>
        <h1>COMPOUND CALCULATION</h1>
      </header>

      <main>
        <section className="card" aria-labelledby="calculator-heading">
          <h2 id="calculator-heading">Calculator</h2>
          <form onSubmit={onSubmit} noValidate>
            <div className="fields">
              <label>
                <span>Accounts</span>
                <input
                  name="accounts"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Whole number, minimum 1"
                  value={accounts}
                  onChange={onAccountsChange}
                  aria-describedby="input-error"
                />
              </label>
              <label>
                <span>Days</span>
                <input
                  name="days"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Whole number, minimum 0"
                  value={days}
                  onChange={onDaysChange}
                  aria-describedby="input-error"
                />
              </label>
            </div>
            <div className="actions">
              <button type="submit" className="primary">
                CALCULATE
              </button>
              <button type="button" className="ghost" onClick={onReset}>
                RESET
              </button>
            </div>
          </form>

          <p id="input-error" className="error" role="alert" hidden={!error}>
            {error}
          </p>

          {result ? (
            <dl className="result" aria-live="polite">
              <div>
                <dt>Number of Accounts</dt>
                <dd>{result.accounts.toString()}</dd>
              </div>
              <div>
                <dt>Total Initial Deposit</dt>
                <dd>{result.initialLabel} USDT</dd>
              </div>
              <div>
                <dt>Days Entered</dt>
                <dd>{result.days.toString()}</dd>
              </div>
              <div>
                <dt>Completed Cycles</dt>
                <dd>{result.cycles.toString()}</dd>
              </div>
              <div>
                <dt>Compound Multiplier</dt>
                <dd>{MULTIPLIER_LABEL}</dd>
              </div>
              <div className="final">
                <dt>Final USDT</dt>
                <dd>{result.finalLabel} USDT</dd>
              </div>
              <div>
                <dt>Total Profit</dt>
                <dd>{result.profitLabel} USDT</dd>
              </div>
            </dl>
          ) : null}
        </section>

        <section className="card" aria-labelledby="table-heading">
          <h2 id="table-heading">Accounts 1–100</h2>
          <p className="table-note">Same calculation for 30, 60, and 90 days.</p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Accounts</th>
                  <th scope="col">Initial Deposit</th>
                  <th scope="col">30 Days</th>
                  <th scope="col">60 Days</th>
                  <th scope="col">90 Days</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.accounts}>
                    <th scope="row">{row.accounts}</th>
                    <td>{row.initialLabel} USDT</td>
                    <td>{row.days30} USDT</td>
                    <td>{row.days60} USDT</td>
                    <td>{row.days90} USDT</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="disclaimer">
          Calculation is mathematical only and does not guarantee actual returns. Actual
          results may vary according to platform rules, fees, availability and other
          conditions.
        </p>
      </main>
    </div>
  );
}
