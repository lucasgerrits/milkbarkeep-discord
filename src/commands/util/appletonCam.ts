import { ApplicationCommandOptionType, Channel, ChannelType, PermissionFlagsBits, TextChannel } from "discord.js";
import { Command } from "../../classes/Command";
import { SeleniumWebDriver } from "../../integrations/SeleniumWebDriver";

export default new Command({
    name: "appleton-cam",
    description: "Posts a screenshot from an Appleton based webcam.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        const driver: SeleniumWebDriver = new SeleniumWebDriver();
        const screenString: string = await driver.getAppletonCamScreen();
        const base64Data: string = screenString.replace(/^data:image\/png;base64,/, '');
        const buffer: Buffer = Buffer.from(base64Data, "base64");

        try {
            await args.interaction.editReply({
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