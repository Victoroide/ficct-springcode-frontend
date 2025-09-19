import React from 'react';
import { Avatar } from '@/components/ui/avatar';

interface UserAvatarProps {
  name: string | null;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * User Avatar Component
 * Displays user's profile image or initials if no image is available
 */
export function UserAvatar({ name, imageUrl, size = 'md' }: UserAvatarProps) {
  // Generate initials from user name
  const getInitials = (fullName: string) => {
    if (!fullName) return '??';
    
    const names = fullName.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  // Determine avatar size
  const avatarSize = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base'
  }[size];

  return (
    <Avatar className={avatarSize}>
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={name || 'User'} 
          className="object-cover"
          onError={(e) => {
            // On image load error, fallback to initials
            e.currentTarget.style.display = 'none';
          }} 
        />
      ) : (
        <div className="bg-blue-600 text-white font-medium flex items-center justify-center h-full w-full rounded-full">
          {name ? getInitials(name) : '??'}
        </div>
      )}
    </Avatar>
  );
}
