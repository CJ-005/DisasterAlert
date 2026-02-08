require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const corsOptions = require('./config/cors');
const { notFoundHandler } = require('./middleware/notFound');
const { globalErrorHandler } = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const trainingsRoutes = require('./routes/trainings');
const userProgressRoutes = require('./routes/userProgress');
const assessmentsRoutes = require('./routes/assessments');
const certificatesRoutes = require('./routes/certificates');
const announcementsRoutes = require('./routes/announcements');
const faqsRoutes = require('./routes/faqs');
const contactMessagesRoutes = require('./routes/contactMessages');
const riskLayersRoutes = require('./routes/riskLayers');
const evacuationCentersRoutes = require('./routes/evacuationCenters');
const evacuationRoutes = require('./routes/evacuation');
const gamificationRoutes = require('./routes/gamification');
const alertsRoutes = require('./routes/alerts');
const syncRoutes = require('./routes/sync');

const app = express();

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false,
}));
app.use(corsOptions);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: process.env.BODY_LIMIT || '256kb' }));

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trainings', trainingsRoutes);
app.use('/api/user-progress', userProgressRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/faqs', faqsRoutes);
app.use('/api/contact-messages', contactMessagesRoutes);
app.use('/api/risk-layers', riskLayersRoutes);
app.use('/api/evacuation-centers', evacuationCentersRoutes);
app.use('/api/evacuation', evacuationRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/sync', syncRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
