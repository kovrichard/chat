import { type ClassValue, clsx } from "clsx";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FormState = {
  message: string;
  description: string;
};

export const initialState: FormState = {
  message: "",
  description: "",
};

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

export function formatTimeAgo(date: Date) {
  return timeAgo.format(date);
}

export function debounce(func: Function, wait = 100) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function ensure(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
