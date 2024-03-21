import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../../classes/Command";
import zalgo, { ZalgoOptions } from 'zalgo-js';

export default new Command({
    name: "zalgo",
    description: "Release Him",
    options: [
        {
            name: "text",
            description: "The Dark One cometh",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        // Get args
        const text: string = args.options.getString("text", true);

        // Release Him
        const options: ZalgoOptions = {
            directions: {
                up: true,
                down: true,
                middle: true,
            },
            intensity: (str, i) => {
                // return Math.random();
                return 1;
            }
        };
        const releaseHim: string = zalgo(text, options);

        // Send to Discord
        try {
            await args.interaction.editReply({
                content: releaseHim
            });
        } catch (error) {
            console.error(error);
            await args.interaction.editReply({ content: "Something went wrong with sending the message." });
        }
    }
});