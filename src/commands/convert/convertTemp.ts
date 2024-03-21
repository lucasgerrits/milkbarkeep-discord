import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Command } from "../../classes/Command";

export default new Command({
    name: "convert-temperature",
    description: "Explanation of the point value coloring in the ra-feed embeds.",
    options: [
        {
            name: "units",
            description: "The unit types to be converted to and from.",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "f-to-c", value: "f-to-c" },
                { name: "c-to-f", value: "c-to-f" }
            ]
        }, {
            name: "value",
            description: "The measurement to be converted.",
            type: ApplicationCommandOptionType.Number,
            required: true
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        // Get arguments
        const units: string = args.options.getString("units") as string;
        const value: number = args.options.getNumber("value") as number;

        // Perform the conversion
        let f: number = 0;
        let c: number = 0;
        let msg: string = "";
        if (units === "c-to-f") {
            c = value;
            f = ((9 / 5) * c) + 32;
            msg = `${c} °C = ${f} °F`;
        } else if (units === "f-to-c") {
            f = value;
            c = (f - 32) * (5 / 9);
            msg = `${f} °F = ${c} °C`;
        } else {
            console.log("Something is goofed.");
        }

        // Create embed
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor("#467566")
            .addFields([
                { name: "Fahrenheit:", value: `${f.toFixed(2)} °F` },
                { name: "Celsius:", value: `${c.toFixed(2)} °C` },
            ])

        // Send Discord message
        try {
            await args.interaction.editReply({
                embeds: [ embed ],
            });
        } catch (error) {
            console.error(error);
            await args.interaction.editReply({
                content: "Something went wrong with your request.",
            });
        }
    }
});