import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Command } from "../../classes/Command";
import { Timestamps } from "../../classes/Timestamps";
import urls from "../../../data/urls.json";

export default new Command({
    name: "cows-stats",
    description: "Displays data about a user's cow launches on CFB's stream.",
    options: [
        {
            name: "user",
            description: "The twitch user to lookup.",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        const userArg: string = args.options.getString("user") ?? "";
        const url: string = urls.cowUserStats + userArg;

        await fetch(url)
            .then(async (response) => {
                const text: string = await response.text();

                let formattedText: string = "";

                if (text.substring(0, 12) === "User has not") {
                    formattedText = `
                        **User:** [\`${userArg}\`](https://www.twitch.tv/${userArg})
                        ${text}
                    `;
                } else {
                    // These shouldn't all be strings, it's an issue on the php end
                    const data: {
                        rank: string,
                        launches: string,
                        most_recent: string,
                        total_users: string,
                        total_launches: string,
                    } = JSON.parse(text);
                    const percentage: string = ((parseInt(data.launches) / parseInt(data.total_launches)) * 100).toFixed(2);
                    const timestamp: string = Timestamps.default(new Date(data.most_recent));

                    formattedText = `` +
                        `**User:** [\`${userArg}\`](https://www.twitch.tv/${userArg})\n` +
                        `**Rank:** ${data.rank} (of ${data.total_users})\n` +
                        `**Launches:** ${data.launches}\n` +
                        `**Contribution:** ${percentage}% (of ${data.total_launches})\n` +
                        `**Most Recent:** ${timestamp}`;
                }

                const embed: EmbedBuilder = new EmbedBuilder()
                    .setColor("#000000")
                    .setTitle(`Cow Launch User Stats`)
                    .setDescription(formattedText)
                    .setThumbnail(urls.cowImg);

                await args.interaction.editReply({
                    embeds: [ embed ],
                });
            })
            .catch(async (err) => {
                console.log(err);
                await args.interaction.editReply({
                    content: "Something went wrong with your request."
                });
            });
    }
});