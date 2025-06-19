import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { hrService } from '../services/api';

export const useHR = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await hrService.getAllEmployees();
      setEmployees(response);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
      toast.error(err.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const getEmployee = async (id) => {
    try {
      setLoading(true);
      const response = await hrService.getEmployeeById(id);
      setSelectedEmployee(response);
      setError(null);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employee');
      toast.error(err.response?.data?.message || 'Failed to fetch employee');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (id, data) => {
    try {
      setLoading(true);
      const response = await hrService.updateEmployee(id, data);
      setEmployees(employees.map(emp => emp._id === id ? response : emp));
      setError(null);
      toast.success('Employee updated successfully');
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee');
      toast.error(err.response?.data?.message || 'Failed to update employee');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      setLoading(true);
      await hrService.deleteEmployee(id);
      setEmployees(employees.filter(emp => emp._id !== id));
      setError(null);
      toast.success('Employee deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee');
      toast.error(err.response?.data?.message || 'Failed to delete employee');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    selectedEmployee,
    loading,
    error,
    getEmployee,
    updateEmployee,
    deleteEmployee,
    refreshEmployees: fetchEmployees,
  };
}; 