import Logo from "../logo/logo";
import Navigation from "../navigation/navigation";
import UserProfile from "../userProfile/userProfile";
import LeaveSession from "../leaveSession/leaveSession";

const Sidebar = ({ 
  currentView, 
  setCurrentView, 
  navItems,
  logoProps,
  userProfileProps 
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Logo {...logoProps} />
      </div>
      <Navigation 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        navItems={navItems}
      />
      <div className="sidebar-footer">
        <UserProfile {...userProfileProps} />
        <div className="sidebar-actions">
          <LeaveSession />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;