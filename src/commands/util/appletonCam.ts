import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Command } from "../../classes/Command";
import { Convert } from "../../util/Convert";
import { SeleniumWebDriver } from "../../integrations/SeleniumWebDriver";
import { OpenWeatherMapApi } from "../../integrations/OpenWeatherMap-API";
import type { CurrentResponse } from "openweathermap-ts/dist/types";

export default new Command({
    name: "appleton-cam",
    description: "Posts a screenshot from an Appleton based webcam.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        // Get screenshot data
        const driver: SeleniumWebDriver = new SeleniumWebDriver();
        const screenString: string = await driver.getAppletonCamScreen();
        const base64Data: string = screenString.replace(/^data:image\/png;base64,/, '');
        const buffer: Buffer = Buffer.from(base64Data, "base64");

        // Get weather info
        const owm: OpenWeatherMapApi = new OpenWeatherMapApi();
        const weatherData: CurrentResponse = await owm.getCurrentWeatherByZipcode(54911, "US");

        // Create embed
        const embed: EmbedBuilder = await owm.createEmbed(weatherData, "attachment://cam.png");

        // Send Discord message
        try {
            await args.interaction.editReply({
                embeds: [ embed ],
                files: [{
                    attachment: buffer,
                    name: "cam.png"
                }]
            });
        } catch (error) {
            console.log(error);
            await args.interaction.editReply({ content: "Something went wrong with sending the message." });
        }
    }
});