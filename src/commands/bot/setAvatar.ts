import { ApplicationCommandOptionType, Attachment, ClientUser, MessageFlags, PermissionFlagsBits } from "discord.js";
import { Command } from "../../core/Command";
import { Logger } from "../../core/Logger";

export default new Command({
    name: "set-avatar",
    description: "Sets the avatar of the bot.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "file",
            description: "The image to be uploaded.",
            type: ApplicationCommandOptionType.Attachment,
            required: true
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply({ flags: MessageFlags.Ephemeral });

        //const defaultFile: string = "pfpAnimated.gif";
        //const defaultDir: string = `${__dirname}/../../../assets/`;
        //const defaultFileName: string = defaultDir + defaultFile;

        const attachment = args.interaction.options.get("file", true)?.attachment as Attachment;
        
        const clientUser: ClientUser = args.client.user as ClientUser;

        try {
            await clientUser.setAvatar(attachment.url);
            await args.interaction.editReply({ content: "Client avatar set successfully." });
        } catch (error: any) {
            Logger.log(error as string);
            await args.interaction.editReply({ content: "There was a problem with setting the client avatar." });
        }
    }
});