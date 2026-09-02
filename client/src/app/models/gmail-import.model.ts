export interface GmailImport {
  id: number;
  gmailMessageId: string;
  sender?: string | null;
  subject?: string | null;
  title: string;
  payee?: string | null;
  isUpi: boolean;
  gmailAddress: string;
  amount?: number | null;
  type?: 'income' | 'expense' | null;
  transactionDate?: string | null;
  preview?: string | null;
  confidence: number;
  possibleMatch?: { title: string; amount: number; transactionDate: string; accountName: string } | null;
}
