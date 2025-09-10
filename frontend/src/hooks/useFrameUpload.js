import { useCallback, useState, useEffect } from "react";

const getUserFromStorage = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const useFrameUpload = (endpoint) => {
  const [studentId, setStudentId] = useState(null);
  const [studentName, setStudentName] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      setStudentId(user.id);
      setStudentName(user.name);
      setCurrentSessionId(user.currentSessionId || null);
    }
  }, []);

  const uploadFrame = useCallback(
    async (frameBlob) => {
      const formData = new FormData();
      formData.append("frame", frameBlob);
      formData.append("studentId", studentId);
      formData.append("studentName", studentName);
      formData.append("sessionId", currentSessionId);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response.json();
    },
    [endpoint, studentId, studentName]
  );

  return { uploadFrame, studentId, studentName };
};