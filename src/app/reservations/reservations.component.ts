import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReservationService } from '../shared/reservation.service';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css']
})
export class ReservationsComponent implements OnInit {

  disableButton = false;
  form: FormGroup;
  constructor(private reservationService: ReservationService) { }

  onSubmit() {
    this.disableButton = true;
    if (this.form.invalid) {
      return this.disableButton = false;
    }
    this.reservationService.bookNewSeats(this.form.value);
    this.disableButton = false;
  }


  onClearAllSeats() {
    this.reservationService.clearAllSeats();
  }

  ngOnInit() {
    this.form = new FormGroup({
      seatsReq: new FormControl(null, {validators: [Validators.required,
        Validators.pattern(/^[1-7]$/)]})
    });
  }

}
