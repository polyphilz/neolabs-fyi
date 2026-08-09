# Valuation methodology

How this dataset arrives at a `Valuation` for a lab, and how to research one from scratch.

This file is both a **reference** for the repo and a **prompt** you can hand to a research
agent verbatim — §9 is the agent contract.

---

## 1. The core principle

For labs with a published price, record the price.

For labs without one, **`usdM` is an inferred nominal post-money valuation — not capital
raised.** This is the single most important rule here, and the one the pre-`606cd52` records
got wrong. Stated in the Orbital record:

> The nominal is editorial, as it is for every `undisclosed` here: $71M of capital raised is
> what the company has taken in, not what it is worth.

A nominal is *editorial and explicitly so*. It sets a bubble radius and nothing more. The
`undisclosed` qualifier keeps it off the blue magnitude ramp so it can never be misread as a
reported figure. What earns its place in the file is not the number but **the argument in
the comment above it.**

### Corollary: never leave a bare number

Every `undisclosed` figure must carry a comment that states what is on record, what was
rejected and why, how the number was derived, and where its floor and ceiling sit. A figure
without that argument is not a datum, it is a guess wearing a datum's clothes.

---

## 2. Pick the qualifier first

Decide *how well the figure is known* before deciding what it is.

| Qualifier | Use when | Precedent in the file |
| --- | --- | --- |
| `exact` | A real post-money is published — by the company, or by two independent outlets carrying the same point value from a source close to the deal | `irregular` $450M (TechCrunch + Forbes, company never priced it publicly) |
| `approx` | The figure is known but soft: currency-converted, "roughly", or a midpoint | `mistral` — €11.7B post converted at the announcement-date rate |
| `rumored: true` | A single outlet, unnamed sources, and everyone else tracing back to it | `aleph-alpha` — the ~10% merger split, all roads leading to one Handelsblatt story |
| `gt` / `lt` | Only a bound was ever reported | `axiom-math` `>$1.6B` |
| `range` | A genuine reported range, not your own uncertainty | — |
| `undisclosed` | No figure was ever published. `usdM` becomes an inferred nominal | Orbital, Deep Cogito, Grafton |

**Three traps in this step:**

1. **An asking price is not a valuation.** The FT reported Logical Intelligence "targets
   $1bn-plus valuation" while the raise was still open; two later sources confirmed it was
   still open months on. A target the market has not met is not a close. Stays `undisclosed`.
2. **An acquirer's investment commitment is not a purchase price.** SAP committed up to €1B
   *into* Prior Labs over four years. That is not consideration paid.
3. **Your own uncertainty is not a `range`.** `range` means the source reported a range. Your
   uncertainty belongs in the floor/ceiling sentences of the comment.

---

## 3. Establish the record

Before any arithmetic:

- **Every round**: size, date, stage label, lead, full participant list.
- **Total raised**, and whether trackers agree with the company. They often do not — flag
  the gap rather than silently picking one.
- **Headcount**, from LinkedIn or the company's own careers page.
- **What has shipped**, and when relative to the round. A round priced before the flagship
  product shipped prices differently from one priced after.
- **Separate company-confirmed facts from tracker facts.** Say which is which in the comment.

---

## 4. Check the registers

### 4.1 EDGAR — always, and always with a control

A Form D is the best single source in this whole method: exact offering size, amount sold,
first-sale date, investor count, sometimes directors. Deep Cogito's entire figure was built
on one.

```bash
UA="neolabs-research <your-email>"

# Full-text search
curl -s -H "User-Agent: $UA" --get \
  --data-urlencode 'q="Company Name"' \
  --data-urlencode 'forms=D' \
  "https://efts.sec.gov/LATEST/search-index"

# Company-name index
curl -s -H "User-Agent: $UA" \
  "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=NAME&type=D&output=atom"
```

Try legal-entity variants: `"X Inc"`, `"X, Inc."`, `"X Labs"`, `"X Technologies"`, the
founder's surname, and any alternate name you have found.

**A null result only counts once the control passes.** Run a query known to return hits and
report it:

```bash
curl -s -H "User-Agent: $UA" --get \
  --data-urlencode 'q="Deep Cogito"' --data-urlencode 'forms=D' \
  "https://efts.sec.gov/LATEST/search-index"
# expect exactly 2: D 2026-04-08, D/A 2026-04-24, Deep Cogito Inc. CIK 0002128259
```

The Grafton record makes this argument explicitly and every later record should too. Without
the control, "no hits" is indistinguishable from a broken query.

**Non-US labs still often file.** Latent Labs is London-headquartered and had two Form Ds
under a Delaware topco. Never skip EDGAR because the lab is foreign.

### 4.2 Companies House, for UK labs

`https://find-and-update.company-information.service.gov.uk`

