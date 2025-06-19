import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { employeeService } from '../services/api';

export const useEmployee = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getProfile();
      setProfile(response);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      toast.error(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      setLoading(true);
      const response = await employeeService.updateProfile(data);
      setProfile(response);
      setError(null);
      toast.success('Profile updated successfully');
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      toast.error(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile: fetchProfile,
  };
}; 