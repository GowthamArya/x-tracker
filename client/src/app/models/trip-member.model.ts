export interface TripMember {
  id: number;
  userId?: number | null;
  name: string;
  email?: string | null;
  joinedAt: string;
  isOwner: boolean;
}
