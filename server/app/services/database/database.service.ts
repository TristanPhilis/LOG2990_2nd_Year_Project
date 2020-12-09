import { DrawingInfo } from '@common/communication/drawing-info';
import { injectable } from 'inversify';
import { Collection, MongoClient, MongoClientOptions } from 'mongodb';
import 'reflect-metadata';
@injectable()
export class DatabaseService {
    collection: Collection<DrawingInfo>;
    client: MongoClient;

    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    start(): void {
        const DB_URL =
            'mongodb+srv://' +
            process.env.DB_USER +
            ':' +
            process.env.DB_PASSWORD +
            '@database.boh6g.mongodb.net/' +
            process.env.DB_NAME +
            '?retryWrites=true&w=majority';
        MongoClient.connect(DB_URL, this.options)
            .then((client: MongoClient) => {
                this.client = client;
                this.collection = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION as string);
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
            .catch(() => {
                throw new Error('Drawings could not be fetched');
            });
    }

    async getDrawing(drawingId: number): Promise<DrawingInfo> {
        // NB: This can return null if the drawing does not exist, you need to handle it
        return this.collection
            .findOne({ id: drawingId })
            .then((drawing: DrawingInfo) => {
                return drawing;
            })
            .catch();
    }

    async addDrawing(drawing: DrawingInfo): Promise<void> {
        if (this.validateDrawing(drawing)) {
            this.collection.insertOne(drawing).catch();
        } else {
            throw new Error('Invalid drawing, could not add to database');
        }
    }

    async deleteDrawing(drawingId: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.collection
                .findOneAndDelete({ id: drawingId })
                .then((deletedDrawing) => {
                    if (deletedDrawing.value === null) {
                        reject(new Error('Invalid id, could not find the drawing to remove'));
                    } else {
                        resolve();
                    }
                })
                .catch();
        });
    }

    private validateDrawing(drawing: DrawingInfo): boolean {
        return this.validateId(drawing.id) && this.validateName(drawing.name) && this.validateTags(drawing.tags);
    }

    private validateId(id: number): boolean {
        return id >= 0;
    }

    private validateName(name: string): boolean {
        return name !== '';
    }
    private validateTags(tags: string[]): boolean {
        let isValid = true;
        const regEx = /^[a-z][a-z0-9]{0,4}$/i;
        for (const tag of tags) if (!regEx.test(tag)) isValid = false;
        return isValid;
    }
}
