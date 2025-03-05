import { ApplicationCommandOptionType, Attachment, DiscordAPIError, EmbedBuilder, Guild, GuildEmoji, MessageFlags, PermissionFlagsBits } from "discord.js";
import { Command } from "../../core/Command";
import { Logger } from "../../util/Logger";

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

        const guildId: string = args.interaction.guildId as string;
        const guild: Guild = args.client.guilds.cache.get(guildId) as Guild;

        const emoteName: string = args.options.getString("name", true) as string;
        const attachment = args.options.getAttachment("image", true) as Attachment;
        if (!attachment.contentType?.startsWith("image/")) {
            await args.interaction.editReply({ content: "Only image files can be uploaded as emotes." });
            return;
        }

        try {
            const newEmote: GuildEmoji = await guild.emojis.create({
                attachment: attachment.url,
                name: emoteName
            });
            const emoteId: string = newEmote.id;

            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor("#000000")
                .setTitle(`:${emoteName}:`)
                .setThumbnail(attachment.url)
                .setDescription("Emote successfully uploaded to server.");
            
            Logger.log(`Successfully uploaded emote :${emoteName}: (${emoteId}) to guild ${guild.name} (${guildId})`);
            await args.interaction.editReply({ embeds: [ embed ] });
        } catch (error: any) {
            Logger.log(`Failed to upload emote :${emoteName}: to guild ${guild.name} (${guildId}) : ${error as string}`);
            if (error instanceof DiscordAPIError) {
                if (error.code === 30008) {
                    await args.interaction.editReply({ content: "The server has reached it's emoji limit." });
                } else if (error.code === 50035) {
                    await args.interaction.editReply({ content: "The image is too large or has invalid dimensions." });
                } else if (error.code === 50013) {
                    await args.interaction.editReply({ content: "I lack the proper permission to add emotes." });
                } else {
                    await args.interaction.editReply({ content: "The upload failed due to an unexpected error." });
                }
            } else {
                await args.interaction.editReply({ content: "There was an unexpected problem uploading the emote." });
            }
        }
    }
});