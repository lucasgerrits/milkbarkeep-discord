import { ApplicationCommandOptionType, ColorResolvable, EmbedBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";
import { Command } from "../../core/Command";
import { AchievementUnlocksMetadata, GameExtended } from "@retroachievements/api";
import { Util } from "../../util/Util";

export default new Command({
    name: "ra-achievement",
    description: "Creates an embed of a given achievement for display.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "id",
            description: "The achievement's ID number (check the URL).",
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        // Get args
        const achievementID: number = args.options.getInteger("id", true);

        // API calls
        const chievoData: AchievementUnlocksMetadata = await args.client.ra.getAchievementUnlocks(achievementID);
        await Util.sleep(175);
        const gameData: GameExtended = await args.client.ra.getGameExtended(chievoData.game.id);

        // Format data
        const webURL: string = `https://retroachievements.org/achievement/${achievementID}`;
        const badgeName: string = gameData.achievements[achievementID].badgeName;
        const badgeUrl: string = `https://media.retroachievements.org/Badge/${badgeName}.png`;
        const titleStr: string = `${chievoData.achievement.title} (${chievoData.achievement.points})`;
        const pointsStr: string = `${chievoData.achievement.points} (${chievoData.achievement.trueRatio})`;
        const percentStr: string = `${((chievoData.unlocksCount / chievoData.totalPlayers) * 100).toFixed(2)}%`;
        const unlocksStr: string = `${chievoData.unlocksCount} of ${chievoData.totalPlayers}\n${percentStr} rate`;
        const gameUrl: string = `https://www.retroachievements.org/game/${chievoData.game.id}`
        const gameString: string = `[${chievoData.game.title}](${gameUrl})\n${chievoData.console.title}`;
        const darkGray: ColorResolvable = "#1E1F22";
        const raYellow: ColorResolvable = "#cc9900";

        // Create embed
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor(darkGray)
            .setTitle(titleStr)
            .setURL(webURL)
            .setDescription(chievoData.achievement.description)
            .setThumbnail(badgeUrl)
            .setFields(
                { name: "Game:", value: gameString, inline: true },
                { name: "Unlocks:", value: unlocksStr, inline: true },
            )

        // Send Discord message
        try {
            await args.interaction.editReply({
                embeds: [ embed ],
            });
        } catch (error) {
            console.log(error);
            await args.interaction.reply({ content: "Something went wrong with sending the message.", flags: MessageFlags.Ephemeral });
        }
    }
});