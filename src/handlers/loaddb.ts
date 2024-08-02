import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import { calcProcessDurationTime } from "./functions";
import { ExtendedClient } from "../types";

export const DatabaseManager = async (
  client: ExtendedClient,
): Promise<void> => {
  console.log(
    `${chalk.magenta("[x] :: ")}${chalk.greenBright("Now loading the Database ...")}`,
  );
  const beforeTime = process.hrtime();
  client.database = new PrismaClient();
  console.log(
    chalk.magenta(`[x] :: `) +
      chalk.greenBright(`LOADED THE DATABASE after: `) +
      chalk.green(`${calcProcessDurationTime(beforeTime, false)}ms`),
  );
};
