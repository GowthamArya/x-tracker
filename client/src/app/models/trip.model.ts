export interface Trip {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdByUserId: number;
  createdAt: string;
  memberCount: number;
  expenseCount: number;
  // optional UI helpers
  totalPaid?: number;
  yourShare?: number;
}
