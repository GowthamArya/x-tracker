import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TripExpensesService } from '../../services/trip-expenses.service';
import { TripMembersService } from '../../services/trip-members.service';
import { TripExpenseRequest } from '../../models/trip-expense-request.model';
import { TripMember } from '../../models/trip-member.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.page.html',
  styleUrls: ['./expense-form.page.scss'],
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonLabel, IonInput, IonSelect, IonSelectOption]
})
export class ExpenseFormPage implements OnInit {
  tripId = 0;
  expenseId: number | null = null;

  description = '';
  amount: number | null = null;
  categoryId: number | null = null;
  paidByTripMemberId: number | null = null;
  expenseDate = new Date().toISOString().split('T')[0];
  notes = '';
  members: TripMember[] = [];
  selectedParticipants: number[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly expensesService: TripExpensesService,
    private readonly membersService: TripMembersService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (Number.isNaN(id)) {
      this.router.navigate(['/tabs/trips']);
      return;
    }

    this.tripId = id;

    const expenseParam = this.route.snapshot.paramMap.get('expenseId');
    if (expenseParam) {
      this.expenseId = Number(expenseParam);
      this.loadExpense();
    }

    this.membersService.getMembers(this.tripId).subscribe({ next: (m) => (this.members = m), error: (err) => console.error(err) });
  }

  private loadExpense(): void {
    if (this.expenseId === null) return;

    this.expensesService.getExpense(this.tripId, this.expenseId).subscribe({
      next: (e) => {
        this.description = e.description;
        this.amount = e.amount;
        this.categoryId = e.categoryId ?? null;
        this.paidByTripMemberId = e.paidByTripMemberId;
        this.expenseDate = e.expenseDate.split('T')[0];
        this.notes = e.notes ?? '';
      },
      error: (err) => console.error(err)
    });
  }

  save(): void {
    if (!this.description.trim() || !this.amount || !this.paidByTripMemberId) {
      return;
    }

    const request: TripExpenseRequest = {
      categoryId: this.categoryId ?? undefined,
      paidByTripMemberId: this.paidByTripMemberId!,
      description: this.description.trim(),
      amount: this.amount!,
      expenseDate: this.expenseDate,
      notes: this.notes.trim() || undefined,
      participantTripMemberIds: this.selectedParticipants.length ? this.selectedParticipants : this.members.map(m => m.id)
    };

    if (this.expenseId) {
      this.expensesService.updateExpense(this.tripId, this.expenseId, request).subscribe({ next: () => this.router.navigate([`/tabs/trips/${this.tripId}`]), error: (err) => console.error(err) });
    } else {
      this.expensesService.addExpense(this.tripId, request).subscribe({ next: () => this.router.navigate([`/tabs/trips/${this.tripId}`]), error: (err) => console.error(err) });
    }
  }

  delete(): void {
    if (!this.expenseId) return;

    this.expensesService.deleteExpense(this.tripId, this.expenseId).subscribe({ next: () => this.router.navigate([`/tabs/trips/${this.tripId}`]), error: (err) => console.error(err) });
  }

  cancel(): void {
    this.router.navigate([`/tabs/trips/${this.tripId}`]);
  }
}
