/**
 * Icon Mapper
 * Maps icon names from the backend to Lucide React components
 */

import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldCheck,
  Layers,
  Folder,
  FileText,
  CreditCard,
  History,
  LifeBuoy,
  Home,
  User,
  Bell,
  Mail,
  Calendar,
  Search,
  Filter,
  Edit,
  Trash,
  Plus,
  Minus,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Menu,
  MoreVertical,
  MoreHorizontal,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  LogOut,
  LogIn,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Shield,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Star,
  Heart,
  Bookmark,
  Share,
  ExternalLink,
  Link,
  Unlink,
  Copy,
  Clipboard,
  Save,
  Archive,
  Package,
  Inbox,
  Send,
  MessageSquare,
  MessageCircle,
  Phone,
  Video,
  Camera,
  Image,
  Film,
  Music,
  Mic,
  Volume,
  VolumeX,
  Play,
  Pause,
  StopCircle,
  SkipBack,
  SkipForward,
  RefreshCw,
  RotateCw,
  RotateCcw,
  Repeat,
  Shuffle,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Map,
  MapPin,
  Navigation,
  Compass,
  Globe,
  Wifi,
  WifiOff,
  Bluetooth,
  Cast,
  Airplay,
  Battery,
  BatteryCharging,
  Zap,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Droplet,
  Thermometer,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  Award,
  Target,
  Flag,
  Tag,
  Hash,
  AtSign,
  Percent,
  DollarSign,
  Code,
  Terminal,
  Command,
  Box,
  Package2,
  Truck,
  ShoppingCart,
  ShoppingBag,
  Gift,
  Briefcase,
  Building,
  Factory,
  Store,
  type LucideIcon
} from 'lucide-react';

// Default icon if no match is found
const defaultIcon = Folder;

// Icon mapping object
const iconMap: Record<string, LucideIcon> = {
  // Dashboard & Home
  dashboard: LayoutDashboard,
  home: Home,
  
  // Users & People
  users: Users,
  user: User,
  'user-plus': UserPlus,
  'user-minus': UserMinus,
  'user-check': UserCheck,
  'user-x': UserX,
  
  // Settings & Config
  settings: Settings,
  
  // Security
  shield: Shield,
  'shield-check': ShieldCheck,
  lock: Lock,
  unlock: Unlock,
  key: Key,
  
  // Layout & Structure
  layers: Layers,
  folder: Folder,
  file: FileText,
  'file-text': FileText,
  
  // Business & Commerce
  billing: CreditCard,
  'credit-card': CreditCard,
  'shopping-cart': ShoppingCart,
  'shopping-bag': ShoppingBag,
  gift: Gift,
  briefcase: Briefcase,
  building: Building,
  factory: Factory,
  store: Store,
  truck: Truck,
  package: Package,
  'package-2': Package2,
  box: Box,
  
  // History & Time
  history: History,
  calendar: Calendar,
  
  // Communication
  'help-center': LifeBuoy,
  'life-buoy': LifeBuoy,
  bell: Bell,
  mail: Mail,
  'message-square': MessageSquare,
  'message-circle': MessageCircle,
  send: Send,
  inbox: Inbox,
  phone: Phone,
  video: Video,
  
  // Navigation
  menu: Menu,
  navigation: Navigation,
  compass: Compass,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'external-link': ExternalLink,
  
  // Actions
  search: Search,
  filter: Filter,
  edit: Edit,
  trash: Trash,
  plus: Plus,
  minus: Minus,
  check: Check,
  x: X,
  download: Download,
  upload: Upload,
  save: Save,
  copy: Copy,
  clipboard: Clipboard,
  archive: Archive,
  
  // Visibility
  eye: Eye,
  'eye-off': EyeOff,
  
  // Auth
  'log-out': LogOut,
  'log-in': LogIn,
  
  // Alerts & Status
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  info: Info,
  'help-circle': HelpCircle,
  
  // Social & Engagement
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  share: Share,
  
  // Links
  link: Link,
  unlink: Unlink,
  
  // Media
  camera: Camera,
  image: Image,
  film: Film,
  music: Music,
  mic: Mic,
  volume: Volume,
  'volume-x': VolumeX,
  
  // Playback
  play: Play,
  pause: Pause,
  'stop-circle': StopCircle,
  'skip-back': SkipBack,
  'skip-forward': SkipForward,
  repeat: Repeat,
  shuffle: Shuffle,
  
  // Transform
  'refresh-cw': RefreshCw,
  'rotate-cw': RotateCw,
  'rotate-ccw': RotateCcw,
  maximize: Maximize,
  minimize: Minimize,
  'zoom-in': ZoomIn,
  'zoom-out': ZoomOut,
  
  // Location
  map: Map,
  'map-pin': MapPin,
  globe: Globe,
  
  // Connectivity
  wifi: Wifi,
  'wifi-off': WifiOff,
  bluetooth: Bluetooth,
  cast: Cast,
  airplay: Airplay,
  
  // Power & Battery
  battery: Battery,
  'battery-charging': BatteryCharging,
  zap: Zap,
  
  // Weather & Nature
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  wind: Wind,
  droplet: Droplet,
  thermometer: Thermometer,
  
  // Analytics & Data
  activity: Activity,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'bar-chart': BarChart,
  'pie-chart': PieChart,
  
  // Achievement
  award: Award,
  target: Target,
  flag: Flag,
  
  // Labels & Tags
  tag: Tag,
  hash: Hash,
  'at-sign': AtSign,
  percent: Percent,
  'dollar-sign': DollarSign,
  
  // Development
  code: Code,
  terminal: Terminal,
  command: Command,
  
  // More actions
  'more-vertical': MoreVertical,
  'more-horizontal': MoreHorizontal,
};

/**
 * Get icon component by name
 * @param iconName - The name of the icon (e.g., 'dashboard', 'users')
 * @returns The Lucide icon component
 */
export function getIcon(iconName: string): LucideIcon {
  const normalizedName = iconName.toLowerCase().trim();
  return iconMap[normalizedName] || defaultIcon;
}

/**
 * Check if an icon exists in the map
 * @param iconName - The name of the icon
 * @returns True if the icon exists
 */
export function hasIcon(iconName: string): boolean {
  const normalizedName = iconName.toLowerCase().trim();
  return normalizedName in iconMap;
}

export default getIcon;
