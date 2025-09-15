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
  const ctrl = new SessionController(req.app.locals.uow);
  return ctrl.generateReport(req, res);
});

router.post('/download-pdf', async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        let targetSessionId = sessionId;
        if (!targetSessionId) {
            const uow = req.app.locals.uow;
            const sessionService = new SessionService(uow);
            targetSessionId = sessionService.getCurrentActiveSessionId();
            
            if (!targetSessionId) {
                return res.status(400).json({
                    success: false,
                    message: 'No session ID provided and no active session found'
                });
            }
        }

        const uow = req.app.locals.uow;
        const sessionService = new SessionService(uow);
        
        const reportData = await sessionService.generateReport(targetSessionId);
        
        if (!reportData || !reportData.students || reportData.students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No data found for this session'
            });
        }

        if (pdfService.reportExists(targetSessionId)) {
            const filepath = pdfService.getReportPath(targetSessionId);
            return res.download(filepath, `${targetSessionId}.pdf`);
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