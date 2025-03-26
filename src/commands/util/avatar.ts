import { ApplicationCommandOptionType, ColorResolvable, EmbedBuilder, User } from "discord.js";
import { Command } from "../../core/Command";
import { Logger } from "../../core/Logger";

export default new Command({
    name: "avatar",
    description: "Get the avatar of a user.",
    options: [
        {
            name: "user",
            description: "The user whose avatar you want to view",
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        // Get avatar info from user args
        const user: User = args.options.getUser("user", false) || args.interaction.user;
        await user.fetch();
        const isAnimated: boolean | undefined = user.avatar?.startsWith("a_");
        const avatarExtension = isAnimated ? "gif" : "png";
        const avatarUrl: string = user.displayAvatarURL({ size: 1024, extension: avatarExtension });
        const userColor: ColorResolvable = user.hexAccentColor ?? "#000000";

        // Create embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${user.displayName}'s avatar:` })
            .setImage(avatarUrl)
            .setColor(userColor)
            .setURL(avatarUrl);

        // Send Discord message
        try {
            await args.interaction.editReply({
                embeds: [ embed ]
            });
        } catch (error: any) {
            Logger.log(error);
            await args.interaction.editReply({ content: "Something went wrong with sending the message." });
        }
    }
});