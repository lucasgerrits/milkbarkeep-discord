import { ApplicationCommandOptionType, MessageFlags } from "discord.js";
import { Command } from "../../core/Command";

export default new Command({
    name: "ra-achievement",
    description: "Creates an embed of a given achievement for display.",
    options: [
        {
            name: "id",
            description: "The achievement's ID number (check the URL).",
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        // Get args
        const achievementId: number = args.options.getInteger("id", true);

        // Send Discord message
        try {
            await args.client.ra.sendIdAchievement(achievementId, args.interaction);
        } catch (error) {
            args.client.logger.err(error as string);
            await args.interaction.reply({ content: "Something went wrong with sending the message.", flags: MessageFlags.Ephemeral });
        }
    }
});