import PropTypes from 'prop-types';

const ReportMeta = ({ 
  reportData, 
  onDownloadPDF, 
  isDownloading 
}) => {
  return (
    <div className="report-meta">
      <div className="report-info">
        <p><strong>Session ID:</strong> {reportData.sessionId}</p>
        <p><strong>Generated At:</strong> {new Date(reportData.generatedAt).toLocaleString()}</p>
        <p><strong>Total Students:</strong> {reportData.students.length}</p>
      </div>
      <div className="report-actions">
        <button 
          className="download-pdf-btn"
          onClick={onDownloadPDF}
          disabled={isDownloading}
        >
          {isDownloading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
};

ReportMeta.propTypes = {
  reportData: PropTypes.shape({
    sessionId: PropTypes.string.isRequired,
    generatedAt: PropTypes.string.isRequired,
    students: PropTypes.array.isRequired
  }).isRequired,
  onDownloadPDF: PropTypes.func.isRequired,
  isDownloading: PropTypes.bool.isRequired
};

export default ReportMeta;