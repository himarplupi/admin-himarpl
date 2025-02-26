import type { Position as DefaultPosition } from "@prisma/client";

export interface Position extends DefaultPosition {
  users?: {
    id: string;
    name: string | null;
    image: string | null;
    email: string | null;
  }[];
}