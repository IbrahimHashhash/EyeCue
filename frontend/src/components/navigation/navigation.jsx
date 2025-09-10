const Navigation = ({ currentView, setCurrentView, navItems }) => {
  return (
    <nav className="sidebar-nav">
      <div className="nav-group">
        <span className="nav-label">Overview</span>
        {navItems.map((item) => (
          <button 
            key={item.id}
            className={`nav-item ${currentView === item.id ? "active" : ""}`}
            onClick={() => setCurrentView(item.id)}
          >
            <div className="nav-icon">
              {item.icon}
            </div>
            <span>{item.label}</span>
            <div className="nav-indicator"></div>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;