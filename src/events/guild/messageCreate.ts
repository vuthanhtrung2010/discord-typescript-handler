import {
  Message,
  EmbedBuilder,
  Channel,
  ChannelType,
  Collection,
} from "discord.js";
import { ClientEvent, guild_data } from "../../types";
import {
  escapeRegex,
  calcProcessDurationTime,
  checkGuild,
  handlemsg,
  addStats,
  CheckDisabled,
  AddMessageCount,
} from "../../handlers/functions";
import chalk from "chalk";
import { ExtendedClient } from "../../types";

const emoji = await import(`../../config/emojis.json`); // Do not delete this

export const Event: ClientEvent = {
  name: "messageCreate",
  run: async (message: Message, client: ExtendedClient): Promise<any> => {
    const beforeTime = process.hrtime();

    if (message.author.id === "1139406664584409159") {
      console.log(
        chalk.magenta(`[x] :: `) + chalk.redBright(`Received Message`),
      );
    }

    if (message.author.bot) return;

    let guild_settings: guild_data | undefined;

    if (client.caches?.has(`${message.guildId}_settings`)) {
      guild_settings = client.caches.get(`${message.guildId}_settings`);
    } else {
      try {
        guild_settings = await checkGuild(client, message.guildId as string);
      } catch (e) {
        client.sentry?.captureException(e);
        console.log(chalk.red((e as Error).stack));
      }
      client.caches?.set(`${message.guildId}_settings`, guild_settings);
    }

    if (!guild_settings) return;

    if (message.author.id === "1139406664584409159") {
      console.log(
        chalk.redBright(
          `[${calcProcessDurationTime(beforeTime, false)}ms] Settings received`,
        ),
      );
    }

    // Events
    await AddMessageCount(client, message.author.id, message.guildId as string);

    const { prefix, language } = guild_settings;

    const prefixRegex = new RegExp(
      `^(<@!?${client.user?.id}>|${escapeRegex(prefix)})\\s*`,
    );

    let not_allowed = false;
    let matchedPrefix: string | undefined;
    let args: string[];
    let cmd: string | undefined;
    let command;
    const ls = language;

    // If message content doesn't match prefixRegex, return
    if (!prefixRegex.test(message.content)) return;

    matchedPrefix = message.content.match(prefixRegex)?.[0];

    if (!matchedPrefix) return;

    args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    cmd = args.shift()?.toLowerCase();

    if (!cmd) {
      if (matchedPrefix.includes(client.user?.id as string)) {
        return message
          .reply({
            embeds: [
              new EmbedBuilder()
                .setColor("Green")
                .setTitle(`Send ${prefix}help to get help`),
            ],
          })
          .catch(console.error);
      }
      return;
    }

    command =
      client.commands?.get(cmd) ||
      client.commands?.get(client.aliases?.get(cmd) as string);

    if (message.author.id === "1139406664584409159") {
      console.log(
        `${chalk.redBright(
          `[${calcProcessDurationTime(beforeTime, false)}ms] `,
        )}${chalk.dim(`Found the Command ${command?.name} :: ${message.guild?.name}`)}`,
      );
    }

    if (!command) {
      return;
    }

    if (!client.cooldowns?.has(command?.name as string)) {
      // if it's not in the cooldown, set it there
      client.cooldowns?.set(
        command?.name as string,
        new Collection<string, number>(),
      );
    }

    const now = Date.now(); // get the current time
    const timestamps = client.cooldowns?.get(command?.name as string); // get the timestamp of the last used commands
    const cooldownAmount = (command?.cooldown || 1) * 1000; // get the cooldown amount of the command, if there is no cooldown there will be automatically 1 sec cooldown, so you cannot spam it^^
    if (timestamps?.has(message.author.id)) {
      // if the user is on cooldown
      const expirationTime =
        (timestamps?.get(message.author.id) as number) + cooldownAmount; // get the amount of time that user needs to wait until they can run cmd again
      if (now < expirationTime) {
        const timeLeftInMilliseconds = expirationTime - now;
        const formattedTimeLeft = `<t:${Math.floor(now / 1000) + Math.floor(timeLeftInMilliseconds / 1000)}:R>`;
        not_allowed = true;
        return message
          .reply({
            embeds: [
              new EmbedBuilder()
                .setColor("#e01e01")
                .setAuthor({
                  name: message.member?.user.tag as string,
                  iconURL:
                    message.member?.user.displayAvatarURL({ size: 1024 })
                    || message.member?.user.defaultAvatarURL,
                  url: "https://links.trung.is-a.dev",
                })
                .setDescription(
                  handlemsg(client.la?.[ls].common.cooldown, {
                    time: formattedTimeLeft,
                    commandname: command?.name as string,
                  }),
                ),
            ],
          })
          .catch(console.error);
      }
    }

    const owner_settings_cooldown_bypass = false;
    if (
      message.author.id == "1139406664584409159" &&
      owner_settings_cooldown_bypass
    ) {
      // Bypass cooldown
    } else {
      timestamps?.set(message.author.id, now);
      setTimeout(() => timestamps?.delete(message.author.id), cooldownAmount);
    }

    try {
      await addStats(client, message.guildId as string, 1, 0); // Add the stats to the db

      //if Command has specific permission return error
      if (command?.memberpermissions) {
        if (!message.member?.permissions?.has(command?.memberpermissions)) {
          not_allowed = true;
          try {
            message.react("948483017993769041").catch(() => { });
          } catch { }
          return message
            .reply({
              embeds: [
                new EmbedBuilder()
                  .setColor("#0000ff")
                  .setTitle(client.la?.[ls].common.permissions.title)
                  .setDescription(
                    `${client.la?.[ls].common.permissions.description
                    }\n> \`${command?.memberpermissions.join("`, ``")}\``,
                  ),
              ],
            })
            .then(async (msg) => {
              setTimeout(() => {
                try {
                  msg.delete().catch(console.error);
                } catch { }
              }, 5000);
            })
            .catch(console.error);
        }
      }

      if (!CheckDisabled(guild_settings, command.category))
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setTitle(client.la?.[ls].common.disabled.title)
              .setDescription(
                handlemsg(client.la?.[ls].common.disabled.description, {
                  prefix: prefix,
                }),
              ),
          ],
        });

      const owner_ids = ["1139406664584409159", "920850442425102367"];
      if (
        command?.category === "Owner" &&
        !owner_ids.includes(message.author.id)
      ) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setTitle("Missing permission")
              .setDescription(
                `You need to be one of those guys: ${owner_ids.map((id) => `<@${id}>`).join(", ")}`,
              ),
          ],
        });
      } else if (command?.category === "Admin") {
        if (guild_settings.logsChannel) {
          const guildLogChannel = (await client.channels.fetch(
            guild_settings.logsChannel,
          )) as Channel;
          if (
            guildLogChannel &&
            guildLogChannel.type == ChannelType.GuildText
          ) {
            guildLogChannel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor("Green")
                  .setAuthor({
                    name: `${command?.name} | ${message.author.username}`,
                  })
                  .addFields(
                    {
                      name: `**Executed in:**`,
                      value: `<#${message.channel.id}>`,
                    },
                    {
                      name: `**Executed command:**`,
                      value: `${command?.name}`,
                    },
                    {
                      name: `**Executed on:**`,
                      value: `<@${message.mentions.users.first()?.id || args[0]}>`,
                    },
                    {
                      name: `**Reason**`,
                      value: `${args[1] || "No reason provided"}`,
                    },
                  ),
              ],
            });
          }
        }
      }

      command?.run(client, message, args, guild_settings);

      if (message.author.id === "1139406664584409159") {
        console.log(
          `${chalk.redBright(`[${calcProcessDurationTime(beforeTime, false)}ms] `)}${chalk.dim(`Execute the Command ${command?.name} :: ${message.guild?.name}`)}`,
        );
      }
    } catch (error) {
      console.error(error);
    }
  },
};
