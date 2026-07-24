"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Users, 
  Layout, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Check, 
  Loader2, 
  Code2, 
  Server, 
  Mail, 
  User as UserIcon, 
  Lock, 
  Globe, 
  Settings, 
  Download, 
  Key, 
  Layers, 
  UserPlus, 
  Moon, 
  Sun, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Palette, 
  HelpCircle, 
  FileCode, 
  Shield,
  Edit3,
  X,
  FilePlus,
  ChevronDown,
  FolderTree,
  FileText,
  FolderPlus,
  MoreVertical,
  ChevronRight as ChevronRightIcon,
  Folder,
  Eye,
  Wand2,
  Link as LinkIcon,
  LayoutDashboard,
  Home,
  User,
  File,
  Bell,
  BarChart,
  ShoppingCart,
  Package,
  Upload,
  Download as DownloadIcon,
  Activity,
  Archive,
  Bookmark,
  Calendar,
  Camera,
  Clock,
  CreditCard,
  Heart,
  Image,
  Map,
  MessageCircle,
  PieChart,
  Search,
  Star,
  Tag,
  TrendingUp,
  Video,
  Zap,
  LucideIcon
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { 
  setProjectName,
  setProjectDescription,
  setAuthor,
  setAuthType, 
  toggle2FA, 
  setDbProvider, 
  setDefaultTheme,
  setAdminEmail,
  setAdminPassword,
  setAdminFirstName,
  setAdminLastName, 
  nextStep, 
  prevStep, 
  addRole as addRoleAction, 
  updateRole as updateRoleAction, 
  removeRole as removeRoleAction,
  createNode,
  deleteNode,
  updateNode as updateNodeAction,
  toggleRoleOnNode as toggleRoleOnNodeAction,
  setEditingNodeId,
  selectNodeById,
  type NavNode,
} from '@/lib/redux/slices/configSlice';

// --- API Helper ---
const apiKey = ""; 

// Icon mapping helper
const getIconComponent = (iconName?: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'layout-dashboard': LayoutDashboard,
    'home': Home,
    'users': Users,
    'user': User,
    'settings': Settings,
    'folder': Folder,
    'file': File,
    'file-text': FileText,
    'shield': Shield,
    'lock': Lock,
    'key': Key,
    'mail': Mail,
    'bell': Bell,
    'chart-bar': BarChart,
    'shopping-cart': ShoppingCart,
    'package': Package,
    'upload': Upload,
    'download': DownloadIcon,
    'activity': Activity,
    'archive': Archive,
    'bookmark': Bookmark,
    'calendar': Calendar,
    'camera': Camera,
    'clock': Clock,
    'credit-card': CreditCard,
    'database': Database,
    'globe': Globe,
    'heart': Heart,
    'image': Image,
    'layers': Layers,
    'map': Map,
    'message-circle': MessageCircle,
    'pie-chart': PieChart,
    'search': Search,
    'star': Star,
    'tag': Tag,
    'trending-up': TrendingUp,
    'video': Video,
    'zap': Zap,
  };
  
  return iconMap[iconName || ''] || (iconName ? FileText : FileText);
};

// Available icons for navigation
const AVAILABLE_ICONS = [
  { value: 'layout-dashboard', label: 'Dashboard' },
  { value: 'home', label: 'Home' },
  { value: 'users', label: 'Users' },
  { value: 'user', label: 'User' },
  { value: 'settings', label: 'Settings' },
  { value: 'folder', label: 'Folder' },
  { value: 'file', label: 'File' },
  { value: 'file-text', label: 'File Text' },
  { value: 'shield', label: 'Shield' },
  { value: 'lock', label: 'Lock' },
  { value: 'key', label: 'Key' },
  { value: 'mail', label: 'Mail' },
  { value: 'bell', label: 'Bell' },
  { value: 'chart-bar', label: 'Chart Bar' },
  { value: 'shopping-cart', label: 'Shopping Cart' },
  { value: 'package', label: 'Package' },
  { value: 'upload', label: 'Upload' },
  { value: 'download', label: 'Download' },
  { value: 'activity', label: 'Activity' },
  { value: 'archive', label: 'Archive' },
  { value: 'bookmark', label: 'Bookmark' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'camera', label: 'Camera' },
  { value: 'clock', label: 'Clock' },
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'database', label: 'Database' },
  { value: 'globe', label: 'Globe' },
  { value: 'heart', label: 'Heart' },
  { value: 'image', label: 'Image' },
  { value: 'layers', label: 'Layers' },
  { value: 'map', label: 'Map' },
  { value: 'message-circle', label: 'Message' },
  { value: 'pie-chart', label: 'Pie Chart' },
  { value: 'search', label: 'Search' },
  { value: 'star', label: 'Star' },
  { value: 'tag', label: 'Tag' },
  { value: 'trending-up', label: 'Trending Up' },
  { value: 'video', label: 'Video' },
  { value: 'zap', label: 'Zap' },
];

