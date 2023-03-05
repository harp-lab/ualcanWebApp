import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
  })

  export class SharedDataService{
    constructor(private http: HttpClient) { }
    data: string = "";

    setdata(value: string) {
        this.data=value;
      }
    
      getdata():string{
        return this.data;
      }

  }