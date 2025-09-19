import { useState } from 'react';
import ENDPOINTS from '../../api/endpoints';
import ReportHeader from '../../components/reportHeader/reportHeader';
import ErrorMessage from '../../components/errorMessage/errorMessage';
import ReportContent from '../../components/reportContent/reportContent';

const ReportView = ({ currentSessionId, isSessionActive }) => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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

  const downloadReportAsPDF = async () => {
    if (!reportData) {
      setError('No report data available to download');
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch(ENDPOINTS.SESSION.DOWNLOAD_PDF, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: reportData.sessionId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download PDF');
      }

      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportData.sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      setError(err.message || 'Network error occurred while downloading PDF');
      console.error('PDF download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="report-container">
      <ReportHeader 
        currentSessionId={currentSessionId}
        sessionIdInput={sessionIdInput}
        setSessionIdInput={setSessionIdInput}
        onGenerateReport={generateReport}
        isLoading={isLoading}
      />
      
      <ErrorMessage error={error} />
      
      <ReportContent 
        reportData={reportData}
        onDownloadPDF={downloadReportAsPDF}
        isDownloading={isDownloading}
      />
    </div>
  );
};

export default ReportView;