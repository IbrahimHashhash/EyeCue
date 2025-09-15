// services/frame.js - Fixed version

import { v4 as uuidv4 } from 'uuid';
import FrameLogRepository from '../repositories/frameLogRepository.js';
import AttentionMetricRepository from '../repositories/attentionMetricRepository.js';

class FrameService {
    constructor(uow) {
        if (!uow) throw new Error('FrameService requires a uow');
        this.uow = uow;
        
        this.pool = uow.pool || uow._pool || (typeof uow.getPool === 'function' ? uow.getPool() : null);
        if (!this.pool) throw new Error('FrameService could not resolve a DB pool from uow');
        
        this.frameLogRepo = uow.frameLogs || new FrameLogRepository(this.pool);
        this.attentionMetricRepo = uow.attentionMetrics || new AttentionMetricRepository(this.pool);
    }

    async storeFrame({ sessionId, studentId, timestamp, similarity_score, label = null }) {
        try {
            const id = uuidv4();
            
            console.log('Storing frame with data:', {
                id,
                sessionId,
                studentId,
                timestamp,
                similarity_score,
                label
            });

            const frameLogEntry = {
                id: id,
                session_id: sessionId,
                student_id: studentId,
                timestamp: new Date(timestamp),
                similarity_score: similarity_score,
                is_significant: true,
            };

            await this.frameLogRepo.create(frameLogEntry);
            console.log('Frame log created successfully with ID:', id);

            if (label != null) {
                if (!['attentive', 'inattentive'].includes(label)) {
                    console.warn(`Invalid attention label "${label}" provided. Skipping storing attention metric.`);
                    return id;
                }
                
                await this.attentionMetricRepo.storeAttentionMetric(id, label);
                console.log('Attention metric stored for frame:', id, 'with label:', label);
            }

            return id;
        } catch (error) {
            console.error('Error in FrameService.storeFrame:', error);
            throw error;
        }
    }
}

export default FrameService;