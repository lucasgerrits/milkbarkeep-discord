import { UserRecentAchievement } from "@retroachievements/api";

export type userPoints = {
    userName: string,
    points: number
}

export interface achievementData extends UserRecentAchievement {
    userName: string,
}