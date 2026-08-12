export interface TripInvite {
  id: number;
  tripId: number;
  token: string;
  createdAt: string;
  expiresAt?: string | null;
  isActive: boolean;
  tripName?: string | null;
}
