export interface TripMemberBalance {
  tripMemberId: number;
  name: string;
  totalPaid: number;
  totalShare: number;
  balance: number;
  isCurrentUser: boolean;
}
