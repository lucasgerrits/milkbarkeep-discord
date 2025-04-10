import { CacheType, Channel, CommandInteractionOption, CommandInteractionOptionResolver, Events, Guild, Interaction, TextChannel } from "discord.js";
import { Event } from "../core/Event";
import { client } from "..";
import type { CommandType, ExtendedInteraction } from "../types/CommandTypes";

export default new Event(
    Events.InteractionCreate,
    async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const commandName: string = interaction.commandName;
        const guildId: string = interaction.guildId as string;
        const guild: Guild = await client.guilds.fetch(guildId).catch(() => null) as Guild;
        const guildName: string = guild.name;
        const channel: Channel = interaction.channel as TextChannel;
        const channelName: string = channel.name;

        const command: CommandType | undefined = client.commands.get(commandName);
        if (!command) {
            client.logger.err(`${guildName} ~ ${channelName} - No command matching ${commandName} was found.`);
            return;
        }

        const options: readonly CommandInteractionOption<CacheType>[] = interaction.options.data;
        const optionsStr: string = options.length
            ? ` (${options.map(opt => `${opt.name}: ${opt.value}`).join(', ')})`
            : "";
        client.logger.bot(`${guildName} ~ ${channelName} - ${interaction.user.tag} ran /${commandName}${optionsStr}`);

        try {
            await command.run({
                options: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction as ExtendedInteraction
            });
        } catch (error: any) {
            client.logger.err(`${guildName} ~ ${channelName} - Error executing ${commandName}: ${error}`);
        }
    }
);