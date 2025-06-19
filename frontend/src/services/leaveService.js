import api from './api';

// Get all leave requests (HR only)
export const getAllLeaveRequests = async () => {
  try {
    const response = await api.get('/leave/all');
    return response;
  } catch (error) {
    console.error('Leave service error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error.response?.data || { message: 'Failed to fetch leave requests' };
  }
};

// Get employee's leave requests
export const getEmployeeLeaveRequests = async () => {
  try {
    const response = await api.get('/leave');
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch leave requests' };
  }
};

// Get employee's leave balance
export const getLeaveBalance = async (month, year) => {
  try {
    const params = {};
    if (month !== undefined && year !== undefined) {
      params.month = month;
      params.year = year;
    }
    const response = await api.get('/leave/balance', { params });
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch leave balance' };
  }
};

// Submit a new leave request
export const submitLeaveRequest = async (leaveData) => {
  try {
    const response = await api.post('/leave', leaveData);
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit leave request' };
  }
};

// Approve a leave request (HR only)
export const approveLeaveRequest = async (requestId, data) => {
  try {
    const response = await api.put(`/leave/${requestId}/approve`, data);
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to approve leave request' };
  }
};

// Reject a leave request (HR only)
export const rejectLeaveRequest = async (requestId, data) => {
  try {
    const response = await api.put(`/leave/${requestId}/reject`, data);
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reject leave request' };
  }
};

// Update leave request dates
export const updateLeaveRequestDates = async (requestId, data) => {
  try {
    const response = await api.put(`/leave/${requestId}/dates`, data);
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update leave request dates' };
  }
};

export const getRecentLeaveRequests = async () => {
  try {
    const response = await api.get('/leaverequest/recent');
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch recent leave requests' };
  }
};

export const getLeaveRequests = async () => {
  try {
    const response = await api.get('/leaverequest');
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch leave requests' };
  }
};

export const createLeaveRequest = async (data) => {
  try {
    const response = await api.post('/leaverequest', data);
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create leave request' };
  }
};

export const getEmployeeLeaveHistory = async (employeeId) => {
  try {
    const response = await api.get(`/leave/employee/${employeeId}`);
    console.log('Leave history service response:', response);
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch employee leave history' };
  }
};

// Update leave request status
export const updateLeaveRequestStatus = async (id, status) => {
  try {
    const response = await api.put(`/leaverequest/${id}/status`, { status });
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update leave request status' };
  }
}; 