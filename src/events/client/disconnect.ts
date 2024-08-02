import chalk from "chalk";
import { ClientEvent } from "../../types";

export const Event: ClientEvent = {
  name: "disconnect",
  run: (client): void => {
    console.log(chalk.dim(`You have been disconnected at ${new Date()}.`));
  },
};
