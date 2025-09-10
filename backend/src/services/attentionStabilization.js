import { ATTENTION_STABILIZATION } from '../config/constants.js';

const studentCounters = new Map();

export function processAttentionWithCounter(sessionId, studentId, newAttentionState) {
    const key = `${sessionId}_${studentId}`;
    let studentData = studentCounters.get(key);
    
    if (!studentData) {
        studentData = {
            currentStableState: 'unknown',
            pendingState: newAttentionState,
            counter: 1
        };
        studentCounters.set(key, studentData);
        return {
            stableState: 'unknown',
            pendingState: newAttentionState,
            counter: 1,
            shouldUpdate: false
        };
    }
    
    if (newAttentionState === studentData.currentStableState) {
        studentData.pendingState = null;
        studentData.counter = 0;
        return {
            stableState: studentData.currentStableState,
            pendingState: null,
            counter: 0,
            shouldUpdate: false
        };
    }
    
    if (newAttentionState === studentData.pendingState) {
        studentData.counter++;
    } else {
        studentData.pendingState = newAttentionState;
        studentData.counter = 1;
    }

    if (studentData.counter >= ATTENTION_STABILIZATION.FRAME_THRESHOLD) {
        studentData.currentStableState = studentData.pendingState;
        studentData.pendingState = null;
        studentData.counter = 0;
        return {
            stableState: studentData.currentStableState,
            pendingState: null,
            counter: 0,
            shouldUpdate: true
        };
    }

    return {
        stableState: studentData.currentStableState,
        pendingState: studentData.pendingState,
        counter: studentData.counter,
        shouldUpdate: false
    };
}

export function getStableState(sessionId, studentId) {
    const key = `${sessionId}_${studentId}`;
    const studentData = studentCounters.get(key);
    return studentData ? studentData.currentStableState : 'unknown';
}

export function cleanupStudent(sessionId, studentId) {
    const key = `${sessionId}_${studentId}`;
    studentCounters.delete(key);
}