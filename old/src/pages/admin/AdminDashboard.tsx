import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CarFront, 
  Users, 
  IndianRupee, 
  CalendarClock, 
  AlertTriangle 
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import apiService from '../../services/apiService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalVehicles: number;
  vehiclesParked: number;
  todayRevenue: number;
  monthRevenue: number;
  activeGuards: number;
  vehicleTypeDistribution: {
    twoWheeler: number;
    threeWheeler: number;
    fourWheeler: number;
  };
  revenueByDay: {
    day: string;
    revenue: number;
  }[];
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await apiService.getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const revenueChartData = {
    labels: stats?.revenueByDay.map(item => item.day) || [],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: stats?.revenueByDay.map(item => item.revenue) || [],
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const vehicleTypeData = {
    labels: ['Two Wheeler', 'Three Wheeler', 'Four Wheeler'],
    datasets: [
      {
        data: stats 
          ? [
              stats.vehicleTypeDistribution.twoWheeler,
              stats.vehicleTypeDistribution.threeWheeler,
              stats.vehicleTypeDistribution.fourWheeler,
            ] 
          : [33, 33, 34],
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgba(37, 99, 235, 1)',
          'rgba(6, 182, 212, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const vehicleTypeOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    cutout: '60%',
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <div className="card p-5">
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {t('admin.dashboard.title')}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title={t('admin.dashboard.totalVehicles')}
          value={stats?.totalVehicles || 0}
          icon={<CarFront size={24} className="text-white" />}
          color="bg-primary-600"
        />
        <StatCard
          title={t('admin.dashboard.vehiclesParked')}
          value={stats?.vehiclesParked || 0}
          icon={<CarFront size={24} className="text-white" />}
          color="bg-secondary-600"
        />
        <StatCard
          title={t('admin.dashboard.todayRevenue')}
          value={`₹${stats?.todayRevenue || 0}`}
          icon={<IndianRupee size={24} className="text-white" />}
          color="bg-accent-600"
        />
        <StatCard
          title={t('admin.dashboard.activeGuards')}
          value={stats?.activeGuards || 0}
          icon={<Users size={24} className="text-white" />}
          color="bg-green-600"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-5 col-span-1 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t('admin.dashboard.revenueOverview')}
          </h2>
          <div className="h-72">
            <Line data={revenueChartData} options={revenueChartOptions} />
          </div>
        </div>
        
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t('admin.dashboard.vehicleTypeDistribution')}
          </h2>
          <div className="h-72 flex items-center justify-center">
            <Doughnut data={vehicleTypeData} options={vehicleTypeOptions} />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {t('admin.dashboard.monthRevenue')}
            </h2>
            <p className="text-lg font-bold text-primary-600">
              ₹{stats?.monthRevenue || 0}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Two Wheeler Revenue</p>
              <p className="text-sm font-medium">₹8,400</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: '28%' }}></div>
            </div>
            
            <div className="flex justify-between items-center pt-1">
              <p className="text-sm font-medium">Three Wheeler Revenue</p>
              <p className="text-sm font-medium">₹5,600</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-secondary-600 h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>
            
            <div className="flex justify-between items-center pt-1">
              <p className="text-sm font-medium">Four Wheeler Revenue</p>
              <p className="text-sm font-medium">₹11,000</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-accent-600 h-2 rounded-full" style={{ width: '52%' }}></div>
            </div>
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {t('admin.dashboard.overstayAlerts')}
            </h2>
            <div className="badge badge-warning">3 Vehicles</div>
          </div>
          
          <div className="space-y-4">
            <div className="flex p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">KA01AB1234</p>
                  <span className="badge badge-error">9 days</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Four Wheeler • Entry: May 15, 2025</p>
              </div>
            </div>
            
            <div className="flex p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle size={18} className="text-amber-600" />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">MH05XY9876</p>
                  <span className="badge badge-warning">8 days</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Two Wheeler • Entry: May 16, 2025</p>
              </div>
            </div>
            
            <div className="flex p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <CalendarClock size={18} className="text-amber-600" />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">DL8CAF5678</p>
                  <span className="badge badge-warning">7 days</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Four Wheeler • Entry: May 17, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;