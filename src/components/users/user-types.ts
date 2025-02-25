import { type RouterOutputs } from "@/trpc/shared";

export type User = RouterOutputs["user"]["all"][number];
