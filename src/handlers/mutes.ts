import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";
import { ExtendedClient } from "../types";
import { ServerNavigationButton } from "./functions";

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
export type MuteDataType = ThenArg<ReturnType<typeof getMuteData>>;

export const MuteHandler = async (client: ExtendedClient) => {
  setInterval(async () => {
    let data: MuteDataType;
    if (client.caches?.has("MuteData")) {
      data = client.caches.get("MuteData");
    } else {
      data = await getMuteData(client);
      client.caches?.set("MuteData", data);
    }

    await Unmute(client, data);
  }, 1000);

  await Mute(client);
};

async function Mute(client: ExtendedClient) {
  client.on("guildMemberAdd", async (member) => {
    const muteCheck = await client.database?.mutes.findUnique({
      where: {
        userID_guildID: {
          userID: member.id,
          guildID: member.guild.id,
        },
      },
    });

    if (muteCheck) {
      member.roles.add(muteCheck.roleID, "Member rejoins on mute");
    }
  });
}

async function Unmute(client: ExtendedClient, data: MuteDataType) {
  if (!data) return;

  for (const user of data) {
    if (!user.muteTime) continue;
    const unmuteTime = new Date(user.muteTime).getTime();
    if (Date.now() >= unmuteTime) {
      try {
        const guild = await client.guilds.fetch(user.guildID);
        const MutedMember = await guild.members.fetch(user.userID);
        if (MutedMember && MutedMember.roles.cache.has(user.roleID)) {
          MutedMember.roles
            .remove(user.roleID, "Mute duration expired")
            .then(async () => {
              MutedMember.send({
                embeds: [
                  new EmbedBuilder().setColor("Green").addFields({
                    name: "You got unmuted",
                    value: `>>> **Reason:** Mute duration expired\n**Responsible:** <@${client.user?.id}> (${client.user?.id})`,
                  }),
                ],
                components: [
                  ServerNavigationButton(
                    guild,
                  ) as ActionRowBuilder<ButtonBuilder>,
                ],
              }).catch((e: Error) => {
                console.error(e);
                client.sentry?.captureException(e);
              });

              // Remove the mute from the database
              await client.database?.mutes.delete({
                where: {
                  userID_guildID: {
                    userID: user.userID,
                    guildID: user.guildID,
                  },
                },
              });

              const data = await client.database?.mutes.findMany();
              client.caches?.set("MuteData", data);
            });
        }
      } catch (error) {
        console.error(
          `Failed to unmute user ${user.userID} in guild ${user.guildID}:`,
          error,
        );
      }
    }
  }
}

async function getMuteData(client: ExtendedClient) {
  return await client.database?.mutes.findMany();
}
