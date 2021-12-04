export class Note {
  content = '';
  header?: string;
  posX: number;
  posY: number;

  constructor(posX: number, posY: number) {
    this.posX = posX;
    this.posY = posY;
    navigator.clipboard.readText().then((text) => {
      this.content = text;
    });
  }
}