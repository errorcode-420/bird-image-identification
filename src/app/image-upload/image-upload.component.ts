import { Component } from '@angular/core';

import { trigger, transition, style, animate } from '@angular/animations';
import { ImageStorageService } from '../services/image-storage.service';
import { PredictionService } from '../services/prediction.service';
import { UploadService } from '../services/upload.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { InfoComponent } from '../info/info.component';
import { MatDialogModule } from '@angular/material/dialog';
import { InfoService } from '../services/info.service';
import { RegionService } from '../region.service';


@Component({
  selector: 'image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css'],
  animations: [
    trigger('fadeInFast', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1000ms', style({ opacity: 1 }))
      ]),
     
    ]),
    trigger('fadeInSlow', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('2000ms', style({ opacity: 1 }))
      ]),
     
    ])

  ]
})
export class ImageUploadComponent {


  selectedRegion!: string;
  regions: any;

  
  constructor(
    private uploadService: UploadService,
    private predictionService: PredictionService,
    private storage: ImageStorageService,
    private infoService: InfoService,
    private regionService: RegionService,
    public dialog: MatDialog
  ) {
    this.loadRegions();
  }

  async loadRegions() {
    this.selectedRegion = await this.regionService.getCurrent();
    this.regions = this.regionService.getAll();
  }

  selectRegion() {
    this.regionService.select(this.selectedRegion)
  }
  
//single bird identified
  predictedBirdLabel!: any;
  get predictedBird() {
    return Object.keys(this.predictedBirdLabels)[0]
  }
  leftImageSource!: string;
  rightImageSource!: string;
  unknownBirdSource!: string;

  //multiple birds identified
  multipleBirdsPredicted: boolean = false;
  predictedBirdLabels!: any
  predictedBirds: any;
  urlObject: { [key: string]: any } = {}; 


  //template
  processInited = false;
  selectedImage!: HTMLImageElement
  isImageProcessing: boolean = false;
  
  birdsCount = 1;
  get containerSize(): number {
    const birdsCount = this.birdsCount
    const screenWidth: number = window.innerWidth;
    const pixelSharePerBird = 100/birdsCount
    if(screenWidth < 500){
      return (pixelSharePerBird > 33) ? (pixelSharePerBird) : 33.33
    }
    else return pixelSharePerBird;
  }

  async startProcess(event: any) {
    this.isImageProcessing = true;
    this.selectedImage = await this.uploadImage(event);
    await this.predict();
    await this.loadImages();
    this.getPredictedBirdCount();
    this.isImageProcessing = false;  
    this.processInited = true;  
  }
  

  private async uploadImage(event: any): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>(async (resolve) => {
      const selectedImage =  await this.uploadService.uploadImage(event);
      this.unknownBirdSource = this.uploadService.imageUrl;
      resolve(selectedImage);
    })
  }
  
  private async predict(): Promise<void> {
    return new Promise(async (resolve) => {  
        if(!this.selectedImage) return;
        const predictedBirdLabels = await this.predictionService.predict(this.selectedImage);
        this.predictedBirdLabels = predictedBirdLabels;
   
        this.multipleBirdsPredicted = Object.keys(predictedBirdLabels).length > 1;  
        resolve();
    });
  }

  
  private loadImages(): void {
    const predictedBirdLabels = this.predictedBirdLabels


    let index1: number;
    let index2: number;

    do {
      index1 = Math.floor(Math.random() * 10) + 1;
      index2 = Math.floor(Math.random() * 10) + 1;
    } while (index1 === index2);

    console.log("Number 1:", index1);
    console.log("Number 2:", index2);

    this.urlObject = {};

    console.log(predictedBirdLabels)
    if(this.multipleBirdsPredicted){
      for (const birdLabel in predictedBirdLabels) {
        
        this.storage.loadImage(birdLabel, index1).subscribe(url => {
          this.urlObject[birdLabel] = url;
    
        }, error => {
          console.log("Fehler beim Laden des Bildes:", error);
        });      }
    }
    else{
      console.log(predictedBirdLabels)
      console.log(Object.keys(predictedBirdLabels)[0])
      const birdLabel = this.predictedBird
    
      this.storage.loadImage(birdLabel, index1).subscribe(url => {
        this.leftImageSource = url;

      }, error => {
        console.log("Fehler beim Laden des Bildes:", error);
      });

      this.storage.loadImage(birdLabel, index2).subscribe(url => {
        this.rightImageSource = url;

      }, error => {
        console.log("Fehler beim Laden des Bildes:", error);
      });
    } 
  }



  private getPredictedBirdCount() {
    console.log(this.predictedBirdLabels)
    const birdsCount = Object.keys(this.predictedBirdLabels).length;
    this.birdsCount = birdsCount;
    if (birdsCount == 1)
      this.multipleBirdsPredicted = false
    else if(birdsCount > 1)
      this.multipleBirdsPredicted = true
  }



  reloadExamples() {
    this.loadImages();
  }




  get sortedKeys(): string[] {
    return Object.keys(this.predictedBirdLabels)
      .sort((a, b) => this.predictedBirdLabels[b] - this.predictedBirdLabels[a]);
  }

  getRange(count: number): number[] {
    return Array(count).fill(0).map((x, i) => i + 1);
  }

  getName(label: string): string {
    return label.replace(/_/g, " ");
  }



  openInfo(birdLabel: string) {
    this.infoService.get(birdLabel.toLowerCase()).valueChanges().subscribe(text => {
      const dialogConfig = new MatDialogConfig();
      var data: any = {};
      data["title"] = this.getName(birdLabel)
      data["text"] = text
      data["url"] = this.urlObject[birdLabel] || this.unknownBirdSource
      dialogConfig.data = data
      console.log(dialogConfig)
      this.dialog.open(InfoComponent, dialogConfig);      // Perform additional actions with the Firebase content
    });    
    
 
  }

}