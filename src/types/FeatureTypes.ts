import { z } from "zod";

export const BirthdaysSchema = z.array(
    z.object({
        date: z.string().regex(/^\d{2}-\d{2}$/), // Ensures MM-DD format
        user: z.string(),
        userId: z.string().regex(/^\d+$/) // Ensures numeric string
    })
);

export type BirthdaysJson = {
    userId: string;
    date: string;
}

export type EmbedFixUrls = {
    oldUrl: string;
    oldDomain: string;
    newDomain: string;
    newUrl: string;
}

export interface OddballData {
    userID: string;
    userName: string;
    lastPickup?: string;
    lastDrop?: string;
    score: number;
    lastIncrease?: number;
    rank: number;
    hasBall: boolean;
}