Useful: incorporation date, PSC and director lists, charges (which can date money hitting
the bank), and confirmation statements revealing a parent. **Usually useless for price** —
an SH01 return of allotment typically states only aggregate *nominal* capital, never the
premium, so no valuation is derivable. The `cursive` record documents this limitation; say
plainly which case you hit.

---

## 5. Reject bad figures, by name

Name what you discard and why. The comment is more useful for what it rules out than for
what it asserts.

| Class | Why it's wrong | Seen at |
| --- | --- | --- |
| Dealroom "enterprise value" bands | Models capital raised, not worth — the same $200–300M band appears for labs with wildly different profiles | Orbital, Inherent, Latent Labs |
| Caplight / Forge / Hiive / UpMarket marks | Secondary-marketplace models, not rounds | EvolutionaryScale's $1.14B |
| Auto-generated company profiles — sites such as nextomoro, valueaddvc, startuphub.ai | Figures with no traceable source; several contradict primary filings and the company's own statements | A Series B and post-money for one lab that no filing or outlet supports; a modelled "effective valuation" presented as a figure for another |
| Name collisions | A different company entirely | Dealroom's "Autoscience" is an unrelated consumer app; Forge's "Latent" is another firm; Crunchbase's Autoscience description belongs to a car-parts company |
| Derivative lab indexes | Circular — likely built from datasets like this one | labindex.fyi |
| FX round-trip artifacts | Spurious precision | Tracxn's `$50,000,647.82` for a $50M round |

A tracker figure can **corroborate** a nominal you derived independently. It must never
**set** one. Dealroom's $200–300M bracketing Latent Labs' $250M is corroboration; adopting
$250M *because* Dealroom said so is not.

---

## 6. Derive the nominal

### 6.1 Invert the latest priced round

```
nominal post-money ≈ round size ÷ dilution
```

Price the **latest round alone**, never the cumulative total. Latent Labs' old figure was the
correct total ($50M) but the wrong quantity — the round to price was the $40M Series A.

**Dilution reference.** Pick from evidence and justify the choice in one clause.

**Growth rounds (Series A and later):**

| Rate | Reads as | Worked example |
| --- | --- | --- |
| ~10% | Ceiling case only | "a lab priced above that does not raise only $40M" |
| ~12.5% | Hot / contested | Orbital, $50M Series B → $400M |
| ~13% | Competitive, new outside lead taking a board seat | Deep Cogito, $40M Series A → $300M |
| ~16–17% | Normal | Latent Labs $40M A → $250M · Moonvalley $84M → $500M · EvolutionaryScale $102M → $600M |
| ~22% | Soft, no step-up | Essential AI, $56.5M A → $250M |

**Seeds — a band of their own, shifted up.** Seeds dilute more than growth rounds, so the
growth rates above must not be applied mechanically to a first cheque.

| Rate | Reads as |
| --- | --- |
| ~15% | Hot / pre-empted. Use as the **ceiling** |
| **~20%** | **Default.** Start here and argue away from it |
| ~25% | Soft. Use as the **floor** |

Market anchor: TechCrunch, 31 Mar 2026, sourced partly to MaC Ventures — **$10M at $40–45M
post (22–25%) is "pretty typical"** for an AI seed; YC W26 companies were asking $5M at $40M
post (12.5%). The band brackets both.

**Sector adjustment.** Life-sciences and TechBio Series A rounds routinely sell 25–35%. If a
life-sciences fund co-leads, argue the rate explicitly rather than defaulting to the software
band.

### 6.2 Sanity-check against the multiple band

Compare `nominal ÷ total raised` to the band the file has established:

> Moonvalley 3.2× · Xaira 3.4× · Grafton ~3.5× · Essential AI 3.8× · Latent Labs 5.1× ·
> Orbital 5.6× · Deep Cogito 5.6× · Isomorphic 5.8×

Landing outside roughly 3–6× needs a stated reason.

**⚠️ The test is degenerate for one-round companies.** With a single round,
multiple-of-raised is just `1 ÷ dilution` restated — Oumi at 5.0× *is* 1/0.20. It carries no
independent information and cannot corroborate the rate. It only bites when earlier, cheaper
capital sits in the denominator. Say so rather than presenting a tautology as a check.

### 6.3 State a floor and a ceiling

Non-optional. Each needs the dilution rate that produces it **and** a one-line justification
grounded in something real — headcount, shipped work, or a named comparable in this file.

> $200M is the floor (25%: a lab selling a quarter of itself at seed does not draw two
> competing leads and Nvidia) and $400M the ceiling (12.5%, Orbital's rate and Orbital's
> mark, earned on a Series B with a shipped Apache-licensed model).

### 6.4 The Grafton fallback — when there is no round to invert

