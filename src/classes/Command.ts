import { ChatInputApplicationCommandData, PermissionFlagsBits, PermissionResolvable, } from "discord.js";
import type { CommandType, RunFunction } from "../types/CommandTypes";

export class Command implements ChatInputApplicationCommandData {
    public defaultMemberPermissions: PermissionResolvable | null | undefined = PermissionFlagsBits.UseApplicationCommands
    public name: string;
    public description: string;
    public run: RunFunction;
    public options?;

    constructor(commandData: CommandType) {
        this.name = commandData.name;
        this.description = commandData.description;
        this.run = commandData.run;
        this.options = commandData.options || [];
        this.setPerms(commandData.defaultMemberPermissions);
    }

    private setPerms(perms: PermissionResolvable | null | undefined): void {
        if (perms !== null && perms !== undefined) {
            this.defaultMemberPermissions = perms;
        }
    }
}