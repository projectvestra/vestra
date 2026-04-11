import { auth } from './firebaseConfig';

type MaybeUser = {
  uid?: string;
  email?: string | null;
} | null | undefined;

const HARDCODED_ADMIN_UID = 'nKTd5j9rsiVl53wgfK4Il4oGdVV2';
const HARDCODED_ADMIN_EMAIL = 'kashyapkaran483@gmail.com';

export function getAdminIdentityConfig() {
  const adminUid = HARDCODED_ADMIN_UID.trim();
  const adminEmail = HARDCODED_ADMIN_EMAIL.trim().toLowerCase();
  return {
    adminUid,
    adminEmail,
    hasAdminConfig: Boolean(adminUid || adminEmail),
  };
}

export function isCurrentUserAdmin(user: MaybeUser = auth.currentUser) {
  const { adminUid, adminEmail, hasAdminConfig } = getAdminIdentityConfig();
  if (!hasAdminConfig || !user) return false;

  const uidMatch = Boolean(adminUid) && user.uid === adminUid;
  const emailMatch = Boolean(adminEmail) && (user.email || '').toLowerCase() === adminEmail;
  return Boolean(uidMatch || emailMatch);
}
