import { ReactComponent as LogoSvg } from "../../icons/leaveSession.svg";

const LeaveSession = () => {
  const handleLeaveSession = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <button 
      className="sidebar-leave-btn" 
      onClick={handleLeaveSession}
      title="Leave Session"
    >
     <LogoSvg/>
      Leave Session
    </button>
  );
};

export default LeaveSession;