import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingInfo } from '@common/communication/drawing-info';
import { EmailInfo } from '@common/communication/email-info';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class WebRequestService {
    private readonly BASE_URL: string = 'http://localhost:3000/api/index';
    private readonly EMAIL_URL: string = 'http://localhost:3000/api/email';
    nextDrawingId: number;

    constructor(private http: HttpClient) {
        this.nextDrawingId = 0;
    }

    sendEmail(emailInfo: EmailInfo): Observable<void> {
        return this.http.post<void>(this.EMAIL_URL, emailInfo).pipe(catchError(this.handleError<void>('exportEmail')));
    }

    getAllDrawings(): Observable<DrawingInfo[]> {
        return this.http.get<DrawingInfo[]>(this.BASE_URL + '/all').pipe(catchError(this.handleError<DrawingInfo[]>('getAllDrawings')));
    }

    getDrawing(drawingId: number): Observable<DrawingInfo> {
        return this.http.get<DrawingInfo>(this.BASE_URL + '/' + drawingId).pipe(catchError(this.handleError<DrawingInfo>('getDrawing')));
    }

    postDrawing(drawingInfo: DrawingInfo): Observable<void> {
        this.nextDrawingId++;
        return this.http.post<void>(this.BASE_URL + '/send', drawingInfo).pipe(catchError(this.handleError<void>('post')));
    }

    deleteDrawing(drawingId: number): Observable<number> {
        this.nextDrawingId--;
        return this.http.delete<number>(this.BASE_URL + '/' + drawingId).pipe(catchError(this.handleError<number>('delete')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            return of(result as T);
        };
    }
}
