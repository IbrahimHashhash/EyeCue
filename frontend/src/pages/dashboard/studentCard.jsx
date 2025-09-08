const StudentCard = ({ student, index }) => {
  const getCardColor = (currentState) => {
    if (currentState === 'attentive') {
      return 'linear-gradient(135deg, #10b981, #059669)'; 
    } else if (currentState === 'inattentive') {
      return 'linear-gradient(135deg, #ef4444, #dc2626)'; 
    }
    return 'linear-gradient(135deg, #64748b, #475569)';
  };

  const getAttentionLabel = (currentState) => {
    if (currentState === 'attentive') return 'ATTENTIVE';
    if (currentState === 'inattentive') return 'NOT ATTENTIVE';
    return 'WAITING...';
  };

  const getTextColor = (currentState) => {
    return currentState ? '#ffffff' : '#ffffff';
  };

  return (
    <div
      className="simple-student-card"
      style={{
        animationDelay: `${index * 0.1}s`,
        background: getCardColor(student.currentState),
      }}
    >
      <div className="simple-card-content">
        <div className="simple-student-info">
          <h3 
            className="simple-student-name"
            style={{ color: getTextColor(student.currentState) }}
          >
            {student.studentName}
          </h3>
          <span 
            className="simple-attention-label"
            style={{ color: getTextColor(student.currentState) }}
          >
            {getAttentionLabel(student.currentState)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;