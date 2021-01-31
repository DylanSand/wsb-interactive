
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WsbProvider } from '../../providers/wsb-provider/wsb-provider';
import { AppEventService } from '../../providers/events/events.service';


@Component({
  selector: 'app-daily-thread',
  templateUrl: 'daily-thread.html',
  styleUrls: ['daily-thread.scss']
})
export class DailyThreadComponent implements OnInit {
  // Class parameters:
  private OLD_USER_LIMIT = 31557600 * 2;
  private MID_USER_LIMIT = 31557600;
  private COMMENT_REFRESH_TIME = 4000;
  // Class variables:
  private runCommentOrganizer = true;
  public oldUserComments = [];
  public midUserComments = [];
  public newUserComments = [];
  public allUserComments = [];
  public sortedComments = {};
  public oldBottom = true;
  public midBottom = true;
  public newBottom = true;
  public curTime = (new Date()).getTime() / 1000;
  constructor(public wsb: WsbProvider,
              private appEvents: AppEventService) {
  }
  @ViewChild('oldCol') private oldCol: ElementRef;
  @ViewChild('midCol') private midCol: ElementRef;
  @ViewChild('newCol') private newCol: ElementRef;
  ngOnInit(): void {
    this.wsb.startDailyThread();
    const startThread = () => {
      if (this.wsb.allComments.length === 0) {
        setTimeout(() => {
          this.startCommentOrganizer();
        }, 300);
      } else {
        this.startCommentOrganizer();
      }
      this.appEvents.unsubscribe('thread-started', startThread);
    };
    if (this.wsb.allComments.length === 0) {
      this.appEvents.subscribe('thread-started', startThread);
    } else {
      this.startCommentOrganizer();
    }
    setInterval(() => {
      this.updateScroll();
    }, 100);
  }
  startCommentOrganizer(): void {
    if (this.runCommentOrganizer) {
      if (this.wsb.allComments.length !== 0) {
        this.curTime = (new Date()).getTime() / 1000;
        /*
        for (const comment of this.wsb.allComments) {
          if (!this.sortedComments[comment[0].name]) {
            if (this.curTime - comment[1] < this.MID_USER_LIMIT) {
              this.newUserComments.push(comment[0]);
            } else {
              if (this.curTime - comment[1] < this.OLD_USER_LIMIT) {
                this.midUserComments.push(comment[0]);
              } else {
                this.oldUserComments.push(comment[0]);
              }
            }
            this.sortedComments[comment[0].name] = true;
          }
        }
        this.oldUserComments.sort((a, b) => Number(a.created_utc) - Number(b.created_utc));
        this.midUserComments.sort((a, b) => Number(a.created_utc) - Number(b.created_utc));
        this.newUserComments.sort((a, b) => Number(a.created_utc) - Number(b.created_utc));
         */
        for (const comment of this.wsb.allComments) {
          if (!this.sortedComments[comment[0].name]) {
            this.allUserComments.push(comment);
            this.sortedComments[comment[0].name] = true;
          }
        }
        this.allUserComments.sort((a, b) => Number(a[0].created_utc) - Number(b[0].created_utc));
        this.wsb.updateDailyThread(false);
        setTimeout(() => {
          this.startCommentOrganizer();
        }, this.COMMENT_REFRESH_TIME);
      } else {
        setTimeout(() => {
          this.startCommentOrganizer();
        }, this.COMMENT_REFRESH_TIME);
      }
    }
  }
  toggleCommentOrganizer(): void {
    if (this.runCommentOrganizer) {
      this.runCommentOrganizer = false;
    } else {
      this.runCommentOrganizer = true;
      this.startCommentOrganizer();
    }
  }
  scrollCheck(type): void {
    if (type === 1) {
      // tslint:disable-next-line:max-line-length
      this.oldBottom = this.oldCol.nativeElement.scrollHeight - this.oldCol.nativeElement.scrollTop === this.oldCol.nativeElement.clientHeight;
    }
    if (type === 2) {
      // tslint:disable-next-line:max-line-length
      this.midBottom = this.midCol.nativeElement.scrollHeight - this.midCol.nativeElement.scrollTop === this.midCol.nativeElement.clientHeight;
    }
    if (type === 3) {
      // tslint:disable-next-line:max-line-length
      this.newBottom = this.newCol.nativeElement.scrollHeight - this.newCol.nativeElement.scrollTop === this.newCol.nativeElement.clientHeight;
    }
  }
  updateScroll(): void {
    if (this.oldBottom) {
      this.oldCol.nativeElement.scrollTop = this.oldCol.nativeElement.scrollHeight;
      this.oldBottom = true;
    }
    if (this.midBottom) {
      this.midCol.nativeElement.scrollTop = this.midCol.nativeElement.scrollHeight;
      this.midBottom = true;
    }
    if (this.newBottom) {
      this.newCol.nativeElement.scrollTop = this.newCol.nativeElement.scrollHeight;
      this.newBottom = true;
    }
  }
  switchThread(thread): void {
    if (thread.title === this.wsb.altPost.title) {
      this.runCommentOrganizer = false;
      this.oldUserComments = [];
      this.midUserComments = [];
      this.newUserComments = [];
      this.allUserComments = [];
      this.sortedComments = {};
      const startThread = () => {
        if (this.wsb.allComments.length === 0) {
          setTimeout(() => {
            this.startCommentOrganizer();
          }, 300);
        } else {
          this.startCommentOrganizer();
        }
        this.appEvents.unsubscribe('thread-started', startThread);
      };
      this.appEvents.subscribe('thread-started', startThread);
      this.runCommentOrganizer = true;
      this.wsb.switchToAlt();
    }
  }
}
