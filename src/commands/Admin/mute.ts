import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import { MessageCommand } from "../../types";
import ms from "ms";
import { ServerNavigationButton, duration } from "../../handlers/functions";

export const Command: MessageCommand = {
  name: "mute",
  category: "Admin",
  usage: "mute <user> [duration] [reason]",
  cooldown: 10,
  memberpermissions: [PermissionsBitField.Flags.ModerateMembers],
  description: "Mute a user in the server",
  run: async (client, message, args, guild_settings): Promise<any> => {
    const ls = guild_settings?.language as string;

    if (!args[0]) {
      return message.reply(
        "Please mention a user or provide their user ID to mute.",
      );
    }

    const userID =
      message.mentions.users.first()?.id || args[0].replace(/[<@!>]/g, "");

    try {
      const botMember = await message.guild?.members.fetch(
        client.user?.id as string,
      );
      if (
        !botMember?.permissions.has(PermissionsBitField.Flags.ModerateMembers)
      ) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("Error")
              .setDescription(
                "I am missing the Moderate Members permission. Please grant it to me.",
              ),
          ],
        });
      }

      const target = await message.guild?.members.fetch(userID);
      if (!target) {
        return message.reply(
          `The user <@${userID}> does not exist in this server.`,
        );
      }

      const memberPosition = target.roles.highest.rawPosition;
      const moderationPosition = message.member?.roles?.highest.rawPosition;

      if (
        message.guild?.ownerId !== message.author.id &&
        (moderationPosition ?? 0) <= memberPosition
      ) {
        return message
          .reply({
            embeds: [
              new EmbedBuilder()
                .setColor("#e01e01")
                .setTitle(
                  "You cannot mute a member with a role higher than or equal to yours.",
                ),
            ],
          })
          .catch(() => null);
      }

      if (!target.manageable) {
        return message
          .reply({
            embeds: [
              new EmbedBuilder()
                .setColor("#e01e01")
                .setTitle(
                  "I cannot mute this user. Their role is higher than or equal to mine.",
                ),
            ],
          })
          .catch(() => null);
      }

      const muteRoleID = guild_settings?.moderation[0]?.muterole;
      if (!muteRoleID) {
        return message.reply(
          `Please set up a mute role using ${guild_settings?.prefix}muterole <role> command!`,
        );
      }

      const muteRole = message.guild?.roles.cache.get(muteRoleID);
      if (!muteRole) {
        return message.reply(
          `The mute role set in the server settings does not exist. Please update the mute role using ${guild_settings?.prefix}muterole <role> command.`,
        );
      }

      const time = ms(args[1] ? args[1] : "none");
      let reason: string;

      if (!time) {
        reason = args[1] ? args.slice(1).join(" ") : "No reason provided";
      } else {
        reason = args[2] ? args.slice(2).join(" ") : "No reason provided";
      }

      await target.roles.add(
        muteRole,
        `Muted by ${message.author.id} with reason ${reason}`,
      );

      const avatarURL = target.avatarURL({ size: 1024 }) as string;

      await target
        .send({
          embeds: [
            new EmbedBuilder().setColor("Red").addFields({
              name: "You got muted",
              value: `>>> **Reason:** ${reason}\n**Duration:** ${time ? duration(time) : "Permanent"}\n**Responsible:** <@${message.author.id}> (${message.author.id})`,
            }),
          ],
          components: [
            ServerNavigationButton(
              message.guild,
            ) as ActionRowBuilder<ButtonBuilder>,
          ],
        })
        .catch((e) => {
          console.error(e);
        });

      if (!time && target.roles.cache.has(muteRoleID)) {
        return message.reply("User is already muted.");
      } else if (time) {
        await client.database?.mutes.upsert({
          where: {
            userID_guildID: {
              userID: userID,
              guildID: message.guildId as string,
            },
          },
          update: {
            muteTime: new Date(Date.now() + time),
          },
          create: {
            userID: userID,
            guildID: message.guildId as string,
            muteTime: new Date(Date.now() + time),
            roleID: guild_settings.moderation[0].muterole,
          },
        });
      } else {
        await client.database?.mutes.create({
          data: {
            userID: userID,
            guildID: message.guildId as string,
            roleID: guild_settings.moderation[0].muterole,
          },
        });
      }

      const data = await client.database?.mutes.findMany();
      client.caches?.set("MuteData", data);

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setTitle("Success")
            .setAuthor({ name: target.user.username, iconURL: avatarURL })
            .setDescription(
              `Successfully muted <@${userID}> for the following reason: ${reason} for ${duration(time)}.`,
            ),
        ],
      });
    } catch (error) {
      console.error(`Error muting user: ${error}`);
      return message.reply(
        `There was an error trying to mute the user: ${error}`,
      );
    }
  },
};
