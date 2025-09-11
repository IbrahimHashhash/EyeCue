import FrameLogRepository from '../repositories/frameLogRepository.js';
import AttentionMetricRepository from '../repositories/attentionMetricRepository.js';

class FrameService {
    /**
     * @param {object} uow - Your Unit of Work (with or exposing a pool)
     */
    constructor(uow) {
        if (!uow) throw new Error('FrameService requires a uow');
        this.uow = uow;
        this.pool = uow.pool || uow._pool || (typeof uow.getPool === 'function' ? uow.getPool() : null);
        if (!this.pool) throw new Error('FrameService could not resolve a DB pool from uow');
    }

    /**
     * Store a frame log (and optional attention label) in DB.
     * @param {Object} params
     * @param {string|number} params.sessionId
     * @param {string|number} params.studentId
     * @param {string|number|Date} params.timestamp
     * @param {number|null} params.similarityScore
     * @param {string|number|null} [params.label] - optional attention label to attach
     * @returns {Promise<string|number>} frame_log_id
     */
    async storeFrame({ sessionId, studentId, timestamp, similarity_score, label = null }) {
        const frameLogRepo = new FrameLogRepository(this.pool);

        const frame_log_id = await frameLogRepo.create({
            session_id: sessionId,
            student_id: studentId,
            timestamp,
            similarity_score: similarity_score,
            is_significant: true,
        });

        if (label != null) {
            if (!['Attentive', 'inattentive'].includes(label)) {
                console.warn(`Invalid attention label "${label}" provided. Skipping storing attention metric.`);
                return frame_log_id;
            }
            const attentionMetricRepo = new AttentionMetricRepository(this.pool);
            await attentionMetricRepo.storeAttentionMetric(frame_log_id, label);
        }

        return frame_log_id;
    }
}
export default FrameService;