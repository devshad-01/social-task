// Layout Components
export { AppLayout } from './layout/AppLayout';
export { MobileLayout } from './layout/MobileLayout';
export { DesktopLayout } from './layout/DesktopLayout';

// Navigation Components
export { BottomTabBar } from './navigation/BottomTabBar';
export { MobileTopHeader } from './navigation/MobileTopHeader';
export { DesktopNavbar } from './navigation/DesktopNavbar';
export { MobileSidebar } from './navigation/MobileSidebar';
export { NotificationBell } from './navigation/NotificationBell';
export { SearchBar } from './navigation/SearchBar';
export { UserMenu } from './navigation/UserMenu';

// Common Components
export { Button } from './common/Button';
export { Card, CardHeader, CardTitle, CardContent, CardFooter } from './common/Card';
export { Alert } from './common/Alert';
export { Badge } from './common/Badge';
export { Avatar } from './common/Avatar';
export { MobileLoader } from './common/MobileLoader';
export { Modal } from './common/Modal';
export { Loading } from './common/Loading';
export { EmptyState } from './common/EmptyState';
export { Input, TextArea, Select, Checkbox, FileInput } from './common/Input';
export { Toast, ToastContainer, useToast } from './common/Toast';
export { DataTable } from './common/DataTable';
export { PWAInstallPrompt } from './common/PWAInstallPrompt';

// Auth Components
export { AuthLayout } from './auth/AuthLayout';
export { LoginForm } from './auth/LoginForm';
export { SignUpForm } from './auth/SignUpForm';
export { ForgotPasswordForm } from './auth/ForgotPasswordForm';
export { AuthContainer } from './auth/AuthContainer';

// Task Components
export { TaskCard } from './tasks/TaskCard';
export { TaskModal } from './tasks/TaskModal';
export { TaskFilters } from './tasks/TaskFilters';

// Notification Components
export { NotificationCard } from './notifications/NotificationCard';
export { NotificationBell as NotificationBellComponent } from './notifications/NotificationBell';

// Client Components
export { ClientCard } from './clients/ClientCard';
export { ClientModal } from './clients/ClientModal';

// Profile Components
export { ProfileCard } from './profile/ProfileCard';
export { ProfileEditModal } from './profile/ProfileEditModal';
export { ProfileActivity } from './profile/ProfileActivity';
export { ProfileSettings } from './profile/ProfileSettings';

// UI Components
export { Icons } from './Icons';
export { DashboardPage } from './DashboardPage';

// Hooks
export { useResponsive } from '../hooks/useResponsive';
export { useNavigation } from '../hooks/useNavigation';
