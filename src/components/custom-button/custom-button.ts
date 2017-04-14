import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Generated class for the CustomButton component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'custom-button',
  templateUrl: 'custom-button.html'
})
export class CustomButton {

  @Input('text') text;
  @Input('icon') icon;

  @Output() notify: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
    /*console.log('Hello CustomButton Component');
    this.text = 'Hello World';*/
  }

  onClick(param: any = null) {
    console.log('click on custom button');
    this.notify.emit();
  }
}
