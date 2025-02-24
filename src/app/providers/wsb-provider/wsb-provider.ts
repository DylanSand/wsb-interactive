
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
  private dateNow = new Date();
  constructor(private httpClient: HttpClient,
              private appEvents: AppEventService) {
  }
  public startDailyThread(): void {
    const curDay = this.dateNow.getDay();
    let url = 'https://www.reddit.com/r/wallstreetbets/search.json?q=subreddit%3Awallstreetbets%20AND%20flair%3ADaily%20AND%20Daily&sort=new';
    let altUrl = '';
    if (curDay === 0 || curDay === 6) {
      url = 'https://www.reddit.com/r/wallstreetbets/search.json?q=subreddit%3Awallstreetbets%20AND%20flair%3AWeekend%20AND%20Weekend&sort=new';
      altUrl = 'https://www.reddit.com/r/wallstreetbets/search.json?q=subreddit%3Awallstreetbets%20AND%20flair%3ADaily%20AND%20Daily&sort=new';
    } else {
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
    } else {
      this.httpClient.get(altUrl)
        .subscribe(posts => {
          // @ts-ignore
          this.altPost = posts.data.children[1].data;
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
          if (this.commentDict[comment.data.name] || comment.data.author === '[deleted]' || !comment.data.body || comment.data.parent_id !== this.curPost.name) {
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
            /*
            this.httpClient.get('https://api.pushshift.io/reddit/comment/search/?author=' + comment.data.author + '&sort=asc&sort_type=created_utc&size=50&subreddit=wallstreetbets')
              .subscribe(authorResp => {
                let curScore = this.dateNow.getTime();
                // @ts-ignore
                if (authorResp.data.length !== 0) {
                  // @ts-ignore
                  curScore = Number(authorResp.data[0].created_utc);
                }
                this.httpClient.get('https://api.pushshift.io/reddit/submission/search/?author=' + comment.data.author + '&sort=asc&sort_type=created_utc&size=50&subreddit=wallstreetbets')
                  .subscribe(authorResp2 => {
                    // @ts-ignore
                    if (authorResp2.data.length !== 0) {
                      // @ts-ignore
                      const curScore2 = Number(authorResp2.data[0].created_utc);
                      if (curScore2 < curScore) {
                        curScore = curScore2;
                      }
                    }
                    this.allComments.push([comment.data, curScore]);
                    // @ts-ignore
                    this.authorDict[comment.data.author] = curScore;
                    this.commentDict[comment.data.name] = true;
                  });
              });
             */
          }
        }
        if (sendEvent) {
          this.appEvents.publish('thread-started');
        }
      });
  }
  switchToAlt(): void {
    const temp = JSON.parse(JSON.stringify(this.curPost));
    this.curPost = this.altPost;
    this.altPost = temp;
    this.commentDict = {};
    this.allComments = [];
    this.updateDailyThread(true);
  }
}
