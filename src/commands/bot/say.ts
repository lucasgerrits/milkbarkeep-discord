import { ApplicationCommandOptionType, Channel, ChannelType, PermissionFlagsBits, TextChannel } from "discord.js";
import { Command } from "../../classes/Command";

export default new Command({
    name: "say",
    description: "Speak on Barkeep's behalf.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "message",
            description: "The text to be sent.",
            type: ApplicationCommandOptionType.String,
            required: true
        }, {
            name: "channel",
            description: "The channel to be messaged.",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ ChannelType.GuildText ],
            required: false
        }
    ],
    run: async (args): Promise<void> => {
        const content = args.options.getString("message", true);
        const channelID: string = args.options.getChannel("channel", false)?.id ?? args.interaction.channel?.id as string;

        try {
            const channel: Channel = args.client.channels.cache.get(channelID) as TextChannel;
            await channel.send(content);
            await args.interaction.reply({ content: "Message success.", ephemeral: true });
        } catch (error) {
            console.log(error);
            await args.interaction.reply({ content: "Something went wrong with sending the message.", ephemeral: true });
        }
    }
});