import { ApplicationCommandOptionType, Collection, EmbedBuilder, Guild, GuildEmoji, Message, MessageFlags, PermissionFlagsBits, TextChannel } from "discord.js";
import { Command } from "../../core/Command";
import { Logger } from "../../util/Logger";

export default new Command({
    name: "copy-emote",
    description: "Upload an emote from another Discord server.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "source",
            description: "The Discord emoji or Id of message containing one.",
            type: ApplicationCommandOptionType.String,
            required: true
        }, {
            name: "rename",
            description: "An optional new name",
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        const guildId: string = args.interaction.guildId as string;
        const guild: Guild = args.client.guilds.cache.get(guildId) as Guild;

        // Check input
        const sourceArg: string = args.options.getString("source", true);
        const renameArg: string | null = args.options.getString("rename", false);
        const sourceTrimmed: string = sourceArg.replace(/\+/g, "");
        const snowflakeRegex: RegExp = /^\d{17,20}$/;
        const isPossibleMessage: boolean = snowflakeRegex.test(sourceTrimmed);
        const emoteRegex: RegExp = /<(a?):(\w+):(\d+)>/;
        const isEmote: boolean = emoteRegex.test(sourceTrimmed);

        // If messageId, determine if message exists in guild
        let content: string = "";
        if (isPossibleMessage) {
            try {
                // First try the channel of the interaction
                try {
                    const message: Message = await args.interaction.channel?.messages.fetch(sourceTrimmed) as Message;
                    content = message.content;
                } catch (error: any) { }

                // Then try all other text based channels in guild
                if (!content) {
                    const textChannels: Collection<string, TextChannel> = guild.channels.cache.filter(channel => channel.isTextBased()) as Collection<string, TextChannel>;
                    for (const channel of textChannels.values()) {
                        try {
                            const message: Message = await channel.messages.fetch(sourceTrimmed);
                            content = message.content;
                        } catch(error: any) {
                            // Logger.log(`Message not found in channel ${channel.name}`)
                            continue;
                        }
                    }
                }
            } catch (error: any) {
                Logger.log(`Failed to locate messageId: ${sourceTrimmed}`);
                await args.interaction.editReply({ content: "Please use a valid emote or message Id." });
                return;
            }
        } else if (isEmote) {
            content = sourceTrimmed;
        } else {
            await args.interaction.editReply({ content: "Please use a valid emote or message Id." });
            return;
        }

        // Extract emote id and whether it is animated from the string
        const cdnUrl: string = "https://cdn.discordapp.com/emojis/";
        const match: RegExpMatchArray = content.match(emoteRegex) as RegExpMatchArray;
        const emoteId: string = match[3];
        const emoteName: string = renameArg ?? match[2];
        const isAnimated: boolean = match[1] === "a";
        const extension: string = isAnimated ? ".gif" : ".png";
        const fullUrl: string = `${cdnUrl}${emoteId}${extension}`;

        try {
            // Get the image file as a buffer
            const response: Response = await fetch(fullUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch emoji: ${response.statusText}`);
            }
            const buffer: Buffer = Buffer.from(await response.arrayBuffer());

            // Upload to the guild
            try {
                const newEmote: GuildEmoji = await guild.emojis.create({
                    attachment: buffer,
                    name: emoteName
                });
                const newEmoteString: string = `<${(isAnimated ? "a" : "")}:${emoteName}:${newEmote.id}>`;

                const embed: EmbedBuilder = new EmbedBuilder()
                    .setColor("#000000")
                    .setTitle(`:${emoteName}:`)
                    .setThumbnail(fullUrl)
                    .setDescription("Emote successfully copied to server.");
                
                Logger.log(`Successfully uploaded emote :${emoteName}: (${emoteId}) to guild ${guild.name} (${guildId})`);
                await args.interaction.editReply({ embeds: [ embed ] });
            } catch (error: any) {
                throw new Error(`Failed to upload emote :${emoteName}: (${emoteId}) to guild ${guild.name} (${guildId})`);
            }
        } catch (error: any) {
            Logger.log(error as string);
            await args.interaction.editReply({ content: "Something went wrong with copying the emote." });
        }
    }
});