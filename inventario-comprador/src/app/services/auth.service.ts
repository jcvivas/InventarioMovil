import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

type LoginResponse = {
  isSuccess: boolean;
  message: string;
  data: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  async login(correo: string, contrasena: string): Promise<string> {
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiBaseUrl}/api/v1/auth/login`, {
        correo,
        contrasena,
      })
    );

    if (!res?.isSuccess) throw new Error(res?.message || 'Credenciales inválidas.');

    const token = (res?.data || '').trim();
    if (!token) throw new Error('El login no devolvió token.');

    await Preferences.set({ key: this.tokenKey, value: token });
    return token;
  }

  async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.tokenKey });
    return value ?? null;
  }

  async logout(): Promise<void> {
    await Preferences.remove({ key: this.tokenKey });
  }
}
