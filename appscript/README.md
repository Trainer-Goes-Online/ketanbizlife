# Ketan BizLife CRM — Apps Script Downstream CAPI Engine

Apps Script bound to the **Ketan BizLife CRM** Google Sheet that fires three
downstream Meta Conversions API events whenever a team-edited dropdown is set
to TRUE:

| Sheet dropdown set to TRUE | Meta CAPI event fired | Carries value? |
|---|---|---|
| `attended` (col X) | `LeadShowUp` | no |
| `qualified` (col AB) | `QualifiedLead` | no |
| `sale_closed` (col AF) | `HighTicketPurchase` | yes — `contracted_value` from col AG |

The tripwire `Purchase` + `sales` events for the ₹99 webinar ticket are fired
separately by the **Cashfree webhook** in the Next.js backend
(`app/api/cashfree/webhook/route.ts`) at payment time. This script handles only
the three downstream lifecycle events. The two systems share the same Meta
pixel ID + access token but never talk directly — the Sheet is the only link.

> **Funnel type:** paid webinar / live challenge. Everyone who buys attends the
> SAME scheduled webinar, so `showup_time` (col Y) is identical for every
> attendee — fill it once and copy down the column, then toggle `attended`
> per row.

---

## Files

- **`Code.gs`** — paste into the Apps Script editor (replaces the default file)
- **`appsscript.json`** — the manifest. **Note the double "s": `appsscript.json`.**
  Google Apps Script only recognizes a manifest with this exact filename. (This
  repo folder is `appscript/` per the project's naming, but the manifest file
  itself must stay `appsscript.json` inside the Apps Script editor.)
- **`sheet-header.csv`** — the 36-column header row (A→AJ) to paste into row 1
- **`README.md`** — this file

These files are a template. They are NOT auto-deployed. To make them live,
copy-paste them into a Google Sheet's Apps Script editor (steps below).

---

## Prerequisites

1. **The Ketan BizLife CRM Google Sheet exists** with the 36-column schema in
   row 1, columns A through AJ. Paste the contents of `sheet-header.csv`:

   ```
   lead_id | created_at | first_name | last_name | email | phone | city | country_code | fbc | fbp | client_ip_address | client_user_agent | external_id | event_source_url | amount | is_test | purchase_event_id | utm_source | utm_medium | utm_campaign | utm_content | utm_term | fbclid | attended | showup_time | leadshowup_capi_event_id | leadshowup_capi_sent | qualified | qualified_time | qualified_capi_event_id | qualified_capi_sent | sale_closed | contracted_value | sales_time | htsale_capi_event_id | htsale_capi_sent
   ```

2. **The hidden `_Errors` tab exists** with this header in row 1:
   `timestamp | row_number | event_type | http_status | response_body | retry_count`

3. **Column types are correctly set** (see the Column formatting section below).

4. **Spreadsheet timezone is `Asia/Kolkata`** (File → Settings → Timezone).
   This matters because Apps Script reads `showup_time` / `qualified_time` /
   `sales_time` as Date objects and the timezone determines their resolved value.

5. **Pabbly is writing rows correctly** — at least one real payment has produced
   a row with all 23 auto-fill columns populated (especially `lead_id`, `email`,
   `fbc`, `fbp`, `client_ip_address`, `client_user_agent`, `external_id`).

---

## Column formatting (do this in the Sheet before going live)

| Cols | Format |
|---|---|
| X `attended`, AB `qualified`, AF `sale_closed` | **Dropdown** — Data → Data validation → Dropdown → values `TRUE` and `FALSE` (exact uppercase). **Blank by default.** Do NOT use checkboxes — they pre-populate as FALSE when Pabbly creates a row, which is indistinguishable from "explicitly marked FALSE". A blank dropdown stays blank on row creation. |
| Y `showup_time`, AC `qualified_time`, AH `sales_time` | **Date+time** — Format → Number → Date time (`yyyy-mm-dd hh:mm`, IST) |
| AG `contracted_value` | **Plain number** — no thousands separator, no currency symbol (e.g. `60000`) |
| Z, AA, AD, AE, AI, AJ | Leave default — Apps Script writes these |

The auto-fill columns A–W are written by Pabbly; leave their formats as plain text/number.

---

## Deployment (first-time setup, ~10 minutes)

### 1. Open the Sheet's Apps Script editor
Ketan BizLife CRM Sheet → **Extensions** → **Apps Script**.

