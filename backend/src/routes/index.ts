/**
 * Main router
 * Combines all route modules
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import developerRoutes from './developer.routes';
import adminRoutes from './admin.routes';
import employeeRoutes from './employee.routes';
import publicRoutes from './public.routes';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'AMSteel Survey API is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Mount route modules
 */
router.use('/auth', authRoutes);
router.use('/developer', developerRoutes);
router.use('/admin', adminRoutes);
router.use('/employee', employeeRoutes);
router.use('/public', publicRoutes);

export default router;
