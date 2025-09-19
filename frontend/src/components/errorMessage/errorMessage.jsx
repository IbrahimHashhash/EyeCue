import PropTypes from 'prop-types';

const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="report-error">
      <p>{error}</p>
    </div>
  );
};

ErrorMessage.propTypes = {
  error: PropTypes.string
};

export default ErrorMessage;