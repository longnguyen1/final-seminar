// app/auth/signout/page.tsx
'use client';

import React, { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function SignOutPage() {
  useEffect(() => {
    // sign out xong redirect về home
    signOut({ callbackUrl: "/" });
  }, []);

  return <p>Đang đăng xuất...</p>;
}
