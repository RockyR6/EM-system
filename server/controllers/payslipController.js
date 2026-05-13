import Payslip from "../models/Payslip.model.js";
import moduleName from '../models/Employee.model.js'
import Employee from "../models/Employee.model.js";



//crate payslip


// POST /api/payslips
export const createPayslip = async (req, res) => {
    try {
        const { employeeId, month, year, basicSaclary, allowances, deductions } = req.body;

        if(!employeeId || !month || !year || !basicSaclary|| !allowances || !deductions){
            return res.status(400).json({ error: 'Missing fields' })
        }

        const netSalary = Number(basicSaclary) + Number(allowances || 0) - Number(deductions || 0)

        const payslip = await Payslip.create({
            employeeId,
            month: Number(month),
            year: Number(year),
            basicSaclary: Number(basicSaclary),
            allowances: Number(allowances || 0),
            deductions: Number(deductions || 0),
            netSalary,
        })
        
        return res.json({success: true, data: payslip})
    } catch (error) {
        return res.status(500).json({error: 'Failed to crate Payslip'})
    }
}

//get payslip
//GET /api/payslips
export const getPayslip = async (req, res) => {
    try {
        const session = req.session;
        const isAdmin = session.role === 'ADMIN'
        if(isAdmin){
            const payslips = (await Payslip.find().populate('employeeId')).aort({createdAt: -1})
            const data = payslips.map((p) => {
                const obj = p.toObject()
                return {
                    ...obj, 
                    id: Object._id.toString(),
                    employee: obj.employeeId,
                    employeeId: obj.employeeId?._id?.toString()
                }
            })
            return res.json({data})
        }else{
            const employee = await Employee.findOne({ userId: session.userId })
            const payslips = (await Payslip.find({employeeId: employee._id})).toSorted({createdAt: -1})
            return res.json({data: payslips})
        }
    } catch (error) {
        return res.status(500).json({error: 'Failed to get Payslip'})
    }
}

//get payslip by ID
// GET /api/payslips/:id
export const getPayslipById = async (req, res) => {
    try {
        const payslip = await Payslip.findById(req.params.id).populate('employeeId').lean()
        if(!payslip) return res.status(404).json({ error: 'Not found' })

        const result = {
            ...payslip,
            id: payslip._id.toString(),
            employee: payslip.employeeId,
        }
        return res.json(result)
    } catch (error) {
        return res.status(500).json({error: 'Failed to get this Payslip'})
    }
}