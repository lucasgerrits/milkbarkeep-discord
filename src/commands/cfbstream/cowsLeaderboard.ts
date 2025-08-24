import { EmbedBuilder, inlineCode } from "discord.js";
import { Command } from "../../core/Command";
import { Timestamps } from "../../core/Timestamps";
import urls from "../../../data/urls.json";

export default new Command({
    name: "cows-leaderboard",
    description: "Displays data about the cow launches on CFB's stream.",
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        await fetch(urls.cowLeaderboard)
            .then(async (response) => {
                const text: string = await response.text();

                const data: Array<{
                    rank: string,
                    user_name: string,
                    launches: string,
                    most_recent: string,
                }> = JSON.parse(text);
                
                let formattedText: string = "";
                data.forEach((row) => {
                    const timestamp: string = Timestamps.relative(new Date(row.most_recent));
                    formattedText += `### ${row.rank}. [${inlineCode(row.user_name)}](https://www.twitch.tv/${row.user_name})` +
                        `: ${row.launches} \n-# ${timestamp}\n`;
                });
                
                const embed: EmbedBuilder = new EmbedBuilder()
                    .setColor("#000000")
                    .setTitle("Cow Launch Top 10:")
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