export interface Account {
  id: number;
  userId?: number;
  name: string;
  openingBalance: number;
  accountType: 'personal' | 'joint';
  memberCount?: number;
  isOwner?: boolean;
}
