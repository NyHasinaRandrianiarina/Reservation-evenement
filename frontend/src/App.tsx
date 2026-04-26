import { Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthBootstrap from "@/components/auth/AuthBootstrap";
import { usePageTitle } from './hooks/usePageTitle';  

// EventNest — Public
import PublicLayout from './components/layouts/PublicLayout';
import CatalogPage from './pages/CatalogPage';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RegisterDeliveryPage from './pages/auth/RegisterDeliveryPage';
import TrackPage from './pages/TrackPage';
import TrackResultPage from './pages/TrackResultPage';
import AppLayout from './components/layouts/AppLayout';
import SenderDashboardPage from './pages/sender/SenderDashboardPage';
import SenderDeliveriesPage from './pages/sender/SenderDeliveriesPage';
import SenderDeliveryDetailPage from './pages/sender/SenderDeliveryDetailPage';
import SenderNewDeliveryPage from './pages/sender/SenderNewDeliveryPage';

// Delivery Pages
import DeliveryDashboardPage from './pages/delivery/DeliveryDashboardPage';
import DeliveryMissionsPage from './pages/delivery/DeliveryMissionsPage';
import DeliveryMissionDetailPage from './pages/delivery/DeliveryMissionDetailPage';
import DeliveryHistoryPage from './pages/delivery/DeliveryHistoryPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminAllOrdersPage from './pages/admin/AdminAllOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminStatsPage from './pages/admin/AdminStatsPage';

function App() {
  usePageTitle(); 

  return (
    <div>
      <TooltipProvider>
        <Toaster position="top-right" />
        <AuthBootstrap />
        <Routes>
          {/* EventNest — Public */}
          <Route element={<PublicLayout />}>
            <Route path='/events' element={<CatalogPage />} />
          </Route>

          {/* Legacy Public Routes */}
          <Route path='/' element={<LandingPage/>}/>
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/register' element={<RegisterPage/>}/>
          <Route path='/register/delivery' element={<RegisterDeliveryPage/>}/>
          <Route path='/track' element={<TrackPage/>}/>
          <Route path='/track/:trackingNumber' element={<TrackResultPage/>}/>
          
          {/* Protected Sender Routes */}
          <Route path='/sender' element={<AppLayout><Outlet /></AppLayout>}>
            <Route path='dashboard' element={<SenderDashboardPage />} />
            <Route path='demandes' element={<SenderDeliveriesPage />} />
            <Route path='demandes/nouvelle' element={<SenderNewDeliveryPage />} />
            <Route path='demandes/:id' element={<SenderDeliveryDetailPage />} />
          </Route>

          {/* Protected Delivery Routes */}
          <Route path='/delivery' element={<AppLayout><Outlet /></AppLayout>}>
            <Route path='dashboard' element={<DeliveryDashboardPage />} />
            <Route path='missions' element={<DeliveryMissionsPage />} />
            <Route path='missions/:id' element={<DeliveryMissionDetailPage />} />
            <Route path='historique' element={<DeliveryHistoryPage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route path='/admin' element={<AppLayout><Outlet /></AppLayout>}>
            <Route path='dashboard' element={<AdminDashboardPage />} />
            <Route path='commandes' element={<AdminAllOrdersPage />} />
            <Route path='commandes/:id' element={<AdminOrderDetailPage />} />
            <Route path='utilisateurs' element={<AdminUsersPage />} />
            <Route path='statistiques' element={<AdminStatsPage />} />
          </Route>
        </Routes>
      </TooltipProvider>
    </div>
  );
}

export default App;
