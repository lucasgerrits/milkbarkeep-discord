import { EmbedBuilder, TextChannel } from "discord.js";
import { ExtendedClient } from "./ExtendedClient";
import { OpenWeatherMapApi } from "../integrations/OpenWeatherMap-API";
import { SeleniumWebDriver } from "../integrations/SeleniumWebDriver";
import channelIDs from "../../data/channelIDs.json";
import type { CurrentResponse } from "openweathermap-ts/dist/types";

export class AppletonCam {
    public static async postToDisc(clientRef: ExtendedClient): Promise<void> {
        // Get screenshot data
        const driver: SeleniumWebDriver = new SeleniumWebDriver();
        const screenString: string = await driver.getAppletonCamScreen();
        const base64Data: string = screenString.replace(/^data:image\/png;base64,/, '');
        const buffer: Buffer = Buffer.from(base64Data, "base64");

        // Get weather info
        let owm: OpenWeatherMapApi;
        let weatherData: CurrentResponse;
        try {
            owm = new OpenWeatherMapApi();
            weatherData = await owm.getCurrentWeatherByZipcode(54911, "US");
        } catch (error) {
            console.log(error);
            return;
        }

        // Create embed
        const embed: EmbedBuilder = await owm.createEmbed(weatherData, "attachment://cam.png");

        // Send to Discord
        try {
            const channelId: string = channelIDs.bombsquad.channels.appletonCam;
            const channel: TextChannel = clientRef.channels.cache.get(channelId) as TextChannel;
            await channel.send({
                embeds: [ embed ],
                files: [{
                    attachment: buffer,
                    name: "cam.png"
                }]
            });
        } catch (error) {
            console.log(error);
        }
    };
}