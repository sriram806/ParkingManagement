import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired, log out the user
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock API services for demonstration
const mockGuards = [
  { id: '1', name: 'John Doe', email: 'john@example.com', shift: 'day', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', shift: 'night', status: 'active' },
];

const mockVehicles = [
  { 
    id: '1', 
    vehicleNumber: 'KA01AB1234', 
    vehicleType: 'fourWheeler', 
    entryTime: new Date(Date.now() - 3600000).toISOString(),
    exitTime: null,
    guardId: '1',
    guardName: 'John Doe',
    shift: 'day',
    fees: null,
    status: 'active'
  },
  { 
    id: '2', 
    vehicleNumber: 'KA02CD5678', 
    vehicleType: 'twoWheeler', 
    entryTime: new Date(Date.now() - 36000000).toISOString(),
    exitTime: new Date(Date.now() - 3600000).toISOString(),
    guardId: '2',
    guardName: 'Jane Smith',
    shift: 'night',
    fees: 100,
    status: 'exited'
  },
];

const mockPricing = {
  twoWheeler: 50,
  threeWheeler: 100,
  fourWheeler: 200,
};

// Mock login service
const login = async (email: string, password: string) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock login logic
  if (email === 'user1@gmail.com' && password === '123456789') {
    // Return guard token
    return {
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJuYW1lIjoiSm9obiBEb2UiLCJyb2xlIjoiZ3VhcmQiLCJzaGlmdCI6ImRheSIsImV4cCI6MTkwMDAwMDAwMH0.Ks9zzHUK8dryuwXA7Y3_3QVdp9L3OVd_h5HEmkqm5R0',
      },
    };
  } else if (email === 'admin@gmail.com' && password === '123456789') {
    // Return admin token
    return {
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMiLCJuYW1lIjoiQWRtaW4gVXNlciIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTkwMDAwMDAwMH0.3YGm-MSoPKt_fUSrPN6X4OYD6GiVHZXhMSLzPBjLYHM',
      },
    };
  }
  
  throw new Error('Invalid credentials');
};

// Mock services
const getVehicles = async (filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // In a real app, we would filter based on the filters object
  return { data: mockVehicles };
};

const getActiveVehicles = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { 
    data: mockVehicles.filter(v => v.status === 'active') 
  };
};

const getVehicleByNumber = async (vehicleNumber: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Modified to find vehicle regardless of status
  const vehicle = mockVehicles.find(
    v => v.vehicleNumber.toLowerCase() === vehicleNumber.toLowerCase()
  );
  
  if (!vehicle) {
    return Promise.reject({ 
      response: { status: 404, data: { message: 'Vehicle not found' } } 
    });
  }
  
  // If vehicle has already exited, return appropriate error
  if (vehicle.status === 'exited') {
    return Promise.reject({ 
      response: { status: 400, data: { message: 'Vehicle has already exited', vehicle } } 
    });
  }
  
  return { data: vehicle };
};

const createVehicleEntry = async (vehicleData: any) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newVehicle = {
    id: String(mockVehicles.length + 1),
    ...vehicleData,
    entryTime: new Date().toISOString(),
    exitTime: null,
    fees: null,
    status: 'active',
  };
  
  return { data: newVehicle };
};

const processVehicleExit = async (vehicleId: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const vehicle = mockVehicles.find(v => v.id === vehicleId);
  
  if (!vehicle) {
    return Promise.reject({ 
      response: { status: 404, data: { message: 'Vehicle not found' } } 
    });
  }
  
  // Calculate fees based on duration and vehicle type
  const entryTime = new Date(vehicle.entryTime).getTime();
  const exitTime = Date.now();
  const durationHours = (exitTime - entryTime) / (1000 * 60 * 60);
  const days = Math.ceil(durationHours / 24);
  
  let feePerDay = 0;
  if (vehicle.vehicleType === 'twoWheeler') {
    feePerDay = mockPricing.twoWheeler;
  } else if (vehicle.vehicleType === 'threeWheeler') {
    feePerDay = mockPricing.threeWheeler;
  } else {
    feePerDay = mockPricing.fourWheeler;
  }
  
  const totalFees = days * feePerDay;
  
  const updatedVehicle = {
    ...vehicle,
    exitTime: new Date().toISOString(),
    fees: totalFees,
    status: 'exited',
  };
  
  return { data: updatedVehicle };
};

const getGuards = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { data: mockGuards };
};

const createGuard = async (guardData: any) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newGuard = {
    id: String(mockGuards.length + 1),
    ...guardData,
  };
  
  return { data: newGuard };
};

const updateGuard = async (guardId: string, guardData: any) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const guard = mockGuards.find(g => g.id === guardId);
  
  if (!guard) {
    return Promise.reject({ 
      response: { status: 404, data: { message: 'Guard not found' } } 
    });
  }
  
  const updatedGuard = {
    ...guard,
    ...guardData,
  };
  
  return { data: updatedGuard };
};

const deleteGuard = async (guardId: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { data: { success: true } };
};

const getPricingSettings = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { data: mockPricing };
};

const updatePricingSettings = async (pricingData: any) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { data: { ...mockPricing, ...pricingData } };
};

// Dashboard statistics
const getDashboardStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { 
    data: {
      totalVehicles: mockVehicles.length,
      vehiclesParked: mockVehicles.filter(v => v.status === 'active').length,
      todayRevenue: 1200,
      monthRevenue: 25000,
      activeGuards: mockGuards.filter(g => g.status === 'active').length,
      vehicleTypeDistribution: {
        twoWheeler: 35,
        threeWheeler: 15,
        fourWheeler: 50,
      },
      revenueByDay: [
        { day: 'Mon', revenue: 1200 },
        { day: 'Tue', revenue: 1400 },
        { day: 'Wed', revenue: 1100 },
        { day: 'Thu', revenue: 1300 },
        { day: 'Fri', revenue: 1600 },
        { day: 'Sat', revenue: 1800 },
        { day: 'Sun', revenue: 1000 },
      ],
    } 
  };
};

const apiService = {
  login,
  getVehicles,
  getActiveVehicles,
  getVehicleByNumber,
  createVehicleEntry,
  processVehicleExit,
  getGuards,
  createGuard,
  updateGuard,
  deleteGuard,
  getPricingSettings,
  updatePricingSettings,
  getDashboardStats,
};

export default apiService;