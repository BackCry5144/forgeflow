/**
 * Component Manager - 컴포넌트 CRUD 관리
 */

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
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
import { resourceService } from '@/services/resourceService';
import { getIconComponent } from '@/utils/iconMapper';
import { IconSelect } from '@/components/ui/icon-select';
import type { Component, CreateComponentRequest, UpdateComponentRequest } from '@/types/resource';

export function ComponentList() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // 컴포넌트 로드
  const loadComponents = async () => {
    setLoading(true);
    try {
      const data = await resourceService.getComponents(undefined, true);
      setComponents(data);
    } catch (error) {
      console.error('Failed to load components:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComponents();
  }, []);

  // 카테고리 목록
  const categories = [...new Set(components.map(c => c.category))];

  // 필터링
  const filteredComponents = components.filter(comp => {
    const matchesSearch = searchQuery === '' ||
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || comp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // 삭제
  const handleDelete = async (id: string) => {
    if (!confirm(`컴포넌트 '${id}'을(를) 삭제하시겠습니까?`)) return;
    try {
      await resourceService.deleteComponent(id);
      await loadComponents();
    } catch (error) {
      console.error('Failed to delete component:', error);
      alert('삭제 실패');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="컴포넌트 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex gap-1">
            <Button
              variant={categoryFilter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(null)}
            >
              전체
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
        
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          새 컴포넌트
        </Button>
      </div>

      {/* Component Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredComponents.map((comp) => {
            const Icon = getIconComponent(comp.icon);
            return (
              <Card key={comp.id} className={`${!comp.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedComponent(comp);
                          setIsEditing(true);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(comp.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-sm">{comp.name}</h3>
                  <p className="text-xs text-gray-500">{comp.id}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{comp.description}</p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2 py-0.5 text-xs bg-gray-100 rounded">{comp.category}</span>
                    {!comp.is_active && (
                      <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">비활성</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <ComponentEditDialog
        component={isCreating ? null : selectedComponent}
        open={isEditing || isCreating}
        onClose={() => {
          setIsEditing(false);
          setIsCreating(false);
          setSelectedComponent(null);
        }}
        onSave={async () => {
          await loadComponents();
          setIsEditing(false);
          setIsCreating(false);
          setSelectedComponent(null);
        }}
      />
    </div>
  );
}

// Component Edit Dialog
interface ComponentEditDialogProps {
  component: Component | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

function ComponentEditDialog({ component, open, onClose, onSave }: ComponentEditDialogProps) {
  const isNew = !component;
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    type: '',
    category: 'form',
    icon: 'Square',
    default_props: {},
    jsx_template: '',
    available_events: [] as string[],
    is_active: true,
    sort_order: '0',
  });
  const [saving, setSaving] = useState(false);
  const [eventsJson, setEventsJson] = useState('[]');
  const [propsJson, setPropsJson] = useState('{}');

  useEffect(() => {
    if (component) {
      setFormData({
        id: component.id,
        name: component.name,
        description: component.description || '',
        type: component.type,
        category: component.category,
        icon: component.icon,
        default_props: component.default_props || {},
        jsx_template: component.jsx_template || '',
        available_events: component.available_events || [],
        is_active: component.is_active,
        sort_order: component.sort_order,
      });
      setEventsJson(JSON.stringify(component.available_events || [], null, 2));
      setPropsJson(JSON.stringify(component.default_props || {}, null, 2));
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
        type: '',
        category: 'form',
        icon: 'Square',
        default_props: {},
        jsx_template: '',
        available_events: [],
        is_active: true,
        sort_order: '0',
      });
      setEventsJson('[]');
      setPropsJson('{}');
    }
  }, [component, open]);

  const handleSave = async () => {
    let parsedEvents: string[] = [];
    let parsedProps: Record<string, any> = {};
    try {
      parsedEvents = JSON.parse(eventsJson);
      parsedProps = JSON.parse(propsJson);
    } catch (e) {
      alert('JSON 형식이 올바르지 않습니다');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await resourceService.createComponent({
          ...formData,
          available_events: parsedEvents,
          default_props: parsedProps,
        } as CreateComponentRequest);
      } else {
        await resourceService.updateComponent(component!.id, {
          name: formData.name,
          description: formData.description,
          type: formData.type,
          category: formData.category,
          icon: formData.icon,
          jsx_template: formData.jsx_template,
          available_events: parsedEvents,
          default_props: parsedProps,
          is_active: formData.is_active,
          sort_order: formData.sort_order,
        } as UpdateComponentRequest);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save component:', error);
      alert('저장 실패');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isNew ? '새 컴포넌트 생성' : `컴포넌트 수정: ${component?.name}`}
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
                placeholder="textbox"
              />
            </div>
            <div>
              <Label>이름</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="텍스트박스"
              />
            </div>
          </div>

          <div>
            <Label>설명</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="단일 줄 텍스트 입력"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>타입</Label>
              <Input
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="textbox"
              />
            </div>
            <div>
              <Label>카테고리</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded-md"
              >
                <option value="form">form</option>
                <option value="data-display">data-display</option>
                <option value="layout">layout</option>
              </select>
            </div>
            <div>
              <Label>아이콘</Label>
              <IconSelect
                value={formData.icon}
                onChange={(icon) => setFormData({ ...formData, icon })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <Label>사용 가능한 이벤트 (JSON Array)</Label>
            <Textarea
              value={eventsJson}
              onChange={(e) => setEventsJson(e.target.value)}
              rows={3}
              className="font-mono text-xs"
              placeholder='["click", "change", "submit"]'
            />
          </div>

          <div>
            <Label>기본 Props (JSON)</Label>
            <Textarea
              value={propsJson}
              onChange={(e) => setPropsJson(e.target.value)}
              rows={3}
              className="font-mono text-xs"
              placeholder='{"placeholder": "입력하세요"}'
            />
          </div>

          <div>
            <Label>JSX 템플릿</Label>
            <Textarea
              value={formData.jsx_template}
              onChange={(e) => setFormData({ ...formData, jsx_template: e.target.value })}
              rows={4}
              className="font-mono text-xs"
              placeholder="<input type='text' className='...' />"
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

export default ComponentList;
