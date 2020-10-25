// import { Injectable } from '@angular/core';
import { DrawingInfo } from '@common/communication/drawing-info';
import { injectable } from 'inversify';
import { Collection, MongoClient, MongoClientOptions } from 'mongodb';
import 'reflect-metadata';

const DB_USER = 'NewUser';
const DB_PASSWORD = 'eWLZhsX3pGPJJE8N';
const DB_NAME = 'DrawingsDB';
const DB_COLLECTION = 'Drawings';

const DB_URL = 'mongodb+srv://' + DB_USER + ':' + DB_PASSWORD + '@database.boh6g.mongodb.net/' + DB_NAME + '?retryWrites=true&w=majority';
@injectable()
export class DatabaseService {
    collection: Collection<DrawingInfo>;
    client: MongoClient;

    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    start() {
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

    async getDrawing(drawingId: number): Promise<DrawingInfo> {
        // NB: This can return null if the drawing does not exist, you need to handle it
        return this.collection
            .findOne({ id: drawingId })
            .then((drawing: DrawingInfo) => {
                return drawing;
            })
            .catch((error: Error) => {
                throw error;
            });
    }

    async addDrawing(drawing: DrawingInfo): Promise<void> {
        if (this.validateDrawing(drawing)) {
            this.collection.insertOne(drawing).catch((error: Error) => {
                throw error;
            });
        } else {
            throw new Error('Invalid drawing');
        }
    }

    async deleteDrawing(drawingId: number): Promise<void> {
        return this.collection
            .findOneAndDelete({ id: drawingId })
            .then(() => {})
            .catch((error: Error) => {
                throw error;
            });
    }

    async populateDB() {
        const drawings: DrawingInfo[] = [
            { id: 1, name: 'Drawing1', tags: ['a', 'c'], metadata: '' },
            { id: 2, name: 'Drawing2', tags: ['b', 'c'], metadata: '' },
            { id: 3, name: 'Drawing3', tags: ['a'], metadata: '' },
            { id: 4, name: 'Drawing4', tags: ['a', 'c', 'd'], metadata: '' },
            { id: 5, name: 'Drawing5', tags: ['a', 'b'], metadata: '' },
        ];

        console.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        drawings.forEach((drawing) => {
            this.addDrawing(drawing);
        });
    }

    private validateDrawing(drawing: DrawingInfo): boolean {
        return this.validateId(drawing.id) && this.validateName(drawing.name) && this.validateTags(drawing.tags);
    }

    private validateId(id: number): boolean {
        return true;
    }

    private validateName(name: string): boolean {
        return true;
    }
    private validateTags(tags: string[]): boolean {
        return true;
    }

    constructor() {
    }
}
