import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Command } from "../../core/Command";
import { Convert } from "../../util/Convert";

export default new Command({
    name: "convert-temperature",
    description: "Convert a temperature from one unit of measurement to another.",
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
            f = Convert.cToF(c);
            msg = `${c} °C = ${f} °F`;
        } else if (units === "f-to-c") {
            f = value;
            c = Convert.fToC(f);
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