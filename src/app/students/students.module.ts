import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentsComponent } from './students.component';

@NgModule({
  imports: [
    DashboardRoutingModule,
    CommonModule
  ],
  declarations: [StudentsComponent]
})
export class StudentsModule { }
