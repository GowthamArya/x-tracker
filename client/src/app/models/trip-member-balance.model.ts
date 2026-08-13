export interface TripMemberBalance {
  tripMemberId: number;
  name: string;
  totalPaid: number;
  totalShare: number;
  balance: number;
  isCurrentUser: boolean;
}

export interface TripDebt {
  fromTripMemberId: number;
  fromTripMemberName: string;
  toTripMemberId: number;
  toTripMemberName: string;
  amount: number;
  isFromCurrentUser: boolean;
  isToCurrentUser: boolean;
}

export interface TripBalancesSummary {
  balances: TripMemberBalance[];
  debts: TripDebt[];
}

