
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppEventService } from '../events/events.service';

@Injectable()
export class WsbProvider {
  public curPost = null;
  private authorDict = {};
  private commentDict = {};
  public allComments = [];
  constructor(private httpClient: HttpClient,
              private appEvents: AppEventService) {
  }
  public startDailyThread() {
    const cur_day = (new Date()).getDay();
    let url = 'https://www.reddit.com/r/wallstreetbets/search.json?q=subreddit%3Awallstreetbets%20AND%20flair%3ADaily&sort=new';
    if (cur_day === 0 || cur_day === 6) {
      url = 'https://www.reddit.com/r/wallstreetbets/search.json?q=subreddit%3Awallstreetbets%20AND%20flair%3AWeekend&sort=new';
    }
    this.httpClient.get(url)
      .subscribe(posts => {
        this.curPost = posts['data']['children'][0]['data'];
        // console.log('Current thread: ' + this.curPost['title']);
        this.updateDailyThread(true);
      });
  }
  public updateDailyThread(sendEvent: boolean) {
    this.httpClient.get(this.curPost['url'] + '.json?sort=new&limit=1000&depth=1')
      .subscribe(commentsResp => {
        const comments = commentsResp[1]['data']['children'];
        if (comments.length === 0) {
          this.updateDailyThread(sendEvent);
          return;
        }
        for (const comment of comments) {
          if (this.commentDict[comment['data']['name']] || comment['data']['author'] === '[deleted]' || !comment['data']['body']) {
            continue;
          }
          if (this.authorDict[comment['data']['author']]) {
            this.allComments.push([comment['data'], this.authorDict[comment['data']['author']]]);
            this.commentDict[comment['data']['name']] = true;
          } else {
            this.httpClient.get('https://api.reddit.com/user/' + comment['data']['author'] + '/about')
              .subscribe(authorResp => {
                this.allComments.push([comment['data'], Number(authorResp['data']['created_utc'])]);
                this.authorDict[comment['data']['author']] = Number(authorResp['data']['created_utc']);
                this.commentDict[comment['data']['name']] = true;
              });
          }
        }
        if (sendEvent) {
          this.appEvents.publish('thread-started');
        }
      });
  }

}
