import { ApplicationCommandOptionType, Channel, EmbedBuilder, PermissionFlagsBits, TextChannel } from "discord.js";
import { Command } from "../../classes/Command";
import { SeleniumWebDriver } from "../../integrations/SeleniumWebDriver";
import { Logger } from "../../util/Logger";

export default new Command({
    name: "check-website",
    description: "Is it down?",
    options: [
        {
            name: "url",
            description: "The website to be checked.",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        // Get args
        const url = args.options.getString("url", true);

        // Check isitdown for results
        const driver: SeleniumWebDriver = new SeleniumWebDriver();
        const result: string = await driver.getIsItDown(url);
        Logger.log(`[Selenium] ${result}`, "cyan");

        // Create embed
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor("#000000")
            .setDescription(result);

        // Send Discord message
        try {
            await args.interaction.editReply({
                embeds: [ embed ],
            });
        } catch (error) {
            console.log(error);
            await args.interaction.reply({ content: "Something went wrong with sending the message." });
        }
    }
});