import { EmbedBuilder } from "discord.js";
import { Birthdays } from "../../core/Birthdays";
import { BirthdaysJson } from "../../types/FeatureTypes";
import { Command } from "../../core/Command";
import { Timestamps } from "../../core/Timestamps";

export default new Command({
    name: "upcoming-birthdays",
    description: "See the five upcoming dates with user birthdays.",
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        if (!args.interaction.guildId) {
            throw new Error("Required guild id is null.");
        }
        const guildId: string = args.interaction.guildId;

        // Filter json for possible results
        const birthdays: Array<BirthdaysJson> = await Birthdays.getUpcomingByDayCount(args.client, args.interaction.guildId, 5);
        const grouped: Record<string, string[]> = birthdays.reduce<Record<string, string[]>>((acc, obj) => {
            if (!acc[obj.date]) acc[obj.date] = [];
            acc[obj.date].push(obj.userId);
            return acc;
        }, {});

        const formattedText: string = Object.entries(grouped).map(([date, users]) => {
            const timestamp = Timestamps.relative(Birthdays.getUpcomingDateFromMMDD(date));
            return `### __${date}__ (${timestamp})\n<@${users.join('>\n')}>`;
        }).join("\n");

        // Create embed
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor("#000000")
            .setTitle("Upcoming Birthdays")
            .setDescription(formattedText);

        // Send
        await args.interaction.editReply({
            embeds: [ embed ],
        });
    }
});