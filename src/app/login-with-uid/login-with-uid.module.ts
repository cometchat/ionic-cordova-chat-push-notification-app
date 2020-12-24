import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginWithUidPageRoutingModule } from './login-with-uid-routing.module';

import { LoginWithUidPage } from './login-with-uid.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginWithUidPageRoutingModule
  ],
  declarations: [LoginWithUidPage]
})
export class LoginWithUidPageModule {}
