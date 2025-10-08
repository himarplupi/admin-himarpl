import { type RouterOutputs } from "@/trpc/shared";

export type Post = RouterOutputs["post"]["all"][number];
