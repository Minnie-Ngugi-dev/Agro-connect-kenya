import 'dotenv/config';
import express    from 'express';
import cors       from 'cors';
import morgan     from 'morgan';
import rateLimit  from 'express-rate-limit';
import connectDB  from './config/db.js';
import logger     from './config/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes     from './routes/auth.js';
import profileRoutes  from './routes/profile.js';
import productRoutes  from './routes/products.js';
import orderRoutes    from './routes/orders.js';
import paymentRoutes  from './routes/payments.js';
import cartRoutes     from './routes/cart.js';
import adminRoutes    from './routes/admin.js';
import hotelRoutes    from './routes/hotel.js';

const app = express();
connectDB();

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: 'Too many requests' } });

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (m) => logger.info(m.trim()) } }));
app.use('/api/', limiter);

app.get('/health', (_, res) => res.json({ success: true, message: '🌾 Agro-Connect Kenya API running', ts: new Date() }));

app.use('/api/auth',     authRoutes);
app.use('/api/profile',  profileRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/hotel',    hotelRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`🌾 Server on port ${PORT}`));
export default app;
