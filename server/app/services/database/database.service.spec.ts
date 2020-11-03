import { DrawingInfo } from '@common/communication/drawing-info';
import { fail } from 'assert';
import { expect } from 'chai';
import { describe } from 'mocha';
import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
    let db: Db;
    let client: MongoClient;
    let testDrawing: DrawingInfo;

    beforeEach(async () => {
        databaseService = new DatabaseService();
        // Start a local test server
        mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getUri();
        client = await MongoClient.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // We use the local Mongo Instance and not the production database
        db = client.db(await mongoServer.getDbName());
        databaseService.collection = db.collection('test');

        testDrawing = { id: 991, name: 'Test1', tags: ['a'], metadata: '' };
        await databaseService.collection.insertOne(testDrawing);
    });

    afterEach(async () => {
        if (client.isConnected()) await client.close().catch();
    });

    it('should be connected', async () => {
        await databaseService.start();
        expect(client.isConnected());
    });

    it('should get all drawings from DB', async () => {
        const drawings = await databaseService.getAllDrawings();
        expect(drawings.length).to.equal(1);
        expect(testDrawing).to.deep.equals(drawings[0]);
    });

    it('should get specific drawing with valid id', async () => {
        // tslint:disable-next-line: no-magic-numbers
        const drawing = await databaseService.getDrawing(991);
        expect(drawing).to.deep.equals(testDrawing);
    });

    it('should insert a new valid drawing', async () => {
        const secondDrawing: DrawingInfo = { id: 992, name: 'Test2', tags: ['asdb'], metadata: '' };

        await databaseService.addDrawing(secondDrawing);
        const drawing = await databaseService.collection.find({}).toArray();
        expect(drawing.length).to.equal(2);
        expect(drawing.find((searchedDrawing) => searchedDrawing.id === secondDrawing.id)).to.deep.equals(secondDrawing);
    });

    it('should not insert a new drawing if it has an invalid name and tags', async () => {
        const secondDrawing: DrawingInfo = { id: 992, name: 'Test Drawing2', tags: [''], metadata: '' };

        try {
            await databaseService.addDrawing(secondDrawing);
        } catch {
            const drawings = await databaseService.collection.find({}).toArray();
            expect(drawings.length).to.equal(1);
        }
    });

    it('should delete an existing drawing if a valid id is sent', async () => {
        // tslint:disable-next-line: no-magic-numbers
        await databaseService.deleteDrawing(991);
        const drawings = await databaseService.collection.find({}).toArray();
        expect(drawings.length).to.equal(0);
    });

    it('should return an appropriate error for add', async () => {
        // client.logout();
        const secondDrawing: DrawingInfo = { id: 992, name: 'Test Drawing2', tags: [''], metadata: '' };
        try {
            await databaseService.addDrawing(secondDrawing);
            fail('Method should have thrown');
        } catch (error) {
            expect(error.message).to.equal('Invalid drawing, could not add to database');
        }
    });

    it('should return an appropriate error for delete', async () => {
        const drawings = await databaseService.collection.find({}).toArray();

        try {
            // tslint:disable-next-line: no-magic-numbers
            await databaseService.deleteDrawing(992);
            fail('Method should have thrown');
        } catch (error) {
            expect(error.message).to.equal('Invalid id, could not find the drawing to remove');
            expect(drawings.length).to.equal(1);
        }
    });

    it('should return an appropriate error for getAll', async () => {
        await client.close();
        try {
            await databaseService.getAllDrawings();
            fail('Method should have thrown');
        } catch (error) {
            expect(error.message).to.equal('Drawings could not be fetched');
        }
    });
});
