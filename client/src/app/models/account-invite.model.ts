export interface AccountInvite {
  id: number;
  accountId: number;
  token: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  accountName?: string;
}
