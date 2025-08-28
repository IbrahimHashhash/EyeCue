import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import triangleAlert from '../../icons/triangleAlert.svg';
import "react-toastify/dist/ReactToastify.css";
import "./dashboard.css";
import ENDPOINTS from "../../api/endpoints";

const getScoreClass = (score) => {
  if (score < 40) return "score-critical";
  if (score < 60) return "score-warning";
  if (score < 80) return "score-good";
  return "score-excellent";
};

const getScoreLabel = (score) => {
  if (score < 40) return "Critical";
  if (score < 60) return "Warning";
  if (score < 80) return "Good";
  return "Excellent";
};

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [avgScore, setAvgScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [sortType, setSortType] = useState("performance");
  const [popAlert, setPopAlert] = useState(null);

  useEffect(() => {
    if (popAlert) {
      toast("Low Attention Level", {
        
        className: "notification",
        icon: <img src={ triangleAlert } alt="alert" className="w-5 h-5" />,
        progressClassName: "toast-progress",
      });
    }
  }, [popAlert]);

  useEffect(() => {
    setLoading(true);
    fetch(ENDPOINTS.SCORE.AVERAGE)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch students");
        return res.json();
      })
      .then((data) => {
        setStudents(data.students);
        setPopAlert(data.popAlert);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Network error - please check your connection");
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter students based on search and selected performance filter
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.studentName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "excellent" && student.score >= 80) ||
      (selectedFilter === "good" && student.score >= 60 && student.score < 80) ||
      (selectedFilter === "warning" && student.score >= 40 && student.score < 60) ||
      (selectedFilter === "critical" && student.score < 40);

    return matchesSearch && matchesFilter;
  });

  // Sort the filtered students based on sortType
  const sortedAndFilteredStudents = [...filteredStudents].sort((a, b) => {
    if (sortType === "name") {
      return a.studentName.localeCompare(b.studentName);
    }
    // Default or 'performance' sort
    return b.score - a.score;
  });

  const getGradientByScore = (score) => {
    if (score < 40) return "linear-gradient(135deg, #ff6b6b, #ee5a24)";
    if (score < 60) return "linear-gradient(135deg, #feca57, #ff9ff3)";
    if (score < 80) return "linear-gradient(135deg, #48cae4, #023e8a)";
    return "linear-gradient(135deg, #06ffa5, #00d4aa)";
  };

  const LoadingSpinner = () => (
    <div className="loading-container">
      <div className="loading-animation">
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
      </div>
      <p className="loading-text">Fetching student data...</p>
    </div>
  );

  const ErrorMessage = ({ message }) => (
    <div className="error-container">
      <div className="error-animation">
        <div className="error-circle">
          <span className="error-icon">!</span>
        </div>
      </div>
      <h3 className="error-title">Oops! Something went wrong</h3>
      <p className="error-message">{message}</p>
      <button onClick={() => window.location.reload()} className="retry-button">
        <span className="button-shine"></span>
        Try Again
      </button>
    </div>
  );

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
            <button className="nav-item">
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
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <path d="M12 2v4"></path>
                  <path d="M8 6h8"></path>
                </svg>
              </div>
              <span>Reports</span>
            </button>
          </div>

          <div className="nav-group">
            <span className="nav-label">Management</span>
            <button className="nav-item">
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <span>Students</span>
            </button>
            <button className="nav-item">
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
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <span>Settings</span>
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
                Performance
                <span className="title-accent">Dashboard</span>
              </h1>
              <p className="dashboard-subtitle">
                Monitor and track academic progress in real-time
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

              {/* New sort functionality */}
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
                  <span className="sort-label">Sort</span>
                </button>
                {isSortDropdownOpen && (
                  <div className="sort-dropdown-menu">
                    <div
                      className={`sort-dropdown-item ${
                        sortType === "performance" ? "active" : ""
                      }`}
                      onClick={() => {
                        setSortType("performance");
                        setIsSortDropdownOpen(false);
                      }}
                    >
                      Performance
                    </div>
                    <div
                      className={`sort-dropdown-item ${
                        sortType === "name" ? "active" : ""
                      }`}
                      onClick={() => {
                        setSortType("name");
                        setIsSortDropdownOpen(false);
                      }}
                    >
                      Name
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <section className="content-body">
          <div className="students-grid">
            {error ? (
              <ErrorMessage message={error} />
            ) : loading ? (
              <LoadingSpinner />
            ) : (
              sortedAndFilteredStudents.map((student, index) => (
                <div
                  key={student.studentId}
                  className={`student-card ${getScoreClass(student.score)}`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    background: getGradientByScore(student.score),
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
                      <div className="avatar-ring">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#ffff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-user smaller-icon"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    </div>

                    <div className="student-details">
                      <h3 className="student-name">{student.studentName}</h3>
                      <span className="student-id">#{student.studentId}</span>
                    </div>

                    <div className="performance-badge">
                      <span className="badge-text">
                        {getScoreLabel(student.score)}
                      </span>
                    </div>
                  </div>

                  <div className="score-section">
                    <div className="score-display">
                      <span className="score-value">{student.score}</span>
                      <span className="score-unit">%</span>
                    </div>

                    <div className="progress-container">
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${student.score}%` }}
                        >
                          <div className="progress-shine"></div>
                        </div>
                      </div>
                      <div className="progress-markers">
                        <span className="marker" style={{ left: "40%" }}>
                          40
                        </span>
                        <span className="marker" style={{ left: "60%" }}>
                          60
                        </span>
                        <span className="marker" style={{ left: "80%" }}>
                          80
                        </span>
                      </div>
                    </div>
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