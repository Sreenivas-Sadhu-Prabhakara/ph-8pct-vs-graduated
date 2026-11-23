/* 8% flat vs graduated-rates decision tool (Philippines, TRAIN law). No deps, no network. */
(function () {
  "use strict";

  var THRESHOLD = 3000000;   // VAT threshold; also the 8% / 3%-percentage-tax ceiling
  var EXEMPT = 250000;       // annual exemption
  var RATE_8 = 0.08;
  var RATE_PCT = 0.03;       // Sec. 116 percentage tax
  var OSD_RATE = 0.40;       // optional standard deduction

  var peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
  var plain = new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 });

  function money(n) {
    if (!isFinite(n)) n = 0;
    return peso.format(n);
  }
  function num(el) {
    if (!el) return 0;
    var v = parseFloat(el.value);
    if (!isFinite(v) || v < 0) return 0;
    return v;
  }

  // Graduated income tax on annual taxable net income (TRAIN brackets).
  function graduatedTax(net) {
    if (net <= 250000) return 0;
    if (net <= 400000) return (net - 250000) * 0.15;
    if (net <= 800000) return 22500 + (net - 400000) * 0.20;
    if (net <= 2000000) return 102500 + (net - 800000) * 0.25;
    if (net <= 8000000) return 402500 + (net - 2000000) * 0.30;
    return 2202500 + (net - 8000000) * 0.35;
  }

  var $ = function (id) { return document.getElementById(id); };

  var grossEl = $("gross"),
      expensesEl = $("expenses"),
      withheldEl = $("withheld"),
      osdOut = $("osdExpenses"),
      methodWrap = $("method"),
      itemizedField = $("itemizedField"),
      osdField = $("osdField");

  var recLabel = $("recLabel"), recValue = $("recValue"), recSub = $("recSub"),
      badge8 = $("badge8"), badgeG = $("badgeG"),
      rBase8 = $("r_base8"), rTax8 = $("r_tax8"), rNet = $("r_net"),
      rIncTax = $("r_inctax"), rPct = $("r_pct"), rTot8 = $("r_tot8"), rTotG = $("r_totg"),
      payRow = $("payRow"), rPay8 = $("r_pay8"), rPayG = $("r_payg");

  function activeMethod() {
    var b = methodWrap.querySelector('button[aria-pressed="true"]');
    return b ? b.getAttribute("data-method") : "itemized";
  }

  function compute() {
    var gross = num(grossEl);
    var method = activeMethod();
    var withheld = num(withheldEl);

    var expenses = method === "osd" ? OSD_RATE * gross : num(expensesEl);
    osdOut.value = plain.format(OSD_RATE * gross); // keep OSD preview current even when hidden

    var eligible8 = gross <= THRESHOLD;
    var base8 = Math.max(0, gross - EXEMPT);
    var tax8 = base8 * RATE_8;

    var net = Math.max(0, gross - expenses);
    var incomeTax = graduatedTax(net);
    var pctTax = gross <= THRESHOLD ? gross * RATE_PCT : 0;
    var gradTotal = incomeTax + pctTax;

    // ---- decision ----
    var recName, recTotal, badgeText8 = "", badgeTextG = "";
    if (eligible8) {
      if (tax8 <= gradTotal) { recName = "8% flat option"; recTotal = tax8; badgeText8 = "cheaper"; }
      else { recName = "graduated rates"; recTotal = gradTotal; badgeTextG = "cheaper"; }
      var diff = Math.abs(gradTotal - tax8);
      recLabel.textContent = "Recommended · " + recName;
      recValue.textContent = money(recTotal);
      if (diff < 1) {
        recSub.textContent = "Both options cost the same — the 8% flat option is simpler to file.";
      } else {
        var other = recName === "8% flat option" ? "graduated rates" : "the 8% flat option";
        recSub.textContent = "You save " + money(diff) + " vs " + other + ".";
      }
    } else {
      recName = "graduated rates";
      recTotal = gradTotal;
      badgeTextG = "only option";
      recLabel.textContent = "Recommended · graduated rates";
      recValue.textContent = money(recTotal);
      recSub.textContent = "The 8% option is unavailable above ₱3,000,000 — VAT (12%) now applies instead of the 3% percentage tax. Confirm your VAT filing.";
    }

    // ---- breakdown table ----
    rBase8.textContent = eligible8 ? money(base8) : "n/a";
    rTax8.textContent = eligible8 ? money(tax8) : "n/a";
    rNet.textContent = money(net);
    rIncTax.textContent = money(incomeTax);
    rPct.textContent = gross <= THRESHOLD ? money(pctTax) : "VAT 12% applies";
    rTot8.textContent = eligible8 ? money(tax8) : "n/a";
    rTotG.textContent = money(gradTotal);

    // cheaper-column badges
    badge8.textContent = badgeText8;
    badge8.hidden = !badgeText8;
    badgeG.textContent = badgeTextG;
    badgeG.hidden = !badgeTextG;

    // ---- net still payable (only when withholding entered) ----
    if (withheld > 0) {
      payRow.hidden = false;
      var payable = recTotal - withheld;
      var payTxt = payable < 0 ? money(-payable) + " refundable" : money(payable);
      var on8 = recName === "8% flat option";
      rPay8.textContent = on8 ? payTxt : "—";
      rPayG.textContent = on8 ? "—" : payTxt;
    } else {
      payRow.hidden = true;
      rPay8.textContent = "—";
      rPayG.textContent = "—";
    }
  }

  // ---- wiring ----
  [grossEl, expensesEl, withheldEl].forEach(function (el) {
    el.addEventListener("input", compute);
  });

  methodWrap.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-method]");
    if (!b) return;
    var method = b.getAttribute("data-method");
    methodWrap.querySelectorAll("button[data-method]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn === b));
    });
    itemizedField.hidden = method !== "itemized";
    osdField.hidden = method !== "osd";
    compute();
  });

  $("print").addEventListener("click", function () { window.print(); });

  $("reset").addEventListener("click", function () {
    grossEl.value = "";
    expensesEl.value = "";
    withheldEl.value = "";
    methodWrap.querySelectorAll("button[data-method]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-method") === "itemized"));
    });
    itemizedField.hidden = false;
    osdField.hidden = true;
    compute();
  });

  compute();
})();
