import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { Rank, Tensor } from '@tensorflow/tfjs';
import { RegionService } from '../region.service';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {

  constructor(private http: HttpClient, private regionService: RegionService) { 
    this.loadModel();

  }

  model: any; // Update the type to 'any' since the model is loaded with tfjs-converter
  currentRegion!: string

  filesPath = `assets/models/`
  classes: any[] | undefined = []
  
  // ngOnInit(): void {
  //   this.loadModel();

  // }
  async loadModel() {


    const region = await this.regionService.getCurrent();
    const modelUrl = this.filesPath + region + "/model.json";
    const classUrl = this.filesPath + region + "/class_labels.json"

    
    this.model = await tf.loadGraphModel(modelUrl);
    console.log(this.model);
    
    await this.loadClasses(classUrl);
    console.log(this.classes);

    // this.predict();
    // this.predict();
    
  }

  
  async loadClasses(filePath: string) {

    await this.http.get<any[]>(filePath).toPromise()
      .then(data => {
        this.classes = data;
        console.log(data)
        console.log('JSON-Daten geladen:', data);
      })
      .catch(error => {
        console.error('Fehler beim Laden der JSON-Datei:', error);
      });
  }





  async predict(testImage: HTMLImageElement): Promise<any> {
    const imageTensor = await tf.browser.fromPixels(testImage).toFloat();
    const resizedImageTensor = await tf.image.resizeBilinear(imageTensor, [140, 170]);
    const normalizedImageTensor = await resizedImageTensor.div(255.0);
    const expandedImageTensor = await normalizedImageTensor.expandDims(0) as Tensor<Rank>;

      
    const predictions = this.model.predict(expandedImageTensor) as Tensor<Rank>;
    
    const predictionsArray = predictions.dataSync()
    const maxIndex = predictionsArray.indexOf(Math.max(...predictionsArray));
    const maxValue = predictionsArray[maxIndex];
    console.log('Max Value:', maxValue);
    console.log('Max Index:', maxIndex);



    const filterPredictions = await this.filterPredictions(predictionsArray);
    return filterPredictions;

  }

  private async filterPredictions(predictionsArray: any): Promise<any>{
    const classes = this.classes;
    function getSortedIndices(array: any[] | Uint8Array | Float32Array | Int32Array) {
      const indices = Array.from(array.keys());
      indices.sort((a, b) => array[b] - array[a]);
      return indices;
    }
    if(classes){
      const sortedIndices = getSortedIndices(predictionsArray);
      const rank1Index =  sortedIndices[0];
      const rank2Index =  sortedIndices[1];
      const rank3Index =  sortedIndices[2];
      const rank4Index =  sortedIndices[3];
      const rank5Index =  sortedIndices[4];
      const rank6Index =  sortedIndices[5];

            
      const allRankIndices = [];
      allRankIndices.push(rank1Index, rank2Index, rank3Index, rank4Index, rank5Index, rank6Index);

      const filteredBirdJson: { [key: string]: any } = {}; 
      allRankIndices.forEach(index => {
        const propability = predictionsArray[index]
        const bird = classes[index]
        if ( propability > 0.1) {
          filteredBirdJson[bird] = propability
        }
      });

  
      const filteredBirdJsonSorted = Object.fromEntries(
        Object.entries(filteredBirdJson).sort((a, b) => b[1] - a[1])
      );
      
      for (const key in filteredBirdJsonSorted) {
        filteredBirdJsonSorted[key] = Math.round(filteredBirdJsonSorted[key] * 100);
      }
      
      return filteredBirdJsonSorted
    }

  

  }
}
