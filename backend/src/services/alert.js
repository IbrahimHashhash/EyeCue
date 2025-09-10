import { getAllStudents } from "./studentState.js";
import { ALERT_THRESHOLD } from "../config/constants.js";

export function computeAlertFlag(){

    const students = getAllStudents();

    if (!students.length) return false;

    const inattentiveCount = students.filter(label => label === 'inattentive').length;

    return (inattentiveCount / students.length) >= ALERT_THRESHOLD;
};