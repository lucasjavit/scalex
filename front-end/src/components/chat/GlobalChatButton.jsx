import { useState } from 'react';
import { useUserStatus } from '../../hooks/useUserStatus';
import { useLocation } from 'react-router-dom';
import { getModuleFromRoute, hasModulePermission, isPartnerForModule } from '../../config/moduleChatConfig';
import PartnerChatPanel from './PartnerChatPanel';
import UserChatPanel from './UserChatPanel';

export default function GlobalChatButton() {
  const { userStatus, userPermissions } = useUserStatus();
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  console.log('🔍 GlobalChatButton Debug:', {
    userStatus,
    userPermissions,
    pathname: location.pathname,
  });

  if (!userStatus?.id) {
    console.log('❌ No userStatus.id');
    return null;
  }

  const moduleConfig = getModuleFromRoute(location.pathname);
  console.log('📦 Module Config:', moduleConfig);
  if (!moduleConfig) {
    console.log('❌ No module config for this route');
    return null;
  }

  const isActualPartner = userStatus.role === moduleConfig.partnerRole;
  const isAdmin = userStatus.role === 'admin';
  const hasPermission = hasModulePermission(moduleConfig, userPermissions);
  const isPartnerRoute = location.pathname.startsWith(moduleConfig.routes.partner);
  const isUserRoute = location.pathname.startsWith(moduleConfig.routes.user) && !isPartnerRoute;

  console.log('✅ Chat Button Logic:', {
    isActualPartner,
    isAdmin,
    hasPermission,
    isPartnerRoute,
    isUserRoute,
    userRole: userStatus.role,
    permissionField: moduleConfig.permissionField,
    permissionValue: userPermissions?.[moduleConfig.permissionField],
  });

  // Partner on partner route -> PartnerChatPanel (sees all users)
  if (isActualPartner && isPartnerRoute) {
    return (
      <PartnerChatPanel
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        moduleConfig={moduleConfig}
        partnerId={userStatus.id}
      />
    );
  }

  // Admin on partner route -> PartnerChatPanel (acts as partner, sees all users)
  if (isAdmin && isPartnerRoute) {
    return (
      <PartnerChatPanel
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        moduleConfig={moduleConfig}
        partnerId={userStatus.id}
      />
    );
  }

  // Admin on user route -> UserChatPanel (acts as user, talks to partner)
  if (isAdmin && isUserRoute) {
    return (
      <UserChatPanel
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        moduleConfig={moduleConfig}
        userId={userStatus.id}
      />
    );
  }

  // Regular user with permission on user route -> UserChatPanel
  if (hasPermission && isUserRoute) {
    return (
      <UserChatPanel
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        moduleConfig={moduleConfig}
        userId={userStatus.id}
      />
    );
  }

  return null;
}
