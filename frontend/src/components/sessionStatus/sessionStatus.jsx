const SessionStatus = ({
  isActive,
  duration,
  stats = [],
  activeLabel = "Live Session Active",
  inactiveLabel = "No Active Session"
}) => {
  return (
    <div className="session-status">
      <div className="status-row">
        <div className={`status-indicator ${isActive ? 'active' : 'inactive'}`}>
          <span className="status-dot"></span>
          {isActive ? activeLabel : inactiveLabel}
        </div>
        {isActive && stats.length > 0 && (
          <div className="session-stats">
            {stats.map((stat, index) => (
              <span key={index} className="stat-item">
                <strong>{stat.label}:</strong> {stat.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionStatus;