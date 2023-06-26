import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageStorageService {
  private basePath = ''; // Leerer String, da der gesamte Bucket verwendet wird


  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage) { }







  loadImage(birdName: string, index: number): Observable<string> {
    // const imageName = 'Brewer_Blackbird1.jpg'
    
    const imageName = `${this.basePath}/${birdName.toLowerCase()}_${index}.jpg`
    // const filePath = `${this.basePath}/${imageName}`;
    const storageRef = this.storage.ref(imageName);

    return storageRef.getDownloadURL();
  }






}