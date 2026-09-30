import { Router } from 'express';
import { authenticate } from '../../../middleware/auth.middleware';
import {
  createBackupController,
  restoreBackupController,
  getBackupsController,
  getBackupStatsController,
  deleteBackupController,
} from './backup.controller';

const router = Router();

// All backup routes require authentication and admin role
router.use(authenticate);

/**
 * @route   POST /api/backups
 * @desc    Create a new database backup
 * @access  Admin only
 */
router.post('/', createBackupController);

/**
 * @route   POST /api/backups/restore/:fileName
 * @desc    Restore database from backup
 * @access  Admin only
 */
router.post('/restore/:fileName', restoreBackupController);

/**
 * @route   GET /api/backups
 * @desc    Get all available backups
 * @access  Admin only
 */
router.get('/', getBackupsController);

/**
 * @route   GET /api/backups/stats
 * @desc    Get backup statistics
 * @access  Admin only
 */
router.get('/stats', getBackupStatsController);

/**
 * @route   DELETE /api/backups/:fileName
 * @desc    Delete a specific backup
 * @access  Admin only
 */
router.delete('/:fileName', deleteBackupController);

export default router;