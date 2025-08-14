import { processFrame } from '../services/fastapi.js';
import { getIO } from '../socket/index.js';
import { students } from '../mocks/students.js';

export async function frameHandler(req, res) {
    const frame = req.body;
    const captureTimestamp = req.header('X-Capture-Timestamp');


    if (!frame?.length) {
        return res.status(400).send('No frame received');
    }

    if (!captureTimestamp) {
        return res.status(400).json({ success: false, error: 'Missing X-Capture-Timestamp header' });
    }

    console.log(`Frame received from FE, size: ${frame.length} bytes`);

    try {

        const analysisResult = await processFrame({
            frameBase64: frame.toString('base64'),
            timestamp: captureTimestamp,
            studentId: students[0].id
        });

        console.log('Received analysis from FastAPI:', analysisResult);

        const io = getIO();

        io.emit('attentionUpdate', {
            analysis: analysisResult,
            studentId: analysisResult.studentId,
            timestamp: new Date().toISOString()
        });

        return res.status(200).json({ success: true, analysis: analysisResult });

    } catch (error) {
        console.error('Error processing frame:', error.message);

        return res.status(500).json({ success: false, error: 'Failed to process frame' });
    }
}