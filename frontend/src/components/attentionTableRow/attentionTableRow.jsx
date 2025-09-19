import PropTypes from 'prop-types';

const AttentionTableRow = ({ student }) => {
  const getAttentionClass = (percentage) => {
    if (percentage >= 70) return 'high-attention';
    if (percentage >= 50) return 'medium-attention';
    return 'low-attention';
  };

  return (
    <tr className={getAttentionClass(student.attention_percentage)}>
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
            style={{ width: `${student.attention_percentage}%` }}
          ></div>
        </div>
      </td>
    </tr>
  );
};

AttentionTableRow.propTypes = {
  student: PropTypes.shape({
    name: PropTypes.string.isRequired,
    total_frames: PropTypes.number.isRequired,
    attentive_frames: PropTypes.number.isRequired,
    attention_percentage: PropTypes.number.isRequired
  }).isRequired
};

export default AttentionTableRow;