import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonInput, IonButton, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddOutline, linkOutline, checkmarkOutline } from 'ionicons/icons';
import { TripMembersService } from '../../services/trip-members.service';
import { TripMember } from '../../models/trip-member.model';

@Component({
  selector: 'app-trip-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonInput, IonButton, IonIcon]
})
export class MembersPage implements OnInit {
  tripId = 0;
  members: TripMember[] = [];
  userIdToAdd: number | null = null;
  guestName = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly membersService: TripMembersService,
    private readonly toastCtrl: ToastController
  ) {
    addIcons({ personAddOutline, linkOutline, checkmarkOutline });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isNaN(id)) return;

    this.tripId = id;
    this.load();
  }

  private load(): void {
    this.membersService.getMembers(this.tripId).subscribe({
      next: (m) => (this.members = m),
      error: (err) => console.error(err)
    });
  }

  addExistingUser(): void {
    if (this.userIdToAdd === null) return;

    this.membersService.addMember(this.tripId, this.userIdToAdd).subscribe({
      next: async () => {
        this.userIdToAdd = null;
        this.showToast('Member added');
        this.load();
      },
      error: (err) => console.error(err)
    });
  }

  addGuest(): void {
    if (!this.guestName.trim()) return;

    this.membersService.addGuestMember(this.tripId, this.guestName.trim()).subscribe({
      next: async () => {
        this.guestName = '';
        this.showToast('Guest member added');
        this.load();
      },
      error: (err) => console.error(err)
    });
  }

  private async showToast(msg: string): Promise<void> {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1500, position: 'bottom' });
    await toast.present();
  }
}
