import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKes(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return "KES 0";
  return `KES ${Number(amount).toLocaleString("en-KE")}`;
}

export function formatKenyanPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("254") && cleaned.length === 12) {
    return `+254 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return `+254 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export function formatDateEAT(dateString: string | Date | undefined): string {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatRelativeTime(dateString: string | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return formatDateEAT(date);
}

// ==============================================================================
// KENYAN GEOGRAPHIC & OPERATIONAL CONSTANTS
// ==============================================================================

export const KENYAN_COUNTIES = [
  "Nairobi",
  "Kiambu",
  "Mombasa",
  "Nakuru",
  "Kisumu",
  "Machakos",
  "Kajiado",
  "Uasin Gishu",
  "Kilifi",
  "Meru",
] as const;

export const NAIROBI_SUBCOUNTIES = [
  "Westlands",
  "Kilimani / Kileleshwa",
  "Kasarani",
  "Embakasi",
  "CBD / Starehe",
  "Lang'ata",
  "Dagoretti",
  "Roysambu",
  "Ruaraka",
  "Parklands / Highridge",
  "Karen",
  "Ngong Road Corridor",
  "Thika Road Corridor",
  "Eastleigh / Kamukunji",
  "South B / South C",
] as const;

export const SUPPORTED_MOBILITY_PLATFORMS = [
  "Uber",
  "Bolt",
  "Little",
  "Faras",
  "Yango",
  "Independent / Chapa",
] as const;

export const VEHICLE_MAKE_MODELS: Record<string, string[]> = {
  Toyota: ["Fielder", "Axio", "Vitz", "Probox", "Succeed", "Premio", "Belta", "Noah", "Prius"],
  Nissan: ["Note", "Tiida", "Sylphy", "Wingroad", "Serena", "AD Van"],
  Honda: ["Fit", "Grace", "Insight", "Freed", "Civic"],
  Mazda: ["Demio", "Axela", "CX-3", "Premacy"],
  Suzuki: ["Alto", "Swift", "Dzire", "Ertiga"],
  Electric: ["Roam Air / EV Shuttle", "BasiGo", "Opibus / Roam Rapid", "BYD e6"],
};
