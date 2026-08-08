import { Routes } from '@angular/router';
import { TabsPage } from './layout/tabs/tabs.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
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
    ],
  },
];
