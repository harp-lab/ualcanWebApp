import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TypeaheadService {

  constructor(private http: HttpClient) { }

  getGene(term: string, analysis: string, cancer: string): Observable<string[]> {
    return new Observable((observer) => {
      let getGeneNamePromise: Promise<any>;
      let file = ''
      switch (analysis) {
        case 'expression':
          file = 'genes.json';
          break;
        case 'methylation':
          file = 'methylation-genes.json';
          break;
        case 'proteomics':
          file = `${cancer.toLocaleLowerCase()}-genes.json`;
          break;
        default:
      }
      getGeneNamePromise = new Promise((resolve) => {
        this.http.get<string[]>(`../assets/data/${file}`).subscribe((data: any) => {
          resolve(data.genes);
        });
      });

      getGeneNamePromise.then((data) => {
        if (term == ""){
            data = ""
        }
        else if (term) {
          data = data.filter((x:any) => x.name.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) == 0);
        }
        observer.next(data);
      });
    });
  }
}