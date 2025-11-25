import type { Screen } from './screen';

export interface Menu {
  id: number;
  name: string;
  description: string | null;
  is_folder: boolean;
  parent_id: number | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  children?: Menu[];
}

export interface MenuWithScreens extends Menu {
  screens: Screen[];
}

export interface CreateMenuRequest {
  name: string;
  description?: string;
  is_folder?: boolean;
  parent_id?: number | null;
  order_index?: number;
}

export interface UpdateMenuRequest {
  name?: string;
  description?: string;
  is_folder?: boolean;
  parent_id?: number | null;
  order_index?: number;
}
