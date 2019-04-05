import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReservationService } from '../shared/reservation.service';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-seats',
  templateUrl: './seats.component.html',
  styleUrls: ['./seats.component.css']
})
export class SeatsComponent implements OnInit, OnDestroy {

  isLoading = true;
  seatsArr = [...Array(80)];
  bookedSeats = [];
  userSeats = [];

  combinedSub: Subscription;
  constructor(private reservationService: ReservationService) { }

  ngOnInit() {
    this.reservationService.getBookedSeats();

    this.combinedSub = combineLatest([
      this.reservationService.BookedSeatsSub,
      this.reservationService.UserSeatsSub
    ])
    .subscribe(([bookedSeatsValue, userSeatsValue]) => {
      this.bookedSeats = bookedSeatsValue;
      this.userSeats = userSeatsValue;
      this.isLoading = false;
    });
  }
  ngOnDestroy() {
    this.combinedSub.unsubscribe();
  }

}
