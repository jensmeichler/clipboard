import {Clipboard} from "@angular/cdk/clipboard";
import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {Subscription} from "rxjs";
import {htmlRegex} from "../../const/regexes";
import {Note, TaskList} from "../../models";
import {DataService} from "../../services/data.service";
import {HashyService} from "../../services/hashy.service";
import {EditNoteDialogComponent} from "../dialogs/edit-note-dialog/edit-note-dialog.component";

@Component({
  selector: 'note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnInit, OnDestroy {
  @Input()
  note: Note = {} as Note;

  dialogSubscription?: Subscription;

  rippleDisabled = false;

  // Hack for suppress copy after dragging note
  mouseDown = false;
  movedPx = 0;

  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  rightClickPosX = 0;
  rightClickPosY = 0;

  @ViewChild('code')
  codeElement?: ElementRef;

  constructor(
    private readonly clipboard: Clipboard,
    private readonly hashy: HashyService,
    private readonly dialog: MatDialog,
    public readonly dataService: DataService,
  ) {
  }

  get canInteract() {
    return this.movedPx < 5;
  }

  ngOnInit() {
    if (this.note.code != false && this.note.content) {
      if (htmlRegex.test(this.note.content)) {
        this.note.code = true;
      }
    }
  }

  ngOnDestroy() {
    this.dialogSubscription?.unsubscribe();
  }

  select() {
    this.note.selected = !this.note.selected;
    this.dataService.onSelectionChange(this.note);
  }

  onMouseDown(event: MouseEvent) {
    if (event.button != 2) {
      this.mouseDown = true;
    }
  }

  onMouseMove() {
    if (this.mouseDown) {
      this.movedPx++;
    }
  }

  onMouseUp(event: MouseEvent) {
    if (this.mouseDown && this.canInteract) {
      switch (event.button) {
        case 0:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            this.select();
          } else {
            this.copy();
          }
          break;
        case 1:
          this.delete(event);
          break;
        case 2:
          break;
      }

      event.stopPropagation();
    }

    this.mouseDown = false;
    this.movedPx = 0;
  }

  copy() {
    if (this.note.content && !this.rippleDisabled && this.canInteract) {
      this.clipboard.copy(this.note.content);
      this.hashy.show('Copied to clipboard', 600);
    }
  }

  edit(event: MouseEvent, stopPropagation?: boolean) {
    if (this.canInteract) {
      let note = {...this.note};
      this.dialogSubscription = this.dialog.open(EditNoteDialogComponent, {
        width: 'var(--width-edit-dialog)',
        data: note,
        disableClose: true,
      }).afterClosed().subscribe((editedNote) => {
        if (editedNote) {
          this.dataService.deleteNote(this.note, true);
          this.dataService.addNote(editedNote);
        }
      });
      this.rippleDisabled = false;
      if (stopPropagation) {
        event.stopPropagation();
      }
    }
  }

  delete(event: MouseEvent) {
    if (this.canInteract) {
      this.dataService.deleteNote(this.note);
      event.stopPropagation();
    }
  }

  toggleCodeView(event: MouseEvent, stopPropagation?: boolean) {
    if (this.canInteract) {
      this.note.code = !this.note.code;
      this.rippleDisabled = false;
      if (stopPropagation) {
        event.stopPropagation();
      }
    }
  }

  moveToTab(index: number) {
    this.dataService.moveNoteToTab(index, this.note);
  }

  copyColorFrom(item: Note | TaskList) {
    this.note.backgroundColor = item.backgroundColor;
    this.note.backgroundColorGradient = item.backgroundColorGradient;
    this.note.foregroundColor = item.foregroundColor;
    this.dataService.cacheData();
  }

  showContextMenu(event: MouseEvent) {
    if (this.canInteract) {
      event.preventDefault();
      event.stopPropagation();

      this.rightClickPosX = event.clientX;
      this.rightClickPosY = event.clientY;
      this.contextMenu.openMenu();
    }
    this.rippleDisabled = false;
    this.mouseDown = false;
  }
}
