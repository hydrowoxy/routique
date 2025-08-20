"use client";

import { useLinkInterceptor } from '@/hooks/LinkInterceptor';

export default function LinkInterceptorProvider() {
  const { LinkWarningComponent } = useLinkInterceptor();
  return <LinkWarningComponent />;
}