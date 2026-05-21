import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEPARTMENTS } from '../assets/assets'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../api/axios'

const EmployeeForm = ({initialData, onSuccess, onCancel}) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const isEditMode = !!initialData
    
    const handleSubmit = async(e) => {
        e.preventDefault()
        setLoading(true)
        
        try {
            const formData = new FormData(e.currentTarget)
            
            // Convert FormData to JSON object
            const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                position: formData.get('position'),
                department: formData.get('department'),
                basicSalary: formData.get('basicSalary'),
                allowances: formData.get('allowances'),
                deductions: formData.get('deductions'),
                joinDate: formData.get('joinDate'),
                bio: formData.get('bio'),
                role: formData.get('role'),
            }
            
            // Only include password if provided
            const password = formData.get('password')
            if(password) {
                data.password = password
            }
            
            // Only include employmentStatus in edit mode
            if(isEditMode) {
                data.employmentStatus = formData.get('employmentStatus')
            }
            
            // Validate required fields
            if(!data.firstName || !data.lastName || !data.email || !data.phone || !data.position || !data.department || !data.joinDate) {
                toast.error('Please fill in all required fields')
                setLoading(false)
                return
            }
            
            // Validate password on create
            if(!isEditMode && !password) {
                toast.error('Password is required for new employees')
                setLoading(false)
                return
            }
            
            const url = isEditMode ? `/employees/${initialData.id}` : '/employees'
            const method = isEditMode ? 'put' : 'post'
            
            const response = await api[method](url, data)
            
            toast.success(isEditMode ? 'Employee updated successfully!' : 'Employee created successfully!')
            
            if(onSuccess) {
                onSuccess()
            } else {
                navigate('/employees')
            }
        } catch (error) {
            console.error("Error submitting employee form:", error)
            const errorMessage = error.response?.data?.error || error.message || 'Failed to submit form'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

  return (
    <form onSubmit={handleSubmit}
    className='space-y-6 max-w-3xl animate-fade-in'>
    {/*personal Information*/ }
    <div className='card p-5 sm:p-6'>
      <h3 className='font-medium mb-6 pb-4 border-b border-slate-100'>Personal Information</h3>
      <div className=' grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700'>
        <div>
          <label className='block mb-2'>First Name</label>
          <input name='firstName' type='text' required defaultValue={initialData?.firstName || ''}/>
        </div>
        <div>
          <label className='block mb-2'>Last Name</label>
          <input name='lastName' type='text' required defaultValue={initialData?.lastName || ''}/>
        </div>
        <div>
          <label className='block mb-2'>Phone Number</label>
          <input name='phone' type='tel' required defaultValue={initialData?.phone || ''}/>
        </div>
        <div>
          <label className='block mb-2'>Join Date</label>
          <input name='joinDate' type='date' required defaultValue={initialData?.joinDate ? new Date(initialData.joinDate).toISOString().split('T')[0] : ''}/>
        </div>
        <div className='sm:col-span-2'>
          <label className='block mb-2'>Bio (Optional)</label>
          <textarea name='bio' rows={3} className='resize-none w-full' placeholder='Brief description...' defaultValue={initialData?.bio || ''}/>
        </div>
      </div>
    </div>
    {/*Employment Information*/ }
    <div className='card p-5 sm:p-6'>
    <h3 className='text-base font-medium text-slate-900 mb-6 pb-4 border-b border-slate-100'>Employment Details</h3>
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700'>
        <div>
          <label className='block mb-2'>Department</label>
          <select name="department" required defaultValue={initialData?.department || ''}>
            <option value="">Select Department</option>
            {DEPARTMENTS.map((deptName) => (
              <option key={deptName} value={deptName}>
                {deptName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className='block mb-2'>Position</label>
          <input name='position' type='text' required defaultValue={initialData?.position || ''}/>
        </div>
        <div>
          <label className='block mb-2'>Basic Salary</label>
          <input min='0' step='0.01' type='number' name='basicSalary' required defaultValue={initialData?.basicSalary || 0}/>
        </div>
        <div>
          <label className='block mb-2'>Allowances</label>
          <input min='0' step='0.01' type='number' name='allowances' required defaultValue={initialData?.allowances || 0}/>
        </div>
        <div>
          <label className='block mb-2'>Deductions</label>
          <input min='0' step='0.01' type='number' name='deductions' required defaultValue={initialData?.deductions || 0}/>
        </div>
        {isEditMode && (
          <div>
          <label className='block mb-2'>Status</label>
          <select name='employmentStatus' required defaultValue={initialData?.employmentStatus || 'ACTIVE'}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        )}
    </div>
    </div>
    {/*Account Setup*/ }
    <div className='card p-5 sm:p-6'>
      <h3 className='text-base font-medium mb-6 pb-4 border-b border-slate-100'>Account Setup</h3>
      <div className=' grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700'>
        <div className='sm:col-span-2'>
          <label className='block mb-2'>Work Email</label>
          <input type='email' name='email' required defaultValue={initialData?.email || ''}/>
        </div>
        {!isEditMode && (
          <div>
          <label className='block mb-2'>Temporary Password <span className='text-red-500'>*</span></label>
          <input type='password' name='password' required placeholder='Enter initial password'/>
        </div>
        )}
        {isEditMode && (
          <div>
          <label className='block mb-2'>Change Password (Optional)</label>
          <input type='password' name='password' placeholder='Leave blank to keep current' />
        </div>
        )}
        <div>
          <label className='block mb-2'>System Role</label>
          <select name="role" required defaultValue={initialData?.user?.role || 'EMPLOYEE'}>
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>
    </div>
    {/*buttons*/ }
    <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2'>
      <button type='button' className='btn-secondary' onClick={() => (onCancel ? onCancel() : navigate(-1))}>
        Cancel
      </button>
      <button disabled={loading} type='submit' className='btn-primary flex items-center justify-center gap-2'>
        {loading && <Loader2Icon className='w-4 h-4 animate-spin'/>}
        {isEditMode ? 'Update Employee' : 'Create Employee'}
      </button>
    </div>
    </form>
  )
}

export default EmployeeForm