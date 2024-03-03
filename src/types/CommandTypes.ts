import { 
    ChatInputApplicationCommandData, 
    CommandInteraction, 
    CommandInteractionOptionResolver, 
    GuildMember, 
    PermissionResolvable} from "discord.js";
import { ExtendedClient } from "../classes/ExtendedClient";

export interface ExtendedInteraction extends CommandInteraction {
    member: GuildMember;
}

interface RunArgs {
    client: ExtendedClient,
    interaction: ExtendedInteraction,
    options: CommandInteractionOptionResolver
}

export type RunFunction = (args: RunArgs) => any;

export type CommandType = {
    userPermissions?: PermissionResolvable[];
    cooldown?: number;
    run: RunFunction;
} & ChatInputApplicationCommandData