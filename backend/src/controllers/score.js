export async function scoreHandler(req, res) {
  try {
    const sessionId = req.query.sessionId;

    if (!sessionId) {
        return res.status(400).json({ error: "Missing sessionId" });
    }

    const uow = req.app.locals.uow;

    const students = await uow.sessionParticipants.listStudentsBySession(sessionId);

    const response = students.map(student => ({
      studentId: student.id,
      studentName: student.name,
      studentLabel: student.label
    }));

    res.json({ students: response });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
}