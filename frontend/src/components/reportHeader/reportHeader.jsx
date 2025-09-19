import PropTypes from 'prop-types';

const ReportHeader = ({ 
  currentSessionId, 
  sessionIdInput, 
  setSessionIdInput, 
  onGenerateReport, 
  isLoading 
}) => {
  return (
    <div className="report-header">
      <h2>Session Attention Report</h2>
      <div className="report-controls">
        {currentSessionId ? (
          <div className="current-session-info">
            <p>Current Session: <strong>{currentSessionId}</strong></p>
            <button 
              className="generate-report-btn"
              onClick={() => onGenerateReport()}
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
              onClick={() => onGenerateReport()}
              disabled={isLoading || !sessionIdInput}
            >
              {isLoading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

ReportHeader.propTypes = {
  currentSessionId: PropTypes.string,
  sessionIdInput: PropTypes.string.isRequired,
  setSessionIdInput: PropTypes.func.isRequired,
  onGenerateReport: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default ReportHeader;