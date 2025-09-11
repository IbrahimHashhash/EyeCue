const HeaderTitle = ({ title, accent, subtitle }) => {
  return (
    <div className="header-title-section">
      <h1 className="dashboard-title">
        {title}
        {accent && <span className="title-accent">{accent}</span>}
      </h1>
      {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
    </div>
  );
};

export default HeaderTitle;