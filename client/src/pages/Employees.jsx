import { useCallback, useEffect, useState } from 'react';
import { dummyEmployeeData, DEPARTMENTS } from '../assets/assets';
import { Plus, Search, X } from 'lucide-react';
import EmployeeCard from '../components/EmployeeCard';
import EmployeeForm from '../components/EmployeeForm';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [editEmployee, setEditEmployee] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  //added selectedDept dependency
  const fetchEmployees = useCallback(() => {
    setLoading(true);

    const filtered = dummyEmployeeData.filter((emp) =>
      selectedDept ? emp.department === selectedDept : true
    );

    setEmployees(filtered);

    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [selectedDept]);

  // added dependency
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = employees.filter((emp) =>
    `${emp.firstName} ${emp.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage your team members</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search employees..."
            className="w-full pl-10"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </div>

        <select
          className="max-w-40"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Employees */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
          {filteredEmployees.length === 0 ? (
            <p className="col-span-full text-center py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              No employees found
            </p>
          ) : (
            filteredEmployees.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onDelete={fetchEmployees}
                onEdit={(e) => setEditEmployee(e)} //this triggers modal
              />
            ))
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-fade-in"
          >
            <div className="flex items-center justify-between p-6 pb-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add New Employee
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Create a user account and employee profile
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <EmployeeForm onSuccess={()=>{
                setShowCreateModal(false);
                fetchEmployees();
              }} onCancel={()=> setShowCreateModal(false)}/>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editEmployee && (
        <div
          onClick={() => setEditEmployee(null)}
          className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-auto bg-black/40 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-fade-in"
          >
            <div className="flex items-center justify-between p-6 pb-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Edit Employee
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Update employee details
                </p>
              </div>

              <button
                onClick={() => setEditEmployee(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <EmployeeForm initialData={editEmployee} onSuccess={()=>{
                setEditEmployee(null);
                fetchEmployees();
              }} onCancel={()=> setEditEmployee(null)}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;