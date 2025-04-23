import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Lock, Mail, ParkingCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginFormInput {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInput>();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  const onSubmit = async (data: LoginFormInput) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      await login(data.email, data.password);
      const from = location.state?.from?.pathname || '/';
      
      // Redirect based on role after successful login
      if (from === '/') {
        // If they came from root, redirect to appropriate dashboard
        navigate('/guard', { replace: true });
      } else {
        // Otherwise return them to where they were trying to go
        navigate(from, { replace: true });
      }
    } catch (error) {
      setLoginError(t('login.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <button 
        onClick={toggleLanguage}
        className="absolute top-4 right-4 px-3 py-1.5 text-sm font-medium rounded-md bg-white shadow-sm hover:bg-gray-50"
      >
        {language === 'en' ? 'हिन्दी' : 'English'}
      </button>
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden animate-fade-in">
        <div className="bg-primary-600 px-6 py-8 text-center">
          <div className="flex justify-center">
            <ParkingCircle size={56} className="text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">
            {t('common.appName')}
          </h1>
        </div>
        
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {t('login.title')}
          </h2>
          
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  placeholder={t('login.emailPlaceholder')}
                  className={`input pl-10 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  {...register('email', { 
                    required: t('validation.required'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('validation.invalidEmail')
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  placeholder={t('login.passwordPlaceholder')}
                  className={`input pl-10 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  {...register('password', { 
                    required: t('validation.required'),
                    minLength: {
                      value: 6,
                      message: t('validation.minLength', { count: 6 })
                    }
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                t('login.loginButton')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;