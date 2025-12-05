import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Layers, Zap } from 'lucide-react';
import ActivityBar from './ActivityBar';
import MenuTreeView from './MenuTreeView';
import { menuService, screenService } from '@/services';
import type { Menu } from '@/types';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('explorer');
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  const handleMenuSelect = async (menu: Menu) => {
    setSelectedMenu(menu);
    if (!menu.is_folder) {
      try {
        const menuData = await menuService.getMenu(menu.id);
        if (menuData.screens && menuData.screens.length > 0) {
          navigate(`/screen/${menuData.screens[0].id}`);
        } else {
          const newScreen = await screenService.createScreen({
            menu_id: menu.id,
            name: `${menu.name} 화면`,
            description: menu.description || `${menu.name}을 위한 화면입니다.`,
          });
          navigate(`/screen/${newScreen.id}`);
        }
      } catch (error) {
        console.error('메뉴 선택 처리 실패:', error);
        alert('화면을 열 수 없습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleActivityBarClick = (view: string) => {
    setActiveView(view);
    if (view === 'home') {
      navigate('/');
    }
  };

  const isHome = activeView === 'home';

  return (
    <div className={`main-layout${isHome ? ' home-full' : ''}`}>
      <ActivityBar activeView={activeView} onViewChange={handleActivityBarClick} />
      {!isHome && (
        <div className="sidebar">
          {activeView === 'explorer' && (
            <MenuTreeView
              onMenuSelect={handleMenuSelect}
              selectedMenuId={selectedMenu?.id || null}
            />
          )}
          {activeView === 'settings' && (
            <div className="sidebar-content">
              <h3 className="sidebar-title">설정</h3>
              <div className="settings-menu">
                <button
                  className="settings-menu-item"
                  onClick={() => navigate('/admin/resources?tab=layouts')}
                >
                  <LayoutGrid size={18} />
                  <span>레이아웃 관리</span>
                </button>
                <button
                  className="settings-menu-item"
                  onClick={() => navigate('/admin/resources?tab=components')}
                >
                  <Layers size={18} />
                  <span>컴포넌트 관리</span>
                </button>
                <button
                  className="settings-menu-item"
                  onClick={() => navigate('/admin/resources?tab=actions')}
                >
                  <Zap size={18} />
                  <span>액션 관리</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <div className={`content-wrapper${isHome ? ' content-full' : ''}`}>
        {!isHome && (
          <div className="header">
            <div className="breadcrumb">
              {selectedMenu && (
                <span>{selectedMenu.name}</span>
              )}
            </div>
          </div>
        )}
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
