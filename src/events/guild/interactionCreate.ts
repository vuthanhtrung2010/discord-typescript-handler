import {
  ButtonInteraction,
  CommandInteraction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
} from "discord.js";

import { ClientEvent, ExtendedClient } from "../../types";

export const Event: ClientEvent = {
  name: "interactionCreate",
  run: async (
    interaction:
      | CommandInteraction
      | ButtonInteraction
      | StringSelectMenuInteraction
      | ModalSubmitInteraction,
    client: ExtendedClient,
  ): Promise<void> => {
    
  },
};
