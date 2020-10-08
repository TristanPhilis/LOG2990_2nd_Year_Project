import { Injectable } from '@angular/core';
// import { injectable } from 'inversify';
import { Collection, FilterQuery, FindOneOptions, MongoClient, MongoClientOptions, UpdateQuery } from 'mongodb';
import 'reflect-metadata';

const DB_USER = 'NewUser';
const DB_PASSWORD = 'eWLZhsX3pGPJJE8N';
const DB_NAME = 'Database';
const DB_COLLECTION = 'drawings';

const DB_URL = 'mongodb+srv://database.boh6g.mongodb.net/<Database>';
@Injectable({
    providedIn: 'root',
})
export class DatabaseService {
    collection: Collection<any>;
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

    async getAllDrawings(): Promise<any[]> {
        return this.collection
            .find({})
            .toArray()
            .then((drawings: any[]) => {
                return drawings;
            })
            .catch((error: Error) => {
                throw error;
            });
    }

    async getDrawing(sbjCode: string): Promise<any> {
        // NB: This can return null if the drawing does not exist, you need to handle it
        return this.collection
            .findOne({ subjectCode: sbjCode })
            .then((course: any) => {
                return course;
            })
            .catch((error: Error) => {
                throw error;
            });
    }

    async addDrawing(drawing: any): Promise<void> {
        // if (this.validateDrawing(drawing)) {
        this.collection.insertOne(drawing).catch((error: Error) => {
            throw error;
        });
        /* } else {
            throw new Error('Invalid course');
        }*/
    }

    async deleteDrawing(sbjCode: string): Promise<void> {
        return this.collection
            .findOneAndDelete({ subjectCode: sbjCode })
            .then(() => {})
            .catch((error: Error) => {
                throw new Error('Failed to delete course');
            });
    }

    constructor() {}
}
