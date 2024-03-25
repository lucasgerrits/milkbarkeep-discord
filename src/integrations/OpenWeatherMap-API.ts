import OpenWeatherMap from "openweathermap-ts";
import { EmbedBuilder } from "discord.js";
import { Convert } from "../util/Convert";
import { Timestamps } from "../classes/Timestamps";
import { openWeatherMap as apiKey } from "../../data/apiKeys.json";
import type { CurrentResponse } from "openweathermap-ts/dist/types";

export class OpenWeatherMapApi extends OpenWeatherMap {
    private apiKey: string;

    constructor() {
        super({
            apiKey: apiKey,
        });
        this.apiKey = apiKey;
        this.setUnits("imperial");
    }

    public iconUrl(iconId: string): string {
        return `https://openweathermap.org/img/wn/${iconId}@2x.png`;
    }

    public async createEmbed(data: CurrentResponse, imageUrl: string = ""): Promise<EmbedBuilder> {
        // Weather data variables
        const weatherDesc: string = data.weather[0].description.replace(/\b\w/g, (char: string) => char.toUpperCase());
        const iconId: string = data.weather[0].icon;
        const temp: number = data.main.temp;
        const feelsLike: number = data.main.feels_like;
        const humidity: number = data.main.humidity;
        const windSpeed: number = data.wind.speed;
        const windDir: string = Convert.degreesToCompass(data.wind.deg);

        // Time variables
        const now: Date = new Date();
        const longDateTime: string = Timestamps.longDateTime(now);
        const relativeTime: string = Timestamps.relative(now);
        const outputStr: string = `${longDateTime}\n(${relativeTime})`;
        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        const formattedTime = new Intl.DateTimeFormat('en-US', options).format(now);
        
        // Formatted embed strings
        const tempStr: string = `${temp.toFixed(0)} °F / ${Convert.fToC(temp).toFixed(0)} °C`;
        const feelsLikeStr: string = `${feelsLike.toFixed(0)} °F / ${Convert.fToC(feelsLike).toFixed(0)} °C`;
        const windStr: string = `${windDir} ${windSpeed.toFixed(0)} miles/hour / ${Convert.mphToMps(windSpeed).toFixed(0)} meters/sec`;
        const titleStr: string = `${formattedTime} - ${weatherDesc}`;
        const descStr: string = `
            **Your Time:** ${outputStr}\n
            **Temp:** ${tempStr}
            **Feels Like:** ${feelsLikeStr}
            **Humidity:** ${humidity}
            **Wind:** ${windStr}
        `;

        return new EmbedBuilder()
            .setColor("#1E1F22")
            .setTitle(titleStr)
            .setDescription(descStr)
            .setThumbnail(this.iconUrl(iconId))
            .setImage(imageUrl);
    }
}