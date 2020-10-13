import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingInfo } from '@common/communication/drawing-info';
// import { DrawingInfo } from '@common/communication/drawing-info';
import { Message } from '@common/communication/message';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class IndexService {
    private readonly BASE_URL: string = 'http://localhost:3000/api/index';

    constructor(private http: HttpClient) {}

    /*basicGet(): Observable<Message> {
        return this.http.get<Message>(this.BASE_URL).pipe(catchError(this.handleError<Message>('basicGet')));
    }*/

    basicPost(message: Message): Observable<void> {
        return this.http.post<void>(this.BASE_URL + '/send', message).pipe(catchError(this.handleError<void>('basicPost')));
    }

    getDrawing(): Observable<DrawingInfo[]> {
      return this.http.get<DrawingInfo[]>(this.BASE_URL).pipe(catchError(this.handleError<DrawingInfo[]>('getDrawing')));
    };

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            return of(result as T);
        };
    }
}
