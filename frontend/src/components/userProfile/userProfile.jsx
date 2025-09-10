const UserProfile = ({ 
  avatar = "T", 
  name = "Teacher", 
  role = "Administrator" 
}) => {
  return (
    <div className="user-profile">
      <div className="user-avatar">{avatar}</div>
      <div className="user-info">
        <span className="user-name">{name}</span>
        <span className="user-role">{role}</span>
      </div>
    </div>
  );
};

export default UserProfile;