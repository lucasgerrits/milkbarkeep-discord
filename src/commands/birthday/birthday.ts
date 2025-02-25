import { ApplicationCommandOptionType } from "discord.js";
import { Birthdays } from "../../core/Birthdays";
import { BirthdaysJson } from "../../types/GuildTypes";
import { Command } from "../../core/Command";

export default new Command({
    name: "birthday",
    description: "Show your (or another member's) set birthday",
    options: [
        {
            name: "user",
            description: "Optional username.",
            type: ApplicationCommandOptionType.User,
            required: false
        },
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        // Get specified name, else command user
        const userId: string = args.options.getUser("user", false)?.id ?? args.interaction.user.id;

        if (!args.interaction.guildId) {
            throw new Error("Required guild id is null.");
        }
        const guildId: string = args.interaction.guildId;

        // Filter json for possible result
        const results: Array<BirthdaysJson> = await Birthdays.getUserBirthday(args.client, args.interaction.guildId, userId);

        // Create output string
        let outputStr: string = "";
        if (results.length > 0) {
            const birthday: string = results[0].date;
            outputStr = `<@${userId}>'s set birthday: ${birthday}`;
        } else {
            outputStr = `<@${userId}'s birthday is not set.`;
        }

        // Send
        await args.interaction.editReply({
            "content": outputStr
        });
    }
});