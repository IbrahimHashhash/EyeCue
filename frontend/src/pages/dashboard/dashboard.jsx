import { useEffect, useState, useCallback } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSocket } from "../../hooks/useSocket";
import StudentCard from "./studentCard";
import DebugView from "./debug";
import SessionControl from "../../components/sessionStart"; 
import "./dashboard.css";
import {
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
  const [currentView, setCurrentView] = useState("overview");
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const handleAttentionUpdate = useCallback((data) => {
    if (!currentSessionId) {
      console.log('Ignoring attention update - no active session');
      return;
    }
    
    console.log('Real-time attention update:', data);
    
    const stableState = data.stabilization?.stableState || data.label;
    const isAttentive = stableState === 'attentive';
    const attentionLabel = stableState || 'unknown';
    const studentId = data.studentId;
    const timestamp = data.timestamp;
    
    const now = new Date();
    setLastUpdate(now.toLocaleTimeString());
    if (!sessionStartTime) {
      setSessionStartTime(now);
    }
    
    setStudents(prevStudents =>
      processStudentUpdate(prevStudents, data, isAttentive, attentionLabel, studentId, timestamp)
    );
    
    if (data.stabilization?.shouldUpdate) {
      setSessionStats(prev => updateSessionStats(prev, isAttentive));
    }
    
    if (data.alert === true) {
      showInattentiveToast();
    }
  }, [currentSessionId, sessionStartTime]);

  useSocket(handleAttentionUpdate);

  const handleSessionStart = (sessionId) => {
    console.log('Session started:', sessionId);
    setCurrentSessionId(sessionId);
    setIsSessionActive(true);
    setSessionStartTime(new Date());
    setStudents([]);
    setSessionStats({
      totalAttentiveFrames: 0,
      totalInattentiveFrames: 0,
      attentivePercentage: 0
    });
  };

  const handleSessionEnd = (sessionId) => {
    console.log('Session ended:', sessionId);
    setCurrentSessionId(null);
    setIsSessionActive(false);
    setSessionStartTime(null);
    setLastUpdate(null);
  };

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
            <button 
              className={`nav-item ${currentView === "overview" ? "active" : ""}`}
              onClick={() => setCurrentView("overview")}
            >
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
            <button 
              className={`nav-item ${currentView === "debug" ? "active" : ""}`}
              onClick={() => setCurrentView("debug")}
            >
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
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v6"></path>
                  <path d="m21 12-6-3-6 3-6-3"></path>
                </svg>
              </div>
              <span>Summary Debug</span>
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
                {currentView === "overview" ? "Attention" : "Summary"}
                <span className="title-accent">
                  {currentView === "overview" ? "Dashboard" : "Debug"}
                </span>
              </h1>
              <p className="dashboard-subtitle">
                {currentView === "overview" 
                  ? "Monitor student attention states in real-time"
                  : "Detailed analytics and monitoring data"
                }
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
          {currentView === "overview" ? (
            <div className="simple-students-grid">
              {sortedAndFilteredStudents.length === 0 ? (
                <div className="no-students">
                  <div className="no-students-icon">👥</div>
                  <h3>No Students Found</h3>
                  <p>Start a camera session to see real-time attention data</p>
                </div>
              ) : (
                sortedAndFilteredStudents.map((student, index) => (
                  <StudentCard 
                    key={student.studentId} 
                    student={student} 
                    index={index} 
                  />
                ))
              )}
            </div>
          ) : (
            <DebugView 
              students={students}
              isSessionActive={isSessionActive}
              sortedAndFilteredStudents={sortedAndFilteredStudents}
            />
          )}
        </section>
      </main>
      
      <SessionControl 
        onSessionStart={handleSessionStart}
        onSessionEnd={handleSessionEnd}
      />
      
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