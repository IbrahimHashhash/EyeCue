const DebugView = ({ 
  students, 
  isSessionActive, 
  sortedAndFilteredStudents 
}) => {
  return (
    <div className="students-grid">
      {sortedAndFilteredStudents.length === 0 ? (
        <div className="no-students">
          <div className="no-students-icon">👥</div>
          <h3>No Students Found</h3>
          <p>Start a camera session to see debug data</p>
        </div>
      ) : (
        sortedAndFilteredStudents.map((student, index) => (
          <div
            key={student.studentId}
            className="student-card debug-card"
            style={{
              animationDelay: `${index * 0.1}s`,
              background: student.currentState === 'attentive' 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : student.currentState === 'inattentive'
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #64748b, #475569)',
            }}
          >
            <div className="card-glow"></div>
            <div className="card-header">
              <div className="student-details">
                <h3 className="student-name">{student.studentName}</h3>
                <span className="student-id">#{student.studentId}</span>
                {isSessionActive && (
                  <span className={`attention-badge ${student.currentState || 'unknown'}`}>
                    {student.currentState ? student.currentState.toUpperCase() : 'WAITING...'}
                  </span>
                )}
              </div>
            </div>
            <div className="attention-section">
              <div className="attention-percentage">
                <span className="percentage-value">{student.attentivePercentage || 0}</span>
                <span className="percentage-unit">%</span>
                <span className="percentage-label">Attentive Time</span>
              </div>
              <div className="attention-breakdown">
                <div className="breakdown-item attentive">
                  <span className="breakdown-label">Attentive</span>
                  <span className="breakdown-value">{student.attentiveCount || 0}</span>
                </div>
                <div className="breakdown-item inattentive">
                  <span className="breakdown-label">Inattentive</span>
                  <span className="breakdown-value">{student.inattentiveCount || 0}</span>
                </div>
              </div>
              {student.attentionStates && student.attentionStates.length > 1 && (
                <div className="mini-timeline">
                  <span className="timeline-label">Recent:</span>
                  <div className="timeline-bars">
                    {student.attentionStates.slice(-10).map((isAttentive, index) => (
                      <div
                        key={index}
                        className={`timeline-bar ${isAttentive ? 'attentive' : 'inattentive'}`}
                        title={isAttentive ? 'Attentive' : 'Inattentive'}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
              {isSessionActive && student.totalUpdates && (
                <div className="realtime-stats">
                  <div className="stat">
                    <span className="stat-label">Updates:</span>
                    <span className="stat-value">{student.totalUpdates}</span>
                  </div>
                  {student.lastUpdate && (
                    <div className="stat">
                      <span className="stat-label">Last:</span>
                      <span className="stat-value">{new Date(student.lastUpdate).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DebugView;