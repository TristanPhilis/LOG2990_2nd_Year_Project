import { DrawingInfo } from '@common/communication/drawing-info';
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

        testDrawing = { id: 991, name: 'Test Drawing', tags: [''], metadata: '' };
        databaseService.collection.insertOne(testDrawing);
    });

    afterEach(async () => {
        client.close();
    });

    it('should get all drawings from DB', async () => {
        const courses = await databaseService.getAllDrawings();
        expect(courses.length).to.equal(1);
        expect(testDrawing).to.deep.equals(courses[0]);
    });

    it('should get specific drawing with valid id', async () => {
        const drawing = await databaseService.getDrawing(991);
        expect(drawing).to.deep.equals(testDrawing);
    });

    /*it('should get null with an invalid id', async () => {
        const course = await databaseService.getDrawing(990);
        expect(course).to.deep.equals(null);
    });*/

    it('should insert a new drawing', async () => {
        const secondDrawing: DrawingInfo = { id: 992, name: 'Test Drawing2', tags: [''], metadata: '' };

        await databaseService.addDrawing(secondDrawing);
        const drawing = await databaseService.collection.find({}).toArray();
        expect(drawing.length).to.equal(2);
        expect(drawing.find((searchedDrawing) => searchedDrawing.id === secondDrawing.id)).to.deep.equals(secondDrawing);
    });

    /*it('should not insert a new course if it has an invalid name and tags', async () => {
        const secondDrawing: DrawingInfo = {id: 992, name: 'Test Drawing2', tags: [''], metadata: '' };

        try {
            await databaseService.addDrawing(secondDrawing);
        } catch {
            const courses = await databaseService.collection.find({}).toArray();
            expect(courses.length).to.equal(1);
        }
    });*/

    it('should delete an existing drawing if a valid id is sent', async () => {
        await databaseService.deleteDrawing(991);
        const drawings = await databaseService.collection.find({}).toArray();
        expect(drawings.length).to.equal(0);
    });

    /*it('should not delete a course if it has an invalid subjectCode ', async () => {
        try {
            await databaseService.deleteCourse('LOG1002');
        } catch {
            const courses = await databaseService.collection.find({}).toArray();
            expect(courses.length).to.equal(1);
        }
    });*/
});
