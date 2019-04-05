import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment as env} from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';


@Injectable({providedIn: 'root'})
export class ReservationService {

  // subjects to send seats data to other components
  private bookedSeatsSub = new BehaviorSubject<[]>([]);
  private userSeatsSub = new BehaviorSubject<[]>([]);

  constructor(private http: HttpClient,
              private router: Router,
              private dialog: MatDialog) {}


  get BookedSeatsSub() {
    return this.bookedSeatsSub.asObservable();
  }
  get UserSeatsSub() {
    return this.userSeatsSub.asObservable();
  }

  // receive an array of all the booked seats
  getBookedSeats() {
    this.http.get<[]>(env.url + 'reservations/seats')
    .subscribe(response => {
      this.bookedSeatsSub.next(response);
    });
  }

  // to make new reservation
  bookNewSeats(body) {
    this.http.post<{message: string, result: []}>(env.url + 'reservations', body)
    .subscribe(response => {
      if (!response.result) {    // if reservation failed display error message
        this.dialog.open(DialogComponent, {data: {message: response.message}});
        return;
      }

      this.userSeatsSub.next(response.result);
      this.router.navigate(['/seats']);
    });
  }

  // this is solely for testing purposes so that multiple testing can be
  // possible without having to go to database to empty seats
  // when all seats are reserved
  clearAllSeats() {
    this.http.delete(env.url + 'reservations').subscribe(response => {
      this.getBookedSeats();
    });
  }
}
