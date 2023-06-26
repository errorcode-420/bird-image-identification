import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  getAll(): any {
    
    const regions = [
      { value: 'na', label: 'North America' },
      // { value: 'eu', label: 'Europe' },
    ];  

    return regions;
  }

  async getCurrent(): Promise<string> {
    return new Promise(async (resolve) => {  
      const selectedRegion = localStorage.getItem('selectedRegion') || 'na';       
      resolve(selectedRegion);
  });
  }

  select (region: string) {
    localStorage.setItem('selectedRegion', region);

  }

  constructor() { }
}
