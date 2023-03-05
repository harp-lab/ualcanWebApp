import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TypeaheadService {

  constructor(private http: HttpClient) { }

  //data: string = "";
  //datad: string = "";

  getGene(term: string): Observable<string[]> {
    return new Observable((observer) => {
      let getGeneNamePromise: Promise<any>;

      getGeneNamePromise = new Promise((resolve) => {
        this.http.get<string[]>('../assets/data/genes.json').subscribe((data: any) => {
          resolve(data.genes);
        });
      });

      getGeneNamePromise.then((data) => {
        if (term) {
          data = data.filter((x:any) => x.name.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
        }
        observer.next(data);
      });

      
    });
  }
  /*setdata(value: string) {
    this.data=value;
  }

  getdata():string{
    return this.data;
  }*/


}