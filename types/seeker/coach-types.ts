
export interface CoachService {
  id: string;
  name: string;
  description?: string | null;
  sessionType: string;
  durationMinutes: number;
  price: number;
  currency: string;
  isFree: boolean;
}

export interface CoachProfile {
  profileImageUrl: string;
  headline: string;
  bio: string;
  specialization: string;
  experienceYears: number;
  qualifications: string;
  languages: string[];
  linkedinUrl: string;
}

export interface Coach {
  id: string;
  name: string;
  profileCompleted: boolean;
  profile: CoachProfile | null;
  services: CoachService[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CoachDirectoryResponse {
  success: boolean;
  data: Coach[];
  pagination: Pagination;
  message?: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface CoachAvailabilityResponse {
  success: boolean;
  message?: string;
  data: {
    coachId: string;
    serviceId: string;
    date: string;
    durationMinutes: number;
    timezone: string;
    slots: AvailableSlot[];
  };
}

export interface CreateBookingPayload {
  coachId: string;
  serviceId: string;
  sessionDate: string;
  startTime: string;
  timezone: string;
}

export interface BookingResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

export function getInitials(name: string) {
  if (!name?.trim()) return "C";

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatPrice(service: CoachService) {
  if (service.isFree || Number(service.price) === 0) return "Free";

  const currency = service.currency || "INR";
  const amount = Number(service.price);

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function formatSessionType(sessionType: string) {
  if (!sessionType) return "Session";

  return sessionType
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function isGroupSession(sessionType: string) {
  return !!sessionType?.toLowerCase().includes("group");
}

export function getStartingPrice(services: CoachService[]) {
  if (!services.length) return null;

  const cheapest = [...services].sort(
    (a, b) =>
      (a.isFree ? 0 : Number(a.price)) -
      (b.isFree ? 0 : Number(b.price))
  )[0];

  const label = formatPrice(cheapest);
  return label === "Free" ? "Free" : `From ${label}`;
}
