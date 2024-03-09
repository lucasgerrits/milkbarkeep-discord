import { APIEmbedField, Channel, EmbedBuilder, TextChannel, User, userMention } from "discord.js";
import { Command } from "../../classes/Command";
import { Oddball } from "../../classes/Oddball";

export default new Command({
    name: "oddball-ranks",
    description: "See the current standings for this game of Oddball.",
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        // Get json data
        const oddballArr: Array<OddballData> = Oddball.readJson() ?? [];

        // Format into string
        let outputStr: string = "";
        for (let i: number = 0; i < oddballArr.length; i++) {
            outputStr += oddballArr[i].rank + ". " + 
                userMention(oddballArr[i].userID) + " (" + oddballArr[i].score + ")\n";
        }

        // Create message embed
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor("#000000")
            .setTitle("Current Oddball Game Ranking:")
            .setDescription(outputStr);

        // Send to Discord
        try {
            await args.interaction.editReply({
                content: "",
                embeds: [ embed ]
            });
        } catch (error) {
            console.error(error);
            await args.interaction.editReply({ content: "Something went wrong with sending the message." });
        }
    }
});