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
        path: 'trips',
        loadComponent: () => import('./pages/trips/trips.page').then(m => m.TripsPage)
      },
      {
        path: 'trips/create',
        loadComponent: () => import('./pages/trips/create-trip.page').then(m => m.CreateTripPage)
      },
      {
        path: 'trips/:id',
        loadComponent: () => import('./pages/trips/trip-detail.page').then(m => m.TripDetailPage)
      },
      {
        path: 'trips/:id/members',
        loadComponent: () => import('./pages/trips/members.page').then(m => m.MembersPage)
      },
      {
        path: 'trips/:id/invites',
        loadComponent: () => import('./pages/trips/trip-invites.page').then(m => m.TripInvitesPage)
      },
      {
        path: 'trips/:id/expenses/add',
        loadComponent: () => import('./pages/trips/expense-form.page').then(m => m.ExpenseFormPage)
      },
      {
        path: 'trips/:id/expenses/:expenseId',
        loadComponent: () => import('./pages/trips/expense-form.page').then(m => m.ExpenseFormPage)
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
  {
    path: 'join/trip/:token',
    loadComponent: () => import('./pages/join-trip/join-trip.page').then(m => m.JoinTripPage)
  },
  {
    path: 'filters',
    loadComponent: () => import('./pages/filters/filters.page').then( m => m.FilterPage)
  },

];
