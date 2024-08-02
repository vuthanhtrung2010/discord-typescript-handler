import chalk from "chalk";
import { ClientEvent } from "../../types";

export const Event: ClientEvent = {
  name: "ratelimit",
  run: (rateLimitData, client): void => {
    console.log(chalk.grey(JSON.stringify(rateLimitData)));
  },
};
