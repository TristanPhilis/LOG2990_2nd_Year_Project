import { Injectable } from '@angular/core';
import { DrawingInfo } from '@app/classes/drawing-info';
// import { injectable } from 'inversify';
import { Collection, MongoClient, MongoClientOptions } from 'mongodb';
import 'reflect-metadata';

const DB_USER = 'NewUser';
const DB_PASSWORD = 'eWLZhsX3pGPJJE8N';
const DB_NAME = 'DrawingsDB';
const DB_COLLECTION = 'Drawings';

const DB_URL = 'mongodb+srv://' + DB_USER + ':' + DB_PASSWORD + '@database.boh6g.mongodb.net/' + DB_NAME + '?retryWrites=true&w=majority';
@Injectable({
    providedIn: 'root',
})
export class DatabaseService {
    collection: Collection<DrawingInfo>;
    client: MongoClient;

    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    start(): void {
        MongoClient.connect(DB_URL, this.options)
            .then((client: MongoClient) => {
                this.client = client;
                this.collection = client.db(DB_NAME).collection(DB_COLLECTION);
            })
            .catch(() => {
                console.error('CONNECTION ERROR. EXITING PROCESS');
                process.exit(1);
            });
    }

    closeConnection(): void {
        this.client.close();
    }

    async getAllDrawings(): Promise<DrawingInfo[]> {
        return this.collection
            .find({})
            .toArray()
            .then((drawings: DrawingInfo[]) => {
                return drawings;
            })
            .catch((error: Error) => {
                throw error;
            });
    }

    async getDrawing(drawingName: string): Promise<DrawingInfo> {
        // NB: This can return null if the drawing does not exist, you need to handle it
        return this.collection
            .findOne({ name: drawingName })
            .then((drawing: DrawingInfo) => {
                return drawing;
            })
            .catch((error: Error) => {
                throw error;
            });
    }

    async addDrawing(drawing: DrawingInfo): Promise<void> {
        // if (this.validateDrawing(drawing)) {
        this.collection.insertOne(drawing).catch((error: Error) => {
            throw error;
        });
        /* } else {
            throw new Error('Invalid course');
        }*/
    }

    async deleteDrawing(drawingName: string): Promise<void> {
        return this.collection
            .findOneAndDelete({ name: drawingName })
            .then(() => {})
            .catch((error: Error) => {
                throw new Error('Failed to delete course');
            });
    }

    async populateDB(): Promise<void> {
        const drawings: DrawingInfo[] = [
            { name: 'Drawing1', tags: ['a', 'c'] },
            { name: 'Drawing2', tags: ['b', 'c'] },
            { name: 'Drawing3', tags: ['a'] },
            { name: 'Drawing4', tags: ['a', 'c', 'd'] },
            { name: 'Drawing5', tags: ['a', 'b'] },
        ];

        console.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        drawings.forEach((drawing) => {
            this.addDrawing(drawing);
        });
    }

    constructor() {
        //this.populateDB();
        //this.getAllDrawings();
    }
}
