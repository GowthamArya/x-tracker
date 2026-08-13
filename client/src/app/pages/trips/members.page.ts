import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonInput, IonButton, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddOutline, linkOutline, checkmarkOutline, trashOutline } from 'ionicons/icons';
import { TripMembersService } from '../../services/trip-members.service';
import { TripMember } from '../../models/trip-member.model';
import { AuthService, CurrentUser } from '../../services/auth.service';

@Component({
  selector: 'app-trip-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonInput, IonButton, IonIcon]
})
export class MembersPage implements OnInit {
  tripId = 0;
  members: TripMember[] = [];
  currentUser: CurrentUser | null = null;
  userIdToAdd: number | null = null;
  guestName = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly membersService: TripMembersService,
    private readonly toastCtrl: ToastController,
    private readonly alerts: AlertController,
    private readonly auth: AuthService,
  ) {
    addIcons({ personAddOutline, linkOutline, checkmarkOutline, trashOutline });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isNaN(id)) return;

    this.tripId = id;
    this.auth.getCurrentUser().subscribe(user => this.currentUser = user);
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

  canRemove(member: TripMember): boolean {
    return this.isOrganizer && !member.isOwner;
  }

  get isOrganizer(): boolean {
    return this.members.some(member => member.isOwner && member.userId === Number(this.currentUser?.id));
  }

  async confirmRemove(member: TripMember): Promise<void> {
    const alert = await this.alerts.create({
      header: 'Remove member?',
      message: `Remove ${member.name} from this trip? Their existing expenses must be updated first.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Remove', role: 'destructive', handler: () => this.removeMember(member) },
      ],
    });
    await alert.present();
  }

  private removeMember(member: TripMember): void {
    this.membersService.removeMember(this.tripId, member.id).subscribe({
      next: () => {
        this.members = this.members.filter(item => item.id !== member.id);
        this.showToast(`${member.name} was removed.`);
      },
      error: error => this.showToast(
        typeof error?.error === 'string' ? error.error : 'Unable to remove this member.'
      ),
    });
  }

  private async showToast(msg: string): Promise<void> {
    const toast = await this.toastCtrl.create({ message: msg, duration: 1500, position: 'bottom' });
    await toast.present();
  }
}
