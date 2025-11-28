import { useState } from 'react';
import { useUserStatus } from '../../../hooks/useUserStatus';
import { useLocation } from 'react-router-dom';
import UserFloatingChatButton from './UserFloatingChatButton';
import UserChatPanel from './UserChatPanel';
import FloatingChatButton from './FloatingChatButton';
import UnifiedChatPanel from './UnifiedChatPanel';

/**
 * GlobalChatButton
 *
 * Global chat button that appears on specific accounting pages.
 * Shows different chat interfaces based on user role and current route:
 * - Accountants (partner_cnpj, admin): Unified chat with all users (only on /accounting/accountant/* routes)
 * - Regular users: Chat with their assigned accountant (only on /accounting/* routes, except /accounting/accountant/*)
 *
 * This component is rendered globally in AppRoutes.jsx
 */
export default function GlobalChatButton() {
  const { userStatus } = useUserStatus();
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Don't render if user is not logged in
  if (!userStatus?.id) {
    return null;
  }

  // Check if user is an accountant
  const isAccountant = userStatus?.role === 'partner_cnpj' || userStatus?.role === 'admin';

  // Check if current route is an accountant route
  const isAccountantRoute = location.pathname.startsWith('/accounting/accountant');

  // Check if current route is an accounting route (but not accountant)
  const isAccountingRoute = location.pathname.startsWith('/accounting') && !isAccountantRoute;

  return (
    <>
      {isAccountant && isAccountantRoute ? (
        // Accountant view: Purple button with unified chat (only on accountant routes)
        <>
          <FloatingChatButton
            onClick={() => setIsChatOpen(!isChatOpen)}
            isOpen={isChatOpen}
          />
          <UnifiedChatPanel
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            currentUserId={userStatus.id}
          />
        </>
      ) : !isAccountant && isAccountingRoute ? (
        // Regular user view: White button with user chat (only on accounting routes, excluding accountant routes)
        <>
          <UserFloatingChatButton
            onClick={() => setIsChatOpen(!isChatOpen)}
            isOpen={isChatOpen}
          />
          <UserChatPanel
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            currentUserId={userStatus.id}
          />
        </>
      ) : null}
    </>
  );
}
