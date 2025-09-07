import { useCallback } from "react";
import { STUDENT_ID } from "../mocks/ids.js";

export const useFrameUpload = (endpoint) => {
  const uploadFrame = useCallback(
    async (frameBlob) => {
      try {
        if (!endpoint) {
          throw new Error("No endpoint provided");
        }
        console.log(`Sending frame to ${endpoint}: ${frameBlob.size} bytes`);

        const formData = new FormData();
        formData.append("frame", frameBlob);
        formData.append("studentId", STUDENT_ID);

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        console.log("Frame sent successfully:", result);
        return result;
      } catch (err) {
        console.error("Failed to send frame:", err.message);
        throw err;
      }
    },
    [endpoint]
  );
  return {
    endpoint,
    uploadFrame,
  };
};
