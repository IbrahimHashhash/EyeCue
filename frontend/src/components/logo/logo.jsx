import { ReactComponent as LogoSvg } from "../../icons/logo.svg";

const Logo = ({ title = "EyeCue", subtitle = "Analytics" }) => {
  return (
    <div className="logo">
      <div className="logo-icon">
        <span className="logo-symbol">
          <LogoSvg />
        </span>
      </div>
      <div className="logo-content">
        <span className="logo-title">{title}</span>
        <span className="logo-subtitle">{subtitle}</span>
      </div>
    </div>
  );
};

export default Logo;
