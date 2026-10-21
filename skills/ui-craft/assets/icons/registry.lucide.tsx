// Concept → icon. One picture per concept, used everywhere. Add entries here, never import
// lucide-react anywhere else (lint_ui.mjs enforces this). Browse: https://lucide.dev/icons
import {
  ArrowRight, Bell, Calendar, ChartColumn, Check, ChevronDown, Download, FileText, Funnel,
  Heart, House, Lock, Mail, Plus, Search, Settings, Trash, Upload, User, X,
} from 'lucide-react';
// import { Example } from './custom/example';

export const icons = {
  'arrow-right': ArrowRight,
  bell: Bell,
  calendar: Calendar,
  chart: ChartColumn,
  check: Check,
  close: X,
  'chevron-down': ChevronDown,
  download: Download,
  document: FileText,
  filter: Funnel,
  favorite: Heart,
  home: House,
  lock: Lock,
  mail: Mail,
  add: Plus,
  search: Search,
  settings: Settings,
  delete: Trash,
  upload: Upload,
  user: User,
};
