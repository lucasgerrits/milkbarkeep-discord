import { ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Command } from "../../core/Command";
import type { EmoteInfo, EmoteOperation } from "../../types/GuildTypes";

export default new Command({
    name: "emote-rename",
    description: "Rename an emote on this server.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "emote",
            description: "The emote to be renamed on this server.",
            type: ApplicationCommandOptionType.String,
            required: true
        }, {
            name: "rename",
            description: "The new name",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        // Check input
        const rename: string = args.options.getString("rename", true);
        const emoteString: string = args.options.getString("emote", true).replace(/\+/g, "");
        const guildId: string = args.interaction.guildId as string;
        const isEmote: boolean = args.client.emotes.isEmote(emoteString);
        if (!isEmote) {
            await args.interaction.editReply({ content: "Please use a valid emote." });
            return;
        }

        // Extract emote id
        const emote: EmoteInfo = args.client.emotes.emoteInfoFromString(emoteString);

        // Delete emote from guild
        const op: EmoteOperation = await args.client.emotes.rename(guildId, emote.id, rename);
        
        // Send results
        if (!op.success) {
            args.interaction.editReply({ content: op.response });
        } else {
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor("#000000")
                .setTitle(`Renamed :${rename}:`)
                .setThumbnail(emote.cdnUrl)
                .setDescription(op.response);
            args.interaction.editReply({ embeds: [ embed ] })
        }
    }
});