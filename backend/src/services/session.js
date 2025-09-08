let sessionStorage = new Map();
let currentSessionId = null;

export function startNewSession() {
    currentSessionId = `session_${Date.now()}`;
    sessionStorage.set(currentSessionId, {
        id: currentSessionId,
        startTime: new Date().toISOString(),
        students: new Map()
    });
    return currentSessionId;
}

export function recordAttentionData(studentId, frameLabel) {
    if (!currentSessionId) {
        currentSessionId = startNewSession();
    }
    
    const isAttentive = frameLabel === 'attentive';
    const session = sessionStorage.get(currentSessionId);
    if (!session.students.has(studentId)) {
        session.students.set(studentId, {
            id: studentId,
            name: `Student ${studentId}`,
            totalFrames: 0,
            attentiveFrames: 0,
            inattentiveFrames: 0
        });
    }

    const student = session.students.get(studentId);
    student.totalFrames++;
    
    if (isAttentive) {
        student.attentiveFrames++;
    } else {
        student.inattentiveFrames++;
    }
}