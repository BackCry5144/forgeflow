import React from 'react';
import { Menu, Settings, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, onViewChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const activities = [
    { id: 'home', icon: Home, label: '홈', path: '/' },
    { id: 'explorer', icon: Menu, label: '메뉴 탐색기', path: null },
    { id: 'settings', icon: Settings, label: '설정', path: null },
  ];

  const handleClick = (activity: typeof activities[0]) => {
    if (activity.path) {
      navigate(activity.path);
    }
    onViewChange(activity.id);
  };

  const isActive = (activity: typeof activities[0]) => {
    // 홈 페이지에 있을 때는 home만 활성화
    if (location.pathname === '/') {
      return activity.id === 'home';
    }
    // 그 외에는 activeView로 판단
    return activeView === activity.id;
  };

  return (
    <div className="activity-bar">
      {activities.map((activity) => {
        const Icon = activity.icon;
        return (
          <button
            key={activity.id}
            className={`activity-bar-item ${isActive(activity) ? 'active' : ''}`}
            onClick={() => handleClick(activity)}
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
