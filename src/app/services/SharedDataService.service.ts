import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })

  export class SharedDataService{
    data: string = "{}"; 
    analysis: string = "";

    setdata(value: string) {
      this.data=value;  
    }
    
    getdata(): string{
      return this.data;
    }

    setanalysis(value: string) {
      this.analysis=value;
    }
    
    getanalysis():string{
      return this.analysis;
    }
  }