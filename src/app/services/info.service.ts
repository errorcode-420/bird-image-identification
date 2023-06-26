import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root'
})
export class InfoService {
  dbPath: string;

  constructor(private db: AngularFireDatabase) {
    this.dbPath = '/info';

  }

  get(birdLabel: string): AngularFireObject<any> {

    const path = `${this.dbPath}/${birdLabel}`;
    return this.db.object(path);
  }  
}
