import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export type ProductoBusquedaDto = {
  idProducto: number;
  codigo?: string | null;
  nombre?: string | null;
  marca?: string | null;
  categoria?: string | null;
  urlImagen?: string | null;
  activo: boolean;
  precioDesde: number;
  stockTotalParaVenta: number;
  moneda?: string | null;
  esDeseado: boolean;
};

export type OfertaDetalleDto = {
  idProductoProveedorLote: number;
  idProveedor: number;
  codigoProveedor?: string | null;
  nombreProveedor?: string | null;
  numeroLote?: string | null;
  precioUnitario: number;
  stockParaVenta: number;
  moneda?: string | null;
  fechaVencimiento?: string | null;
  ofertaActiva: boolean;
};

export type ProductoDetalleDto = {
  idProducto: number;
  codigo?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  marca?: string | null;
  categoria?: string | null;
  urlImagen?: string | null;
  activo: boolean;
  esDeseado: boolean;
  ofertas: OfertaDetalleDto[];
};

export type DeseadoDto = {
  idProducto: number;
  fechaAgregadoUtc: string;
};

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  buscar(texto?: string): Observable<ProductoBusquedaDto[]> {
    const q = (texto ?? '').trim();


    if (q.length === 0) {
      return this.http.get<ProductoBusquedaDto[]>(
        `${environment.apiBaseUrl}/api/v1/comprador/productos/buscar`
      );
    }
    const params = new HttpParams().set('texto', q);
    return this.http.get<ProductoBusquedaDto[]>(
      `${environment.apiBaseUrl}/api/v1/comprador/productos/buscar`,
      { params }
    );
  }

  buscarOListar(texto?: string) {
    const q = (texto ?? '').trim();
    const textoQuery = q.length > 0 ? q : '%';
    const params = new HttpParams().set('texto', textoQuery);

    return this.http.get<ProductoBusquedaDto[]>(
      `${environment.apiBaseUrl}/api/v1/comprador/productos/buscar`,
      { params }
    );
  }

  detalle(idProducto: number) {
    return this.http.get<ProductoDetalleDto>(
      `${environment.apiBaseUrl}/api/v1/comprador/productos/${idProducto}`
    );
  }

  wishlist() {
    return this.http.get<DeseadoDto[]>(
      `${environment.apiBaseUrl}/api/v1/comprador/deseados`
    );
  }

  toggleDeseado(idProducto: number) {
    return this.http.post(
      `${environment.apiBaseUrl}/api/v1/comprador/deseados/${idProducto}/toggle`,
      {}
    );
  }

  comprar(
    moneda: string,
    detalles: { idProductoProveedorLote: number; cantidad: number }[]
  ) {
    return this.http.post(
      `${environment.apiBaseUrl}/api/v1/comprador/compras/procesar`,
      { moneda, detalles }
    );
  }
  
}
