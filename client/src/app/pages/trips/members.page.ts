import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TripMembersService } from '../../services/trip-members.service';
import { TripMember } from '../../models/trip-member.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonInput, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-trip-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
  imports: [CommonModule, FormsModule, IonContent, IonInput, IonButton]
})
export class MembersPage implements OnInit {
  tripId = 0;
  members: TripMember[] = [];
  userIdToAdd: number | null = null;

  constructor(private readonly route: ActivatedRoute, private readonly membersService: TripMembersService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (Number.isNaN(id)) {
      return;
    }

    this.tripId = id;
    this.load();
  }

  private load(): void {
    this.membersService.getMembers(this.tripId).subscribe({ next: (m) => (this.members = m), error: (err) => console.error(err) });
  }

  addExistingUser(): void {
    if (this.userIdToAdd === null) {
      return;
    }

    this.membersService.addMember(this.tripId, this.userIdToAdd).subscribe({ next: () => this.load(), error: (err) => console.error(err) });
  }
}
