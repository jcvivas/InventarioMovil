import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  finalize,
  switchMap,
  tap,
  shareReplay,
} from 'rxjs/operators';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonSearchbar,
  IonNote,
  IonRefresher,
  IonRefresherContent,
  IonButtons, IonButton } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { EventsService } from '../../services/events.service';

import {
  ProductService,
  ProductoBusquedaDto,
} from '../../services/product.service';

@Component({
  standalone: true,
  selector: 'app-products',
  templateUrl: './products.page.html',
  imports: [IonButton, 
    IonButtons,
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonSearchbar,
    IonNote,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class ProductsPage {
  loading = false;
  errorMsg: string | null = null;
  private sub?: Subscription;

  private queryValue = '';
  private readonly query$ = new BehaviorSubject<string>('');

  readonly productos$ = this.query$.pipe(
    debounceTime(250),
    tap(() => {
      this.loading = true;
      this.errorMsg = null;
    }),
    switchMap((q) =>
      this.api.buscarOListar(q).pipe(
        catchError((err) => {
          this.errorMsg = err?.error?.message || 'No se pudo cargar productos.';
          return of([] as ProductoBusquedaDto[]);
        }),
        finalize(() => (this.loading = false))
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private api: ProductService,
    private router: Router,
    private events: EventsService
  ) {}

  ionViewWillEnter() {
    this.queryValue = '';
    this.query$.next('');
    this.sub?.unsubscribe();
    this.sub = this.events.purchaseDone$.subscribe(() => {
      this.query$.next(this.queryValue);
    });
  }

  ionViewWillLeave() {
    this.sub?.unsubscribe();
    this.sub = undefined;
  }

  onQuery(ev: any) {
    const value = (ev?.detail?.value ?? '').toString();
    this.queryValue = value;
    this.query$.next(value);
  }

  doRefresh(ev: CustomEvent) {
    this.query$.next(this.queryValue);
    (ev.target as any).complete();
  }

  verDetalle(idProducto: number) {
    this.router.navigate(['/product', idProducto]);
  }
}
