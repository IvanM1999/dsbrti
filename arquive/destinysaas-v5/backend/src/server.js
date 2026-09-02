const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Database connection
const db = require('./config/db');

// Import middlewares
const tenantMiddleware = require('./middlewares/tenantMiddleware');
const authMiddleware = require('./middlewares/authMiddleware');

// Import controllers
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:5173"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id']
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: db.client ? 'connected' : 'disconnected'
    });
});

// Apply tenant middleware to all API routes (except auth)
app.use('/api', tenantMiddleware.resolveTenant);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Static files for frontend
app.use(express.static('public'));

// Serve frontend HTML
app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    
    res.status(statusCode).json({
        status: 'error',
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Database initialization and server start
async function initializeDatabase() {
    try {
        await db.init();
        console.log('✅ Database initialized successfully');
        
        // Create tables if they don't exist
        const sqlScript = `
        -- Create tenants table
        CREATE TABLE IF NOT EXISTS tenants (
            id SERIAL PRIMARY KEY,
            slug VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            is_active BOOLEAN DEFAULT true,
            plan VARCHAR(50) DEFAULT 'free',
            trial_ends_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create users table
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            theme_color VARCHAR(50) DEFAULT 'teal',
            avatar_url TEXT,
            refresh_token VARCHAR(500),
            refresh_token_expires_at TIMESTAMP,
            billing_status VARCHAR(50) DEFAULT 'active',
            trial_ends_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create audit_logs table
        CREATE TABLE IF NOT EXISTS audit_logs (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            action VARCHAR(100) NOT NULL,
            resource_type VARCHAR(100) NOT NULL,
            resource_id INTEGER,
            details JSONB,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create payments table
        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'BRL',
            status VARCHAR(50) DEFAULT 'pending',
            payment_method VARCHAR(100),
            gateway_transaction_id VARCHAR(255),
            description TEXT,
            metadata JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create user_course_progress table
        CREATE TABLE IF NOT EXISTS user_course_progress (
            id SERIAL PRIMARY KEY,
            tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            course_id VARCHAR(100) NOT NULL,
            module_id VARCHAR(100),
            progress_percentage INTEGER DEFAULT 0,
            completed_at TIMESTAMP,
            score INTEGER,
            time_spent_minutes INTEGER DEFAULT 0,
            metadata JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tenant_id, user_id, course_id)
        );
        `;
        
        await db.query(sqlScript);
        console.log('✅ Database tables created successfully');
        
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}/api`);
            console.log(`🌐 Frontend available at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    await db.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    await db.close();
    process.exit(0);
});

// Initialize and start the server
initializeDatabase();