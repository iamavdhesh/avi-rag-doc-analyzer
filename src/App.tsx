import { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardModule } from './components/DashboardModule';
import { DocumentUploadModule } from './components/DocumentUploadModule';
import { AIChatWorkspace } from './components/AIChatWorkspace';
import { KafkaDashboard } from './components/KafkaDashboard';
import { AdminPanel } from './components/AdminPanel';
import { LoginScreen } from './components/LoginScreen';
import { NotificationCenter } from './components/NotificationCenter';

function MainLayout() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Navigation Drawer Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        <Header activeTab={activeTab} />
        
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardModule />}
          {activeTab === 'documents' && <DocumentUploadModule />}
          {activeTab === 'chat' && <AIChatWorkspace />}
          {activeTab === 'kafka' && <KafkaDashboard />}
          {activeTab === 'admin' && <AdminPanel />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
      <NotificationCenter />
    </AppProvider>
  );
}
