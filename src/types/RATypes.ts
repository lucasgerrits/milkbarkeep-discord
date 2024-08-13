import { UserRecentAchievement } from "@retroachievements/api";

export type userPoints = {
    username: string,
    points: number
}

export interface achievementData extends UserRecentAchievement {
    username: string,
}