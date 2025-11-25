import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    
    // 폴더가 아닌 메뉴만 처리
    if (!menu.is_folder) {
      try {
        // 메뉴의 화면 정보 확인
        const menuData = await menuService.getMenu(menu.id);
        
        if (menuData.screens && menuData.screens.length > 0) {
          // 화면이 있으면 첫 번째 화면으로 이동
          navigate(`/screen/${menuData.screens[0].id}`);
        } else {
          // 화면이 없으면 자동 생성 후 이동
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

  return (
    <div className="main-layout">
      <ActivityBar activeView={activeView} onViewChange={setActiveView} />
      
      <div className="sidebar">
        {activeView === 'explorer' && (
          <MenuTreeView
            onMenuSelect={handleMenuSelect}
            selectedMenuId={selectedMenu?.id || null}
          />
        )}
        {activeView === 'screens' && (
          <div className="sidebar-content">
            <h3>화면 관리</h3>
            <p>화면 목록이 여기에 표시됩니다</p>
          </div>
        )}
        {activeView === 'home' && (
          <div className="sidebar-content">
            <h3>홈</h3>
            <p>대시보드</p>
          </div>
        )}
        {activeView === 'settings' && (
          <div className="sidebar-content">
            <h3>설정</h3>
            <p>설정 옵션</p>
          </div>
        )}
      </div>
      
      <div className="content-wrapper">
        <div className="header">
          <div className="breadcrumb">
            {selectedMenu && (
              <span>{selectedMenu.name}</span>
            )}
          </div>
        </div>
        
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
