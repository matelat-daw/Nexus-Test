// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MsalModule, MsalService, MsalGuard, MsalInterceptor, MSAL_INSTANCE } from '@azure/msal-angular';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { msalConfig } from './auth-config';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';

// Proveedor para MSAL_INSTANCE
export function MSALInstanceFactory(): PublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

@NgModule({
  declarations: [
    // Your components
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    MsalModule.forRoot(MSALInstanceFactory(), {
      interactionType: InteractionType.Redirect,
      authRequest: {
        scopes: ['user.read'],
      },
    }, {
      interactionType: InteractionType.Redirect,
      protectedResourceMap: new Map([
        ['https://graph.microsoft.com/v1.0/me', ['user.read']]
      ])
    })
  ],
  providers: [
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory, // Proveedor para MSAL_INSTANCE
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    MsalService,
    MsalGuard
  ],
  bootstrap: []
})
export class AppModule { }