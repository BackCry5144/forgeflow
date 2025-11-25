import React from 'react';
import { Menu, Settings, FileText, Home } from 'lucide-react';

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, onViewChange }) => {
  const activities = [
    { id: 'home', icon: Home, label: '홈' },
    { id: 'explorer', icon: Menu, label: '메뉴 탐색기' },
    { id: 'screens', icon: FileText, label: '화면 관리' },    
    { id: 'settings', icon: Settings, label: '설정' },
  ];

  return (
    <div className="activity-bar">
      {activities.map((activity) => {
        const Icon = activity.icon;
        return (
          <button
            key={activity.id}
            className={`activity-bar-item ${activeView === activity.id ? 'active' : ''}`}
            onClick={() => onViewChange(activity.id)}
            title={activity.label}
          >
            <Icon size={24} />
          </button>
        );
      })}
    </div>
  );
};

export default ActivityBar;
