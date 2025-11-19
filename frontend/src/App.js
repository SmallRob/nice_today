import React, { useState } from 'react';
import BiorhythmDashboard from './components/BiorhythmDashboard';
import ApiManagementNavigation from './components/ApiManagement/ApiManagementNavigation';
import DarkModeToggle from './components/DarkModeToggle';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('main');

  return (
    <div className="App min-h-screen bg-white dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nice Today</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setCurrentView('main')}
                  className={`${
                    currentView === 'main'
                      ? 'border-indigo-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  主应用
                </button>
                <button
                  onClick={() => setCurrentView('api-management')}
                  className={`${
                    currentView === 'api-management'
                      ? 'border-indigo-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  API管理
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main>
        {currentView === 'main' && <BiorhythmDashboard />}
        {currentView === 'api-management' && <ApiManagementNavigation />}
      </main>
    </div>
  );
}

export default App;