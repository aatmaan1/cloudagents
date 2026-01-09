import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

function parseISODate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function monthStart(date) {
  const d = new Date(date);
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

function safeLower(s) {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
}

function formatMoney(amount) {
  const n = typeof amount === "number" ? amount : 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function defaultPaths() {
  const root = process.cwd();
  return {
    propertiesPath:
      process.env.PROPERTY_MCP_PROPERTIES_PATH ??
      path.join(root, "data", "properties.json"),
    eventsPath:
      process.env.PROPERTY_MCP_EVENTS_PATH ??
      path.join(root, "data", "events.jsonl"),
  };
}

export function loadProperties(propertiesPath) {
  const raw = fs.readFileSync(propertiesPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("properties.json must be a JSON array");
  }
  const byId = new Map();
  for (const p of parsed) {
    if (!p || typeof p !== "object") continue;
    if (typeof p.id !== "string" || p.id.trim() === "") continue;
    byId.set(p.id, {
      id: p.id,
      name: typeof p.name === "string" && p.name.trim() ? p.name.trim() : p.id,
    });
  }
  return byId;
}

export async function loadEvents(eventsPath) {
  const events = [];
  const fileStream = fs.createReadStream(eventsPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const evt = JSON.parse(trimmed);
      events.push(evt);
    } catch {
      // Skip malformed line.
    }
  }
  return events;
}

export function computeWindow({ months, asOfDate }) {
  const asOf = asOfDate ? parseISODate(asOfDate) : new Date();
  if (!asOf) throw new Error(`Invalid asOfDate: ${asOfDate}`);
  const toExclusive = monthStart(addMonths(asOf, 1));
  const fromInclusive = monthStart(addMonths(toExclusive, -months));
  return { fromInclusive, toExclusive };
}

export function summarize({ propertiesById, events, fromInclusive, toExclusive }) {
  const perProperty = new Map();

  // Ensure "all properties" are present even with no activity.
  for (const [id, meta] of propertiesById.entries()) {
    perProperty.set(id, {
      propertyId: meta.id,
      propertyName: meta.name,
      revenue: 0,
      expenses: 0,
      issueCount: 0,
      openIssueCount: 0,
      issueCategories: new Map(),
      hasActivity: false,
    });
  }

  const ensure = (propertyId) => {
    if (!perProperty.has(propertyId)) {
      perProperty.set(propertyId, {
        propertyId,
        propertyName: propertiesById.get(propertyId)?.name ?? propertyId,
        revenue: 0,
        expenses: 0,
        issueCount: 0,
        openIssueCount: 0,
        issueCategories: new Map(),
        hasActivity: false,
      });
    }
    return perProperty.get(propertyId);
  };

  let portfolioRevenue = 0;
  let portfolioExpenses = 0;
  let portfolioIssues = 0;
  let portfolioOpenIssues = 0;

  for (const e of events) {
    if (!e || typeof e !== "object") continue;
    const occurredAt = parseISODate(e.occurredAt ?? e.date ?? e.timestamp);
    if (!occurredAt) continue;
    if (occurredAt < fromInclusive || occurredAt >= toExclusive) continue;

    const propertyId = typeof e.propertyId === "string" ? e.propertyId : null;
    if (!propertyId) continue;
    const row = ensure(propertyId);
    row.hasActivity = true;

    const type = safeLower(e.type);
    if (type === "revenue") {
      const amount = typeof e.amount === "number" ? e.amount : 0;
      row.revenue += amount;
      portfolioRevenue += amount;
    } else if (type === "expense") {
      const amount = typeof e.amount === "number" ? e.amount : 0;
      row.expenses += amount;
      portfolioExpenses += amount;
    } else if (type === "issue") {
      row.issueCount += 1;
      portfolioIssues += 1;
      const status = safeLower(e.status);
      if (status === "open") {
        row.openIssueCount += 1;
        portfolioOpenIssues += 1;
      }
      const category = safeLower(e.category) || "uncategorized";
      row.issueCategories.set(category, (row.issueCategories.get(category) ?? 0) + 1);
    }
  }

  const propertySummaries = Array.from(perProperty.values())
    .map((p) => {
      const topIssues = Array.from(p.issueCategories.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));

      const net = p.revenue - p.expenses;
      return {
        propertyId: p.propertyId,
        propertyName: p.propertyName,
        revenue: p.revenue,
        expenses: p.expenses,
        net,
        issueCount: p.issueCount,
        openIssueCount: p.openIssueCount,
        topIssueCategories: topIssues,
        hasActivity: p.hasActivity,
      };
    })
    .sort((a, b) => b.net - a.net);

  const portfolioNet = portfolioRevenue - portfolioExpenses;
  const propertiesWithActivity = propertySummaries.filter((p) => p.hasActivity).length;

  return {
    window: {
      fromInclusive: fromInclusive.toISOString(),
      toExclusive: toExclusive.toISOString(),
    },
    portfolio: {
      propertyCount: perProperty.size,
      propertiesWithActivity,
      revenue: portfolioRevenue,
      expenses: portfolioExpenses,
      net: portfolioNet,
      issueCount: portfolioIssues,
      openIssueCount: portfolioOpenIssues,
    },
    properties: propertySummaries,
  };
}

export function toMarkdown(summary, { months }) {
  const { portfolio, window, properties } = summary;
  const lines = [];
  lines.push(`## Portfolio summary (last ${months} months)`);
  lines.push(``);
  lines.push(`- Window: **${window.fromInclusive}** to **${window.toExclusive}** (UTC)`);
  lines.push(`- Properties: **${portfolio.propertyCount}** (active: **${portfolio.propertiesWithActivity}**)`);
  lines.push(
    `- Financials: revenue **${formatMoney(portfolio.revenue)}**, expenses **${formatMoney(
      portfolio.expenses
    )}**, net **${formatMoney(portfolio.net)}**`
  );
  lines.push(
    `- Issues: **${portfolio.issueCount}** total (**${portfolio.openIssueCount}** open)`
  );
  lines.push(``);
  lines.push(`## Per-property (sorted by net)`);
  lines.push(``);
  for (const p of properties) {
    const topIssues = (p.topIssueCategories ?? [])
      .map((x) => `${x.category} (${x.count})`)
      .join(", ");
    lines.push(
      `- **${p.propertyName}** (${p.propertyId}): net ${formatMoney(p.net)} (rev ${formatMoney(
        p.revenue
      )}, exp ${formatMoney(p.expenses)}), issues ${p.issueCount} (${p.openIssueCount} open)${
        topIssues ? `; top: ${topIssues}` : ""
      }${p.hasActivity ? "" : " — no activity in window"}`
    );
  }
  return lines.join("\n");
}

