import chalk from "chalk";
import { ClientEvent } from "../../types";

export const Event: ClientEvent = {
  name: "error",
  run: (error, client): void => {
    console.log(chalk.red.dim(String(error)));
  },
};
