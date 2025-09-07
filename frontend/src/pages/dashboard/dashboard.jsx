import { useEffect, useState, useCallback } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSocket } from "../../hooks/useSocket";
import "./dashboard.css";
import {
  getAttentionClass,
  getAttentionGradient,
  getSessionDuration,
  filterStudents,
  sortStudents,
  processStudentUpdate,
  updateSessionStats,
  showInattentiveToast
} from "./dashboard.utils";

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [totalFramesProcessed, setTotalFramesProcessed] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    totalAttentiveFrames: 0,
    totalInattentiveFrames: 0,
    attentivePercentage: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [sortType, setSortType] = useState("attention");
  const [sessionDuration, setSessionDuration] = useState("00:00");

  const handleAttentionUpdate = useCallback((data) => {
    console.log('Real-time attention update:', data);
    const isAttentive = data.label === 'attentive' || data.analysis?.attentionLabel === 'attentive';
    const attentionLabel = data.label || data.analysis?.attentionLabel || 'unknown';
    const studentId = data.studentId;
    const timestamp = data.timestamp;
    const now = new Date();
    setLastUpdate(now.toLocaleTimeString());
    setIsSessionActive(true);
    setTotalFramesProcessed(prev => prev + 1);
    if (!sessionStartTime) {
      setSessionStartTime(now);
    }
    setStudents(prevStudents =>
      processStudentUpdate(prevStudents, data, isAttentive, attentionLabel, studentId, timestamp)
    );
    setSessionStats(prev => updateSessionStats(prev, isAttentive));
    if (data.alert === true) {
      showInattentiveToast();
    }
  }, [sessionStartTime]);

  useSocket(handleAttentionUpdate);

  const filteredStudents = filterStudents(students, searchTerm, selectedFilter);
  const sortedAndFilteredStudents = sortStudents(filteredStudents, sortType);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(getSessionDuration(sessionStartTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  return (
    <div className="dashboard-container">
      <div className="background-pattern"></div>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <span className="logo-symbol">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </span>
            </div>
            <div className="logo-content">
              <span className="logo-title">EyeCue</span>
              <span className="logo-subtitle">Analytics</span>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-group">
            <span className="nav-label">Overview</span>
            <button className="nav-item active">
              <div className="nav-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="20" x2="12" y2="10"></line>
                  <line x1="18" y1="20" x2="18" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="16"></line>
                </svg>
              </div>
              <span>Dashboard</span>
              <div className="nav-indicator"></div>
            </button>
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">T</div>
            <div className="user-info">
              <span className="user-name">Teacher</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-top">
            <div className="header-title-section">
              <h1 className="dashboard-title">
                Attention
                <span className="title-accent">Dashboard</span>
              </h1>
              <p className="dashboard-subtitle">
                Monitor student attention states in real-time
              </p>
            </div>
            <div className="header-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <div className="search-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
              </div>
              <div className="sort-container">
                <button
                  className="sort-button"
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="filter-icon"
                  >
                    <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" />
                  </svg>
                  <span className="sort-label">Filter</span>
                </button>
                {isSortDropdownOpen && (
                  <div className="sort-dropdown-menu">
                    <div
                      className={`sort-dropdown-item ${selectedFilter === "all" ? "active" : ""}`}
                      onClick={() => {
                        setSelectedFilter("all");
                        setIsSortDropdownOpen(false);
                      }}
                    >
                      All Students
                    </div>
                    <div
                      className={`sort-dropdown-item ${selectedFilter === "attentive" ? "active" : ""}`}
                      onClick={() => {
                        setSelectedFilter("attentive");
                        setIsSortDropdownOpen(false);
                      }}
                    >
                      Currently Attentive
                    </div>
                    <div
                      className={`sort-dropdown-item ${selectedFilter === "inattentive" ? "active" : ""}`}
                      onClick={() => {
                        setSelectedFilter("inattentive");
                        setIsSortDropdownOpen(false);
                      }}
                    >
                      Currently Inattentive
                    </div>
                    <div
                      className={`sort-dropdown-item ${selectedFilter === "high" ? "active" : ""}`}
                      onClick={() => {
                        setSelectedFilter("high");
                        setIsSortDropdownOpen(false);
                      }}
                    >
                      High Attention (80%+)
                    </div>
                    <div
                      className={`sort-dropdown-item ${selectedFilter === "low" ? "active" : ""}`}
                      onClick={() => {
                        setSelectedFilter("low");
                        setIsSortDropdownOpen(false);
                      }}
                    >
                      Low Attention (&lt;50%)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="session-status">
            <div className="status-row">
              <div className={`status-indicator ${isSessionActive ? 'active' : 'inactive'}`}>
                <span className="status-dot"></span>
                {isSessionActive ? 'Live Session Active' : 'No Active Session'}
              </div>
              {isSessionActive && (
                <div className="session-stats">
                  <span className="stat-item">
                    <strong>Duration:</strong> {sessionDuration}
                  </span>
                  <span className="stat-item">
                    <strong>Frames:</strong> {totalFramesProcessed}
                  </span>
                  <span className="stat-item">
                    <strong>Overall Attention:</strong> {sessionStats.attentivePercentage}%
                  </span>
                  {lastUpdate && (
                    <span className="stat-item">
                      <strong>Last Update:</strong> {lastUpdate}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        <section className="content-body">
          <div className="students-grid">
            {sortedAndFilteredStudents.length === 0 ? (
              <div className="no-students">
                <div className="no-students-icon">👥</div>
                <h3>No Students Found</h3>
                <p>Start a camera session to see real-time attention data</p>
              </div>
            ) : (
              sortedAndFilteredStudents.map((student, index) => (
                <div
                  key={student.studentId}
                  className={`student-card ${getAttentionClass(student)} ${isSessionActive ? 'live' : ''}`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    background: getAttentionGradient(student.attentivePercentage || 0),
                  }}
                >
                  <div className="card-glow"></div>
                  <div className="card-header">
                    <div className="student-avatar">
                      <span className="avatar-text">
                        {student.studentName
                          .split(" ")
                          .map((name) => name[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="student-details">
                      <h3 className="student-name">{student.studentName}</h3>
                      <span className="student-id">#{student.studentId}</span>
                      {isSessionActive && (
                        <span className={`attention-badge ${student.currentState || 'unknown'}`}>
                          {student.currentState ? student.currentState.toUpperCase() : 'WAITING...'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="attention-section">
                    <div className="attention-percentage">
                      <span className="percentage-value">{student.attentivePercentage || 0}</span>
                      <span className="percentage-unit">%</span>
                      <span className="percentage-label">Attentive Time</span>
                    </div>
                    <div className="attention-breakdown">
                      <div className="breakdown-item attentive">
                        <span className="breakdown-label">Attentive</span>
                        <span className="breakdown-value">{student.attentiveCount || 0}</span>
                      </div>
                      <div className="breakdown-item inattentive">
                        <span className="breakdown-label">Inattentive</span>
                        <span className="breakdown-value">{student.inattentiveCount || 0}</span>
                      </div>
                    </div>
                    {student.attentionStates && student.attentionStates.length > 1 && (
                      <div className="mini-timeline">
                        <span className="timeline-label">Recent:</span>
                        <div className="timeline-bars">
                          {student.attentionStates.slice(-10).map((isAttentive, index) => (
                            <div
                              key={index}
                              className={`timeline-bar ${isAttentive ? 'attentive' : 'inattentive'}`}
                              title={isAttentive ? 'Attentive' : 'Inattentive'}
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}
                    {isSessionActive && student.totalUpdates && (
                      <div className="realtime-stats">
                        <div className="stat">
                          <span className="stat-label">Updates:</span>
                          <span className="stat-value">{student.totalUpdates}</span>
                        </div>
                        {student.lastUpdate && (
                          <div className="stat">
                            <span className="stat-label">Last:</span>
                            <span className="stat-value">{new Date(student.lastUpdate).toLocaleTimeString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      <ToastContainer
        position="bottom-right"
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Dashboard;