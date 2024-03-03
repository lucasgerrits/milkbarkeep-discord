import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../../classes/Command";

export default new Command({
    name: "louder",
    description: "For those in the back.",
    options: [
        {
            name: "text",
            description: "Say it again.",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (args): Promise<void> => {
        const text: string = args.options.getString("text", true);
        const clap: string = "👏";

        const wordArray: Array<string> = text.toUpperCase().split(" ");

        const newString: string = wordArray.join(" " + clap + " ");

        await args.interaction.reply(`**${clap} ${newString} ${clap}**`);
    }
});