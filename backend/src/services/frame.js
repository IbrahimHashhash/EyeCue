const FrameLogRepository = require('../repositories/frameLogRepository');

/**
 * Stores a frame log in the database.
 * @param {Object} appLocals - Express app.locals object (should contain uow).
 * @param {Object} frameData - Frame data to store.
 * @param {string|number} frameData.sessionId
 * @param {string|number} frameData.studentId
 * @param {Date|string|number} frameData.timestamp
 * @param {number} frameData.similarityScore
 * @returns {Promise<void>}
 */
async function storeFrameLog(appLocals, { sessionId, studentId, timestamp, similarityScore }) {
    const uow = appLocals.uow;
    const pool = uow.pool || uow._pool || uow.getPool();
    const frameLogRepo = new FrameLogRepository(pool);
    await frameLogRepo.create({
        session_id: sessionId,
        student_id: studentId,
        timestamp,
        similarity_score: similarityScore,
        is_significant: true
    });
}

module.exports = storeFrameLog;
