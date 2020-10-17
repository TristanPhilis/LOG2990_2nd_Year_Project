import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingInfo } from '@common/communication/drawing-info';
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

    /*basicPost(message: Message): Observable<void> {
        return this.http.post<void>(this.BASE_URL + '/send', message).pipe(catchError(this.handleError<void>('basicPost')));
    }*/

    getAllDrawings(): Observable<DrawingInfo[]> {
      return this.http.get<DrawingInfo[]>(this.BASE_URL + '/all').pipe(catchError(this.handleError<DrawingInfo[]>('getAllDrawings')));
    };

    getDrawing(drawingId: number): Observable<DrawingInfo> {
      return this.http.get<DrawingInfo>(this.BASE_URL + '/' + drawingId).pipe(catchError(this.handleError<DrawingInfo>('getDrawing')));
    };

    postDrawing(drawingInfo: DrawingInfo): Observable<void> {
      return this.http.post<void>(this.BASE_URL + '/send', drawingInfo).pipe(catchError(this.handleError<void>('post')));
    }

    deleteDrawing(drawingId: number): Observable<void> {
      return this.http.delete<void>(this.BASE_URL + '/' + drawingId).pipe(catchError(this.handleError<void>('delete')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            return of(result as T);
        };
    }
}
