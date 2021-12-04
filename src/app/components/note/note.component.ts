import {Component, Input} from '@angular/core';
import {Note} from "../../models/note.model";
import {Clipboard} from "@angular/cdk/clipboard";
import {BehaviorSubject} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {EditNoteDialogComponent} from "../dialogs/edit-note-dialog/edit-note-dialog.component";

@Component({
  selector: 'note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent {
  @Input()
  note: Note = {} as Note;
  @Input()
  notes$ = new BehaviorSubject<Note[] | null>(null);

  disabled = false;

  constructor(
    private readonly clipboard: Clipboard,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) {
  }

  copy() {
    this.clipboard.copy(this.note.content);
    this.snackBar.open('COPIED TO CLIPBOARD', undefined, {duration: 1000})
  }

  edit() {
    const dialogRef = this.dialog.open(EditNoteDialogComponent, {
      width: '50vw',
      data: this.note,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.note = result;
      }
    });
  }

  delete() {
    let notes = this.notes$.getValue();
    let filteredNotes = notes!.filter(x => x !== this.note);
    this.notes$.next(filteredNotes!);
  }
}