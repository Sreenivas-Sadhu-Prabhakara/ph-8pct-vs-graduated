# 8% flat vs graduated-rates decision tool (Philippines)

A single-page calculator that compares the two ways a Philippine self-employed individual or
professional can be taxed on the same income: the **8% flat option** versus the **graduated
income-tax rates plus the 3% percentage tax**. Enter your expected annual gross, choose itemized
expenses or the 40% OSD, and the tool shows the tax both ways, which is cheaper and by how much,
and warns about the ₱3,000,000 VAT-threshold trap.

## What it does

- Computes the **8% flat tax**: 8% of gross receipts above the ₱250,000 exemption. Available only
  when gross is at or below ₱3,000,000; it replaces both the income tax and the 3% percentage tax.
- Computes the **graduated total**: TRAIN-law income tax on net income (gross minus expenses) plus
  the 3% percentage tax (Section 116) on gross.
- Supports **itemized expenses** or the **40% Optional Standard Deduction** (40% of gross).
- Recommends the cheaper option, shows the difference, and — if you enter tax already withheld —
  the net still payable.
- Above ₱3,000,000 the 8% option is removed and the tool warns that VAT (12%) applies instead of
  the 3% percentage tax.

## Who it's for

Philippine self-employed individuals, freelancers, and professionals registered with the BIR who
are deciding between the 8% income-tax option and the graduated rates.

## Regulation

Rates follow the **TRAIN law (Republic Act No. 10963)**, including the graduated brackets effective
from 2023, the 8% option, the Section 116 percentage tax, and the ₱3,000,000 VAT threshold.

## How to run

It is a static page with no dependencies and no network calls. Serve the folder locally:

```sh
python3 -m http.server 8137
```

Then open <http://localhost:8137/>. Or simply open `index.html` in a browser.

## Scope & accuracy

This is an educational estimate, not tax advice. It covers the income-tax decision only: it ignores
other tax credits, the quarterly filing schedule, VAT computation itself, and any registration
specifics. The 8% option must be formally elected and requires non-VAT registration. Always confirm
your figures with a CPA or the BIR before filing.

MIT licensed.
