import { PermissionFlagsBits } from "discord.js";
import { Command } from "../../core/Command";
import { Birthdays } from "../../core/Birthdays";
import { Logger } from "../../util/Logger";

export default new Command({
    name: "test",
    description: "NOTHING TO SEE HERE",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    run: async (args): Promise<void> => {
        try {
            await args.interaction.reply({ content: "Test began" });
            // ======================================================================

            Birthdays.check(args.client);

            // ======================================================================
            await args.interaction.editReply({ content: "Test concluded successfully" });
        } catch (error: any) {
            Logger.log(`[DEV] ${error}`);
            await args.interaction.editReply({ content: "Test concluded in error" });
        }
    }
});