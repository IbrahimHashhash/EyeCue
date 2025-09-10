import { processFrame } from '../services/fastapi.js';
import { getIO } from '../socket/index.js';
import { recordAttentionData } from '../services/session.js';
import { compareAgainstPrevious } from '../services/check-similarity/similarity.js';
import { storeFrame } from '../services/frame.js';

export async function frameHandler(req, res) {
    const frame = req.file?.buffer;
    const studentId = req.body.studentId;
    const studentName = req.body.studentName;
    const timestamp = new Date().toISOString();
    const sessionId = req.body.sessionId || req.get('X-Session-Id');

    if (!frame?.length) {
        return res.status(400).send('No frame received');
    }

    if (!studentId) {
        return res.status(400).send('No ID received');
    }

    if (!sessionId) {
        return res.status(400).json({ success: false, message: 'sessionId required' });
    }

    try {
        const comparasonResult = await compareAgainstPrevious(studentId, frame);
        if (!comparasonResult.firstFrame && !comparasonResult.noticeableChange) {
            console.log("Frame received is similar to the last one !");

            return res.json({
                success: true,
                ts: Number(timestamp),
                clientId: studentId,
                skipped: true,
                reason: 'similar_to_previous',
                similarity: comparasonResult
            });
        }

        console.log(`Frame received from FE, size: ${frame.length} bytes`);

        const frameBase64 = frame.toString('base64');
        console.log('Processing frame for student:', studentId);
        const analysisResult = await processFrame(frameBase64, studentId, timestamp);

        recordAttentionData(studentId, timestamp, analysisResult.attentionLabel);

        console.log('Received analysis from FastAPI:', analysisResult);

        const io = getIO();

        io.emit('attentionUpdate', {
            studentId: analysisResult.studentId,
            studentName: studentName,
            label: analysisResult.label,
            analysis: analysisResult,
            timestamp: timestamp
        });


        await storeFrame({
            sessionId: sessionId,
            studentId: studentId,
            studentName: studentName,
            timestamp: timestamp,
            similarity_score: comparasonResult.scores.ssim
        });

        return res.status(200).json({
            success: true,
            analysis: analysisResult,
            studentId: studentId,
            timestamp: timestamp
        });

    } catch (error) {
        console.error('Error processing frame:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to process frame',
            details: error.message
        });
    }
}