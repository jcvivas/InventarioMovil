import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { EventsService } from '../../services/events.service';

import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonList, IonItem, IonLabel, IonButton, IonNote, IonInput
} from '@ionic/angular/standalone';

import { ToastController } from '@ionic/angular/standalone';
import { CartService, CartItem } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

@Component({
  standalone: true,
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonList, IonItem, IonLabel, IonButton, IonNote, IonInput
  ],
})
export class CartPage {
  loading = false;

  constructor(
  public cart: CartService,
  private api: ProductService,
  private toast: ToastController,
  private events: EventsService
) {}

  async inc(it: CartItem) {
    await this.cart.setQty(it.idProductoProveedorLote, it.cantidad + 1);
  }

  async dec(it: CartItem) {
    await this.cart.setQty(it.idProductoProveedorLote, Math.max(1, it.cantidad - 1));
  }

  async setQty(it: CartItem, value: any) {
    const n = Number(value);
    await this.cart.setQty(it.idProductoProveedorLote, isNaN(n) ? 1 : n);
  }

  async remove(it: CartItem) {
    await this.cart.remove(it.idProductoProveedorLote);
    await this.showToast('Quitado del carrito');
  }

  async checkout(items: CartItem[]) {
    if (!items.length) {
      await this.showToast('Tu carrito está vacío.');
      return;
    }

    const moneda = items[0].moneda ?? 'USD';
    const mixed = items.some(x => (x.moneda ?? 'USD') !== moneda);
    if (mixed) {
      await this.showToast('No se puede comprar con monedas mezcladas.');
      return;
    }

    const detalles = items.map(x => ({
      idProductoProveedorLote: x.idProductoProveedorLote,
      cantidad: x.cantidad
    }));

    try {
      this.loading = true;
      await firstValueFrom(this.api.comprar(moneda, detalles));
      this.events.notifyPurchaseDone(); 
      await this.cart.clear();
      await this.showToast('Compra procesada con exito');
    } catch (err: any) {
      await this.showToast(err?.error?.message || 'No se pudo procesar la compra.');
    } finally {
      this.loading = false;
    }
  }

  total(): number {
    return this.cart.total();
  }

  private async showToast(message: string) {
    const t = await this.toast.create({ message, duration: 1800, position: 'bottom' });
    await t.present();
  }
}
