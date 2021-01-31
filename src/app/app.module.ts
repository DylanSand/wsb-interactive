import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DailyThreadComponent } from './pages/daily-thread/daily-thread';
import { HttpClientModule } from '@angular/common/http';
import { WsbProvider } from './providers/wsb-provider/wsb-provider';
import { AppEventService } from './providers/events/events.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    DailyThreadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule
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
