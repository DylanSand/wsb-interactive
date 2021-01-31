
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppEventService } from '../events/events.service';

@Injectable()
export class WsbProvider {
  public curPost = null;
  public altPost = null;
  private authorDict = {};
  private commentDict = {};
  public allComments = [];
  constructor(private httpClient: HttpClient,
              private appEvents: AppEventService) {
  }
  public startDailyThread(): void {
    const curDay = (new Date()).getDay();
    let url = 'https://www.reddit.com/r/wallstreetbets/search.json?q=subreddit%3Awallstreetbets%20AND%20flair%3ADaily%20AND%20Daily&sort=new';
    let altUrl = '';
    if (curDay === 0 || curDay === 6) {
      url = 'https://www.reddit.com/r/wallstreetbets/search.json?q=subreddit%3Awallstreetbets%20AND%20flair%3AWeekend%20AND%20Weekend&sort=new';
      altUrl = 'https://www.reddit.com/r/wallstreetbets/search.json?q=subreddit%3Awallstreetbets%20AND%20flair%3ADaily%20AND%20Daily&sort=new';
    }
    this.httpClient.get(url)
      .subscribe(posts => {
        // @ts-ignore
        this.curPost = posts.data.children[0].data;
        this.updateDailyThread(true);
      });
    if (curDay === 0 || curDay === 6) {
      this.httpClient.get(altUrl)
        .subscribe(posts => {
          // @ts-ignore
          this.altPost = posts.data.children[0].data;
        });
    }
  }
  public updateDailyThread(sendEvent: boolean): void {
    this.httpClient.get(this.curPost.url + '.json?sort=new&limit=1000&depth=1')
      .subscribe(commentsResp => {
        const comments = commentsResp[1].data.children;
        if (comments.length === 0) {
          this.updateDailyThread(sendEvent);
          return;
        }
        for (const comment of comments) {
          if (this.commentDict[comment.data.name] || comment.data.author === '[deleted]' || !comment.data.body) {
            continue;
          }
          if (this.authorDict[comment.data.author]) {
            this.allComments.push([comment.data, this.authorDict[comment.data.author]]);
            this.commentDict[comment.data.name] = true;
          } else {
            this.httpClient.get('https://api.reddit.com/user/' + comment.data.author + '/about')
              .subscribe(authorResp => {
                // @ts-ignore
                this.allComments.push([comment.data, Number(authorResp.data.created_utc)]);
                // @ts-ignore
                this.authorDict[comment.data.author] = Number(authorResp.data.created_utc);
                this.commentDict[comment.data.name] = true;
              });
          }
        }
        if (sendEvent) {
          this.appEvents.publish('thread-started');
        }
      });
  }

}
