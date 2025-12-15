import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonList, IonItem, IonLabel, IonSpinner, IonButton
} from '@ionic/angular/standalone';

import { ProductService, ProductoDetalleDto } from '../../services/product.service';

type WishlistVm = {
  idProducto: number;
  nombre: string;
  marca?: string | null;
  categoria?: string | null;
  precioDesde?: number | null;
  moneda?: string | null;
};

@Component({
  standalone: true,
  selector: 'app-wishlist',
  templateUrl: './wishlist.page.html',
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonList, IonItem, IonLabel, IonSpinner, IonButton
  ],
})
export class WishlistPage {
  loading = false;
  items: WishlistVm[] = [];

  constructor( private api:  ProductService, private router: Router) {}

  ionViewWillEnter() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.api.wishlist().pipe(
      switchMap(deseados => {
        if (!deseados || deseados.length === 0) return of([] as ProductoDetalleDto[]);


        return forkJoin(
          deseados.map(d =>
            this.api.detalle(d.idProducto).pipe(catchError(() => of(null as any)))
          )
        ).pipe(
          map(arr => arr.filter(Boolean) as ProductoDetalleDto[])
        );
      }),

      map(detalles => detalles.map(p => {
        const precios =(p.ofertas || []).map(x => x.precioUnitario);
        const precioDesde = precios.length ? Math.min(...precios) : null;
        const moneda =p.ofertas?.[0]?.moneda ?? 'USD';

        return {
          idProducto: p.idProducto,
          nombre: p.nombre|| 'Producto',
          marca: p.marca??null,
          categoria: p.categoria??null,
          precioDesde,
          moneda,
        } as WishlistVm;
      })),
      finalize(() => ( this.loading = false))
    ).subscribe( res => ( this.items = res));
  }

  verDetalle(idProducto: number) {
    this.router.navigate(['/product',idProducto]);
  }
  quitar(idProducto: number) {
    this.api.toggleDeseado(idProducto).subscribe(() => this.cargar());
  }
}
