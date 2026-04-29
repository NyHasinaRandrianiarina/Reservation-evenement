import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthBootstrap from "@/components/auth/AuthBootstrap";
import RequireAuth from "@/components/auth/RequireAuth";
import { usePageTitle } from './hooks/usePageTitle';  

// EventNest — Public
import PublicLayout from './components/layouts/PublicLayout';
import CatalogPage from './pages/CatalogPage';
import EventDetailPage from './pages/EventDetailPage';
import OrganizersPage from './pages/OrganizersPage';
import OrganizerDetailPage from './pages/OrganizerDetailPage';
import RegistrationLayout from './components/layouts/RegistrationLayout';
import Step1TicketsPage from './pages/registration/Step1TicketsPage';
import Step2InfoPage from './pages/registration/Step2InfoPage';
import Step3PaymentPage from './pages/registration/Step3PaymentPage';
import ConfirmationPage from './pages/registration/ConfirmationPage';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

import AccountLayout from './components/layouts/AccountLayout';
import MyRegistrationsPage from './pages/account/MyRegistrationsPage';
import ProfilePage from './pages/account/ProfilePage';
import ParticipantCalendarPage from './pages/account/ParticipantCalendarPage';

import OrganizerLayout from './components/layouts/OrganizerLayout';
import OrgDashboardPage from './pages/organizer/OrgDashboardPage';
import EventWizardPage from './pages/organizer/EventWizardPage';
import OrgEventListPage from './pages/organizer/OrgEventListPage';
import OrgEventDetailPage from './pages/organizer/OrgEventDetailPage';
import OrgCalendarPage from './pages/organizer/OrgCalendarPage';

// Admin Pages
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
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
            <Route path='/' element={<CatalogPage />} />
            <Route path='/events/:slug' element={<EventDetailPage />} />
            <Route path='/organisateurs' element={<OrganizersPage />} />
            <Route path='/organisateurs/:id' element={<OrganizerDetailPage />} />
          </Route>
          
          <Route path='/events/:slug/register' element={<RegistrationLayout />}>
            <Route path='tickets' element={<Step1TicketsPage />} />
            <Route path='info' element={<Step2InfoPage />} />
            <Route path='payment' element={<Step3PaymentPage />} />
          </Route>
          <Route path='/events/:slug/confirmation' element={<ConfirmationPage />} />

          {/* Auth Routes */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<SignupPage />} />
          
          <Route element={<RequireAuth />}>
            {/* Protected Participant Routes */}
            <Route path='/account' element={<AccountLayout />}>
              <Route path='registrations' element={<MyRegistrationsPage />} />
              <Route path='profile' element={<ProfilePage />} />
              <Route path='calendar' element={<ParticipantCalendarPage />} />
            </Route>

            {/* Protected Organizer Routes */}
            <Route path='/organizer' element={<OrganizerLayout />}>
              <Route path='dashboard' element={<OrgDashboardPage />} />
              <Route path='events' element={<OrgEventListPage />} />
              <Route path='events/new' element={<EventWizardPage />} />
              <Route path='events/:id' element={<OrgEventDetailPage />} />
              <Route path='events/:id/edit' element={<EventWizardPage />} />
              <Route path='profile' element={<ProfilePage />} />
              <Route path='calendar' element={<OrgCalendarPage />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route path='/admin' element={<AdminLayout />}>
              <Route path='dashboard' element={<AdminDashboardPage />} />
              <Route path='evenements' element={<AdminEventsPage />} />
              <Route path='utilisateurs' element={<AdminUsersPage />} />
              <Route path='statistiques' element={<AdminStatsPage />} />
            </Route>
          </Route>
        </Routes>
      </TooltipProvider>
    </div>
  );
}

export default App;
