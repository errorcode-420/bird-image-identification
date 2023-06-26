import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor() { }
  imageUrl = ""


  async uploadImage(event: any): Promise<HTMLImageElement> { 
    return new Promise<HTMLImageElement>(async (resolve, reject) => {
      const file = await this.getFile(event)
      const image = await this.fileToImage(file);
      resolve(image);
    });
  }

  private fileToImage(file: File): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const image = new Image();
        image.onload = () => {
          resolve(image);
        };
        image.onerror = () => {
          reject(new Error('Fehler beim Laden des Bildes.'));
        };
        image.src = event.target?.result as string;
        this.imageUrl = event.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Fehler beim Lesen der Datei.'));
      };
      reader.readAsDataURL(file);
    });
  }

  private getFile(event: any): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      const file: File = event.target.files[0];
      if (!file) {
        reject(new Error("Keine Datei ausgewählt."));
      }

      const reader = new FileReader();
      reader.onload = (fileEvent: any) => {
        const content: string | ArrayBuffer = fileEvent.target.result;
        if (!content) {
          reject(new Error("Fehler beim Lesen der Datei."));
        }
        resolve(new File([content], file.name, { type: file.type }));
      };

      reader.onerror = () => {
        reject(new Error("Fehler beim Lesen der Datei."));
      };

      reader.readAsArrayBuffer(file);
    });
  }

}
