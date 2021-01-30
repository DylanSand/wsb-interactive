
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { DailyThreadComponent } from './pages/daily-thread/daily-thread';
import { WsbProvider } from './providers/wsb-provider/wsb-provider';
import { HttpClientModule } from '@angular/common/http';
import { AppEventService } from './providers/events/events.service';


@NgModule({
  declarations: [
    AppComponent,
    DailyThreadComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    WsbProvider,
    AppEventService,
    HttpClientModule
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
