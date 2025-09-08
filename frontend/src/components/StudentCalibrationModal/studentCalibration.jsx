import { useState, useEffect } from "react";
import "./studentCalibrationModal.css";

const StudentCalibrationModal = ({ isOpen, countdown }) => {
  if (!isOpen) return null;

  return (
    <div className="calibration-message">
      <p className="calibration-text">
        Please look directly at the screen - starting in <span className="countdown-number">{countdown}</span>
      </p>
    </div>
  );
};

export default StudentCalibrationModal;