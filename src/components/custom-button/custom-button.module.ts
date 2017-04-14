import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { CustomButton } from './custom-button';

@NgModule({
  declarations: [
    CustomButton,
  ],
  imports: [
    IonicModule
  ],
  exports: [
    CustomButton
  ]
})
export class CustomButtonModule {}
