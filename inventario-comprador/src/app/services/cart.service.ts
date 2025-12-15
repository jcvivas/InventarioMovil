import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';
import { OfertaDetalleDto } from './product.service';

export type CartItem = {
  idProductoProveedorLote: number;
  nombreProducto: string;
  proveedor?: string | null;
  precioUnitario: number;
  moneda?: string | null;
  cantidad: number;
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly key = 'cart_items';
  private readonly _items$ = new BehaviorSubject<CartItem[]>([]);
  readonly items$ = this._items$.asObservable();

  constructor() {
    void this.load();
  }

  snapshot(): CartItem[] {
    return this._items$.value;
  }

  private async load() {
    const { value } = await Preferences.get({ key: this.key });
    if (!value) return;
    try {
      const parsed = JSON.parse(value) as CartItem[];
      this._items$.next(Array.isArray(parsed) ? parsed : []);
    } catch {
      this._items$.next([]);
    }
  }

  private async save(items: CartItem[]) {
    this._items$.next(items);
    await Preferences.set({ key: this.key, value: JSON.stringify(items) });
  }

  async clear() {
    await this.save([]);
  }

  async addFromOferta(oferta: OfertaDetalleDto, nombreProducto: string) {
    const items = [...this.snapshot()];
    const existing = items.find(x => x.idProductoProveedorLote === oferta.idProductoProveedorLote);

    if (existing) {
      existing.cantidad += 1;
      await this.save(items);
      return;
    }

    items.push({
      idProductoProveedorLote: oferta.idProductoProveedorLote,
      nombreProducto,
      proveedor: oferta.nombreProveedor ?? oferta.codigoProveedor ?? null,
      precioUnitario: oferta.precioUnitario,
      moneda: oferta.moneda ?? null,
      cantidad: 1,
    });

    await this.save(items);
  }

  async setQty(idProductoProveedorLote: number, qty: number) {
    const items = [...this.snapshot()];
    const it = items.find(x => x.idProductoProveedorLote === idProductoProveedorLote);
    if (!it) return;

    it.cantidad = Math.max(1, Math.floor(qty || 1));
    await this.save(items);
  }

  async remove(idProductoProveedorLote: number) {
    const items = this.snapshot().filter(x => x.idProductoProveedorLote !== idProductoProveedorLote);
    await this.save(items);
  }

  total(): number {
    return this.snapshot().reduce((sum, it) => sum + it.precioUnitario * it.cantidad, 0);
  }
}
