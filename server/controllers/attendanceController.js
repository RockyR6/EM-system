import Employee from "../models/Employee.model.js";
import Attendance from "../models/Attendance.model.js";

//clock in/out for employee
//POST /api/attendance
export const clockInOut = async (req, res) => {
  try {
    const session = req.session;
    const employee = await Employee.findOne({ userId: session.userId });

    if (!employee) return res.status(404).json({ error: "Employee not found" });

    if (employee.isDeleted)
      return res.status(403).json({
        error: "Your account is deactivated. You cannot clock in/out.",
      });

    //Creates current date-time
    const today = new Date();
    //Reset time to midnight
    //Because we only care about the date, not time.
    today.setHours(0, 0, 0, 0);
    //Has employee already marked attendance today?
    const existing = await Attendance.findOne({
      employeeId: employee._id,
      date: today,
    });
    const now = new Date();
    if (!existing) {
      //Checks if employee came after 9:00.
      const isLate =
        now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);

      const attendance = await Attendance.create({
        employeeId: employee._id,
        date: today,
        checkIn: now,
        status: isLate ? "LATE" : "PRESENT",
      });
      return res.json({ success: true, type: "CHECK_IN", data: attendance });

      //employee is clocking out.
    } else if (!existing.checkOut) {
      //Get check-in time
      const checkInTime = new Date(existing.checkIn).getTime();
      //Calculates total milliseconds worked.
      const diffMs = now.getTime() - checkInTime;
      //Converts milliseconds to hours.
      const diffHours = diffMs / (1000 * 60 * 60);
     //Stores checkout time.
      existing.checkOut = now;

      //compute working hours and day type
      //Rounds to 2 decimal places. 7.4567 → 7.46
      const workingHours = parseFloat(diffHours.toFixed(2));
      let dayType = "Half Day";
      if (workingHours >= 8) dayType = "Full Day";
      else if (workingHours >= 6) dayType = "Three Quarter Day";
      else if (workingHours >= 4) dayType = "Half Day";
      else dayType = "Short Day";

      //Updates attendance record.
      existing.workingHours = workingHours;
      existing.dayType = dayType;

      //Stores changes in MongoDB.
      await existing.save();

      //Returns checkout success.
      return res.json({ success: true, type: "CHECK_OUT", data: existing });

      //Employee already checked out today.So it simply returns existing attendance.
      
    } else {
      return res.json({ success: true, type: "CHECK_OUT", data: existing });
    }
  } catch (error) {
    console.error("Attendance Error:", error);
    return res.status(500).json({ error: "Operatin failed" });
  }
};

//get in/out for employee
//GET /api/attendance
export const getAttendance = async (req, res) => {
  try {
    const session = req.session;
    const employee = await Employee.findOne({ userId: session.userId });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const limit = parseInt(req.query.limit || 30);
    const history = (await Attendance.find({employeeId: employee._id})).toSorted({date: -1}).limit(lilit)

    return res.json({
      data: history,
      employee: {isDeleted: employee.isDeleted}
    })
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch attendance" });
  }
};
