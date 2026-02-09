import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Config and Middleware (Note the .js extensions)
import corsOptions from './config/cors.js';
import { notFoundHandler } from './middleware/notFound.js';
import { globalErrorHandler } from './middleware/errorHandler.js';

// Route Imports (Note the .js extensions)
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import announcementsRoutes from './routes/announcements.js';
import alertsRoutes from './routes/alerts.js';
import faqsRoutes from './routes/faqs.js';
import riskLayersRoutes from './routes/riskLayers.js';
import contactMessagesRoutes from './routes/contactMessages.js';
import certificatesRoutes from './routes/certificates.js';
import figmaRoutes from './routes/figma.js';

const app = express();

// --- Middleware ---
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// --- API Routes ---
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/faqs', faqsRoutes);
app.use('/api/risk-layers', riskLayersRoutes);
app.use('/api/contact-messages', contactMessagesRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/figma', figmaRoutes);

// --- Error Handling ---
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app; // Replaces module.exports = app;