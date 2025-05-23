import { Events, Guild, GuildMember, TextChannel } from "discord.js";
import { Event } from "../core/Event";
import { client } from "..";

export default new Event(
    Events.GuildMemberAdd,
    async (member: GuildMember) => {
        // Strucutre event details
        const joinedGuildId = member.guild.id;
        const joinedGuild: Guild = await client.guilds.fetch(joinedGuildId).catch(() => null) as Guild;
        const joinedGuildName: string = joinedGuild.name;
        const newMemberId: string = member.id;
        const newMemberTag: string = member.user.tag;

        client.logger.bot(`${joinedGuildName} - New member ${newMemberTag} (${newMemberId})`);

        // Determine if welcome message should be sent in the joined guild
        if (!await client.settings.isFeatureEnabled(joinedGuildId, "welcome")) {
            return;
        }

        // Check for channel property
        const welcomeChannel: string = await client.settings.getChannelId(joinedGuildId, "welcome");
        if (!welcomeChannel) {
            client.logger.err(`${joinedGuildName} - Welcome messages enabled, but no channel set.`);
            return;
        }

        // Determine appropriate welcome message
        const defaultWelcomeMessage: string = `Hey everyone, let's welcome <@${newMemberId}> to the server! Hello there! 🎉👋 Please make note of the rules and have a good Tim.`;
        let welcomeMessage: string | undefined = await client.settings.getWelcomeMessage(joinedGuildId);
        if (!welcomeMessage) {
            welcomeMessage = defaultWelcomeMessage;
        } else {
            welcomeMessage = welcomeMessage.replace("{newMember}", `<@${newMemberId}>`);
        }

        // Get id of channel to welcome in and send off the message
        const channelToWelcomeIn: TextChannel = member.guild.channels.cache.get(welcomeChannel) as TextChannel;
        await channelToWelcomeIn.send({
            "content": welcomeMessage,
            "allowedMentions": { "users": [ newMemberId ] },
        });
    }
);