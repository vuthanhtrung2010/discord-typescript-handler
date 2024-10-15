import chalk from "chalk";
import { readdirSync } from "fs";
import { calcProcessDurationTime } from "./functions";
import { ExtendedClient } from "../types";

const events_map = new Map<string, any>();

const loadEvent = async (
  client: ExtendedClient,
  dir: string,
  file: string,
): Promise<void> => {
  try {
    const pull = (await import(`../events/${dir}/${file}`)).Event;
    if (!pull) {
      return;
    }
    if (pull.name) {
      events_map.set(pull.name, pull); // Set event into cache
      client.on(pull.name, (...args: any[]) => pull.run(...args, client));
    } else {
      //console.log(`    | ${file} :: error -> missing a name property or it's not a string.`)
      return;
    }
  } catch (e) {
    client.sentry?.captureException(e);
    console.log(chalk.grey.bgRed((e as Error).stack));
  }
};

export const EventsManager = async (client: ExtendedClient): Promise<void> => {
  console.log(
    `${chalk.magenta("[x] :: ")}${chalk.greenBright("Now loading the Events ...")}`,
  );
  const beforeTime = process.hrtime();

  try {
    // Read event directories
    for (const dir of readdirSync("./src/events/")) {
      const events = readdirSync(`./src/events/${dir}/`).filter((file) =>
        file.endsWith(".ts"),
      );

      for (const file of events) {
        await loadEvent(client, dir, file);
      }
    }
  } catch (e) {
    client.sentry?.captureException(e);
    console.log(chalk.grey.bgRed((e as Error).stack));
  }

  const duration = process.hrtime(beforeTime);
  console.log(
    chalk.magenta(`[x] :: `) +
      chalk.greenBright(`LOADED THE ${events_map.size} EVENTS after: `) +
      chalk.green(`${calcProcessDurationTime(beforeTime, false)}ms`),
  );
};
