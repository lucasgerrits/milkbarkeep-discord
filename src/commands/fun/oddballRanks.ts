import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageActionRowComponentBuilder, User, userMention } from "discord.js";
import { Command } from "../../classes/Command";
import { Oddball } from "../../classes/Oddball";
import { Util } from "../../util/Util";

export default new Command({
    name: "oddball-ranks",
    description: "See the current standings for this game of Oddball.",
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        // Get json data
        const oddballArr: Array<OddballData> = Oddball.readJson() ?? [];

        const chunkSize: number = 10;
        const pageCount: number = Math.ceil(oddballArr.length / chunkSize);
        let currentPage: number = 0;

        // Create message embed
        const createEmbed = (chunkedArr: Array<OddballData>): EmbedBuilder => {
            // Format into string
            const createRankString = (arr: Array<OddballData>): string => {
                let outputStr: string = "";
                for (let i: number = 0; i < arr.length; i++) {
                    outputStr += arr[i].rank + ". `" +
                        arr[i].userName + "` (" + arr[i].score + ")\n";
                }
                return outputStr;
            }

            // Create embed
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor("#000000")
                .setTitle("Current Oddball Game Ranking:")
                .setDescription(createRankString(chunkedArr));
            return embed;
        }

        // Create pagination buttons
        const createComponents = (currentPage: number, pageCount: number) => {
            const components: Array<ButtonBuilder> = [];
            // Determine if previous button needed
            if (currentPage > 0) {
                const prevButton = new ButtonBuilder()
                    .setCustomId(`${currentPage - 1}`)
                    .setLabel("◀")
                    .setStyle(ButtonStyle.Secondary);
    
                components.push(prevButton);
            }
            // Determine if next button needed
            if (currentPage < pageCount - 1) {
                const nextButton = new ButtonBuilder()
                    .setCustomId(`${currentPage + 1}`)
                    .setLabel("▶")
                    .setStyle(ButtonStyle.Secondary);

                components.push(nextButton);
            }
            // Return component row
            return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(components);
        }

        const chunkedArr = Util.chunkArray(oddballArr, chunkSize);

        // Send to Discord
        try {
            const embeddedMessage = await args.interaction.editReply({
                content: "",
                embeds: [ createEmbed(chunkedArr[currentPage]) ],
                components: [ createComponents(currentPage, pageCount) ]
            });

            // Create event handler
            const collector = embeddedMessage.createMessageComponentCollector();
            collector.on("collect", async (newInteraction) => {
                await newInteraction.deferUpdate();

                currentPage = parseInt(newInteraction.customId);

                // SEND UPDATED REPLY
                const message = await newInteraction.fetchReply();
                await message.edit({
                    content: "",
                    embeds: [ createEmbed(chunkedArr[currentPage]) ],
                    components: [ createComponents(currentPage, pageCount) ],
                });
            });
        } catch (error) {
            console.error(error);
            await args.interaction.editReply({ content: "Something went wrong with sending the message." });
        }
    }
});