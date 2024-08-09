import { ClientEvent } from "../../types";

export const Event: ClientEvent = {
  name: "debug",
  run: (info, client): void => {
    // console.log(chalk.dim(String(info)));
  },
};
