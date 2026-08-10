import { Routes } from '@angular/router';
import { TabsPage } from './layout/tabs/tabs.page';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then(
            (m) => m.DashboardPage
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./pages/transactions/transactions.page').then(
            (m) => m.TransactionsPage
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/reports/reports.page').then(
            (m) => m.ReportsPage
          ),
      },
      {
        path: 'more',
        loadComponent: () =>
          import('./pages/more/more.page').then(
            (m) => m.MorePage
          ),
      },
      {
        path: 'add-transaction',
        loadComponent: () =>
          import('./pages/add-transaction/add-transaction.page').then(
            (m) => m.AddTransactionPage
          ),
      },
      {
        path: 'accounts',
        loadComponent: () => import('./pages/accounts/accounts.page').then( m => m.AccountsPage)
      },
      
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
];
