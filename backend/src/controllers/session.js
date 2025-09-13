import { SessionService } from '../services/sessionStart.js';

export class SessionController {
  constructor(uow) {
    this.uow = uow;
    this.sessionService = new SessionService(uow);
  }

  async startSession(req, res) {
    try {
      const sessionId = await this.sessionService.startSession();
      res.json({ 
        success: true, 
        sessionId,
        message: 'Session started successfully' 
      });
    } catch (error) {
      console.error('Error starting session:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async endSession(req, res) {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Session ID is required' 
        });
      }

      const session = await this.sessionService.endSession(sessionId);
      res.json({ 
        success: true, 
        session,
        message: 'Session ended successfully' 
      });
    } catch (error) {
      console.error('Error ending session:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async generateReport(req, res) {
    try {
      const { sessionId } = req.body;
      
      let targetSessionId = sessionId;
      
      if (!targetSessionId) {
        targetSessionId = this.sessionService.getCurrentActiveSessionId();
        
        if (!targetSessionId) {
          return res.status(400).json({ 
            success: false, 
            message: 'No session ID provided and no active session found' 
          });
        }
      }

      console.log('Generating report for session:', targetSessionId);
      
      const reportData = await this.sessionService.generateReport(targetSessionId);
      
      res.json({ 
        success: true, 
        data: reportData,
        message: 'Report generated successfully' 
      });
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}
