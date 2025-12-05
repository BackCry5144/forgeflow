/**
 * Layout Manager - 레이아웃 CRUD 관리 컴포넌트
 */

import { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, LayoutGrid,
  Search, ChevronDown, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { resourceService } from '@/services/resourceService';
import type { Layout, CreateLayoutRequest, UpdateLayoutRequest, LayoutArea } from '@/types/resource';

export function LayoutList() {
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 레이아웃 로드
  const loadLayouts = async () => {
    setLoading(true);
    try {
      const data = await resourceService.getLayouts(true); // include inactive
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

  // 필터링된 레이아웃
  const filteredLayouts = layouts.filter(layout =>
    layout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    layout.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (layout.description && layout.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 삭제 핸들러
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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="레이아웃 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          새 레이아웃
        </Button>
      </div>

      {/* Layout List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">로딩 중...</div>
        ) : filteredLayouts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">레이아웃이 없습니다</div>
        ) : (
          filteredLayouts.map((layout) => (
            <Card key={layout.id} className={`${!layout.is_active ? 'opacity-60' : ''}`}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedId(expandedId === layout.id ? null : layout.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedId === layout.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <LayoutGrid className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {layout.name}
                        <span className="text-xs font-normal text-gray-400">({layout.id})</span>
                        {!layout.is_active && (
                          <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">비활성</span>
                        )}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5">{layout.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 mr-2">
                      {layout.areas?.length || 0}개 영역
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLayout(layout);
                        setIsEditing(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(layout.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {expandedId === layout.id && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4 space-y-4">
                    {/* Areas */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">레이아웃 영역</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {layout.areas?.map((area) => (
                          <div
                            key={area.id}
                            className="p-2 bg-gray-50 rounded border text-xs"
                          >
                            <div className="font-medium">{area.name}</div>
                            <div className="text-gray-500">{area.id}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* HTML Preview */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">HTML 템플릿</h4>
                      <pre className="p-3 bg-gray-900 text-gray-100 text-xs rounded overflow-auto max-h-48">
                        <code>{layout.html_template?.slice(0, 500)}...</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Edit/Create Dialog */}
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
    category: 'general',
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
        html_template: layout.html_template,
        areas: layout.areas || [],
        category: layout.category,
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
        category: 'general',
        is_active: true,
        sort_order: '0',
      });
      setAreasJson('[]');
    }
  }, [layout, open]);

  const handleSave = async () => {
    // Parse areas JSON
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                placeholder="mes"
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
            <Label>영역 정의 (JSON)</Label>
            <Textarea
              value={areasJson}
              onChange={(e) => setAreasJson(e.target.value)}
              rows={6}
              className="font-mono text-xs"
              placeholder='[{"id": "search-area", "name": "검색 영역", "suggestedComponents": ["textbox", "button"]}]'
            />
          </div>

          <div>
            <Label>HTML 템플릿</Label>
            <Textarea
              value={formData.html_template}
              onChange={(e) => setFormData({ ...formData, html_template: e.target.value })}
              rows={10}
              className="font-mono text-xs"
              placeholder="<!DOCTYPE html>..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LayoutList;
