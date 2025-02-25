import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../../core/Command";
import type { userPoints } from "../../types/RATypes";

export default new Command({
    name: "ra-ranking",
    description: "Get a ranking of RA users in this Discord.",
    options: [
        {
            name: "all-time",
            description: "Get a ranking of RA users in this Discord, sorted by All-Time point values.",
            type: ApplicationCommandOptionType.Subcommand,
        }, {
            name: "daily",
            description: "Get a ranking of RA users in this Discord, sorted by Daily point values.",
            type: ApplicationCommandOptionType.Subcommand,
        }, {
            name: "weekly",
            description: "Get a ranking of RA users in this Discord, sorted by Weekly point values.",
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        // FUNCTIONS

        const createString = async (list: userPoints[]) => {
            const profileURL = "https://www.retroachievements.org/user/";
            let output = "";
            for (let i = 0; i < list.length; i++) {
                output += `${i + 1}. [${list[i].username}]` +
                    `(${profileURL}${list[i].username}): ` +
                    `${list[i].points}\n`;
            }
            return output;
        };

        const createEmbed = async (label: string, descriptStr: string) => {
            const thumbnail: string = "https://static.retroachievements.org/assets/images/ra-icon.webp";
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor("#cc9900")
                .setThumbnail(thumbnail)
                .setTitle(label)
                .setDescription(descriptStr);
            return embed;
        };

        // GET DATA

        let label: string = "";
        let embedString: string = "";
        try {
            if (args.options.getSubcommand() === "all-time") {
                label = "All-Time";
                embedString = await createString(await args.client.ra.getAllTimeList());
            } else if (args.options.getSubcommand() === "daily") {
                label = "Daily";
                embedString = await createString(await args.client.ra.getDailyList());
            } else if (args.options.getSubcommand() === "weekly") {
                label = "Weekly";
                embedString = await createString(await args.client.ra.getWeeklyList());
            }
        } catch (error) {
            const errorStr: string = "My apologies, but there may currently be an issue with the RA services. " +
                "You can consult the community-news channel on their Discord here: " +
                "https://discord.com/channels/310192285306454017/357633571307126784";
            await args.interaction.editReply({
                content: errorStr,
            });
        }

        // SEND

        try {
            await args.interaction.editReply({
                content: "Bombsquad RA Users Ranking",
                embeds: [ await createEmbed(
                    label,
                    embedString,
                )],
            });
        } catch (error) {
            console.log(error);
            await (args.interaction as CommandInteraction).editReply({
                content: "Something went wrong with your request.",
            });
        }
    }
});