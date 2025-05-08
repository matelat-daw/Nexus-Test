import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [MsalService]
})
export class AppComponent implements OnInit {
  title = 'Nexus-Test';
  constructor(private http: HttpClient, private authService: MsalService) {
    this.authService.instance.initialize().then(() => {
      // MSAL está inicializado y listo para usar
      console.log('MSAL inicializado correctamente');
    }).catch(error => {
      console.error('Error al inicializar MSAL:', error);
    });
  }
  ngOnInit(): void {
    window.addEventListener('load', () => {
      // Configurar el callback para manejar la respuesta de Google
      (window as any).handleCredentialResponse = (response: any) => {
        console.log('Token de Google:', response.credential);
        this.verifyTokenWithBackend(response.credential);
      };
      // Cargar el script de Google de forma segura
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    });
  }

  // async login() {
  //   try {
  //     await this.authService.instance.initialize();
  //     const response = await this.authService.loginRedirect();
  //     // El token se obtiene automáticamente después del redirect
  //     this.authService.instance.acquireTokenSilent({
  //       scopes: ['user.read']
  //     }).then(tokenResponse => {
  //       this.verifyMicrosoftTokenWithBackend(tokenResponse.accessToken);
  //     });
  //   } catch (error) {
  //     console.error('Error durante el inicio de sesión:', error);
  //   }
  // }

  // async login() {
  //   try {
  //     await this.authService.instance.initialize();
  //     const accounts = this.authService.instance.getAllAccounts();
      
  //     if (accounts.length > 0) {
  //       // Si ya hay una cuenta, la establecemos como activa
  //       this.authService.instance.setActiveAccount(accounts[0]);
  //     }
      
  //     // Intentamos obtener el token silenciosamente primero
  //     try {
  //       const tokenResponse = await this.authService.instance.acquireTokenSilent({
  //         scopes: ['user.read']
  //       });
  //       this.verifyMicrosoftTokenWithBackend(tokenResponse.accessToken);
  //     } catch {
  //       // Si falla la adquisición silenciosa, redirigimos al login
  //       await this.authService.loginRedirect();
  //     }
  //   } catch (error) {
  //     console.error('Error durante el inicio de sesión:', error);
  //   }
  // }

  async login() {
    try {
      await this.authService.instance.initialize();
      
      // Verificar si hay una interacción en progreso
      if (this.authService.instance.getActiveAccount()) {
        try {
          const tokenResponse = await this.authService.instance.acquireTokenSilent({
            scopes: ['user.read']
          });
          this.verifyMicrosoftTokenWithBackend(tokenResponse.accessToken);
          return;
        } catch {
          // Si falla la adquisición silenciosa, continuamos con el flujo normal.
          console.log('No hay una interacción en progreso.');
        }
      }

      const accounts = this.authService.instance.getAllAccounts();
      
      if (accounts.length > 0) {
        this.authService.instance.setActiveAccount(accounts[0]);
        try {
          const tokenResponse = await this.authService.instance.acquireTokenSilent({
            scopes: ['user.read']
          });
          this.verifyMicrosoftTokenWithBackend(tokenResponse.accessToken);
        } catch {
          // Si falla la adquisición silenciosa, esperamos un momento antes de redirigir
          setTimeout(async () => {
            await this.authService.loginRedirect();
          }, 1000);
        }
      } else {
        // Si no hay cuentas, esperamos un momento antes de redirigir
        setTimeout(async () => {
          await this.authService.loginRedirect();
        }, 1000);
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
    }
  }

  async logout() {
    try {
      await this.authService.instance.initialize();
      await this.authService.logoutRedirect();
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
    }
  }

  verifyTokenWithBackend(token: string): void {
  // this.http.post('https://localhost:7035/api/Account/GoogleLogin/', {token})
  this.http.get<any>('https://localhost:7035/api/Account/GoogleLogin/' + token)
    .subscribe({
      next: (response) => {
        console.log('Inicio de sesión exitoso:', response);
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
      }
    });
  }

  verifyMicrosoftTokenWithBackend(token: string): void {
    this.http.get<any>('https://localhost:7035/api/Account/MicrosoftLogin/' + token)
    .subscribe({
      next: (response) => {
        console.log('Inicio de sesión con Microsoft exitoso:', response);
      },
      error: (error) => {
        console.error('Error al iniciar sesión con Microsoft:', error);
      }
    });
  }
}