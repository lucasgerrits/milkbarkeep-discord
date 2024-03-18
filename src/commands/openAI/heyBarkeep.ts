import { ApplicationCommandOptionType, ColorResolvable, EmbedBuilder, PermissionFlagsBits, userMention } from "discord.js";
import { Command } from "../../classes/Command";
import { OpenAIApi } from "../../integrations/OpenAI-API";

export default new Command({
    name: "heybarkeep",
    description: "Ask Barkeep a question!",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "prompt",
            description: "The message request",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        // API call
        const prompt: string = args.options.getString("prompt") ?? "";
        const openAI = new OpenAIApi();
        const response = await openAI.chat(prompt);

        // User embed
        const userColor: ColorResolvable = args.interaction.user.hexAccentColor ?? "#000000";
        const userDisplay: string = args.interaction.user.displayName;
        const userAvatar: string = args.interaction.user.displayAvatarURL();

        const embeds: Array<EmbedBuilder> = new Array<EmbedBuilder>(2);
        embeds[0] = new EmbedBuilder()
            .setColor(userColor)
            .setDescription(`${prompt}`)
            .setAuthor({
                name: `${userDisplay}:`,
                iconURL: userAvatar,
            })

        // Bot embed
        const barkeepGreen: ColorResolvable = "#467566";
        const botDisplay: string = args.client.user?.displayName ?? "";
        const botAvatar: string = args.client.user?.displayAvatarURL() ?? "";

        embeds[1] = new EmbedBuilder()
            .setColor(barkeepGreen)
            .setDescription(response)
            .setAuthor({
                name: `${botDisplay}:`,
                iconURL: botAvatar,
            })

        try {
            await args.interaction.editReply({
                embeds: embeds,
            });
        } catch (error) {
            console.log(error);
            await args.interaction.editReply({
                content: "Something went wrong with your request.",
            });
        }
    }
});