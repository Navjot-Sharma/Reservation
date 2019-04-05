import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReservationsComponent } from './reservations/reservations.component';
import { SeatsComponent } from './seats/seats.component';

const routes: Routes = [
  {path: '', component: ReservationsComponent},
  {path: 'seats', component: SeatsComponent},
  {path: '**', component: ReservationsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
