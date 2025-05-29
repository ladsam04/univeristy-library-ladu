import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { string } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getInitials = (name: string): string => 
  name
  .split(' ')
  .map((part) => part[0]) // Get the first character of each part
  .join('')
  .slice(0, 2) // Limit to two initials
  .toUpperCase();
