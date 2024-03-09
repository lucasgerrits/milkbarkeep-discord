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

        // Get relevant data
        const fields: Array<APIEmbedField> = [];

        // In the event someone uses the command again while holding the ball
        if (oddball.dropUser !== undefined && oddball.dropUser.userID === oddball.pickupUser.userID) {
            const keepUserStr: string = `#${oddball.dropUser.rank}: ` + userMention(oddball.dropUser.userID) +
                ` (${oddball.dropUser.score}) (+${oddball.dropUser.lastIncrease})`;
            const keepField: APIEmbedField = { name: "Ball still held by:", value: keepUserStr, inline: false };
            fields.push(keepField);
        } else {
            // First ever ball pickup would have no dropUser
            if (oddball.dropUser !== undefined) {
                const dropUserStr: string = `#${oddball.dropUser.rank}: ` + userMention(oddball.dropUser.userID) +
                    ` (${oddball.dropUser.score}) (+${oddball.dropUser.lastIncrease})`;
                const dropField: APIEmbedField = { name: "Ball dropped by:", value: dropUserStr, inline: false };
                fields.push(dropField);
            }
            const pickupUserStr: string = `#${oddball.pickupUser.rank}: ` +
                userMention(oddball.pickupUser.userID) +
                ` (${oddball.pickupUser.score})`;
            const pickupField: APIEmbedField = { name: "Ball taken by:", value: pickupUserStr, inline: false };
            fields.push(pickupField);
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