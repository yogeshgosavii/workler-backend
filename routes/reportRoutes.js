import { Router } from 'express';
import { createReport, deleteReport, getAllReports, getReport, updateReport } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
// import { getAllReports, getReportById, createReport, updateReport, deleteReport } from '../controllers/reportController.js';

const router = Router();

// Route to get all reports
router.get('/',getAllReports);

// Route to get a specific report by ID
router.get('/:id', getReport);

// Route to create a new report
router.post('/create', createReport);

// Route to update a report by ID
router.put('/:id', updateReport);

// Route to delete a report by ID
router.delete('/:id', deleteReport);

export default router;