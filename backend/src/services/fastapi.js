import axios from 'axios';  // -> import axios library

export async function processFrame(frame) {
    try {
        const response = await axios.post(
            `${process.env.FASTAPI_URL}/process_frame`, 
            {frame},
            {timeout: 5000} 
        );

        return response.data; 
    
    } catch (error) {  
        console.error('Error sending frame to FastAPI:', error.message);
        
        throw error;
    }
}