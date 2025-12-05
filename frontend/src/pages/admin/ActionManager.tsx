/**
 * Action Manager - 액션 CRUD 관리
 */

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Zap } from 'lucide-react';
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
import type { Action, CreateActionRequest, UpdateActionRequest } from '@/types/resource';

export function ActionList() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // 액션 로드
  const loadActions = async () => {
    setLoading(true);
    try {
      const data = await resourceService.getActions(undefined, true);
      setActions(data);
    } catch (error) {
      console.error('Failed to load actions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, []);

  // 카테고리 목록
  const categories = [...new Set(actions.map(a => a.category))];

  // 필터링
  const filteredActions = actions.filter(action => {
    const matchesSearch = searchQuery === '' ||
      action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || action.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // 삭제
  const handleDelete = async (id: string) => {
    if (!confirm(`액션 '${id}'을(를) 삭제하시겠습니까?`)) return;
    try {
      await resourceService.deleteAction(id);
      await loadActions();
    } catch (error) {
      console.error('Failed to delete action:', error);
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
              placeholder="액션 검색..."
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
          새 액션
        </Button>
      </div>

      {/* Action Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredActions.map((action) => {
            const Icon = action.icon ? getIconComponent(action.icon) : Zap;
            return (
              <Card key={action.id} className={`${!action.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAction(action);
                          setIsEditing(true);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(action.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-sm">{action.name}</h3>
                  <p className="text-xs text-gray-500">{action.id}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{action.description}</p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                      {action.category}
                    </span>
                    {!action.is_active && (
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
      <ActionEditDialog
        action={isCreating ? null : selectedAction}
        open={isEditing || isCreating}
        onClose={() => {
          setIsEditing(false);
          setIsCreating(false);
          setSelectedAction(null);
        }}
        onSave={async () => {
          await loadActions();
          setIsEditing(false);
          setIsCreating(false);
          setSelectedAction(null);
        }}
      />
    </div>
  );
}

// Action Edit Dialog
interface ActionEditDialogProps {
  action: Action | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

function ActionEditDialog({ action, open, onClose, onSave }: ActionEditDialogProps) {
  const isNew = !action;
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    category: 'ui',
    icon: 'Zap',
    params_schema: {},
    code_template: '',
    is_active: true,
    sort_order: '0',
  });
  const [saving, setSaving] = useState(false);
  const [paramsJson, setParamsJson] = useState('{}');

  useEffect(() => {
    if (action) {
      setFormData({
        id: action.id,
        name: action.name,
        description: action.description || '',
        category: action.category,
        icon: action.icon || 'Zap',
        params_schema: action.params_schema || {},
        code_template: action.code_template || '',
        is_active: action.is_active,
        sort_order: action.sort_order,
      });
      setParamsJson(JSON.stringify(action.params_schema || {}, null, 2));
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
        category: 'ui',
        icon: 'Zap',
        params_schema: {},
        code_template: '',
        is_active: true,
        sort_order: '0',
      });
      setParamsJson('{}');
    }
  }, [action, open]);

  const handleSave = async () => {
    let parsedParams: Record<string, any> = {};
    try {
      parsedParams = JSON.parse(paramsJson);
    } catch (e) {
      alert('파라미터 JSON 형식이 올바르지 않습니다');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await resourceService.createAction({
          ...formData,
          params_schema: parsedParams,
        } as CreateActionRequest);
      } else {
        await resourceService.updateAction(action!.id, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          icon: formData.icon,
          params_schema: parsedParams,
          code_template: formData.code_template,
          is_active: formData.is_active,
          sort_order: formData.sort_order,
        } as UpdateActionRequest);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save action:', error);
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
            {isNew ? '새 액션 생성' : `액션 수정: ${action?.name}`}
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
                placeholder="open-modal"
              />
            </div>
            <div>
              <Label>이름</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="모달 열기"
              />
            </div>
          </div>

          <div>
            <Label>설명</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="모달 팝업을 엽니다"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>카테고리</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded-md"
              >
                <option value="ui">ui</option>
                <option value="data">data</option>
                <option value="navigation">navigation</option>
              </select>
            </div>
            <div>
              <Label>아이콘</Label>
              <IconSelect
                value={formData.icon}
                onChange={(icon) => setFormData({ ...formData, icon })}
              />
            </div>
            <div>
              <Label>정렬 순서</Label>
              <Input
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <span>활성화</span>
          </div>

          <div>
            <Label>파라미터 스키마 (JSON)</Label>
            <Textarea
              value={paramsJson}
              onChange={(e) => setParamsJson(e.target.value)}
              rows={6}
              className="font-mono text-xs"
              placeholder='{"modalId": {"type": "string", "required": true}}'
            />
          </div>

          <div>
            <Label>코드 템플릿</Label>
            <Textarea
              value={formData.code_template}
              onChange={(e) => setFormData({ ...formData, code_template: e.target.value })}
              rows={4}
              className="font-mono text-xs"
              placeholder="openModal({ id: modalId, data: {} });"
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

export default ActionList;
