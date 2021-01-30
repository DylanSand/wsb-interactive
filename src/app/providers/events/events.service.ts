
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { from } from 'rxjs/observable/from';

@Injectable()
export class AppEventService {
  private listenersMap: Map<string, Array<any>>;
  private eventsSubject = new Subject<{eventName: string, data: any}>();
  private events: Observable<any>;

  constructor() {
    this.events = from(this.eventsSubject);
    this.listenersMap = new Map<string, Array<any>>();

    this.events.subscribe(
      (data: {eventName: string, data: any}) => {
        const listeners = this.listenersMap.get(data.eventName);
        if (listeners) {
          listeners.forEach( listener => listener(...data.data));
        }
      });
  }

  subscribe(eventName: string, handler: (...params: any[]) => any) {
    if (this.listenersMap.has(eventName)) {
      const listeners = this.listenersMap.get(eventName);
      if (listeners) {
        listeners.push(handler);
      }
    } else {
      this.listenersMap.set(eventName, [handler]);
    }
  }

  unsubscribe(eventName: string, handler: (...params: any[]) => any) {
    if (this.listenersMap.has(eventName)) {
      let listeners = this.listenersMap.get(eventName);
      if (listeners) {
        listeners = listeners.filter(x => x !== handler);
        this.listenersMap.set(eventName, listeners);
      }
    }
  }

  publish(eventName: string, ...data: any[]) {
    this.eventsSubject.next({ eventName, data});
  }

}
