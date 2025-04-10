import { PermissionFlagsBits } from "discord.js";
import { AppletonCam } from "../../core/AppletonCam";
import { Command } from "../../core/Command";

export default new Command({
    name: "appleton-cam",
    description: "Posts a screenshot from an Appleton based webcam.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        const buffer: Buffer = await AppletonCam.getScreenBuffer(args.client);
        const embed = await AppletonCam.createEmbed();

        // Send Discord message
        try {
            await args.interaction.editReply({
                embeds: [ embed ],
                files: [{
                    attachment: buffer,
                    name: "cam.png"
                }]
            });
        } catch (error) {
            console.log(error);
            await args.interaction.editReply({ content: "Something went wrong with sending the message." });
        }
    }
});