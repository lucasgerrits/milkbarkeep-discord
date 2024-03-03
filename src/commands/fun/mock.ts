import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../../classes/Command";

export default new Command({
    name: "mock",
    description: "wHAt d Id Yo U SAy ??.",
    options: [
        {
            name: "text",
            description: "The text to be mocked.",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (args): Promise<void> => {
        const text: string = args.options.getString("text", true);
        const mockEmote: string = "<:cfbMock:872350580213960724>";

        const mock = function(char: string): string {
            return Math.random() < 0.5 ? char.toLowerCase() : char.toUpperCase();
        };
        const mockedText: string = text.split("").map(mock).join("");

        await args.interaction.reply(`**${mockEmote} ${mockedText}**`);
    }
});