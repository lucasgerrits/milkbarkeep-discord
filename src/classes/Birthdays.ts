import { ExtendedClient } from "./ExtendedClient";
import { TextChannel } from "discord.js";
import { birthdays } from "../../data/birthdays.json";
import channelIDs from "../../data/channelIDs.json";

export class Birthdays {
    // TODO: lots lol but move birthdays to guild specific data and abstract checks
    public static async check(clientRef: ExtendedClient): Promise<void> {
        const channelID = channelIDs.bombsquad.channels.birthdays;

        const today: Date = new Date();
        const month: string = (today.getMonth() + 1).toString().padStart(2, "0"); // zero-indexed
        const day: string = today.getDate().toString().padStart(2, "0");
        const todayInMMDD: string = `${month}-${day}`;

        const resultIDs: string[] = birthdays.filter(obj => obj.date === todayInMMDD).map(obj => obj.userID);
        const resultTags: string[] = birthdays.filter(obj => obj.date === todayInMMDD).map(obj => `<@${obj.userID}>`);

        if (resultIDs.length > 0) {
            const lf: Intl.ListFormat = new Intl.ListFormat("en");
            const botStr: string = "Today it's " + lf.format(resultTags) + "'s birthday! POGGGG";
            try {
                const channel: TextChannel = clientRef.channels.cache.get(channelID) as TextChannel;
                await channel.send({
                    "content": botStr,
                    "allowedMentions": { "users": [ ...resultIDs ] },
                });
            } catch (error) {
                console.log(error);
            }
        }
    }
}