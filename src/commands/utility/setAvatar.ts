import { ApplicationCommandOptionType, Channel, ChannelType, ClientUser, TextChannel } from "discord.js";
import { Command } from "../../classes/Command";

export default new Command({
    name: "set-avatar",
    description: "Sets the avatar of the bot.",
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        const file: string = "pfpAnimated.gif";
        const dir: string = `${__dirname}/../../../assets/`;
        const fileName: string = dir + file;
        
        const clientUser: ClientUser = args.client.user as ClientUser;

        try {
            await clientUser.setAvatar(fileName);
            await args.interaction.editReply({ content: "Client avatar set successfully." });
        } catch (error) {
            console.log(error);
            await args.interaction.editReply({ content: "There was a problem with setting the client avatar." });
        }
    }
});