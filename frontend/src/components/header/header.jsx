import HeaderTitle from "../headerTitle/headerTitle";
import SearchControls from "../searchControls/searchControls";
import SessionStatus from "../sessionStatus/sessionStatus";

const Header = ({
  titleProps,
  searchControlsProps,
  sessionStatusProps
}) => {
  return (
    <header className="dashboard-header">
      <div className="header-top">
        <HeaderTitle {...titleProps} />
        <SearchControls {...searchControlsProps} />
      </div>
      <SessionStatus {...sessionStatusProps} />
    </header>
  );
};

export default Header;