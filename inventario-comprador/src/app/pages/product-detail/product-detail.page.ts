import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonSpinner, IonButton, IonItem, IonLabel, IonList, IonNote, IonButtons } from '@ionic/angular/standalone';

import { ToastController } from '@ionic/angular/standalone';
import { ProductService, ProductoDetalleDto, OfertaDetalleDto } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  standalone: true,
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  imports: [IonButtons, 
    CommonModule,
    RouterLink,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonSpinner, IonButton, IonItem, IonLabel, IonList, IonNote
  ],
})
export class ProductDetailPage {
  loading = false;
  producto: ProductoDetalleDto | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ProductService,
    private cart: CartService,
    private toast: ToastController
  ) {}

  ionViewWillEnter() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      void this.showToast('ID de producto inválido.');
      return;
    }

    this.load(id);
  }

  private load(id: number) {
    this.loading = true;
    this.api.detalle(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.producto = { ...res, ofertas: Array.isArray(res.ofertas) ? res.ofertas : [] };
        },
        error: async (err) => {
          this.producto = null;
          await this.showToast(err?.error?.message || 'No se pudo cargar el detalle.');
        }
      });
  }

  async toggleDeseado() {
    if (!this.producto) return;

    try {
      await firstValueFrom(this.api.toggleDeseado(this.producto.idProducto));
      this.producto.esDeseado = !this.producto.esDeseado;

      await this.showToast(this.producto.esDeseado ? 'Agregado a deseados' : 'Quitado de deseados');
    } catch (err: any) {
      await this.showToast(err?.error?.message || 'No se pudo actualizar “deseados”.');
    }
  }
  goBack() {
    window.history.back();
  }
  async addToCart(oferta: OfertaDetalleDto) {
    if (!this.producto) return;

    if ((oferta.stockParaVenta ?? 0) <= 0) {
      await this.showToast('Sin stock disponible.');
      return;
    }

    await this.cart.addFromOferta(oferta, this.producto.nombre || 'Producto');
    await this.showToast('Agregado al carrito ✅');
  }

  private async showToast(message: string) {
    const t = await this.toast.create({
      message,
      duration: 1800,
      position: 'bottom',
    });
    await t.present();
  }
}
