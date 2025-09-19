import PropTypes from 'prop-types';
import AttentionTableRow from '../attentionTableRow/attentionTableRow';

const AttentionTable = ({ students }) => {
  if (!students || students.length === 0) {
    return (
      <div className="no-data">
        <p>No attention data available for this session.</p>
        <p>Make sure the session has recorded attention data.</p>
      </div>
    );
  }

  return (
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
          {students.map((student, index) => (
            <AttentionTableRow key={index} student={student} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

AttentionTable.propTypes = {
  students: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      total_frames: PropTypes.number.isRequired,
      attentive_frames: PropTypes.number.isRequired,
      attention_percentage: PropTypes.number.isRequired
    })
  ).isRequired
};

export default AttentionTable;