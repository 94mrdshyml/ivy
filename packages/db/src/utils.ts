export function getDisplayName(user: {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}): string {
  if (user.firstName && user.lastName)
    return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  return user.email;
}
