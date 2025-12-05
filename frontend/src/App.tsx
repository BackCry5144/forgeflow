import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { ScreenWorkspacePage } from './pages/ScreenWorkspacePage';
import { MenuDetailPage } from './pages/MenuDetailPage';
import { Toaster } from '@/components/ui/toaster';
import { ResourcesProvider } from '@/hooks/useResources';
import HomePage from './pages/HomePage';
import ResourceManagerPage from './pages/admin/ResourceManagerPage';

function App() {
  return (
    <ResourcesProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu/:menuId" element={<MenuDetailPage />} />
            <Route path="/screen/:screenId" element={<ScreenWorkspacePage />} />
            <Route path="/admin/resources" element={<ResourceManagerPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
        <Toaster />
      </BrowserRouter>
    </ResourcesProvider>
  );
}

export default App;
