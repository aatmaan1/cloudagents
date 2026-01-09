import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "@modelcontextprotocol/sdk/shared/zod.js";

import fs from "node:fs";
import {
  computeWindow,
  defaultPaths,
  loadEvents,
  loadProperties,
  summarize,
  toMarkdown,
} from "./summary.js";

const PropertiesSummaryInput = z
  .object({
    months: z.number().int().positive().max(60).default(6),
    asOfDate: z.string().optional(),
    propertiesPath: z.string().optional(),
    eventsPath: z.string().optional(),
  })
  .default({});

async function run() {
  const server = new Server(
    { name: "property-mcp", version: "0.1.0" },
    { capabilities: { tools: {}, resources: {} } }
  );

  server.registerTool(
    "properties_summary_last_months",
    {
      title: "Properties summary (last N months)",
      description:
        "Summarize all properties over the last N months (revenue, expenses, net, issue counts) from local JSON/JSONL datasets.",
      inputSchema: PropertiesSummaryInput,
    },
    async (input) => {
      const { months, asOfDate, propertiesPath, eventsPath } = PropertiesSummaryInput.parse(input);
      const defaults = defaultPaths();
      const pPath = propertiesPath ?? defaults.propertiesPath;
      const ePath = eventsPath ?? defaults.eventsPath;

      if (!fs.existsSync(pPath)) {
        return {
          content: [
            {
              type: "text",
              text: `Missing properties file at ${pPath}. Set PROPERTY_MCP_PROPERTIES_PATH or pass propertiesPath.`,
            },
          ],
        };
      }
      if (!fs.existsSync(ePath)) {
        return {
          content: [
            {
              type: "text",
              text: `Missing events file at ${ePath}. Set PROPERTY_MCP_EVENTS_PATH or pass eventsPath.`,
            },
          ],
        };
      }

      let fromInclusive;
      let toExclusive;
      try {
        ({ fromInclusive, toExclusive } = computeWindow({ months, asOfDate }));
      } catch (e) {
        return {
          content: [{ type: "text", text: e?.message ?? "Invalid input" }],
        };
      }

      const propertiesById = loadProperties(pPath);
      const events = await loadEvents(ePath);
      const summary = summarize({ propertiesById, events, fromInclusive, toExclusive });

      return {
        content: [
          { type: "text", text: toMarkdown(summary, { months }) },
          { type: "text", text: JSON.stringify(summary, null, 2) },
        ],
      };
    }
  );

  server.registerResource(
    "properties://summary/last-6-months",
    {
      name: "Properties summary (last 6 months)",
      description:
        "Markdown summary of all properties over the last 6 months (from local JSON/JSONL datasets).",
      mimeType: "text/markdown",
    },
    async () => {
      const { propertiesPath, eventsPath } = defaultPaths();
      if (!fs.existsSync(propertiesPath) || !fs.existsSync(eventsPath)) {
        return {
          contents: [
            {
              uri: "properties://summary/last-6-months",
              mimeType: "text/markdown",
              text: `Missing dataset. Expected:\n- ${propertiesPath}\n- ${eventsPath}\n`,
            },
          ],
        };
      }

      const { fromInclusive, toExclusive } = computeWindow({ months: 6 });
      const propertiesById = loadProperties(propertiesPath);
      const events = await loadEvents(eventsPath);
      const summary = summarize({ propertiesById, events, fromInclusive, toExclusive });
      return {
        contents: [
          {
            uri: "properties://summary/last-6-months",
            mimeType: "text/markdown",
            text: toMarkdown(summary, { months: 6 }),
          },
        ],
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

