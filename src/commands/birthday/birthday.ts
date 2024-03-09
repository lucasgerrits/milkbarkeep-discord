import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../../classes/Command";
import { birthdays } from "../../../data/birthdays.json";

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
        const userID: string = args.options.getUser("user", false)?.id ?? args.interaction.user.id;
        // const userName = interaction.options.getUser("user", false)?.displayName ?? interaction.user.displayName;

        // Filter json for possible result
        const results: Array<{ date: string; user: string; userID: string; }> = birthdays.filter(obj => obj.userID === userID);

        // Create output string
        let outputStr: string = "";
        if (results.length > 0) {
            const birthday: string = results[0].date;
            outputStr = `<@${userID}>'s set birthday: ${birthday}`;
        } else {
            outputStr = `<@${userID}'s birthday is not set.`;
        }

        // Send
        await args.interaction.editReply({
            "content": outputStr
        });
    }
});