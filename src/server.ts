import app from './app';
import { Config } from './config';
import { AppDataSource } from './config/data-source';
import logger from './config/logger';

const startServer = async () => {
    const PORT = Config.PORT;

    try {
        await AppDataSource.initialize();
        logger.info(
            `Database connected successfully on port ${Config.DB_PORT}`,
        );
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            setTimeout(() => process.exit(1), 1000);
        }
    }
};

void startServer();
