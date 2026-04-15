import { Toaster } from 'react-hot-toast'
import { Routes, Route, Navigate } from 'react-router-dom'
import Employees from './pages/Employees'
import Login from './pages/LoginLanding'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import Leave from './pages/Leave'
import Payslips from './pages/Payslips'
import Settings from './pages/Settings'
import PrintPayslip from './pages/PrintPayslip'
import LoginForm from './components/LoginForm'

const App = () => {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/login/admin' element={<LoginForm role='admin' title='Admin Login' subtitle='Please enter your credentials' />} />

        <Route path='/login/employee' element={<LoginForm role='employee' title='Employee Login' subtitle='Please enter your credentials' />} />


        <Route element={<Layout />} >
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/employees' element={<Employees />} />
          <Route path='/attendance' element={<Attendance />} />
          <Route path='/leave' element={<Leave />} />
          <Route path='/payslips' element={<Payslips />} />
          <Route path='/settings' element={<Settings />} />
        </Route>
        <Route path='/print/payslip/:id' element={<PrintPayslip />} />
        <Route path='*' element={<Navigate to="/dashboard"  replace/>} />
      </Routes>
    </>
  )
}

export default App
