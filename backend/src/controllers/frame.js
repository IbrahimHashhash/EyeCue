import { processFrame } from '../services/fastapi.js';
import { getIO } from '../socket/index.js';
import { recordAttentionData } from '../services/session.js';
import { compareAgainstPrevious } from '../services/check-similarity/similarity.js';
import FrameService from '../services/frame.js';
import { processAttentionWithCounter } from '../services/attentionStabilization.js';
import { updateStudent } from '../services/studentState.js';
import { computeAlertFlag, resetAlertState } from '../services/alert.js';

export class FrameController {
    constructor(uow) {
        this.frameservice = new FrameService(uow);
    }

    async frameHandler(req, res) {
        const frame = req.file?.buffer;
        const studentId = req.body.studentId;
        const studentName = req.body.studentName;
        const timestamp = new Date().toISOString();
        const sessionId = req.body.sessionId || req.get('X-Session-Id');
        if (!frame?.length) {
            return res.status(400).send('No frame received');
        }

        if (!studentId) {
            return res.status(400).send('No student ID received');
        }

        if (!sessionId) {
            return res.status(400).json({ 
                success: false, 
                message: 'sessionId required' 
            });
        }

        try {
            const comparasonResult = await compareAgainstPrevious(studentId, frame);
            if (!comparasonResult.firstFrame && !comparasonResult.noticeableChange) {
                console.log("Frame received is similar to the last one!");
                return res.json({
                    success: true,
                    ts: Number(timestamp),
                    clientId: studentId,
                    skipped: true,
                    reason: 'similar_to_previous',
                    similarity: comparasonResult
                });
            }

            console.log(`Processing frame for student: ${studentId}, session: ${sessionId}`);

            const frameBase64 = frame.toString('base64');
            const analysisResult = await processFrame(frameBase64, studentId, timestamp);

            const stabilizationResult = processAttentionWithCounter(
                6,
                studentId,
                analysisResult.attentionLabel
            );

            console.log(`Stabilization for ${studentId}: Stable=${stabilizationResult.stableState}, Counter=${stabilizationResult.counter}`);

            if (stabilizationResult.shouldUpdate) {
                recordAttentionData(studentId, timestamp, stabilizationResult.stableState);
                updateStudent(studentId, stabilizationResult.stableState);
                resetAlertState();
            }

            const alertFlag = computeAlertFlag();

            recordAttentionData(studentId, timestamp, analysisResult.attentionLabel);

            try {
                const frameLogId = await this.frameservice.storeFrame({
                    sessionId,
                    studentId,
                    studentName,
                    timestamp,
                    similarity_score: comparasonResult.scores?.ssim || 0,
                    label: analysisResult.attentionLabel
                });
                console.log('Frame log stored successfully with ID:', frameLogId);
            } catch (storeError) {
                console.error('Error storing frame log:', storeError);
            }

            const io = getIO();
            io.emit('attentionUpdate', {
                studentId: analysisResult.studentId,
                alert: alertFlag,
                studentName: studentName,
                label: stabilizationResult.stableState,
                analysis: analysisResult,
                timestamp: timestamp,
                stabilization: stabilizationResult
            });

            return res.status(200).json({
                success: true,
                analysis: analysisResult,
                studentId: studentId,
                timestamp: timestamp,
                stabilization: stabilizationResult
            });

        } catch (error) {
            console.error('Error processing frame:', error.message, error.stack);
            return res.status(500).json({
                success: false,
                error: 'Failed to process frame',
                details: error.message
            });
        }
    }
}