import { EmbedBuilder, TextChannel } from "discord.js";
import puppeteer, { BoundingBox, Browser, ElementHandle, Page } from "puppeteer";
import { ExtendedClient } from "./ExtendedClient";
import { OpenWeatherMapApi } from "../integrations/OpenWeatherMap-API";
import { Util } from "../util/Util";
import type { CurrentResponse } from "openweathermap-ts/dist/types";

export class AppletonCam {
    private static mode: "cbs" | "fox" = "fox";

    public static async getScreenBuffer(clientRef: ExtendedClient): Promise<Buffer> {
        clientRef.logger.bot("Fetching weather cam screen");
        if (AppletonCam.mode === "cbs") {
            return await AppletonCam.getCBSScreenBuffer(clientRef);
        } else {
            return await AppletonCam.getFoxScreenBuffer(clientRef);
        }
    }

    private static async getFoxScreenBuffer(clientRef: ExtendedClient): Promise<Buffer> {
        const url: string = `https://fox11online.com/resources/ftptransfer/wluk/maps/AvenueCam.jpg`;
        try {
            const response = await fetch(url);
            const buffer = Buffer.from(await response.arrayBuffer());
            return buffer;
        } catch (error: any) {
            clientRef.logger.err(error as string);
            return Buffer.from("", "base64");
        }
    }

    private static async getCBSScreenBuffer(clientRef: ExtendedClient): Promise<Buffer> {
        const width: number = 1920;
        const height: number = 1080;
        const url: string = `https://api.wetmet.net/widgets/stream/frame.php?ruc=245-02-01&width=${width}&height=${height}`;

        const browser: Browser = await puppeteer.launch({ headless: true }); // Use headless mode
        const page: Page = await browser.newPage();

        let imageBase64Str: string = "";

        try {
            await page.setViewport({ width, height });
            await page.goto(url, { waitUntil: "networkidle2" });

            await page.waitForSelector("video", { visible: true, timeout: 5000 });
            await Util.sleep(2000);

            const videoElement: ElementHandle<HTMLVideoElement> | null = await page.$("video");
            const boundingBox: BoundingBox | null | undefined = await videoElement?.boundingBox();

            if (boundingBox) {
                imageBase64Str = await page.screenshot({
                    encoding: "base64",
                    clip: {
                        x: boundingBox.x,
                        y: boundingBox.y,
                        width: boundingBox.width,
                        height: boundingBox.height
                    }
                })
            } else {
                clientRef.logger.err("Video element not found or bounding box could not be determined.");
            }
        } catch (error: any) {
            clientRef.logger.err(error);
        } finally {
            await browser.close();
        }
        return Buffer.from(imageBase64Str, "base64");
    }

    public static async createEmbed(): Promise<EmbedBuilder> {
        // Get weather info
        let owm: OpenWeatherMapApi;
        let weatherData: CurrentResponse;
        try {
            owm = new OpenWeatherMapApi();
            weatherData = await owm.getCurrentWeatherByZipcode(54911, "US");
        } catch (error) {
            console.log(error);
            throw new Error(`Error creating weather embed`);
        }
        const embed: EmbedBuilder = await owm.createEmbed(weatherData, "attachment://cam.png");
        return embed;
    }

    public static async send(clientRef: ExtendedClient, channelId: string, buffer: Buffer, embed: EmbedBuilder): Promise<void> {
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
    };

    public static async sendToAll(clientRef: ExtendedClient): Promise<void> {
        const buffer: Buffer = await this.getScreenBuffer(clientRef);
        const embed = await this.createEmbed();

        const guilds: Array<string> = await clientRef.settings.getGuildIds();

        for (const guildId of guilds) {
            // Check if RA feed enabled for each guild
            if (!await clientRef.settings.isFeatureEnabled(guildId, "appletonCam")) {
                return;
            }
            const channelId: string = await clientRef.settings.getChannelId(guildId, "appletonCam");
            this.send(clientRef, channelId, buffer, embed);
        }
    }
}