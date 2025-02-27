import { EmbedBuilder, TextChannel } from "discord.js";
import { ExtendedClient } from "./ExtendedClient";
import { OpenWeatherMapApi } from "../integrations/OpenWeatherMap-API";
import { SeleniumWebDriver } from "../integrations/SeleniumWebDriver";
import type { CurrentResponse } from "openweathermap-ts/dist/types";

export class AppletonCam {
    public static async send(clientRef: ExtendedClient, channelId: string): Promise<void> {
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

        // Send to feature enabled Discords
        const guilds: Array<string> = await clientRef.settingsManager.getGuildIds();

        for (const guildId of guilds) {
            // Check if birthday announcements enabled for each guild
            if (!clientRef.settingsManager.isFeatureEnabled(guildId, "appletonCam")) {
                return;
            }

            // Send to Discord
            try {
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
        }
    };

    public static async sendToAll(clientRef: ExtendedClient): Promise<void> {
        const guilds: Array<string> = await clientRef.settingsManager.getGuildIds();

        for (const guildId of guilds) {
            // Check if RA feed enabled for each guild
            if (!await clientRef.settingsManager.isFeatureEnabled(guildId, "appletonCam")) {
                return;
            }
            const channelId: string = await clientRef.settingsManager.getChannelId(guildId, "appletonCam");
            this.send(clientRef, channelId);
        }
    }
}