import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar, AppSidebarProps } from "@/components/app-sidebar";
import { AetherMindHeader } from "@/components/AetherMindHeader";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
  sidebarProps: Omit<AppSidebarProps, 'onOpenSettings'>;
  onOpenSettings: () => void;
};
export function AppLayout({ children, container = false, className, contentClassName, sidebarProps, onOpenSettings }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar {...sidebarProps} onOpenSettings={onOpenSettings} />
      <SidebarInset className={className}>
        <AetherMindHeader onOpenSettings={onOpenSettings} />
        {container ? (
          <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32" + (contentClassName ? ` ${contentClassName}` : "")}>{children}</div>
        ) : (
          children
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}