import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { menuService, screenService } from '@/services';
import type { MenuWithScreens } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, FileText } from 'lucide-react';

export function MenuDetailPage() {
  const { menuId } = useParams<{ menuId: string }>();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<MenuWithScreens | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenDescription, setNewScreenDescription] = useState('');

  useEffect(() => {
    if (menuId) {
      loadMenu(parseInt(menuId));
    }
  }, [menuId]);

  const loadMenu = async (id: number) => {
    try {
      const data = await menuService.getMenu(id);
      setMenu(data);
    } catch (error) {
      console.error('메뉴 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScreen = async () => {
    if (!menu || !newScreenName.trim()) return;

    try {
      await screenService.createScreen({
        menu_id: menu.id,
        name: newScreenName,
        description: newScreenDescription || undefined,
      });
      setShowCreateModal(false);
      setNewScreenName('');
      setNewScreenDescription('');
      loadMenu(menu.id);
    } catch (error) {
      console.error('화면 생성 실패:', error);
      alert('화면 생성에 실패했습니다.');
    }
  };

  const handleScreenClick = (screenId: number) => {
    navigate(`/screen/${screenId}`);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { label: '초안', color: 'bg-gray-200 text-gray-700' },
      in_review: { label: '검토중', color: 'bg-blue-200 text-blue-700' },
      approved: { label: '승인', color: 'bg-green-200 text-green-700' },
    };
    const badge = badges[status as keyof typeof badges] || badges.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">메뉴를 찾을 수 없습니다</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{menu.name}</h1>
          <p className="text-muted-foreground mt-2">
            {menu.description || '설명 없음'}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          화면 추가
        </Button>
      </div>

      {showCreateModal && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>새 화면 생성</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">화면 이름</label>
              <Input
                value={newScreenName}
                onChange={(e) => setNewScreenName(e.target.value)}
                placeholder="예: 사용자 목록"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">설명 (선택)</label>
              <Input
                value={newScreenDescription}
                onChange={(e) => setNewScreenDescription(e.target.value)}
                placeholder="화면 설명을 입력하세요"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateScreen} disabled={!newScreenName.trim()}>
                생성
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {menu.screens && menu.screens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">화면이 없습니다</h3>
            <p className="text-muted-foreground mb-4">새 화면을 추가하여 시작하세요</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menu.screens?.map((screen) => (
            <Card
              key={screen.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleScreenClick(screen.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{screen.name}</CardTitle>
                  {getStatusBadge(screen.status)}
                </div>
                <CardDescription>
                  {screen.description || '설명 없음'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  생성일: {new Date(screen.created_at).toLocaleDateString('ko-KR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
