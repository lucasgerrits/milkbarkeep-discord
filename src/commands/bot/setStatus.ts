import { ActivityType, ApplicationCommandOptionType, ClientUser, MessageFlags, PermissionFlagsBits } from "discord.js";
import { Command } from "../../classes/Command";

export default new Command({
    name: "set-status",
    description: "Sets Barkeep's status.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "text",
            description: "The status text to display.",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (args): Promise<void> => {
        const statusText = args.options.getString("text", true);
        try {
            const clientUser: ClientUser = args.client.user as ClientUser;
            clientUser.setPresence({
                activities: [
                    {
                        type: ActivityType.Custom,
                        name: "custom",
                        state: statusText,
                    }
                ]
            }); // 
            await args.interaction.reply({ content: "Status set successfully.", flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.log(error);
            await args.interaction.reply({ content: "Something went wrong with setting the status.", flags: MessageFlags.Ephemeral });
        }
    }
});