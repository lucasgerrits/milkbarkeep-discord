import { ApplicationCommandOptionType, Attachment, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Command } from "../../core/Command";
import { EmoteOperation } from "../../types/GuildTypes";

export default new Command({
    name: "emote-upload",
    description: "Add a new emote to the server.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "image",
            description: "The image to be uploaded.",
            type: ApplicationCommandOptionType.Attachment,
            required: true
        }, {
            name: "name",
            description: "The name to be used.",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        const emoteName: string = args.options.getString("name", true) as string;
        const attachment = args.options.getAttachment("image", true) as Attachment;
        if (!attachment.contentType?.startsWith("image/")) {
            await args.interaction.editReply({ content: "Only image files can be uploaded as emotes." });
            return;
        }

        const guildId: string = args.interaction.guildId as string;
        const op: EmoteOperation = await args.client.emotes.upload(guildId, emoteName, attachment.url);

        if (!op.success) {
            args.interaction.editReply({ content: op.response });
        } else {
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor("#000000")
                .setTitle(`:${emoteName}:`)
                .setThumbnail(attachment.url)
                .setDescription("Emote successfully uploaded to server.");
            args.interaction.editReply({ embeds: [ embed ] })
        }
    }
});