### 2. Paste in `Code.gs`
- Select all in the default `Code.gs` → delete.
- Paste the entire contents of [`Code.gs`](./Code.gs).
- Save (Cmd/Ctrl+S). Rename the file to `Code` if needed.

### 3. Replace the manifest
- Gear icon (Project Settings) → check **"Show 'appsscript.json' manifest file in editor"**.
- Back to the Editor → open `appsscript.json` → replace its contents with
  [`appsscript.json`](./appsscript.json) → Save.

### 4. Add Script Properties (where secrets live)
Project Settings (gear) → **Script Properties** → **Add script property**:

| Property name | Value | Notes |
|---|---|---|
| `META_PIXEL_ID` | `1500971928372824` | The Ketan BizLife pixel (TGO Export pixel). Must match the backend's `META_PIXEL_ID`. |
| `META_CAPI_ACCESS_TOKEN` | `<your token>` | Same value the Vercel backend uses. **Treat as a secret** — anyone with edit access to this Apps Script can read it. |
| `EVENT_SOURCE_URL_DEFAULT` | `https://export.ketanbizlife.in/checkout` | Fallback when a row's `event_source_url` is empty |

Optional overrides:

| Property | Default | Use when |
|---|---|---|
| `MAIN_SHEET_NAME` | `Sheet1` | You renamed the main tab |
| `META_GRAPH_API_VERSION` | `v25.0` | You want to pin a different Graph API version |

Click **Save script properties**.

### 5. Install the onEdit trigger
- Editor → function dropdown → select `setupTriggers` → **Run**.
- Authorize on first run: Review permissions → choose the Sheet's owner account →
  "Google hasn't verified this app" → Advanced → Go to (project) (unsafe) → approve:
  - See/edit/create/delete only the **current** spreadsheet
  - Connect to an external service (UrlFetchApp → posting to Meta)
  - Manage your script's triggers
- Expect the log: `setupTriggers OK — removed 0 old, installed 1 new onSheetEdit trigger`
  and a toast in the Sheet.

### 6. Smoke test against Meta Test Events
- Meta Events Manager → dataset `TGO Export pixel` (ID `1500971928372824`) →
  **Test Events** tab → copy the Test Event Code.
- Drive a dummy row (see "Dummy row" below), or use a real row:
  1. Fill `showup_time` (Y) → set `attended` (X) dropdown to `TRUE`. Expect
     `LeadShowUp` in Test Events within 5–10s; cols Z + AA populate.
  2. Fill `qualified_time` (AC) → set `qualified` (AB) to `TRUE`. Expect
     `QualifiedLead`; cols AD + AE populate.
  3. Fill `contracted_value` (AG) with e.g. `60000` and `sales_time` (AH),
     then set `sale_closed` (AF) to `TRUE`. Expect `HighTicketPurchase` with
     `value: 60000, currency: INR`; cols AI + AJ populate.
- Each event should arrive with EMQ 8–9+ (all identifier columns populated).

---

## How it works internally

```
Team sets `attended` = TRUE on row 47
  → Google fires installable onEdit trigger → onSheetEdit(e)
  → identifies col X = attended → looks up EVENTS.LEAD_SHOWUP
  → confirms e.value is TRUE and leadshowup_capi_sent (AA) is blank
  → fireDownstreamEvent(sheet, 47, EVENTS.LEAD_SHOWUP)
      • reads entire 36-cell row
      • event_id = `${lead_id}_showup`  (deterministic)
      • event_time = showup_time (Y) → Unix seconds, else now
      • user_data = SHA-256 hashes of em/ph/fn/ln/ct/country + external_id
                    + raw fbc/fbp/client_ip_address/client_user_agent
      • custom_data = payment_id + UTM context
      • POST graph.facebook.com/v25.0/{PIXEL_ID}/events
      • retries up to 3× on 429/5xx (1s/2s/4s backoff)
  → on 200: sets Z = `${lead_id}_showup`, AA = TRUE
  → on non-200: appends to _Errors tab, leaves AA blank (retry-able)
```

### Deduplication
- **Sheet-side**: the `*_capi_sent` flag is checked before firing; if TRUE, skip.
- **Meta-side**: `event_id` is deterministic (`{lead_id}_{suffix}`). Meta dedupes
  same `event_name` + `event_id` within 48h, so retries don't double-count.
