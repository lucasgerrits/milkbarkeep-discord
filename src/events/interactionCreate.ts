import { Channel, CommandInteractionOptionResolver, Events, Guild, Interaction, TextChannel } from "discord.js";
import { Event } from "../core/Event";
import { Logger } from "../core/Logger";
import { client } from "..";
import type { ExtendedInteraction } from "../types/CommandTypes";

export default new Event(
    Events.InteractionCreate,
    async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const commandName: string = interaction.commandName;
        const guildId: string = interaction.guildId as string;
        const guild: Guild = await client.guilds.fetch(guildId).catch(() => null) as Guild;
        const guildName: string = guild.name;

        const log = (str: string) => {
            Logger.cmd(`${guildName} - ${str}`);
        }

        const command = client.commands.get(commandName);
        if (!command) {
            log(`No command matching ${commandName} was found.`);
            return;
        }

        if (commandName === "anon") {
            log(`/anon ran.`);
        } else {
            const channel: Channel = interaction.channel as TextChannel;
            log(`${interaction.user.tag} ran /${commandName} in #${channel.name}.`);
        }

        try {
            await command.run({
                options: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction as ExtendedInteraction
            });
        } catch (error: any) {
            log(`Error executing ${commandName}: ${error}`);
        }
    }
);