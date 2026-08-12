export interface TripExpenseRequest {
  categoryId?: number | null;
  paidByTripMemberId: number;
  // addedByUserId is set by server
  description: string;
  amount: number;
  expenseDate: string;
  notes?: string | null;
  participantTripMemberIds: number[];
}
