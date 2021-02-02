import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DailyThreadComponent } from './pages/daily-thread/daily-thread';
import { HttpClientModule } from '@angular/common/http';
import { WsbProvider } from './providers/wsb-provider/wsb-provider';
import { AppEventService } from './providers/events/events.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SpinnerOverlayComponent } from './components/spinner-overlay/spinner-overlay.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

@NgModule({
  declarations: [
    AppComponent,
    DailyThreadComponent,
    SpinnerOverlayComponent,
    SpinnerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    NgxSliderModule,
    BrowserAnimationsModule
  ],
  providers: [
    WsbProvider,
    HttpClientModule,
    AppEventService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
