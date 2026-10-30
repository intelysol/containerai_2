import React, { useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useInspectionStore } from './store/useInspectionStore';
import { AppHeader } from './components/AppHeader';
import { BottomNavigation, NavTab } from './components/BottomNavigation';
import { SecondaryNavDrawer } from './components/SecondaryNavDrawer';
import { OfflineBanner } from './components/OfflineBanner';
import { AuthScreens } from './screens/AuthScreens';
import { HomeScreen } from './screens/HomeScreen';
import { InspectionsListScreen } from './screens/InspectionsListScreen';
import { InspectionDetailScreen } from './screens/InspectionDetailScreen';
import { NewInspectionWizard } from './screens/NewInspectionWizard';
import { SyncCenterScreen } from './screens/SyncCenterScreen';
import { CreditWalletScreen } from './screens/CreditWalletScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { ProfileSettingsScreen } from './screens/ProfileSettingsScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const { activeInspectionId, setActiveInspection, setWizardType } = useInspectionStore();

  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [extraView, setExtraView] = useState<'wallet' | 'sync' | 'notifications' | null>(null);
  
  // Mobile Frame preview toggle for development testing on desktop
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);

  // If not authenticated, render splash / login / register / 2FA flow
  if (!isAuthenticated) {
    return <AuthScreens />;
  }

  const handleStartInspection = (type: 'EMPTY' | 'LOADED') => {
    setWizardType(type);
    setSelectedInspectionId(null);
    setExtraView(null);
    setCurrentTab('new-inspection');
  };

  const handleViewInspection = (id: string) => {
    setSelectedInspectionId(id);
    setActiveInspection(id);
    setExtraView(null);
    setCurrentTab('inspections');
  };

  const handleNavigateFromDrawer = (view: 'wallet' | 'sync' | 'notifications' | 'profile' | 'security' | 'help') => {
    if (view === 'profile' || view === 'security') {
      setCurrentTab('profile');
      setExtraView(null);
    } else if (view === 'wallet') {
      setExtraView('wallet');
    } else if (view === 'sync') {
      setExtraView('sync');
    } else if (view === 'notifications') {
      setExtraView('notifications');
    }
    setSelectedInspectionId(null);
  };

  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    setExtraView(null);
    if (tab !== 'inspections') {
      setSelectedInspectionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center">
      {/* Device Viewport Toggle Toolbar (Subtle top bar on wide screens) */}
      <div className="w-full bg-[#0D1E31] text-slate-300 text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-[#203F5F]/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#12A89D]" />
          <span className="font-semibold text-white">ContainerCheck AI Mobile UI</span>
          <span className="text-slate-400 hidden sm:inline">· Android & iOS Production Suite</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDeviceFrameMode(!deviceFrameMode)}
            className="flex items-center gap-1.5 hover:text-white transition px-2 py-0.5 rounded bg-[#142B45] border border-[#203F5F]"
          >
            {deviceFrameMode ? <Monitor size={13} /> : <Smartphone size={13} />}
            <span>{deviceFrameMode ? 'Full Viewport' : 'Mobile Frame Preview'}</span>
          </button>
        </div>
      </div>

      {/* Main Container Wrapper */}
      <div className={`w-full flex-1 flex flex-col transition-all ${
        deviceFrameMode 
          ? 'max-w-[430px] my-4 shadow-2xl rounded-3xl border-8 border-slate-800 overflow-hidden bg-white min-h-[850px] relative' 
          : 'max-w-4xl'
      }`}>
        {/* Top Header */}
        <AppHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenNotifications={() => {
            setExtraView('notifications');
            setSelectedInspectionId(null);
          }}
          onNavigateToWallet={() => {
            setExtraView('wallet');
            setSelectedInspectionId(null);
          }}
        />

        {/* Offline / Online Connectivity Notification Banner */}
        <OfflineBanner />

        {/* Screen Body */}
        <main className="flex-1 p-3.5 sm:p-5">
          {/* Overlaid Views (Wallet, Sync, Notifications) */}
          {extraView === 'wallet' && (
            <CreditWalletScreen />
          )}

          {extraView === 'sync' && (
            <SyncCenterScreen
              onNavigateToWallet={() => setExtraView('wallet')}
              onViewInspection={handleViewInspection}
            />
          )}

          {extraView === 'notifications' && (
            <NotificationsScreen
              onSelectInspection={(id) => {
                handleViewInspection(id);
                setExtraView(null);
              }}
              onSelectReport={() => {
                setCurrentTab('reports');
                setExtraView(null);
              }}
            />
          )}

          {/* Standard Navigation Tabs */}
          {!extraView && currentTab === 'home' && (
            <HomeScreen
              onStartInspection={handleStartInspection}
              onViewInspection={handleViewInspection}
              onNavigateToWallet={() => setExtraView('wallet')}
              onNavigateToSync={() => setExtraView('sync')}
              onNavigateToReports={() => setCurrentTab('reports')}
              onViewAllInspections={() => setCurrentTab('inspections')}
            />
          )}

          {!extraView && currentTab === 'inspections' && (
            selectedInspectionId ? (
              <InspectionDetailScreen
                inspectionId={selectedInspectionId}
                onBack={() => setSelectedInspectionId(null)}
              />
            ) : (
              <InspectionsListScreen
                onSelectInspection={handleViewInspection}
                onStartNewInspection={() => handleStartInspection('EMPTY')}
              />
            )
          )}

          {!extraView && currentTab === 'new-inspection' && (
            <NewInspectionWizard
              onCancel={() => setCurrentTab('home')}
              onFinished={(inspectionId) => {
                handleViewInspection(inspectionId);
              }}
              onNavigateToWallet={() => setExtraView('wallet')}
            />
          )}

          {!extraView && currentTab === 'reports' && (
            <ReportsScreen />
          )}

          {!extraView && currentTab === 'profile' && (
            <ProfileSettingsScreen />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNavigation
          activeTab={extraView ? ('' as any) : currentTab}
          onChangeTab={handleTabChange}
        />

        {/* Secondary Drawer */}
        <SecondaryNavDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onNavigate={handleNavigateFromDrawer}
        />
      </div>
    </div>
  );
}
