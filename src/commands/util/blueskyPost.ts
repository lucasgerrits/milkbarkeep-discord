import { ApplicationCommandOptionType, MessageFlags, PermissionFlagsBits } from "discord.js";
import { Command } from "../../core/Command";
import { BlueskyApi } from "../../integrations/Bluesky-API";

export default new Command({
    name: "bluesky-post",
    description: "Makes a test post to the Discord's Bluesky account.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "message",
            description: "The text to be sent.",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const content: string = args.options.getString("message", true);

        try {
            const bsky: BlueskyApi = new BlueskyApi();
            await bsky.post(args.client, content);
            
            await args.interaction.editReply({ content: "Message success." });
        } catch (error) {
            console.error(error);
            await args.interaction.editReply({ content: "Something went wrong with sending the message." });
        }
    }
});