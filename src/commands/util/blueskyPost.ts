import { ApplicationCommandOptionType, Channel, MessageFlags, PermissionFlagsBits, TextChannel } from "discord.js";
import { Command } from "../../classes/Command";
import channelIDs from "../../../data/channelIDs.json";

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
        const content: string = args.options.getString("message", true);

        try {
            await args.client.bluesky.post(content);
            
            await args.interaction.reply({ content: "Message success.", flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error(error);
            await args.interaction.reply({ content: "Something went wrong with sending the message.", flags: MessageFlags.Ephemeral });
        }
    }
});