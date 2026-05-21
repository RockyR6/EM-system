import Employee from "../models/Employee.model.js";
import Attendance from "../models/Attendance.model.js";
import { inngest } from "../inngest/index.js";

//clock in/out for employee
//POST /api/attendance
export const clockInOut = async (req, res) => {
  try {
    // Your middleware sets decoded JWT to req.user
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" });
    }

    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (employee.isDeleted) {
      return res.status(403).json({
        error: "Your account is deactivated. You cannot clock in/out.",
      });
    }

    // Creates current date-time
    const today = new Date();
    // Reset time to midnight
    // Because we only care about the date, not time.
    today.setHours(0, 0, 0, 0);
    
    // Has employee already marked attendance today?
    const existing = await Attendance.findOne({
      employeeId: employee._id,
      date: today,
    });
    
    const now = new Date();
    
    if (!existing) {
      // Checks if employee came after 9:00.
      const isLate =
        now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);

      const attendance = await Attendance.create({
        employeeId: employee._id,
        date: today,
        checkIn: now,
        status: isLate ? "LATE" : "PRESENT",
      });

      // inngest event
      try {
        await inngest.send({
          name: "employee/check-in",
          data: {
            employeeId: employee._id.toString(),
            attendanceId: attendance._id.toString(),
          },
        });
      } catch (inngestError) {
        console.error("Inngest error:", inngestError);
        // Don't fail the request if inngest fails
      }

      return res.json({ success: true, type: "CHECK_IN", data: attendance });

      // Employee is clocking out.
    } else if (!existing.checkOut) {
      // Get check-in time
      const checkInTime = new Date(existing.checkIn).getTime();
      // Calculates total milliseconds worked.
      const diffMs = now.getTime() - checkInTime;
      // Converts milliseconds to hours.
      const diffHours = diffMs / (1000 * 60 * 60);
      // Stores checkout time.
      existing.checkOut = now;

      // Compute working hours and day type
      // Rounds to 2 decimal places. 7.4567 → 7.46
      const workingHours = parseFloat(diffHours.toFixed(2));
      let dayType = "Short Day";
      if (workingHours >= 8) {
        dayType = "Full Day";
      } else if (workingHours >= 6) {
        dayType = "Three Quarter Day";
      } else if (workingHours >= 4) {
        dayType = "Half Day";
      }

      // Updates attendance record.
      existing.workingHours = workingHours;
      existing.dayType = dayType;

      // Stores changes in MongoDB.
      await existing.save();

      // inngest event for checkout
      try {
        await inngest.send({
          name: "employee/check-out",
          data: {
            employeeId: employee._id.toString(),
            attendanceId: existing._id.toString(),
            workingHours,
          },
        });
      } catch (inngestError) {
        console.error("Inngest error:", inngestError);
        // Don't fail the request if inngest fails
      }

      // Returns checkout success.
      return res.json({ success: true, type: "CHECK_OUT", data: existing });

      // Employee already checked out today. Return existing attendance.
    } else {
      return res.json({ success: true, type: "ALREADY_CHECKED_OUT", data: existing });
    }
  } catch (error) {
    console.error("Attendance Error:", error);
    return res.status(500).json({ error: "Operation failed" });
  }
};

//get in/out for employee
//GET /api/attendance
export const getAttendance = async (req, res) => {
  try {
    // Your middleware sets decoded JWT to req.user
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const userRole = req.user?.role;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" });
    }

    const isAdmin = userRole === "ADMIN";

    if (isAdmin) {
      // Admin gets all attendance records
      const limit = parseInt(req.query.limit || 100);
      const history = await Attendance.find()
        .populate("employeeId", "firstName lastName email")
        .sort({ date: -1 })
        .limit(limit);

      const data = history.map((record) => ({
        ...record.toObject(),
        id: record._id.toString(),
        employeeId: record.employeeId?._id?.toString(),
      }));

      return res.json({ data });
    } else {
      // Regular employee gets their own records
      const employee = await Employee.findOne({ userId });
      
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const limit = parseInt(req.query.limit || 30);
      const history = await Attendance.find({ employeeId: employee._id })
        .sort({ date: -1 })
        .limit(limit);

      return res.json({
        data: history,
        employee: { 
          id: employee._id.toString(),
          firstName: employee.firstName,
          lastName: employee.lastName,
          isDeleted: employee.isDeleted 
        },
      });
    }
  } catch (error) {
    console.error("Get attendance error:", error);
    return res.status(500).json({ error: "Failed to fetch attendance" });
  }
};