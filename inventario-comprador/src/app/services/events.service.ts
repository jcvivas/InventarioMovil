import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private _purchaseDone$ = new Subject<void>();
  purchaseDone$ = this._purchaseDone$.asObservable();

  notifyPurchaseDone() {
    this._purchaseDone$.next();
  }
}
