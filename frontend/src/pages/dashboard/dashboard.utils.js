import { toast } from "react-toastify";
import triangleAlert from "../../icons/triangleAlert.svg"
export const getAttentionClass = (student) => {
    if (!student.currentState) return "unknown";
    return student.currentState === "attentive" ? "attentive" : "inattentive";
};

export const getAttentionGradient = (attentivePercentage) => {
    if (attentivePercentage >= 80) return "linear-gradient(135deg, #10b981, #059669)";
    if (attentivePercentage >= 60) return "linear-gradient(135deg, #3b82f6, #1d4ed8)";
    if (attentivePercentage >= 40) return "linear-gradient(135deg, #f59e0b, #d97706)";
    return "linear-gradient(135deg, #ef4444, #dc2626)";
};

export const getSessionDuration = (sessionStartTime) => {
    if (!sessionStartTime) return "00:00";
    const now = new Date();
    const diff = Math.floor((now - sessionStartTime) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const filterStudents = (students, searchTerm, selectedFilter) => {
    return students.filter((student) => {
        const matchesSearch = student.studentName
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesFilter = selectedFilter === "all" ||
            (selectedFilter === "attentive" && student.currentState === "attentive") ||
            (selectedFilter === "inattentive" && student.currentState === "inattentive") ||
            (selectedFilter === "high" && student.attentivePercentage >= 80) ||
            (selectedFilter === "low" && student.attentivePercentage < 50);
        return matchesSearch && matchesFilter;
    });
};

export const sortStudents = (students, sortType) => {
    return [...students].sort((a, b) => {
        if (sortType === "name") {
            return a.studentName.localeCompare(b.studentName);
        }
        return (b.attentivePercentage || 0) - (a.attentivePercentage || 0);
    });
};

export const processStudentUpdate = (prevStudents, data, isAttentive, attentionLabel, studentId, timestamp) => {
    const updatedStudents = prevStudents.map(student => {
        if (student.studentId === studentId) {
            const newAttentionStates = [
                ...(student.attentionStates || []).slice(-19),
                isAttentive
            ];
            const totalStates = newAttentionStates.length;
            const attentiveCount = newAttentionStates.filter(state => state).length;
            const attentivePercentage = (attentiveCount / totalStates) * 100;
            return {
                ...student,
                currentState: isAttentive ? 'attentive' : 'inattentive',
                attentionLabel: attentionLabel,
                lastUpdate: timestamp,
                attentionStates: newAttentionStates,
                totalUpdates: (student.totalUpdates || 0) + 1,
                attentiveCount: attentiveCount,
                inattentiveCount: totalStates - attentiveCount,
                attentivePercentage: Math.round(attentivePercentage),
                inattentivePercentage: Math.round(100 - attentivePercentage)
            };
        }
        return student;
    });
    if (!updatedStudents.find(s => s.studentId === studentId)) {
        updatedStudents.push({
            studentId: studentId,
            studentName: data.studentName || data.analysis?.studentName || `Student ${studentId}`,
            currentState: isAttentive ? 'attentive' : 'inattentive',
            attentionLabel: attentionLabel,
            lastUpdate: timestamp,
            attentionStates: [isAttentive],
            totalUpdates: 1,
            attentiveCount: isAttentive ? 1 : 0,
            inattentiveCount: isAttentive ? 0 : 1,
            attentivePercentage: isAttentive ? 100 : 0,
            inattentivePercentage: isAttentive ? 0 : 100
        });
    }
    return updatedStudents;
};

export const updateSessionStats = (prevStats, isAttentive) => {
    const newStats = {
        totalAttentiveFrames: prevStats.totalAttentiveFrames + (isAttentive ? 1 : 0),
        totalInattentiveFrames: prevStats.totalInattentiveFrames + (isAttentive ? 0 : 1),
    };
    const totalFrames = newStats.totalAttentiveFrames + newStats.totalInattentiveFrames;
    newStats.attentivePercentage = totalFrames > 0
        ? Math.round((newStats.totalAttentiveFrames / totalFrames) * 100)
        : 0;
    return newStats;
};

export const showInattentiveToast = () => {
    toast("Low Class Attention Level", {
        className: "notification",
        icon: <img src={triangleAlert} alt="alert" className="w-5 h-5" />,
        progressClassName: "toast-progress",
    });
};