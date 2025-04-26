import { PermissionFlagsBits } from "discord.js";
import { Command } from "../../core/Command";
import { Birthdays } from "../../core/Birthdays";

export default new Command({
    name: "test",
    description: "NOTHING TO SEE HERE",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    run: async (args): Promise<void> => {
        try {
            args.client.logger.dev("Test began");
            await args.interaction.reply({ content: "Test began" });
            // ======================================================================

            Birthdays.check(args.client);

            // ======================================================================
            await args.interaction.editReply({ content: "Test concluded successfully" });
            args.client.logger.dev("Test concluded successfully");
        } catch (error: unknown) {
            args.client.logger.dev("Test concluded in error");
            args.client.logger.dev(error as string);
            await args.interaction.editReply({ content: "Test concluded in error" });
        }
    }
});