Some labs have no disclosed round size at all. Do **not** manufacture one. Use stage
comparison: pick a multiple of whatever capital base exists, and bracket it by naming
specific labs in this file above and below.

> $150M is the floor: that is Grafton Sciences, and where Grafton has fifteen people and
> nothing published, this has 31 profiles on LinkedIn, two shipped systems […] $300M is the
> ceiling — Deep Cogito's mark, and it has a competitively priced Series A and $53.4M raised
> where this has one undisclosed seed.

If even that is unsupportable, a **documented placeholder is a valid outcome**. Say so in the
comment and record what was searched. False precision is worse than an admitted gap.

---

## 7. Special cases

- **Nonprofits** (`structure: 'nonprofit'`) — equity valuation does not apply. Use
  contributions or grants as a neutral proxy and say so. `format.ts` renders "Not
  applicable". LawZero, FutureHouse, Transluce, Kyutai.
- **Subsidiaries** (`structure: 'subsidiary'`) — renders "Not independently valued"; the
  figure only sets a radius. Prior Labs.
- **Public-benefit corporations — NOT exempt.** A PBC is for-profit, has equity, and dilutes
  normally. `format.ts` gives it no special rendering, so the figure is load-bearing exactly
  as for any private lab. Inherent, Oumi.
- **Listed labs** — `status: 'public'` means the figure is a market cap that moves daily. Set
  `asOf`.
- **Non-dilutive capital is excluded from the derivation.** DARPA grants, ARPA-H awards and
  similar are not equity. Note them, then set them aside. Grafton is the hard case: its only
  disclosed capital is non-dilutive, which is why it needs §6.4.
- **Venture debt** is not equity either. Latent Labs has three HSBC charges never reported
  anywhere; "total funding" figures are equity only.

---

## 8. Writing the comment

House voice: dense, specific, verifiable. Name outlets and dates. State the derivation as
arithmetic the reader can redo. 8–20 lines is typical; Grafton runs 33 because its evidence
base is the thinnest and needs the most defending.

Structure that works:

1. **What is on record** — rounds, dates, investors, and who confirmed each.
2. **What was rejected** — by name, with the reason.
3. **The register check** — including the control result.
4. **The derivation** — rate, why that rate, the arithmetic, the multiple check.
5. **Floor and ceiling**, each justified.

Write for a reader who will try to prove you wrong. If a figure rests on an assumption, name
the assumption in the comment rather than letting the number imply confidence it lacks.

**Keep the comment about the company.** Never annotate an
individual — someone's degrees, why they left a role, what their personal profiles say, or
how their fundraising is going. Where a deal fact concerns people (proceeds, payouts,
who signed what), state it at the level of the company and leave the individuals out. Deal
facts that are unavoidably about a person — a founder quoted in a release, an investor named
as a round's lead — are fine. See AGENTS.md.

---

## 9. Agent contract

Hand an agent §1–§8 above plus this section and the target lab's current record.

**Constraints**

- **Strictly read-only.** No file edits, no mutating git commands. Return findings as text.
- Cite every source with a date.
- Distinguish reporting from inference in your own prose. "I could not establish this" beats
  a confident guess.
- Be skeptical of single-source claims, especially for small or early companies, which
  attract the most fabricated data.

**Deliverable**

1. **Paste-ready replacement** — the full `//` comment block plus the `valuation: {...}`
   line, in house voice.
2. **Qualifier verdict** — stays `undisclosed`, or changes, and why.
3. **Confidence** (high / medium / low) and **the single weakest link** in the derivation,
   stated plainly.
4. **Sources**, dated — including the negative searches: what you queried, where, and got
   nothing.
5. **Anything else about the record that looks wrong** — founders, year, tags, structure,
   location. Flag only; do not fix.

Item 5 has repeatedly been worth more than the valuation itself: a single pricing pass over
five labs surfaced three wrong `year` values, an over-long founder list, and a misattributed
`prior`, purely as a by-product.

---

## 10. Worked examples

Read these records in `src/data/labs.ts` before starting. They are the method in practice.

| Record | Why read it |
| --- | --- |
| `deep-cogito` | The clean case — Form D gives the round, board seat justifies a tighter rate |
| `orbital` | Dilution inversion with a tracker corroborating rather than setting |
| `grafton-sciences` | No priced round at all; stage comparison, and how to argue an absence |
| `latent-labs` | Two Form Ds; pricing the latest round rather than the total |
| `prior-labs` | Acquisition where the price was never disclosed and a commitment was mistaken for one |
| `essential-ai` | Deliberately *not* stepping up, because the lab did not |
| `logical-intelligence` | An asking price that is not a valuation |
| `irregular` | When two outlets are enough to make it `exact` |
