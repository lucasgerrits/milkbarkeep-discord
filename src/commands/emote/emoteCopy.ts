import { ApplicationCommandOptionType, Collection, EmbedBuilder, Guild, Message, PermissionFlagsBits, TextChannel } from "discord.js";
import { Command } from "../../core/Command";
import { Logger } from "../../util/Logger";
import type { EmoteInfo, EmoteOperation } from "../../types/GuildTypes";

export default new Command({
    name: "emote-copy",
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

        // Check inputs
        const sourceArg: string = args.options.getString("source", true);
        const renameArg: string | null = args.options.getString("rename", false);
        const guildId: string = args.interaction.guildId as string;
        const isPossibleMessage: boolean = args.client.messageHandler.isPossibleMessageId(sourceArg);
        const isEmote: boolean = args.client.emotes.isEmote(sourceArg);

        // Process next step based on results
        let content: string = "";
        if (isEmote) {
            content = sourceArg.replace(/\+/g, "");
        } else if (isPossibleMessage) {
            const message: Message | undefined = await args.client.messageHandler.getMessage(guildId, sourceArg, args.interaction.channel?.id);
            if (message === undefined) {
                await args.interaction.editReply({ content: "Please use a valid emote or message Id." });
                return;
            } else {
                content = message.content;
            }
        } else {
            await args.interaction.editReply({ content: "Please use a valid emote or message Id." });
            return;
        }

        // Extract emote id and whether it is animated from the string
        const emote: EmoteInfo = args.client.emotes.emoteInfoFromString(content, renameArg ?? undefined);

        // Get the image file as a buffer
        let buffer: Buffer;
        try {
            const response: Response = await fetch(emote.cdnUrl);
            if (!response.ok) { throw new Error(`Failed to fetch emoji: ${response.statusText}`); }
            buffer = Buffer.from(await response.arrayBuffer());
        } catch(error: any) {
            Logger.log(error as string);
            await args.interaction.editReply({ content: "There was an issue with copying the emote image." });
            return;
        }

        // Upload image to the guild
        const op: EmoteOperation = await args.client.emotes.upload(guildId, emote.name, buffer);
        
        if (!op.success) {
            args.interaction.editReply({ content: op.response });
        } else {
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor("#000000")
                .setTitle(`:${emote.name}:`)
                .setThumbnail(emote.cdnUrl)
                .setDescription(op.response);
            args.interaction.editReply({ embeds: [ embed ] })
        }
    }
});