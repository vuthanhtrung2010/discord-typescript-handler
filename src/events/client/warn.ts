import chalk from "chalk";
import { ClientEvent } from "../../types";

export const Event: ClientEvent = {
  name: "warn",
  run: (error, client): void => {
    console.log(chalk.yellow.dim(String(error)));
  },
};
