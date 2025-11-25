import React, { useState, useEffect, useRef } from 'react';
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown, Upload, Plus, RefreshCw } from 'lucide-react';
import { menuService } from '@/services';
import type { Menu } from '@/types';

interface MenuTreeItemProps {
  menu: Menu;
  level: number;
  onSelect: (menu: Menu) => void;
  selectedMenuId: number | null;
  onAddMenu: (parentId: number) => void;
  addingMenuToParentId: number | null;
  newMenuName: string;
  onMenuNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMenuNameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onMenuNameSubmit: () => void;
  menuInputRef: React.RefObject<HTMLInputElement>;
}

const MenuTreeItem: React.FC<MenuTreeItemProps> = ({ 
  menu, 
  level, 
  onSelect, 
  selectedMenuId, 
  onAddMenu,
  addingMenuToParentId,
  newMenuName,
  onMenuNameChange,
  onMenuNameKeyDown,
  onMenuNameSubmit,
  menuInputRef
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = menu.children && menu.children.length > 0;
  const isSelected = selectedMenuId === menu.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (menu.is_folder) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleClick = () => {
    if (menu.is_folder) {
      // 폴더인 경우 토글
      setIsExpanded(!isExpanded);
    } else {
      // 파일인 경우 선택
      onSelect(menu);
    }
  };

  return (
    <>
      <div
        className={`menu-tree-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {menu.is_folder && (
          <button className="expand-button" onClick={handleToggle}>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        {!menu.is_folder && <span className="expand-placeholder" />}
        
        {menu.is_folder ? (
          isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />
        ) : (
          <FileText size={16} />
        )}
        
        <span className="menu-name">{menu.name}</span>
      </div>
      
      {menu.is_folder && isExpanded && (
        <div className="menu-children">
          {hasChildren && menu.children!.map((child) => (
            <MenuTreeItem
              key={child.id}
              menu={child}
              level={level + 1}
              onSelect={onSelect}
              selectedMenuId={selectedMenuId}
              onAddMenu={onAddMenu}
              addingMenuToParentId={addingMenuToParentId}
              newMenuName={newMenuName}
              onMenuNameChange={onMenuNameChange}
              onMenuNameKeyDown={onMenuNameKeyDown}
              onMenuNameSubmit={onMenuNameSubmit}
              menuInputRef={menuInputRef}
            />
          ))}
          
          {/* 메뉴 추가 입력 필드 (이 폴더에 추가 중일 때) */}
          {addingMenuToParentId === menu.id ? (
            <div className="menu-tree-item creating-menu" style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}>
              <span className="expand-placeholder" />
              <FileText size={16} />
              <input
                ref={menuInputRef}
                type="text"
                className="folder-name-input"
                value={newMenuName}
                onChange={onMenuNameChange}
                onKeyDown={onMenuNameKeyDown}
                onBlur={onMenuNameSubmit}
                placeholder="메뉴명 입력..."
                autoFocus
              />
            </div>
          ) : (
            /* 폴더 하위에 메뉴 추가 버튼 */
            <div 
              className="menu-tree-item add-menu-item" 
              style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
              onClick={() => onAddMenu(menu.id)}
            >
              <span className="expand-placeholder" />
              <Plus size={16} className="add-icon" />
              <span className="menu-name">메뉴 추가</span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

interface MenuTreeViewProps {
  onMenuSelect: (menu: Menu) => void;
  selectedMenuId: number | null;
}

const MenuTreeView: React.FC<MenuTreeViewProps> = ({ onMenuSelect, selectedMenuId }) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [addingMenuToParentId, setAddingMenuToParentId] = useState<number | null>(null);
  const [newMenuName, setNewMenuName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const menuInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const data = await menuService.getMenus();
      
      // Build tree structure from flat list
      const menuMap = new Map<number, Menu>();
      const rootMenus: Menu[] = [];
      
      // First pass: create map
      data.forEach(menu => {
        menuMap.set(menu.id, { ...menu, children: [] });
      });
      
      // Second pass: build tree
      data.forEach(menu => {
        const menuItem = menuMap.get(menu.id)!;
        if (menu.parent_id === null) {
          rootMenus.push(menuItem);
        } else {
          const parent = menuMap.get(menu.parent_id);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(menuItem);
          }
        }
      });
      
      // Sort by order_index
      const sortMenus = (menus: Menu[]) => {
        menus.sort((a, b) => a.order_index - b.order_index);
        menus.forEach(menu => {
          if (menu.children) {
            sortMenus(menu.children);
          }
        });
      };
      sortMenus(rootMenus);
      
      setMenus(rootMenus);
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await menuService.importCSV(file);
      await loadMenus();
      setShowImport(false);
    } catch (error) {
      console.error('Failed to import CSV:', error);
      alert('CSV 임포트 실패');
    }
  };

  const handleCreateFolder = () => {
    setIsCreatingFolder(true);
    setNewFolderName('');
    // Focus input after render
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFolderName(e.target.value);
  };

  const handleFolderNameSubmit = async () => {
    if (!newFolderName.trim()) {
      setIsCreatingFolder(false);
      return;
    }

    try {
      // Get max order_index for root level
      const maxOrder = menus.length > 0 
        ? Math.max(...menus.map(m => m.order_index)) 
        : 0;

      await menuService.createMenu({
        name: newFolderName.trim(),
        description: '',
        is_folder: true,
        parent_id: null,
        order_index: maxOrder + 1
      });

      await loadMenus();
      setIsCreatingFolder(false);
      setNewFolderName('');
    } catch (error) {
      console.error('Failed to create folder:', error);
      alert('폴더 생성 실패');
    }
  };

  const handleFolderNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFolderNameSubmit();
    } else if (e.key === 'Escape') {
      setIsCreatingFolder(false);
      setNewFolderName('');
    }
  };

  const handleAddMenu = (parentId: number) => {
    setAddingMenuToParentId(parentId);
    setNewMenuName('');
    // Focus input after render
    setTimeout(() => {
      menuInputRef.current?.focus();
    }, 0);
  };

  const handleMenuNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMenuName(e.target.value);
  };

  const handleMenuNameSubmit = async () => {
    if (!newMenuName.trim() || addingMenuToParentId === null) {
      setAddingMenuToParentId(null);
      setNewMenuName('');
      return;
    }

    try {
      // 부모 메뉴의 자식들 중 최대 order_index 찾기
      const parent = findMenuById(menus, addingMenuToParentId);
      const maxOrder = parent?.children && parent.children.length > 0
        ? Math.max(...parent.children.map(m => m.order_index))
        : -1;

      await menuService.createMenu({
        name: newMenuName.trim(),
        description: '',
        is_folder: false, // 메뉴는 폴더가 아님
        parent_id: addingMenuToParentId,
        order_index: maxOrder + 1
      });

      await loadMenus();
      setAddingMenuToParentId(null);
      setNewMenuName('');
    } catch (error) {
      console.error('Failed to create menu:', error);
      alert('메뉴 생성 실패');
    }
  };

  const handleMenuNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleMenuNameSubmit();
    } else if (e.key === 'Escape') {
      setAddingMenuToParentId(null);
      setNewMenuName('');
    }
  };

  // Helper function to find menu by id in tree
  const findMenuById = (menuList: Menu[], id: number): Menu | null => {
    for (const menu of menuList) {
      if (menu.id === id) return menu;
      if (menu.children) {
        const found = findMenuById(menu.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="menu-tree-view">
        <div className="tree-header">
          <h3>메뉴 탐색기</h3>
        </div>
        <div className="tree-loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="menu-tree-view">
      <div className="tree-header">
        <h3>메뉴 탐색기</h3>
        <div className="tree-actions">
          <button className="icon-button" onClick={handleCreateFolder} title="폴더 생성">
            <Plus size={16} />
          </button>
          <button className="icon-button" onClick={() => loadMenus()} title="새로고침">
            <RefreshCw size={16} />
          </button>
          <button className="icon-button" onClick={() => setShowImport(!showImport)} title="CSV 임포트">
            <Upload size={16} />
          </button>
        </div>
      </div>
      
      {showImport && (
        <div className="import-section">
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="file-input"
          />
        </div>
      )}
      
      <div className="tree-content">
        {menus.length === 0 ? (
          <div className="tree-empty">
            <p>메뉴가 없습니다</p>
            <button onClick={() => setShowImport(true)}>CSV 임포트</button>
          </div>
        ) : (
          menus.map((menu) => (
            <MenuTreeItem
              key={menu.id}
              menu={menu}
              level={0}
              onSelect={onMenuSelect}
              selectedMenuId={selectedMenuId}
              onAddMenu={handleAddMenu}
              addingMenuToParentId={addingMenuToParentId}
              newMenuName={newMenuName}
              onMenuNameChange={handleMenuNameChange}
              onMenuNameKeyDown={handleMenuNameKeyDown}
              onMenuNameSubmit={handleMenuNameSubmit}
              menuInputRef={menuInputRef}
            />
          ))
        )}
        
        {isCreatingFolder && (
          <div className="menu-tree-item creating-folder" style={{ paddingLeft: '8px' }}>
            <span className="expand-placeholder" />
            <Folder size={16} />
            <input
              ref={inputRef}
              type="text"
              className="folder-name-input"
              value={newFolderName}
              onChange={handleFolderNameChange}
              onKeyDown={handleFolderNameKeyDown}
              onBlur={handleFolderNameSubmit}
              placeholder="폴더명 입력..."
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuTreeView;
