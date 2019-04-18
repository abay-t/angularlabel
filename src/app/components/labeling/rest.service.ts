import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';



const httpOptions = {
  headers: new HttpHeaders({
    'Content-type': 'application/json',
    'Accept': 'application/json;q=0.9,*/*;q=0.8'
  })
};

@Injectable()
export class RestService {

  private datasUrl = 'http://35.246.223.72/api/polygons/';

  constructor(private http: HttpClient) { }


  getDatas() {
    let headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Accept': 'application/json;q=0.9,*/*;q=0.8'
    })
    return this.http.get(this.datasUrl, { headers: headers })
  }

  updateData(datas: any, id): Observable<any> {
    return this.http.put(this.datasUrl + id + '/', datas, httpOptions).pipe(
      catchError(this.handleError<any>('updateDatas'))
    );
  }
  deleteData(id) {
    return this.http.delete(this.datasUrl + id + '/', httpOptions);
  }

  /**
 * Handle Http operation that failed.
 * Let the app continue.
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}

