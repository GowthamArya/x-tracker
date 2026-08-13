import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonCheckbox,
  IonItem,
  IonList,
  ToastController,
  AlertController,
  IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  saveOutline,
  trashOutline,
  closeOutline,
  calculatorOutline,
  peopleOutline,
  restaurantOutline,
  carOutline,
  bedOutline,
  ticketOutline,
  bagHandleOutline,
  cartOutline,
  swapHorizontalOutline,
  checkmarkOutline
} from 'ionicons/icons';

import { TripExpensesService } from '../../services/trip-expenses.service';
import { TripMembersService } from '../../services/trip-members.service';
import { TripExpenseRequest, ParticipantShareRequest } from '../../models/trip-expense-request.model';
import { TripMember } from '../../models/trip-member.model';

export interface ParticipantShareInput {
  memberId: number;
  memberName: string;
  selected: boolean;
  amount: number | null;
}

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.page.html',
  styleUrls: ['./expense-form.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonSegment,
    IonSegmentButton,
    IonIcon,
    IonCheckbox,
    IonBackButton
  ]
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
  isSettlement = false;

  splitMode: 'equal' | 'custom' = 'equal';
  members: TripMember[] = [];
  participantInputs: ParticipantShareInput[] = [];

  categories = [
    { id: 1, name: 'Food & Dining', icon: 'restaurant-outline' },
    { id: 2, name: 'Transport', icon: 'car-outline' },
    { id: 3, name: 'Accommodation', icon: 'bed-outline' },
    { id: 4, name: 'Activities', icon: 'ticket-outline' },
    { id: 5, name: 'Shopping', icon: 'bag-handle-outline' },
    { id: 6, name: 'General', icon: 'cart-outline' }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly expensesService: TripExpensesService,
    private readonly membersService: TripMembersService,
    private readonly toastCtrl: ToastController,
    private readonly alertCtrl: AlertController
  ) {
    addIcons({
      saveOutline,
      trashOutline,
      closeOutline,
      calculatorOutline,
      peopleOutline,
      restaurantOutline,
      carOutline,
      bedOutline,
      ticketOutline,
      bagHandleOutline,
      cartOutline,
      swapHorizontalOutline,
      checkmarkOutline
    });
  }

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
    }

    this.membersService.getMembers(this.tripId).subscribe({
      next: (m) => {
        this.members = m;
        if (!this.paidByTripMemberId && m.length > 0) {
          const current = m.find(x => x.userId != null) ?? m[0];
          this.paidByTripMemberId = current.id;
        }
        this.initializeParticipantInputs();

        if (this.expenseId) {
          this.loadExpense();
        }
      },
      error: (err) => console.error(err)
    });
  }

  private initializeParticipantInputs(): void {
    this.participantInputs = this.members.map((m) => ({
      memberId: m.id,
      memberName: m.name,
      selected: true,
      amount: null
    }));
  }

  private loadExpense(): void {
    if (this.expenseId === null) return;

    this.expensesService.getExpense(this.tripId, this.expenseId).subscribe({
      next: (e) => {
        this.description = e.description;
        this.amount = e.amount;
        this.categoryId = e.categoryId ?? null;
        this.paidByTripMemberId = e.paidByTripMemberId;
        this.expenseDate = e.expenseDate ? e.expenseDate.split('T')[0] : new Date().toISOString().split('T')[0];
        this.notes = e.notes ?? '';
        this.isSettlement = !!e.isSettlement;

        if (e.participants && e.participants.length > 0) {
          const hasExplicitShares = e.participants.some(p => p.shareAmount && p.shareAmount > 0);
          if (hasExplicitShares) {
            this.splitMode = 'custom';
          }
          this.participantInputs.forEach(pi => {
            const p = e.participants?.find(x => x.tripMemberId === pi.memberId);
            if (p) {
              pi.selected = true;
              pi.amount = p.shareAmount || null;
            } else {
              pi.selected = false;
              pi.amount = null;
            }
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  selectAllParticipants(): void {
    this.participantInputs.forEach(p => p.selected = true);
  }

  deselectAllParticipants(): void {
    this.participantInputs.forEach(p => p.selected = false);
  }

  distributeEqually(): void {
    if (!this.amount || this.amount <= 0) return;
    const selected = this.participantInputs.filter(p => p.selected);
    if (selected.length === 0) return;
    const perPerson = Math.round((this.amount / selected.length) * 100) / 100;
    selected.forEach(p => p.amount = perPerson);
  }

  get customTotal(): number {
    return this.participantInputs
      .filter(p => p.selected)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }

  async save(): Promise<void> {
    if (!this.description.trim()) {
      this.showToast('Please enter a description');
      return;
    }
    if (!this.amount || this.amount <= 0) {
      this.showToast('Please enter a valid amount');
      return;
    }
    if (!this.paidByTripMemberId) {
      this.showToast('Please select who paid for this expense');
      return;
    }

    const selectedParts = this.participantInputs.filter((p) => p.selected);
    if (selectedParts.length === 0) {
      this.showToast('Select at least one participant');
      return;
    }

    const request: TripExpenseRequest = {
      categoryId: this.categoryId ?? undefined,
      paidByTripMemberId: this.paidByTripMemberId!,
      description: this.description.trim(),
      amount: this.amount!,
      expenseDate: this.expenseDate,
      notes: this.notes.trim() || undefined,
      isSettlement: this.isSettlement,
      participantTripMemberIds: selectedParts.map((p) => p.memberId)
    };

    if (this.splitMode === 'custom') {
      const customShares: ParticipantShareRequest[] = selectedParts.map((p) => ({
        tripMemberId: p.memberId,
        shareAmount: p.amount || Math.round((this.amount! / selectedParts.length) * 100) / 100
      }));

      const sum = customShares.reduce((acc, s) => acc + (s.shareAmount || 0), 0);
      if (Math.abs(sum - this.amount!) > 0.5) {
        const confirm = await this.alertCtrl.create({
          header: 'Share Mismatch Warning',
          message: `The sum of custom shares (₹${sum}) does not match the total amount (₹${this.amount}). Do you want to proceed?`,
          buttons: [
            { text: 'Adjust Shares', role: 'cancel' },
            { text: 'Save Anyway', role: 'confirm' }
          ]
        });
        await confirm.present();
        const { role } = await confirm.onDidDismiss();
        if (role !== 'confirm') return;
      }

      request.participantShares = customShares;
    }

    if (this.expenseId) {
      this.expensesService.updateExpense(this.tripId, this.expenseId, request).subscribe({
        next: () => {
          this.showToast('Expense updated');
          this.router.navigate([`/tabs/trips/${this.tripId}`]);
        },
        error: (err) => {
          console.error(err);
          this.showToast('Failed to update expense', 'danger');
        }
      });
    } else {
      this.expensesService.addExpense(this.tripId, request).subscribe({
        next: () => {
          this.showToast('Expense added');
          this.router.navigate([`/tabs/trips/${this.tripId}`]);
        },
        error: (err) => {
          console.error(err);
          this.showToast('Failed to add expense', 'danger');
        }
      });
    }
  }

  async delete(): Promise<void> {
    if (!this.expenseId) return;

    const alert = await this.alertCtrl.create({
      header: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.expensesService.deleteExpense(this.tripId, this.expenseId!).subscribe({
              next: () => {
                this.showToast('Expense deleted');
                this.router.navigate([`/tabs/trips/${this.tripId}`]);
              },
              error: (err) => console.error(err)
            });
          }
        }
      ]
    });
    await alert.present();
  }

  cancel(): void {
    this.router.navigate([`/tabs/trips/${this.tripId}`]);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
