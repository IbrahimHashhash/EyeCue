// src/components/report/reportView.jsx
import { useState } from 'react';
import ENDPOINTS from '../../api/endpoints';

const ReportView = () => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(ENDPOINTS.SESSION.REPORT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}) // Will use current active session
      });

      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
      } else {
        setError(result.message || 'Failed to generate report');
      }
    } catch (err) {
      setError('Network error occurred while generating report');
      console.error('Report generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>Session Attention Report</h2>
        <button 
          className="generate-report-btn"
          onClick={generateReport}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Report'}
        </button>
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
                    <tr key={index} className={student.attention_percentage >= 70 ? 'high-attention' : student.attention_percentage >= 50 ? 'medium-attention' : 'low-attention'}>
                      <td>{student.name}</td>
                      <td>{student.total_frames}</td>
                      <td>{student.attentive_frames}</td>
                      <td className="percentage-cell">
                        <span className="percentage-value">{student.attention_percentage}%</span>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportView;