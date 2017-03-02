import { Injectable, Pipe, PipeTransform } from '@angular/core';

/*
  Generated class for the Truncate pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'truncate'
})
@Injectable()
export class TruncatePipe implements PipeTransform {
  transform(value, args) {
    let limit = args.length > 0 ? parseInt(args[0], 10) : 10;
    let trail = args.length > 1 ? args[1] : '...';

    return value.length > limit ? value.substring(0, limit) + trail : value;
  }
}
