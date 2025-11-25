import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuService } from '@/services';
import type { Menu } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FolderOpen } from 'lucide-react';

export function MenuListPage() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      const data = await menuService.getMenus();
      setMenus(data);
    } catch (error) {
      console.error('메뉴 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await menuService.importCSV(file);
      alert(`${result.created_count}개의 메뉴가 생성되었습니다.`);
      loadMenus();
    } catch (error) {
      console.error('CSV 임포트 실패:', error);
      alert('CSV 임포트에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleMenuClick = (menuId: number) => {
    navigate(`/menu/${menuId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">메뉴 목록</h1>
          <p className="text-muted-foreground mt-2">
            메뉴를 선택하거나 CSV 파일로 일괄 등록하세요
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => document.getElementById('csv-upload')?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            CSV 임포트
          </Button>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVUpload}
            disabled={uploading}
          />
        </div>
      </div>

      {menus.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">메뉴가 없습니다</h3>
            <p className="text-muted-foreground mb-4">CSV 파일을 업로드하여 메뉴를 생성하세요</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => (
            <Card
              key={menu.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleMenuClick(menu.id)}
            >
              <CardHeader>
                <CardTitle>{menu.name}</CardTitle>
                <CardDescription>
                  {menu.description || '설명 없음'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  생성일: {new Date(menu.created_at).toLocaleDateString('ko-KR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