async function generateCodeFromConfig(config: any) {
  const systemPrompt = `You are a Senior Fullstack Architect. Generate the "Griffion" platform codebase.
  Project: Griffion Multi-tenant Auth Platform.
  Architecture: Microservices (Frontend: React/Vite/Tailwind, Backend: Node.js/Express).
  
  CORE REQUIREMENTS:
  1. Backend Auth Service: Implementation of Login, Register (only for public roles), Forgot/Reset Password.
  2. Profile Management: Edit Profile (First Name, Last Name, Phone).
  3. User Preferences: Store theme (Dark/Light) and UI settings inside a "preferences" JSON field.
  4. Admin API Suite: Bulk user creation, Delete user, Get user list/info, Force Password Change.
  5. Navigation Logic: Use the provided Recursive Tree Structure. 
     - Sections: Render as collapsible sidebar groups.
     - Pages: Render as direct navigation links.
     - RBAC: Respect the accessRoles array at every node (inherited logic is handled by the generated code).
  
  Config: ${JSON.stringify(config)}`;
  
  const userQuery = `Generate the Griffion Microservices stack. Focus on the Sidebar rendering logic which must recursively traverse the provided navigation tree and filter visibility based on the user's role and the accessRoles metadata.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      })
    });
    
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate stack.";
  } catch (error) {
    return "Error connecting to service.";
  }
}

// --- Types ---
// All types are now imported from configSlice

// --- UI Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-1">
    <HelpCircle size={14} className="text-zinc-400 cursor-help hover:text-indigo-500 transition-colors" />
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-56 p-2 bg-zinc-900 text-white text-[10px] rounded shadow-xl z-[100] leading-tight pointer-events-none border border-zinc-700">
      {text}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-zinc-900" />
    </div>
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = "primary", 
  disabled = false, 
  className = "", 
  icon: Icon, 
  type = "button" 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: "primary" | "secondary" | "outline" | "danger"; 
  disabled?: boolean; 
  className?: string; 
  icon?: any; 
  type?: "button" | "submit" | "reset";
}) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20",
    secondary: "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800",
    outline: "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded font-black text-xs uppercase tracking-[0.15em] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export default function ConfigurePage() {
  // Redux state and dispatch
  const dispatch = useAppDispatch();
  const config = useAppSelector((state: any) => state.config);
  const step = config.currentStep;
  const editingNodeId = config.editingNodeId;
  
  // Local state only for generated code (not persisted)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState('dark');

  const totalSteps = 6;

  const handleNextStep = () => dispatch(nextStep());
  const handlePrevStep = () => dispatch(prevStep());

  // Helper functions are now in Redux slice

  // --- Actions ---
  const addRole = () => dispatch(addRoleAction());
  const updateRole = (id: string, updates: any) => dispatch(updateRoleAction({ id, updates }));
  const removeRole = (id: string) => dispatch(removeRoleAction(id));
  const handleCreateNode = (parentId: string | null, type: 'section' | 'page') => {
    dispatch(createNode({ parentId, type }));
  };
  const handleDeleteNode = (id: string) => dispatch(deleteNode(id));
  const handleUpdateNode = (id: string, updates: Partial<NavNode>) => {
    dispatch(updateNodeAction({ id, updates }));
  };
  const toggleRoleOnNode = (nodeId: string, roleId: string) => {
    dispatch(toggleRoleOnNodeAction({ nodeId, roleId }));
  };
  const handleSetEditingNodeId = (id: string | null) => dispatch(setEditingNodeId(id));

  // Find the editing node from the tree
  const editingNode = editingNodeId ? selectNodeById(config, editingNodeId) : null;
  const hasPublicRoles = config.roles.some((r: any) => r.registrationType === 'public');

  const handleFinalize = async () => {
    setIsGenerating(true);
    
    try {
      // Prepare the configuration payload
      const payload = {
        // Project Info
        projectName: config.projectName,
        projectDescription: config.projectDescription,
        author: config.author,
        port: 5000,
        frontendUrl: 'http://localhost:3000',
        
        // Database
        dbProvider: config.dbProvider,
        
        // Authentication
        primaryIdentifier: config.authType,
        enable2FA: config.enable2FA,
        enablePasswordRecovery: true,
        
        // Features
        enableAdminPanel: true,
        enableRBAC: true,
        enableGroups: false,
        enableNavigation: true,
        
        // Admin User
        adminEmail: config.adminEmail,
        adminPassword: config.adminPassword,
        adminFirstName: config.adminFirstName,
        adminLastName: config.adminLastName,
        
        // Frontend Settings
        defaultTheme: config.defaultTheme,
        
        // Roles - enhance with static properties
        roles: config.roles.map((role: any, index: number) => ({
          name: role.name,
          description: role.description,
          registrationType: role.registrationType,
          isSystemRole: role.name === 'Admin',
          permissions: role.name === 'Admin' ? ['*'] : [],
          default: role.registrationType === 'public' && 
                   index === config.roles.findIndex((r: any) => r.registrationType === 'public')
        })),
        
        // Navigation Tree - convert role IDs to role names and add static properties
        navigationTree: convertNavTreeForAPI(config.navTree, config.roles)
      };
      
      // Step 1: Call the API to generate full-stack project
      const response = await fetch('http://localhost:5000/api/download/generate-fullstack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate project' }));
        throw new Error(errorData.message || 'Failed to generate project');
      }
      
      // Parse JSON response
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate project');
      }
      
      // Step 2: Download the ZIP file using the downloadUrl
      const downloadUrl = `http://localhost:5000${result.data.downloadUrl}`;
      
      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = result.data.zipFilename || `${config.projectName.toLowerCase().replace(/\s+/g, '-')}-fullstack.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      alert('✅ Project generated successfully! Check your downloads.');
      
    } catch (error) {
      console.error('Error generating project:', error);
      alert('❌ Failed to generate project. Please check the console for details.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Helper function to convert navigation tree for API
  const convertNavTreeForAPI = (nodes: NavNode[], roles: any[], order = 0): any[] => {
    return nodes.map((node, index) => {
      const roleNames = node.accessRoles.map(roleId => {
        const role = roles.find((r: any) => r.id === roleId);
        return role ? role.name : roleId;
      });
      
      const apiNode: any = {
        id: node.name.toLowerCase().replace(/\s+/g, '_'),
        name: node.name,
        type: node.type,
        icon: node.icon || (node.type === 'section' ? 'folder' : 'file'),
        isPublic: false,
        order: order + index,
        accessRoles: roleNames
      };
      
      if (node.type === 'page' && node.path) {
        apiNode.path = node.path;
      }
      
      if (node.children && node.children.length > 0) {
        apiNode.children = convertNavTreeForAPI(node.children, roles, 0);
      }
      
      return apiNode;
    });
  };

  // --- Recursive Tree Component ---
  const TreeItem = ({ node, depth = 0 }: { node: NavNode; depth?: number }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const IconComponent = getIconComponent(node.icon);

    return (
      <div className="select-none">
        <div 
          className={`flex items-center gap-2 group py-2 px-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${editingNodeId === node.id ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' : ''}`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          {node.type === 'section' ? (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRightIcon size={14} />}
            </button>
          ) : (
            <div className="w-3.5" />
          )}

          <div className={`p-1.5 rounded-md ${node.type === 'section' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800'}`}>
            <IconComponent size={14} />
          </div>

          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="text-sm font-semibold truncate text-zinc-700 dark:text-zinc-200">{node.name}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold text-zinc-400 mr-2 flex items-center gap-1">
                <Shield size={10} /> {node.accessRoles.length}
              </span>
              {node.type === 'section' && (
                <>
                  <button onClick={() => handleCreateNode(node.id, 'section')} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-indigo-500" title="Add Sub-section">
                    <FolderPlus size={14} />
                  </button>
                  <button onClick={() => handleCreateNode(node.id, 'page')} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-blue-500" title="Add Page">
                    <FilePlus size={14} />
                  </button>
                </>
              )}
              <button onClick={() => handleSetEditingNodeId(node.id)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-500" title="Manage Access">
                <Edit3 size={14} />
              </button>
              <button onClick={() => handleDeleteNode(node.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {node.type === 'section' && isExpanded && node.children.length > 0 && (
          <div className="mt-1 space-y-1">
            {node.children.map(child => (
              <TreeItem key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white">Project Information</h2>
              <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-widest">Define your project details and metadata.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Project Name</label>
                <input
                  type="text"
                  value={config.projectName}
                  onChange={(e) => dispatch(setProjectName(e.target.value))}
                  placeholder="My Application"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Project Description</label>
                <textarea
                  value={config.projectDescription}
                  onChange={(e) => dispatch(setProjectDescription(e.target.value))}
                  placeholder="A full-stack application..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Author Name</label>
                <input
                  type="text"
                  value={config.author}
                  onChange={(e) => dispatch(setAuthor(e.target.value))}
                  placeholder="Developer Name"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white">Base Auth Strategy</h2>
              <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-widest">Configure identity methods and advanced security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => dispatch(setAuthType('email'))}
                className={`p-6 cursor-pointer border-2 rounded-xl transition-all ${config.authType === 'email' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${config.authType === 'email' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                    <Mail size={24} />
                  </div>
                  <span className="font-semibold text-lg">Email Auth</span>
                </div>
                <p className="text-sm text-zinc-500">Standard enterprise authentication flow.</p>
              </div>

              <div 
                onClick={() => dispatch(setAuthType('username'))}
                className={`p-6 cursor-pointer border-2 rounded-xl transition-all ${config.authType === 'username' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${config.authType === 'username' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                    <UserIcon size={24} />
                  </div>
                  <span className="font-semibold text-lg">Username Auth</span>
                </div>
                <p className="text-sm text-zinc-500">Traditional identifier-based login.</p>
              </div>
            </div>

            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center">
                      2FA Module (Email OTP) 
                      <Tooltip text="Adds a mandatory 6-digit verification code check after password login." />
                    </h3>
                    <p className="text-sm text-zinc-500">Enforce OTP verification for all authenticated users.</p>
                  </div>
                </div>
                <button 
                  onClick={() => dispatch(toggle2FA())}
                  className={`w-12 h-6 rounded-full transition-colors relative ${config.enable2FA ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${config.enable2FA ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white">Infrastructure & Preferences</h2>
              <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-widest">Database selection and user experience defaults.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => dispatch(setDbProvider('mysql'))}
                className={`p-6 border-2 rounded-xl transition-all cursor-pointer ${config.dbProvider === 'mysql' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-800'}`}
              >
                <div className="p-2 bg-indigo-600 text-white rounded-lg w-fit mb-4">
                  <Database size={24} />
                </div>
                <h3 className="font-bold text-lg mb-1 flex items-center">MySQL</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Storing preferences in a <strong>JSON column</strong>.</p>
              </div>

              <div 
                onClick={() => dispatch(setDbProvider('mongodb'))}
                className={`p-6 border-2 rounded-xl transition-all cursor-pointer ${config.dbProvider === 'mongodb' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-800'}`}
              >
                <div className="p-2 bg-green-600 text-white rounded-lg w-fit mb-4">
                  <Globe size={24} />
                </div>
                <h3 className="font-bold text-lg mb-1 flex items-center">MongoDB</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Storing preferences in a nested <strong>object</strong>.</p>
              </div>

              <div 
                onClick={() => dispatch(setDbProvider('postgresql'))}
                className={`p-6 border-2 rounded-xl transition-all cursor-pointer ${config.dbProvider === 'postgresql' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-800'}`}
              >
                <div className="p-2 bg-blue-600 text-white rounded-lg w-fit mb-4">
                  <Database size={24} />
                </div>
                <h3 className="font-bold text-lg mb-1 flex items-center">PostgreSQL</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Storing preferences in a <strong>JSONB column</strong>.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                <Palette size={18} />
                <h3>Default Theme</h3>
              </div>
              <div className="flex bg-zinc-200 dark:bg-zinc-900 p-1 rounded-lg ml-auto">
                <button 
                  onClick={() => dispatch(setDefaultTheme('light'))}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${config.defaultTheme === 'light' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500'}`}
                >
                  <Sun size={16} /> Light
                </button>
                <button 
                  onClick={() => dispatch(setDefaultTheme('dark'))}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${config.defaultTheme === 'dark' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}
                >
                  <Moon size={16} /> Dark
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white">Admin Account Setup</h2>
              <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-widest">Configure the default administrator credentials.</p>
            </div>

            <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-900/30 rounded-xl">
              <div className="flex items-start gap-3">
                <ShieldAlert className="text-amber-600 dark:text-amber-500 flex-shrink-0 mt-1" size={20} />
                <div className="space-y-1">
                  <h3 className="font-bold text-amber-900 dark:text-amber-200">Security Notice</h3>
                  <p className="text-sm text-amber-800 dark:text-amber-300">These credentials will be used to create the initial admin user. Make sure to change them in production!</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Mail size={16} className="text-indigo-600" />
                  Admin Email
                </label>
                <input
                  type="email"
                  value={config.adminEmail}
                  onChange={(e) => dispatch(setAdminEmail(e.target.value))}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Lock size={16} className="text-indigo-600" />
                  Admin Password
                </label>
                <input
                  type="password"
                  value={config.adminPassword}
                  onChange={(e) => dispatch(setAdminPassword(e.target.value))}
                  placeholder="Strong password"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none transition-colors font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <UserIcon size={16} className="text-indigo-600" />
                  First Name
                </label>
                <input
                  type="text"
                  value={config.adminFirstName}
                  onChange={(e) => dispatch(setAdminFirstName(e.target.value))}
                  placeholder="Admin"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <UserIcon size={16} className="text-indigo-600" />
                  Last Name
                </label>
                <input
                  type="text"
                  value={config.adminLastName}
                  onChange={(e) => dispatch(setAdminLastName(e.target.value))}
                  placeholder="User"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Preview Admin User</h4>
              <div className="space-y-1 text-sm">
                <p className="text-zinc-600 dark:text-zinc-400"><span className="font-semibold">Name:</span> {config.adminFirstName} {config.adminLastName}</p>
                <p className="text-zinc-600 dark:text-zinc-400"><span className="font-semibold">Email:</span> {config.adminEmail}</p>
                <p className="text-zinc-600 dark:text-zinc-400"><span className="font-semibold">Role:</span> Admin (System Role)</p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white flex items-center">
                  Role Identity Logic
                  <Tooltip text="Define who can sign up and who must be created by an Admin." />
                </h2>
                <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-widest">Configure visibility and assignment methods for each role.</p>
              </div>
              <Button onClick={addRole} icon={Plus} variant="outline">Add Role</Button>
            </div>


            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <div className="col-span-3">Role Name</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-3 flex items-center gap-1">Registration Mode</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {config.roles.map((role: any) => (
                  <div key={role.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                        <Key size={16} />
                      </div>
                      <input 
                        value={role.name}
                        onChange={(e) => updateRole(role.id, { name: e.target.value })}
                        placeholder="e.g. Manager"
                        className="bg-transparent font-medium text-zinc-900 dark:text-zinc-100 outline-none w-full border-b border-transparent focus:border-indigo-500 transition-all"
                      />
                    </div>
                    
                    <div className="col-span-4 px-2">
                      <input 
                        value={role.description}
                        onChange={(e) => updateRole(role.id, { description: e.target.value })}
                        placeholder="Role description..."
                        className="bg-transparent text-sm text-zinc-600 dark:text-zinc-400 outline-none w-full border-b border-transparent focus:border-indigo-500 transition-all"
                      />
                    </div>
                    
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateRole(role.id, { 
                            registrationType: role.registrationType === 'public' ? 'admin' : 'public' 
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${role.registrationType === 'public' ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${role.registrationType === 'public' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className={`text-sm font-semibold ${role.registrationType === 'public' ? 'text-indigo-600' : 'text-zinc-500'}`}>
                          {role.registrationType === 'public' ? 'Public' : 'Admin Only'}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2 text-right">
                      <button 
                        onClick={() => removeRole(role.id)}
                        disabled={config.roles.length <= 1}
                        className="p-2 text-zinc-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start">
              <div className="max-w-md">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white flex items-center">
                  Navigation Architect
                  <Tooltip text="Build a recursive folder-style sidebar structure. Manage role access at any level of the tree." />
                </h2>
                <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-widest">Organize Sections, Sub-sections, and Pages with granular role permissions.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" icon={FolderPlus} onClick={() => handleCreateNode(null, 'section')}>Add Root Section</Button>
                <Button icon={FilePlus} onClick={() => handleCreateNode(null, 'page')}>Add Root Page</Button>
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
              {/* --- Explorer Column --- */}
              <div className="md:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sidebar Explorer</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                </div>
                <div className="p-4 space-y-1 min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar">
                  {config.navTree.map((node: NavNode) => (
                    <TreeItem key={node.id} node={node} />
                  ))}
                  {config.navTree.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-zinc-400 italic">
                      <FolderTree size={40} className="mb-3 opacity-20" />
                      <p className="text-sm">Empty tree. Add a root node above.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* --- Configuration Panel --- */}
              <div className="md:col-span-2 space-y-4">
                {editingNode ? (
                  <Card className="p-6 border-indigo-200 dark:border-indigo-900/50 animate-in fade-in zoom-in-95 duration-200 sticky top-24">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${editingNode.type === 'section' ? 'bg-indigo-600' : 'bg-zinc-600'} text-white shadow-lg`}>
                          {editingNode.type === 'section' ? <Folder size={18} /> : <FileText size={18} />}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">Node Settings</h3>
                          <p className="text-[10px] text-zinc-500 uppercase font-black">ID: {editingNode.id}</p>
                        </div>
                      </div>
                      <button onClick={() => handleSetEditingNodeId(null)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center justify-between">
                          Node Label
                          <span className={`text-[10px] px-1.5 rounded border ${editingNode.type === 'section' ? 'border-indigo-200 text-indigo-600' : 'border-zinc-200 text-zinc-500'}`}>{editingNode.type}</span>
                        </label>
                        <input 
                          value={editingNode.name}
                          onChange={(e) => handleUpdateNode(editingNode.id, { name: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {editingNode.type === 'page' && (
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                            Path
                          </label>
                          <input 
                            value={editingNode.path || ''}
                            onChange={(e) => handleUpdateNode(editingNode.id, { path: e.target.value })}
                            placeholder="/path/to/page"
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          {editingNode.path && (
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                              <div className="flex items-center gap-2 text-xs">
                                <LinkIcon size={12} className="text-indigo-600 dark:text-indigo-400" />
                                <span className="font-bold text-indigo-900 dark:text-indigo-200">Full URL:</span>
                                <code className="text-indigo-700 dark:text-indigo-300 font-mono">http://localhost:3000{editingNode.path}</code>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                          Icon
                        </label>
                        <select
                          value={editingNode.icon || ''}
                          onChange={(e) => handleUpdateNode(editingNode.id, { icon: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select icon...</option>
                          {AVAILABLE_ICONS.map(icon => (
                            <option key={icon.value} value={icon.value}>{icon.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center justify-between">
                          Role Access
                          <Tooltip text="Granting access at a Section level usually makes all its nested pages visible to those roles." />
                        </label>
                        <div className="space-y-1">
                          {config.roles.map((role: any) => {
                            const hasAccess = editingNode.accessRoles.includes(role.id);
                            return (
                              <button
                                key={role.id}
                                onClick={() => toggleRoleOnNode(editingNode.id, role.id)}
                                className={`w-full flex items-center justify-between p-2.5 rounded-xl border-2 transition-all ${hasAccess ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-transparent bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100'}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Users size={14} className={hasAccess ? 'text-indigo-600' : 'text-zinc-400'} />
                                  <span className="text-xs font-bold">{role.name || "Unnamed Role"}</span>
                                </div>
                                {hasAccess ? <ShieldCheck className="text-indigo-600" size={16} /> : <Shield className="text-zinc-200" size={16} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <Button className="w-full" variant="secondary" onClick={() => handleSetEditingNodeId(null)}>Done Configuration</Button>
                    </div>
                  </Card>
                ) : (
                  <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-center sticky top-24">
                    <div className="space-y-2">
                      <Layout className="mx-auto opacity-20" size={32} />
                      <p className="text-xs font-medium">Select any node in the explorer<br/>to manage its permissions.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (generatedCode) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold italic">Griffion Stack Provisioned</h1>
              <p className="text-zinc-500">Microservices architecture for {config.dbProvider.toUpperCase()} based tenants.</p>
            </div>
            <Button variant="outline" onClick={() => setGeneratedCode(null)}>Modify Specs</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-4 space-y-4 font-bold uppercase tracking-tighter">
                <h3 className="flex items-center gap-2"><Settings size={18} /> Architecture</h3>
                <div className="space-y-2 text-[10px] text-zinc-500">
                  <div className="flex justify-between"><span>Auth:</span> <span className="text-zinc-900 dark:text-zinc-100">{config.authType}</span></div>
                  <div className="flex justify-between"><span>DB Layer:</span> <span className="text-zinc-900 dark:text-zinc-100">{config.dbProvider}</span></div>
                  <div className="flex justify-between"><span>Nav Depth:</span> <span className="text-zinc-900 dark:text-zinc-100">Recursive</span></div>
                </div>
                <hr className="border-zinc-200 dark:border-zinc-800" />
                <Button className="w-full" icon={Download}>Get Bundle</Button>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-zinc-900 rounded-xl p-6 text-zinc-300 font-mono text-xs overflow-auto max-h-[70vh] border border-zinc-800">
                <div className="flex items-center gap-2 mb-4 text-zinc-500 border-b border-zinc-800 pb-2">
                  <Code2 size={16} />
                  <span>griffion_application_starter.md</span>
                </div>
                <pre className="whitespace-pre-wrap">{generatedCode}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen selection:bg-indigo-500/30 transition-colors duration-500 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100 dark' : 'bg-white text-zinc-900'}`}>
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white shadow-lg transform -rotate-3">
              <ShieldCheck size={18} />
            </div>
            <span className="font-black text-lg tracking-tighter uppercase italic">Griffion</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Step {step}/6</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6].map(s => (
                  <div key={s} className={`w-2 h-2 rounded-full transition-colors ${step >= s ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-12">
          {renderStep()}
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <Button variant="secondary" onClick={handlePrevStep} disabled={step === 1 || isGenerating} icon={ChevronLeft}>
            Back
          </Button>

          {step < totalSteps ? (
            <Button onClick={handleNextStep} icon={ChevronRight} className="px-8">
              Proceed
            </Button>
          ) : (
            <Button onClick={handleFinalize} disabled={isGenerating} className="px-8 bg-indigo-600">
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Provisioning Stack...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Build Griffion Application
                </>
              )}
            </Button>
          )}
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
