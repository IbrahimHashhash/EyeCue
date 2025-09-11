import { getAllStudents } from "./studentState.js";
import { ALERT_THRESHOLD } from "../config/constants.js";

let hasAlertTriggered = false;

export function computeAlertFlag(){

    const students = getAllStudents();

    if (!students.length) return false;

    const inattentiveCount = students.filter(label => label === 'inattentive').length;

    const condition = (inattentiveCount / students.length) >= ALERT_THRESHOLD;

    if (!hasAlertTriggered && condition) {
        hasAlertTriggered = true;
        return true;
    }

    return false
};

export function resetAlertState() {
    hasAlertTriggered = false;
}