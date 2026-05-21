import Employee from "../models/Employee.model.js";


//get profile
//GET /api/profile
export const getProfile = async (req, res) => {
    try {
        const user = req.user;

        const employee = await Employee.findOne({ userId: user.userId })

        if (!employee) {
            return res.json({
                firstName: 'Admin',
                lastName: '',
                email: user.email,
            })
        }

        return res.json(employee)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Failed to fetch profile' })
    }
}

//update profile
//PUT /api/profile
export const updateProfile = async (req, res) => {
    try {
        const user = req.user;

        const employee = await Employee.findOne({ userId: user.userId })

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' })
        }

        if (employee.isDeleted) {
            return res.status(403).json({
                error: 'Your account is deactivated. You cannot update your profile.'
            })
        }

        const { bio } = req.body || {};   // ✅ safe destructuring

        if (bio === undefined) {
            return res.status(400).json({ error: 'Bio is required' })
        }

        await Employee.findByIdAndUpdate(employee._id, { bio })

        return res.json({ success: true })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Failed to update profile' })
    }
}