import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { ScreenWorkspacePage } from './pages/ScreenWorkspacePage';
import { MenuDetailPage } from './pages/MenuDetailPage';
import { Toaster } from '@/components/ui/toaster';
import { ResourcesProvider } from '@/hooks/useResources';
import HomePage from './pages/HomePage';
import { LayoutManagerPage } from './pages/admin/LayoutManagerPage';
import { ComponentManagerPage } from './pages/admin/ComponentManagerPage';
import { ActionManagerPage } from './pages/admin/ActionManagerPage';

function App() {
  return (
    <ResourcesProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu/:menuId" element={<MenuDetailPage />} />
            <Route path="/screen/:screenId" element={<ScreenWorkspacePage />} />
            <Route path="/admin/layouts" element={<LayoutManagerPage />} />
            <Route path="/admin/components" element={<ComponentManagerPage />} />
            <Route path="/admin/actions" element={<ActionManagerPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
        <Toaster />
      </BrowserRouter>
    </ResourcesProvider>
  );
}

export default App;
