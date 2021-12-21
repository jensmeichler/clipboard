import {Injectable} from '@angular/core';
import * as moment from "moment";
import {BehaviorSubject} from "rxjs";
import {Image, IndexItem, Note, NotesJson, TaskList} from "../models";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  notes$: BehaviorSubject<Note[] | null> = new BehaviorSubject<Note[] | null>(null);
  taskLists$: BehaviorSubject<TaskList[] | null> = new BehaviorSubject<TaskList[] | null>(null);
  images$: BehaviorSubject<Image[] | null> = new BehaviorSubject<Image[] | null>(null);

  itemsCount = 0;
  selectedItemsCount = 0;

  private selectedNotes: Note[] = [];
  private selectedTaskLists: TaskList[] = [];

  selectNote(note: Note, selected: boolean) {
    if (selected) {
      this.selectedNotes.push(note);
      this.selectedItemsCount++;
    } else {
      if (this.selectedNotes.some(x => x === note)) {
        this.selectedNotes = this.selectedNotes!.filter(x => x !== note);
        this.selectedItemsCount--;
      }
    }
  }

  selectTaskList(taskList: TaskList, selected: boolean) {
    if (selected) {
      this.selectedTaskLists.push(taskList);
      this.selectedItemsCount++;
    } else {
      if (this.selectedTaskLists.some(x => x === taskList)) {
        this.selectedTaskLists = this.selectedTaskLists!.filter(x => x !== taskList);
        this.selectedItemsCount--;
      }
    }
  }

  addNote(note: Note) {
    if (note.posZ == undefined) {
      note.posZ = this.getNextIndex();
    }
    let currentNotes = this.notes$.getValue() ?? [];
    currentNotes?.push(note);
    this.notes$.next(currentNotes);
    this.itemsCount++;
  }

  addTaskList(taskList: TaskList) {
    if (taskList.posZ == undefined) {
      taskList.posZ = this.getNextIndex();
    }
    let currentTasks = this.taskLists$.getValue() ?? [];
    currentTasks?.push(taskList);
    this.taskLists$.next(currentTasks);
    this.itemsCount++;
  }

  addImage(image: Image) {
    if (image.posZ == undefined) {
      image.posZ = this.getNextIndex();
    }
    let currentImages = this.images$.getValue() ?? [];
    currentImages?.push(image);
    this.images$.next(currentImages);
    this.itemsCount++;
  }

  deleteNote(note: Note) {
    this.selectNote(note, false);
    this.itemsCount--;

    let notes = this.notes$.getValue();
    let filteredNotes = notes!.filter(x => x !== note);
    this.notes$.next(filteredNotes!);

    this.reArrangeIndices();
  }

  deleteTaskList(taskList: TaskList) {
    this.selectTaskList(taskList, false);
    this.itemsCount--;

    let taskLists = this.taskLists$.getValue();
    let filteredTaskLists = taskLists!.filter(x => x !== taskList);
    this.taskLists$.next(filteredTaskLists!);

    this.reArrangeIndices();
  }

  deleteImage(image: Image) {
    let images = this.images$.getValue();
    let filteredImages = images!.filter(x => x !== image);
    this.images$.next(filteredImages!);
    this.itemsCount--;

    this.reArrangeIndices();
  }

  getAsJson(): NotesJson {
    if (this.selectedItemsCount) {
      return {
        notes: this.selectedNotes,
        taskLists: this.selectedTaskLists
      } as NotesJson
    }
    return {
      notes: this.notes$.getValue(),
      taskLists: this.taskLists$.getValue(),
      images: this.images$.getValue()
    } as NotesJson;
  }

  setFromJson(json: string) {
    let currentNotes: Note[] = this.notes$.getValue() ?? [];
    let currentTaskLists: TaskList[] = this.taskLists$.getValue() ?? [];
    let currentImages: Image[] = this.images$.getValue() ?? [];

    let uploadedData = JSON.parse(json) as NotesJson;
    let uploadedNotes = uploadedData.notes;
    let uploadedTaskLists = uploadedData.taskLists;
    let uploadedImages = uploadedData.images;

    uploadedNotes?.forEach((upload: Note) => {
      if (!currentNotes.some(curr => {
        return upload.content === curr.content
          && upload.header === curr.header
          && upload.posX === curr.posX
          && upload.posY === curr.posY
      })) {
        currentNotes.push(upload);
        this.itemsCount++;
      }
    });
    uploadedTaskLists?.forEach((upload: TaskList) => {
      if (!currentTaskLists.some(curr => {
        return upload.header === curr.header
          && upload.posX === curr.posX
          && upload.posY === curr.posY
      })) {
        currentTaskLists.push(upload);
        this.itemsCount++;
      }
    });
    uploadedImages?.forEach((upload: Image) => {
      if (!currentImages.some(curr => {
        return upload.source === curr.source
          && upload.posX === curr.posX
          && upload.posY === curr.posY
      })) {
        currentImages.push(upload);
        this.itemsCount++;
      }
    });
    this.notes$.next(currentNotes);
    this.taskLists$.next(currentTaskLists);
    this.images$.next(currentImages);
  }

  save(): string {
    let json = this.getAsJson();
    let filename = moment(new Date()).format('YYYY-MM-DD-HH-mm') + '.notes.json';
    let a = document.createElement('a');
    let file = new Blob([JSON.stringify(json)], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
    return filename;
  }

  bringToFront(item: { posZ?: number }) {
    item.posZ = this.getNextIndex();
    this.reArrangeIndices();
  }

  bringForward(item: IndexItem) {
    item.posZ! += 1.5;
    this.reArrangeIndices();
  }

  sendBackward(item: IndexItem) {
    item.posZ! -= 1.5;
    this.reArrangeIndices();
  }

  flipToBack(item: IndexItem) {
    item.posZ = 0;
    this.reArrangeIndices();
  }

  private reArrangeIndices() {
    let indexItems = this.getIndexItems()
      .filter(x => x.posZ != undefined)
      .sort((a, b) => a.posZ! - b.posZ!);
    let i = 1;
    indexItems.forEach(item => {
      item.posZ = i++;
    })
  }

  private getNextIndex(): number {
    let highestItem = this.getIndexItems()
      ?.filter(n => n.posZ)
      ?.reduce((hn, n) => Math.max(hn, n.posZ!), 0);

    return highestItem
      ? highestItem + 1
      : 1
  }

  private getIndexItems(): IndexItem[] {
    let notes = this.notes$.getValue() as IndexItem[];
    let taskLists = this.taskLists$.getValue() as IndexItem[];
    let images = this.images$.getValue() as IndexItem[];
    let result: IndexItem[] = [];

    if (notes) {
      result = result.concat(notes);
    }
    if (taskLists) {
      result = result.concat(taskLists);
    }
    if (images) {
      result = result.concat(images);
    }

    return result;
  }
}
