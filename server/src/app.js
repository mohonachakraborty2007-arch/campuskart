import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { AppError } from './utils/AppError.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: env.CLIENT_ORIGIN,
        credentials: true,
    })
);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api', routes);

app.use((req, res, next) => {
    next(new AppError(404, 'NOT_FOUND', 'Route not found'));
});

app.use(errorHandler);

export default app;