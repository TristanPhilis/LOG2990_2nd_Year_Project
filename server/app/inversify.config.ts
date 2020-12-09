import { EmailController } from '@app/controllers/email-controller';
import { IndexController } from '@app/controllers/index.controller';
import { DatabaseService } from '@app/services/database/database.service';
import { IndexService } from '@app/services/index.service';
import { Container } from 'inversify';
import 'reflect-metadata';
import { Application } from './app';
import { Server } from './server';
import { EmailExportService } from './services/email-export/email-export-service';
import { TYPES } from './types';

export const containerBootstrapper: () => Promise<Container> = async () => {
    const container: Container = new Container();

    container.bind(TYPES.Server).to(Server);
    container.bind(TYPES.Application).to(Application);
    container.bind(TYPES.IndexController).to(IndexController);
    container.bind(TYPES.EmailController).to(EmailController);
    container.bind(TYPES.IndexService).to(IndexService);
    container.bind(TYPES.DatabaseService).to(DatabaseService);
    container.bind(TYPES.EmailExportService).to(EmailExportService);

    return container;
};
