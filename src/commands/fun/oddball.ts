import { APIEmbedField, Channel, EmbedBuilder, TextChannel, User, userMention } from "discord.js";
import { Command } from "../../classes/Command";
import { Oddball } from "../../classes/Oddball";

export default new Command({
    name: "oddball",
    description: "PLAY BALL",
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        const user: User = args.interaction.user;

        // Call game logic
        const oddball = new Oddball(user);

        // Format data for embed
        const fields: Array<APIEmbedField> = [];

        const createField = (user: OddballData, prefix: string, includeIncrease: boolean = false): APIEmbedField => {
            let userStr: string = `#${user.rank}: ${userMention(user.userID)} (${user.score})`;
            userStr += (includeIncrease) ? ` (+${user.lastIncrease})` : "";
            return { name: "Ball still held by:", value: userStr, inline: false };
        };

        // In the event someone uses the command again while holding the ball
        if (oddball.dropUser !== undefined && oddball.dropUser.userID === oddball.pickupUser.userID) {
            fields.push(createField(oddball.dropUser, "Ball still held by:", true));
        } else {
            // First ever ball pickup would have no dropUser
            if (oddball.dropUser !== undefined) {
                fields.push(createField(oddball.dropUser, "Ball dropped by:", true));
            }
            fields.push(createField(oddball.pickupUser, "Ball dropped by:"));
        }

        // Create message embed
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor("#000000")
            .addFields(fields);

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