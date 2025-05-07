import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { MsalService } from '@azure/msal-angular';
import { AppModule } from './app.module';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  // providers: [MsalService, AppModule]
})
export class AppComponent implements OnInit {
  title = 'Nexus-Test';
  constructor(private http: HttpClient) {} //, private authService: MsalService) {}
  ngOnInit(): void {
    // Configurar el callback para manejar la respuesta de Google
    (window as any).handleCredentialResponse = (response: any) => {
      console.log('Token de Google:', response.credential);
      this.verifyTokenWithBackend(response.credential);
    };
  }

  // login() {
  //   this.authService.loginRedirect();
  // }

  // logout() {
  //   this.authService.logout();
  // }

  verifyTokenWithBackend(token: string): void {
  this.http.post('https://localhost:7035/api/Account/GoogleLogin', {token})
    .subscribe({
      next: (response) => {
        console.log('Inicio de sesión exitoso:', response);
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
      }
    });
  }
}