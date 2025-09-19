import PropTypes from 'prop-types';
import ReportMeta from '../reportMeta/reportMeta';
import AttentionTable from '../attentionTable/attentionTable';

const ReportContent = ({ 
  reportData, 
  onDownloadPDF, 
  isDownloading 
}) => {
  if (!reportData) return null;

  return (
    <div className="report-content">
      <ReportMeta 
        reportData={reportData}
        onDownloadPDF={onDownloadPDF}
        isDownloading={isDownloading}
      />
      <AttentionTable students={reportData.students} />
    </div>
  );
};

ReportContent.propTypes = {
  reportData: PropTypes.shape({
    sessionId: PropTypes.string.isRequired,
    generatedAt: PropTypes.string.isRequired,
    students: PropTypes.array.isRequired
  }),
  onDownloadPDF: PropTypes.func.isRequired,
  isDownloading: PropTypes.bool.isRequired
};

export default ReportContent;