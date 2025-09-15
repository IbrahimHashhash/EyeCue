import express from 'express';
import { SessionService } from '../services/sessionStart.js';
import { SessionController } from '../controllers/session.js';
import { PDFService } from '../services/downloadPDF.js';

const router = express.Router();
const pdfService = new PDFService();

router.post('/start', (req, res) => {
  const ctrl = new SessionController(req.app.locals.uow);
  return ctrl.startSession(req, res);
});

router.post('/end', (req, res) => {
  const ctrl = new SessionController(req.app.locals.uow);
  return ctrl.endSession(req, res);
});

router.post('/report', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const uow = req.app.locals.uow;
        const sessionService = new SessionService(uow);
        
        const reportData = await sessionService.generateReport(sessionId);

        res.json({
            success: true,
            data: reportData,
            message: 'Report generated successfully'
        });
    } catch (error) {
        console.error('Report generation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/download-pdf', async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }

        const uow = req.app.locals.uow;
        const sessionService = new SessionService(uow);
        
        const reportData = await sessionService.generateReport(sessionId);
        
        if (!reportData || !reportData.students || reportData.students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No data found for this session'
            });
        }

        if (pdfService.reportExists(sessionId)) {
            const filepath = pdfService.getReportPath(sessionId);
            return res.download(filepath, `${sessionId}.pdf`);
        }

        const { filepath, filename } = await pdfService.generateSessionReportPDF(reportData);
        
        res.download(filepath, filename, (err) => {
            if (err) {
                console.error('PDF download error:', err);
                res.status(500).json({
                    success: false,
                    message: 'Error downloading PDF'
                });
            }
        });

    } catch (error) {
        console.error('PDF generation/download error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error generating PDF report'
        });
    }
});

export default router;