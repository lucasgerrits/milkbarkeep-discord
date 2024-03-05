import {  EmbedBuilder } from "discord.js";
import { Command } from "../../classes/Command";

export default new Command({
    name: "ra-point-colors",
    description: "Explanation of the point value coloring in the ra-feed embeds.",
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        const embeds: Array<EmbedBuilder> = new Array<EmbedBuilder>(5);
        embeds[0] = new EmbedBuilder().setColor("#1EFF0C")
            .setDescription("Green (Uncommon): 0 - 9");

        embeds[1] = new EmbedBuilder().setColor("#0070FF")
            .setDescription("Blue (Rare): 10 - 19");

        embeds[2] = new EmbedBuilder().setColor("#A335EE")
            .setDescription("Purple (Epic): 20 - 49");

        embeds[3] = new EmbedBuilder().setColor("#FF8000")
            .setDescription("Orange (Legendary): 50 - 99");

        embeds[4] = new EmbedBuilder().setColor("#FF3F40")
            .setDescription("Red (Ancient): 100");

        try {
            await args.interaction.editReply({
                content: "Achievement point value coloring:",
                embeds: embeds,
            });
        } catch (error) {
            console.log(error);
            await args.interaction.editReply({
                content: "Something went wrong with your request.",
            });
        }
    }
});