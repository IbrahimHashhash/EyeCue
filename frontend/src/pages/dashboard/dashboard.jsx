import { useEffect, useState, useCallback } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSocket } from "../../hooks/useSocket";
import SessionControl from "../../components/session/session"; 
import LeaveSession from "../../components/leaveSession/leaveSession";
import "./dashboard.css";
import NoStudentPNG from "../../icons/student.png";
import { ReactComponent as DashboardSVG } from "../../icons/dashboard.svg";
import { ReactComponent as DebugSVG } from "../../icons/debug.svg";
import { ReactComponent as ReportSVG } from "../../icons/report.svg";

import {
  getSessionDuration,
  filterStudents,
  sortStudents,
  processStudentUpdate,
  updateSessionStats,
  showInattentiveToast
} from "./dashboard.utils";

import Sidebar from "../../components/sidebar/sidebar";
import Header from "../../components/header/header";
import StudentCard from "../../components/studentCard/studentCard";
import DebugView from "../debug/debug";
import ReportView from "../report/reportView";

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

  const navItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: (
        <DashboardSVG/>
      )
    },
    {
      id: "debug",
      label: "Detailed Analytics",
      icon: (
        <DebugSVG/>
      )
    },
    {
      id: "report",
      label: "Generate Report",
      icon: (
        <ReportSVG/>
      )
    }
  ];

  const filterOptions = [
    { value: "all", label: "All Students" },
    { value: "attentive", label: "Currently Attentive" },
    { value: "inattentive", label: "Currently Inattentive" }
  ];

  const sessionStatsArray = isSessionActive ? [
    { label: "Duration", value: sessionDuration },
    { label: "Overall Attention", value: `${sessionStats.attentivePercentage}%` },
    ...(lastUpdate ? [{ label: "Last Update", value: lastUpdate }] : [])
  ] : [];

  const getViewTitle = () => {
    switch (currentView) {
      case "overview": return { title: "Attention", accent: "Dashboard" };
      case "debug": return { title: "Detailed", accent: "Analytics" };
      case "report": return { title: "Session", accent: "Report" };
      default: return { title: "Attention", accent: "Dashboard" };
    }
  };

  const getViewSubtitle = () => {
    switch (currentView) {
      case "overview": return "Monitor student attention states in real-time";
      case "debug": return "Detailed analytics and monitoring data";
      case "report": return "Generate comprehensive attention reports";
      default: return "Monitor student attention states in real-time";
    }
  };

  return (
    <div className="dashboard-container">
      <div className="background-pattern"></div>
      
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        navItems={navItems}
        logoProps={{ title: "EyeCue", subtitle: "Analytics" }}
        userProfileProps={{ avatar: "T", name: "Teacher", role: "Administrator" }}
      />
      
      <main className="main-content">
        <Header 
          titleProps={{
            title: getViewTitle().title,
            accent: getViewTitle().accent,
            subtitle: getViewSubtitle()
          }}
          searchControlsProps={{
            searchTerm,
            setSearchTerm,
            selectedFilter,
            setSelectedFilter,
            isDropdownOpen: isSortDropdownOpen,
            setIsDropdownOpen: setIsSortDropdownOpen,
            searchPlaceholder: "Search students...",
            filterOptions
          }}
          sessionStatusProps={{
            isActive: isSessionActive,
            duration: sessionDuration,
            stats: sessionStatsArray,
            activeLabel: "Live Session Active",
            inactiveLabel: "No Active Session"
          }}
          leaveSessionComponent={<LeaveSession />}
        />
        
        <section className="content-body">
          {currentView === "overview" ? (
            <div className="students-grid">
              {sortedAndFilteredStudents.length === 0 ? (
                <div className="no-students">
                  <img src={NoStudentPNG} alt="No Students" width={80} height={80} />
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
          ) : currentView === "debug" ? (
            <DebugView 
              students={students}
              isSessionActive={isSessionActive}
              sortedAndFilteredStudents={sortedAndFilteredStudents}
            />
          ) : currentView === "report" ? (
            <ReportView 
              currentSessionId={currentSessionId} 
              isSessionActive={isSessionActive} 
            />
          ) : null}

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