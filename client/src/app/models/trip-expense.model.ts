export interface TripExpense {
  id: number;
  tripId: number;
  categoryId?: number | null;
  paidByTripMemberId: number;
  addedByUserId: number;
  description: string;
  amount: number;
  expenseDate: string;
  notes?: string | null;
  createdAt: string;
}
