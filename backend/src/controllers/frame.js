import { processFrame } from '../services/fastapi.js';
import { getIO } from '../socket/index.js';

export async function frameHandler(req, res) {   
    const frame = req.body; 

    if (!frame?.length) {
        return res.status(400).send('No frame received');
    }

    try {
        const analysisResult = await processFrame(frame.toString('base64')); 

        console.log('Received analysis from FastAPI:', analysisResult);

        const io = getIO();  

        io.emit('attentionUpdate', {    
            analysis: analysisResult,
            timestamp: new Date().toISOString()
        });

        return res.status(200).json({ success: true, analysis: analysisResult });

    } catch (error) {
        console.error('Error processing frame:', error.message);

        return res.status(500).json({ success: false, error: 'Failed to process frame' });
    }
}