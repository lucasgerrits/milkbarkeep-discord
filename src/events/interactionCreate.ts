import { Channel, CommandInteractionOptionResolver, Events, Guild, Interaction, TextChannel } from "discord.js";
import { Event } from "../core/Event";
import { Logger } from "../util/Logger";
import { client } from "..";
import type { ExtendedInteraction } from "../types/CommandTypes";

export default new Event(
    Events.InteractionCreate,
    async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const guildId: string = interaction.guildId as string;
        const guild: Guild = await client.guilds.fetch(guildId).catch(() => null) as Guild;
        const guildName: string = guild.name;

        const log = (str: string) => {
            Logger.log(`[CMD] ${guildName} - ${str}`, "red");
        }

        const command = client.commands.get(interaction.commandName);
        if (!command) {
            log(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        let logStr: string = "";
        if (interaction.commandName === "anon") {
            log(`${interaction.guild} /anon ran.`);
        } else {
            const channel: Channel = interaction.channel as TextChannel;
            log(`${interaction.guild}: ${interaction.user.tag} ran /${interaction.commandName} in #${channel.name}.`);
        }

        try {
            await command.run({
                options: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction as ExtendedInteraction
            });
        } catch (error: any) {
            log(`Error executing ${interaction.commandName}: ${error}`);
        }
    }
);