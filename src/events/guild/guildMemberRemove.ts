import { GuildMember } from "discord.js";
import { ClientEvent, ExtendedClient } from "../../types";

export const Event: ClientEvent = {
  name: "guildMemberRemove",
  run: async (member: GuildMember, client: ExtendedClient): Promise<void> => {
    // Holding it here
  },
};
