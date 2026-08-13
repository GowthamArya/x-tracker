export interface TripExpenseParticipantDetail {
  tripMemberId: number;
  name: string;
  shareAmount: number;
}

export interface TripExpense {
  id: number;
  tripId: number;
  categoryId?: number | null;
  categoryName?: string | null;
  paidByTripMemberId: number;
  paidByMemberName?: string;
  addedByUserId: number;
  description: string;
  amount: number;
  expenseDate: string;
  notes?: string | null;
  createdAt: string;
  isSettlement?: boolean;
  participants?: TripExpenseParticipantDetail[];
}

