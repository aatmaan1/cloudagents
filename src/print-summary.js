import fs from "node:fs";
import {
  computeWindow,
  defaultPaths,
  loadEvents,
  loadProperties,
  summarize,
  toMarkdown,
} from "./summary.js";

async function main() {
  const months = 6;
  const { propertiesPath, eventsPath } = defaultPaths();

  if (!fs.existsSync(propertiesPath)) {
    // eslint-disable-next-line no-console
    console.error(
      `Missing properties file at ${propertiesPath}. Set PROPERTY_MCP_PROPERTIES_PATH to override.`
    );
    process.exitCode = 2;
    return;
  }
  if (!fs.existsSync(eventsPath)) {
    // eslint-disable-next-line no-console
    console.error(
      `Missing events file at ${eventsPath}. Set PROPERTY_MCP_EVENTS_PATH to override.`
    );
    process.exitCode = 2;
    return;
  }

  const propertiesById = loadProperties(propertiesPath);
  const events = await loadEvents(eventsPath);
  const { fromInclusive, toExclusive } = computeWindow({ months });
  const summary = summarize({ propertiesById, events, fromInclusive, toExclusive });
  // eslint-disable-next-line no-console
  console.log(toMarkdown(summary, { months }));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

