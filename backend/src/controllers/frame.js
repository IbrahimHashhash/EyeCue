import { processFrame } from '../services/fastapi.js';
import { getIO } from '../socket/index.js';

export async function frameHandler(req, res) {
    const frame = req.body;

    if (!frame?.length) {
        return res.status(400).send('No frame received');
    }
    try {
        console.log(`Frame received from FE, size: ${frame.length} bytes`);
        const frameBase64 = frame.toString('base64');
        const studentId = req.query.studentId || req.headers['student-id'] || '1234';
        const timestamp = new Date().toISOString();
        console.log('Processing frame for student:', studentId);
        const analysisResult = await processFrame(frameBase64, studentId, timestamp);
        console.log('Received analysis from FastAPI:', analysisResult);
        const io = getIO();
        io.emit('attentionUpdate', {
            studentId: analysisResult.studentId || studentId,
            score: analysisResult.attentionScore || 0.5,
            analysis: analysisResult,
            timestamp: timestamp
        });
        return res.status(200).json({
            success: true,
            analysis: analysisResult,
            studentId: studentId,
            timestamp: timestamp
        });

    } catch (error) {
        console.error('Error processing frame:', error.message);

        if (error.response) {
            console.error('FastAPI error response:', {
                status: error.response.status,
                data: error.response.data
            });
        }
        return res.status(500).json({
            success: false,
            error: 'Failed to process frame',
            details: error.response?.data || error.message
        });
    }
}