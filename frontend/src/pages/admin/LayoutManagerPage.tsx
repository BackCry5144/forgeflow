/**
 * Layout Manager Page - 레이아웃 관리 독립 페이지
 */

import { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Search, RefreshCw, LayoutGrid
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { LayoutPreview } from '@/components/ui/layout-preview';
import { resourceService } from '@/services/resourceService';
import type { Layout, CreateLayoutRequest, UpdateLayoutRequest, LayoutArea } from '@/types/resource';

export function LayoutManagerPage() {
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const loadLayouts = async () => {
    setLoading(true);
    try {
      const data = await resourceService.getLayouts(true);
      setLayouts(data);
    } catch (error) {
      console.error('Failed to load layouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLayouts();
  }, []);

  const filteredLayouts = layouts.filter(layout =>
    layout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    layout.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm(`레이아웃 '${id}'을(를) 삭제하시겠습니까?`)) return;
    try {
      await resourceService.deleteLayout(id);
      await loadLayouts();
    } catch (error) {
      console.error('Failed to delete layout:', error);
      alert('삭제 실패');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <LayoutGrid className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">레이아웃 관리</h1>
              <p className="text-sm text-gray-500">Wizard에서 사용할 레이아웃 템플릿 관리</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadLayouts} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              새 레이아웃
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="레이아웃 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Layout Cards */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">로딩 중...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredLayouts.map((layout) => (
              <Card 
                key={layout.id} 
                className={`hover:shadow-lg transition-shadow ${!layout.is_active ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-4">
                  {/* Preview */}
                  <LayoutPreview layoutId={layout.id} height="h-24" />
                  
                  {/* Info */}
                  <div className="mt-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{layout.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{layout.id}</p>
                      </div>
                      <div className="flex items-center gap-0.5 ml-2">
                        <button
                          onClick={() => {
                            setSelectedLayout(layout);
                            setIsEditing(true);
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="수정"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(layout.id)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{layout.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded">
                        {layout.areas?.length || 0}개 영역
                      </span>
                      {!layout.is_active && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-gray-200 text-gray-600 rounded">비활성</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <LayoutEditDialog
        layout={isCreating ? null : selectedLayout}
        open={isEditing || isCreating}
        onClose={() => {
          setIsEditing(false);
          setIsCreating(false);
          setSelectedLayout(null);
        }}
        onSave={async () => {
          await loadLayouts();
          setIsEditing(false);
          setIsCreating(false);
          setSelectedLayout(null);
        }}
      />
    </div>
  );
}

// Layout Edit Dialog
interface LayoutEditDialogProps {
  layout: Layout | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

function LayoutEditDialog({ layout, open, onClose, onSave }: LayoutEditDialogProps) {
  const isNew = !layout;
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    html_template: '',
    areas: [] as LayoutArea[],
    category: 'mes',
    is_active: true,
    sort_order: '0',
  });
  const [saving, setSaving] = useState(false);
  const [areasJson, setAreasJson] = useState('[]');

  useEffect(() => {
    if (layout) {
      setFormData({
        id: layout.id,
        name: layout.name,
        description: layout.description || '',
        html_template: layout.html_template || '',
        areas: layout.areas || [],
        category: layout.category || 'mes',
        is_active: layout.is_active,
        sort_order: layout.sort_order,
      });
      setAreasJson(JSON.stringify(layout.areas || [], null, 2));
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
        html_template: '',
        areas: [],
        category: 'mes',
        is_active: true,
        sort_order: '0',
      });
      setAreasJson('[]');
    }
  }, [layout, open]);

  const handleSave = async () => {
    let parsedAreas: LayoutArea[] = [];
    try {
      parsedAreas = JSON.parse(areasJson);
    } catch (e) {
      alert('Areas JSON 형식이 올바르지 않습니다');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await resourceService.createLayout({
          ...formData,
          areas: parsedAreas,
        } as CreateLayoutRequest);
      } else {
        await resourceService.updateLayout(layout!.id, {
          name: formData.name,
          description: formData.description,
          html_template: formData.html_template,
          areas: parsedAreas,
          category: formData.category,
          is_active: formData.is_active,
          sort_order: formData.sort_order,
        } as UpdateLayoutRequest);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save layout:', error);
      alert('저장 실패');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isNew ? '새 레이아웃 생성' : `레이아웃 수정: ${layout?.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>ID</Label>
              <Input
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={!isNew}
                placeholder="search-grid"
              />
            </div>
            <div>
              <Label>이름</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="SearchGrid"
              />
            </div>
          </div>

          <div>
            <Label>설명</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="검색 + 그리드 레이아웃"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>카테고리</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div>
              <Label>정렬 순서</Label>
              <Input
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <span>활성화</span>
              </label>
            </div>
          </div>

          <div>
            <Label>HTML 템플릿</Label>
            <Textarea
              value={formData.html_template}
              onChange={(e) => setFormData({ ...formData, html_template: e.target.value })}
              rows={8}
              className="font-mono text-xs"
            />
          </div>

          <div>
            <Label>영역 정의 (JSON)</Label>
            <Textarea
              value={areasJson}
              onChange={(e) => setAreasJson(e.target.value)}
              rows={8}
              className="font-mono text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LayoutManagerPage;