- **Cross-event**: each event has a distinct `event_name`, so they never dedupe
  against each other or against the tripwire `Purchase`/`sales`.

### Why event_id is deterministic
Idempotent retries, easy row-level audit, and no state to persist. The trade-off
(can't fire the same event twice for one lead within 48h) is the desired behavior
here — a lead attends one webinar, qualifies once, and buys once.

---

## Operations & troubleshooting

- **Logs**: Apps Script editor → **Executions** tab (success + failures); failures
  also land in the `_Errors` tab.
- **Dropdown set TRUE but no event fired**: check (1) trigger installed (Triggers
  tab shows one `onSheetEdit`), (2) the execution ran (Executions tab), (3) it
  didn't exit early (`already sent, skipping`), (4) `_Errors` for a non-200.
  If Pabbly's "Add Row" wrote TRUE programmatically, installable onEdit may not
  fire — set the dropdown back to blank then to TRUE again by hand.
- **Low EMQ (5–6 instead of 9+)**: an identifier column is blank for that row.
  Confirm `fbc`, `fbp`, `client_ip_address`, `client_user_agent`, `external_id`,
  `email`, `phone` are populated — if blank, it's a Pabbly mapping gap.
- **Force a re-fire**: clear the row's `*_capi_sent` flag (AA/AE/AJ), set the
  trigger dropdown back to blank then TRUE. (Meta dedupes within 48h via event_id.)
- **Bulk replay** (e.g. after a Meta outage): Editor → function dropdown →
  `replayPendingEvents` → Run. Self-paces at 500ms/event.
- **Rotate token**: update `META_CAPI_ACCESS_TOKEN` in Script Properties. No redeploy.

---

## Dummy row for smoke testing

Paste into row 2 (adjust the datetimes to recent IST values). The `external_id`
below is `sha256('capitest@example.com')` — pre-computed so you can sanity-check
the script's hash matches.

| Col | Field | Value |
|---|---|---|
| A | `lead_id` | `5662999001` |
| B | `created_at` | `2026-05-26T20:31:44+05:30` |
| C | `first_name` | `CAPI` |
| D | `last_name` | `TestLead` |
| E | `email` | `capitest@example.com` |
| F | `phone` | `+919876543210` |
| G | `city` | `Mumbai` |
| H | `country_code` | `IN` |
| I | `fbc` | `fb.1.1716817200000.IwAR1testClickId123abcXYZ` |
| J | `fbp` | `fb.1.1716817200000.987654321` |
| K | `client_ip_address` | `49.207.123.45` |
| L | `client_user_agent` | `Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1` |
| M | `external_id` | `c0aacc1d313bad6f39167195e61182636bbab7ab6212078cb8faf69c74030723` |
| N | `event_source_url` | `https://export.ketanbizlife.in/checkout` |
| O | `amount` | `99` |
| P | `is_test` | `false` |
| Q | `purchase_event_id` | `5662999001` |
| R | `utm_source` | `facebook` |
| S | `utm_medium` | `cpc` |
| T | `utm_campaign` | `export-buyers-may26` |
| U | `utm_content` | `carousel-v3` |
| V | `utm_term` | `export-buyers` |
| W | `fbclid` | `IwAR1testClickId123abcXYZ` |
| X – AJ | | leave blank (team / script fills these) |

Smoke sequence:
1. Set X `attended` → `TRUE`. Expect `LeadShowUp`; Z = `5662999001_showup`, AA = `TRUE`.
2. Fill AC `qualified_time`, set AB `qualified` → `TRUE`. Expect `QualifiedLead`; AD + AE populate.
3. Fill AG `contracted_value` = `60000` and AH `sales_time`, set AF `sale_closed` → `TRUE`.
   Expect `HighTicketPurchase` with `value: 60000`; AI + AJ populate.

If any step fails, check the `_Errors` tab + Executions log.

---

## Known limitations

- `onEdit` triggers don't fire on edits made by **other** Apps Scripts (n/a here — one script).
- Apps Script execution limit: 6 min (simple) / 30 min (installable). A single
  CAPI fire is sub-second; only `replayPendingEvents` over hundreds of rows could approach it.
- `UrlFetchApp` quota: 20,000 calls/day (consumer) / 100,000/day (Workspace) — far above this funnel's volume.
- Script Properties are readable by all editors of the Apps Script project —
  restrict editor access to dev/ops; give the sales team viewer + commenter on the Sheet only.
