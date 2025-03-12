import { Events, Guild, GuildMember, TextChannel } from "discord.js";
import { Event } from "../core/Event";
import { Logger } from "../util/Logger";
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

        // Log event to console
        const logStr: string = `New member in guild ${joinedGuildName} (${joinedGuildId}): ${newMemberTag} (${newMemberId})`;
        Logger.log(logStr, "green");

        // Determine if welcome message should be sent in the joined guild
        if (!await client.settings.isFeatureEnabled(joinedGuildId, "welcome")) {
            return;
        }

        // Check for channel property
        const welcomeChannel: string = await client.settings.getChannelId(joinedGuildId, "welcome");
        console.log(welcomeChannel);
        if (!welcomeChannel) {
            Logger.log(`Error: Welcome messages enabled for guild ${joinedGuildId} but no channel set.`);
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