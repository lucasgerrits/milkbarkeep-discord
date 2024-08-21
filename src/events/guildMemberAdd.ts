import { Events, GuildMember, TextChannel } from "discord.js";
import { Event } from "../classes/Event";
import { Logger } from "../util/Logger";
import channelIDs from "../../data/channelIDs.json";

export default new Event(
    Events.GuildMemberAdd,
    async (member: GuildMember) => {
        const newMemberID: string = member.id;
        const rulesChannel:string = channelIDs.bombsquad.channels.rules;
        const genChannel: string = channelIDs.bombsquad.channels.general;
        const cfbWave:string = "<a:cfbWave:798474231381491782>";

        const joinedGuild = member.guild.id;
        if (joinedGuild !== channelIDs.bombsquad.id) return;

        const logStr: string = `New member: ${member.user.tag} (${newMemberID})`;
        Logger.log(logStr, "green");

        const welcomeMessage: string = `Hey everyone, let's welcome <@${newMemberID}> to The Bombsquad ! Hello there 🎉👋 ! Please make note of <#${rulesChannel}> and have a good Tim. ${cfbWave}`;

        const channelToWelcomeIn: TextChannel = member.guild.channels.cache.get(genChannel) as TextChannel;
        await channelToWelcomeIn.send({
            "content": welcomeMessage,
            "allowedMentions": { "users": [ newMemberID ] },
        });
    }
);