// Concept → icon. One picture per concept, used everywhere. Add entries here, never import
// @phosphor-icons/react anywhere else (lint_ui.mjs enforces this). Browse: https://phosphoricons.com
import {
  ArrowRightIcon, BellIcon, CalendarIcon, ChartBarIcon, CheckIcon, CaretDownIcon, DownloadIcon,
  FileTextIcon, FunnelIcon, HeartIcon, HouseIcon, LockIcon, EnvelopeIcon, PlusIcon,
  MagnifyingGlassIcon, GearIcon, TrashIcon, UploadIcon, UserIcon, XIcon,
} from '@phosphor-icons/react';
// import { Example } from './custom/example';

export const icons = {
  'arrow-right': ArrowRightIcon,
  bell: BellIcon,
  calendar: CalendarIcon,
  chart: ChartBarIcon,
  check: CheckIcon,
  close: XIcon,
  'chevron-down': CaretDownIcon,
  download: DownloadIcon,
  document: FileTextIcon,
  filter: FunnelIcon,
  favorite: HeartIcon,
  home: HouseIcon,
  lock: LockIcon,
  mail: EnvelopeIcon,
  add: PlusIcon,
  search: MagnifyingGlassIcon,
  settings: GearIcon,
  delete: TrashIcon,
  upload: UploadIcon,
  user: UserIcon,
};
