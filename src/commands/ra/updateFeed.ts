import { ApplicationCommandOptionType, PermissionFlagsBits, TextChannel } from "discord.js";
import { Command } from "../../classes/Command";
import channelIDs from "../../../data/channelIDs.json";

export default new Command({
    name: "ra-update-feed",
    description: "Updates the RA feed by an amount of previous minutes in case of bot mishap.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "minutes",
            description: "How far back to look (Default: 30).",
            type: ApplicationCommandOptionType.Integer,
            required: false
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply({ ephemeral: true });

        const minutesToLookBack: number = args.options.getInteger("minutes", false) ?? 30;
        let toPostChannelID: string = channelIDs.raFeed;
        const interactionChannel: TextChannel = args.interaction.channel as TextChannel;
        const interactionChannelID: string = interactionChannel.id;
        if (interactionChannelID === channelIDs.testing) {
            toPostChannelID = channelIDs.testing;
        }

        try {
            await args.client.ra.updateFeed(args.client, toPostChannelID, minutesToLookBack);
            await args.interaction.editReply({
                content: "Update successful."
            });
        } catch (error) {
            console.log(error);
            await args.interaction.reply({ content: "Something went wrong with sending the message.", ephemeral: true });
        }
    }
});