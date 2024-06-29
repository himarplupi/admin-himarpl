import { type ClassValue, clsx } from "clsx";
import moment from "moment";
import { twMerge } from "tailwind-merge";
import "moment/locale/id";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function momentId(input: string | number | Date | undefined | null) {
  moment.locale("id");
  return moment(input);
}

export function abbreviation(name: string | undefined | null) {
  if (!name) return "";
  return name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .substring(0, 2);
}
