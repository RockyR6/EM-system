import { inngest } from "../inngest/index.js";
import Employee from "../models/Employee.model.js";
import LeaveApplication from "../models/LeaveApplication.model.js";

//create leaves
//POST /api/leaves
export const createLeave = async (req, res) => {
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
        error: "Your account is deactivated. You cannot apply for leave.",
      });
    }

    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start < today || end < today) {
      return res.status(400).json({ 
        error: "Leave dates must be in the future" 
      });
    }

    if (end < start) {
      return res.status(400).json({ 
        error: "End date cannot be before start date" 
      });
    }

    const leave = await LeaveApplication.create({
      employeeId: employee._id,
      type,
      startDate: start,
      endDate: end,
      reason,
      status: "PENDING",
    });

    //inngest event
    try {
      await inngest.send({
        name: "leave/pending",
        data: { leaveApplicationId: leave._id },
      });
    } catch (inngestError) {
      console.error("Inngest error:", inngestError);
      // Don't fail the request if inngest fails
    }
    
    return res.status(201).json({ success: true, data: leave });
  } catch (error) {
    console.error("Create leave error:", error);
    return res.status(500).json({ error: "Failed to create leave" });
  }
};

//get leaves
//GET /api/leaves
export const getLeave = async (req, res) => {
  try {
    // Your middleware sets decoded JWT to req.user
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const userRole = req.user?.role;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID" });
    }

    const isAdmin = userRole === "ADMIN";
    
    if (isAdmin) {
      const status = req.query.status;
      const where = status ? { status } : {};
      
      const leaves = await LeaveApplication.find(where)
        .populate("employeeId")
        .sort({ createdAt: -1 });

      const data = leaves.map((l) => {
        const obj = l.toObject();
        return {
          ...obj,
          id: obj._id.toString(),
          employee: obj.employeeId,
          employeeId: obj.employeeId?._id?.toString(),
        };
      });
      return res.json({ data });
    } else {
      // Non-admin: get their own leaves
      const employee = await Employee.findOne({
        userId,
      }).lean();
      
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      
      const leaves = await LeaveApplication.find({
        employeeId: employee._id,
      }).sort({ createdAt: -1 });
      
      return res.json({
        data: leaves,
        employee: { ...employee, id: employee._id.toString() },
      });
    }
  } catch (error) {
    console.error("Get leaves error:", error);
    return res.status(500).json({ error: "Failed to get leaves" });
  }
};

//update leaves status
//PATCH /api/leaves/:id
export const updateLeaveStatus = async (req, res) => {
  try {
    // middleware sets decoded JWT to req.user
    const userRole = req.user?.role;
    
    // Only admins can update leave status
    if (userRole !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can update leave status" });
    }

    const { status } = req.body;
    
    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const leave = await LeaveApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!leave) {
      return res.status(404).json({ error: "Leave application not found" });
    }
    
    return res.json({ success: true, data: leave });
  } catch (error) {
    console.error("Update leave status error:", error);
    return res.status(500).json({ error: "Failed to update leave status" });
  }
};