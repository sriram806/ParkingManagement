import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  Moon, 
  Sun, 
  SearchIcon 
} from 'lucide-react';
import apiService from '../../services/apiService';

interface Guard {
  id: string;
  name: string;
  email: string;
  shift: 'day' | 'night';
  status: 'active' | 'inactive';
}

interface GuardFormInput {
  name: string;
  email: string;
  shift: 'day' | 'night';
  status: 'active' | 'inactive';
}

const GuardManagement: React.FC = () => {
  const { t } = useTranslation();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState<Guard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<GuardFormInput>({
    defaultValues: {
      shift: 'day',
      status: 'active'
    }
  });

  useEffect(() => {
    fetchGuards();
  }, []);

  const fetchGuards = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getGuards();
      setGuards(response.data);
    } catch (error) {
      console.error('Error fetching guards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openForm = (guard?: Guard) => {
    if (guard) {
      setIsEditMode(true);
      setSelectedGuard(guard);
      setValue('name', guard.name);
      setValue('email', guard.email);
      setValue('shift', guard.shift);
      setValue('status', guard.status);
    } else {
      setIsEditMode(false);
      setSelectedGuard(null);
      reset({
        name: '',
        email: '',
        shift: 'day',
        status: 'active'
      });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setIsEditMode(false);
    setSelectedGuard(null);
  };

  const onSubmit = async (data: GuardFormInput) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && selectedGuard) {
        await apiService.updateGuard(selectedGuard.id, data);
        // Optimistic update
        setGuards(guards.map(guard => 
          guard.id === selectedGuard.id ? { ...guard, ...data } : guard
        ));
      } else {
        const response = await apiService.createGuard(data);
        // Optimistic add
        setGuards([...guards, response.data]);
      }
      closeForm();
    } catch (error) {
      console.error('Error saving guard:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (guardId: string) => {
    if (window.confirm(t('admin.guardManagement.deleteConfirm'))) {
      setIsDeleting(true);
      try {
        await apiService.deleteGuard(guardId);
        // Optimistic delete
        setGuards(guards.filter(guard => guard.id !== guardId));
      } catch (error) {
        console.error('Error deleting guard:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const filteredGuards = guards.filter(guard => 
    guard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guard.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {t('admin.guardManagement.title')}
        </h1>
        <button
          onClick={() => openForm()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          {t('admin.guardManagement.addGuard')}
        </button>
      </div>
      
      <div className="card p-5 mb-6">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder={t('common.search')}
            className="input pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600"></div>
          </div>
        ) : filteredGuards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No guards found matching your search' : 'No guards added yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.guardManagement.name')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.guardManagement.email')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.guardManagement.shift')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.guardManagement.status')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuards.map((guard) => (
                  <tr key={guard.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{guard.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500">{guard.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {guard.shift === 'day' ? (
                          <>
                            <Sun size={16} className="text-yellow-500 mr-1" />
                            <span>{t('admin.guardManagement.day')}</span>
                          </>
                        ) : (
                          <>
                            <Moon size={16} className="text-indigo-500 mr-1" />
                            <span>{t('admin.guardManagement.night')}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full
                        ${guard.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'}
                      `}>
                        {guard.status === 'active' 
                          ? t('admin.guardManagement.active')
                          : t('admin.guardManagement.inactive')
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openForm(guard)}
                        className="text-primary-600 hover:text-primary-800 mr-3"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(guard.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={isDeleting}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditMode 
                  ? t('admin.guardManagement.editGuard')
                  : t('admin.guardManagement.addGuard')
                }
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.guardManagement.name')}
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={`input ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    {...register('name', { required: t('validation.required') })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.guardManagement.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`input ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    {...register('email', { 
                      required: t('validation.required'),
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: t('validation.invalidEmail')
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.guardManagement.shift')}
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="day"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        {...register('shift')}
                      />
                      <span className="ml-2 flex items-center">
                        <Sun size={16} className="text-yellow-500 mr-1" />
                        {t('admin.guardManagement.day')}
                      </span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="night"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        {...register('shift')}
                      />
                      <span className="ml-2 flex items-center">
                        <Moon size={16} className="text-indigo-500 mr-1" />
                        {t('admin.guardManagement.night')}
                      </span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.guardManagement.status')}
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="active"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        {...register('status')}
                      />
                      <span className="ml-2 flex items-center">
                        <Check size={16} className="text-green-500 mr-1" />
                        {t('admin.guardManagement.active')}
                      </span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="inactive"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        {...register('status')}
                      />
                      <span className="ml-2 flex items-center">
                        <X size={16} className="text-red-500 mr-1" />
                        {t('admin.guardManagement.inactive')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      <span>{t('common.loading')}</span>
                    </div>
                  ) : (
                    isEditMode ? t('common.save') : t('common.add')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuardManagement;