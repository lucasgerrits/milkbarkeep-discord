import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Command } from "../../core/Command";
import { Logger } from "../../core/Logger";
import type { RARankingType } from "../../types/RATypes";

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

        try {
            const listType: RARankingType = args.options.getSubcommand() as RARankingType;

            try {
                await args.client.ra.sendRankingsList(listType, args.interaction);
            } catch (error: any) {
                Logger.log(error as string);
                await (args.interaction as CommandInteraction).editReply({
                    content: "Something went wrong with your request.",
                });
            }
        } catch (error) {
            const errorStr: string = "My apologies, but there may currently be an issue with the RA services. " +
                "You can consult the community-news channel on their Discord here: " +
                "https://discord.com/channels/310192285306454017/357633571307126784";
            await args.interaction.editReply({
                content: errorStr,
            });
        }
    }
});