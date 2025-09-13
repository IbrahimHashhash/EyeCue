import { useState } from 'react';
import ENDPOINTS from '../../api/endpoints';

const ReportView = ({ currentSessionId, isSessionActive }) => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionIdInput, setSessionIdInput] = useState('');

  const generateReport = async (sessionId = null) => {
    const targetSessionId = sessionId || currentSessionId || sessionIdInput;
    
    if (!targetSessionId) {
      setError('No session ID available. Please start a session or enter a session ID.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(ENDPOINTS.SESSION.REPORT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: targetSessionId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
      } else {
        setError(result.message || 'Failed to generate report');
      }
    } catch (err) {
      setError(err.message || 'Network error occurred while generating report');
      console.error('Report generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>Session Attention Report</h2>
        <div className="report-controls">
          {currentSessionId ? (
            <div className="current-session-info">
              <p>Current Session: <strong>{currentSessionId}</strong></p>
              <button 
                className="generate-report-btn"
                onClick={() => generateReport()}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Current Session Report'}
              </button>
            </div>
          ) : (
            <div className="manual-session-input">
              <input
                type="text"
                placeholder="Enter Session ID"
                value={sessionIdInput}
                onChange={(e) => setSessionIdInput(e.target.value)}
                className="search-input"
              />
              <button 
                className="generate-report-btn"
                onClick={() => generateReport()}
                disabled={isLoading || !sessionIdInput}
              >
                {isLoading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="report-error">
          <p>{error}</p>
        </div>
      )}

      {reportData && (
        <div className="report-content">
          <div className="report-meta">
            <p><strong>Session ID:</strong> {reportData.sessionId}</p>
            <p><strong>Generated At:</strong> {new Date(reportData.generatedAt).toLocaleString()}</p>
            <p><strong>Total Students:</strong> {reportData.students.length}</p>
          </div>

          {reportData.students.length > 0 ? (
            <div className="report-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Total Frames</th>
                    <th>Attentive Frames</th>
                    <th>Attention Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.students.map((student, index) => (
                    <tr key={index} className={
                      student.attention_percentage >= 70 ? 'high-attention' : 
                      student.attention_percentage >= 50 ? 'medium-attention' : 
                      'low-attention'
                    }>
                      <td>{student.name}</td>
                      <td>{student.total_frames}</td>
                      <td>{student.attentive_frames}</td>
                      <td className="percentage-cell">
                        <span className="percentage-value">
                          {Number(student.attention_percentage).toFixed(2)}%
                        </span>
                        <div className="percentage-bar">
                          <div 
                            className="percentage-fill" 
                            style={{width: `${student.attention_percentage}%`}}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <p>No attention data available for this session.</p>
              <p>Make sure the session has recorded attention data.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportView;
