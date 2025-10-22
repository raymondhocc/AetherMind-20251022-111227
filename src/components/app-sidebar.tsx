import React from "react";
import { Plus, Trash2, MessageSquare, Pencil, Info, Settings, LogIn, LogOut, Hash, UploadCloud } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AetherMindLogo } from "./AetherMindLogo";
import type { SessionInfo } from '../../worker/types';
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
export interface AppSidebarProps {
  sessions: SessionInfo[];
  activeSessionId: string;
  onNewSession: () => void;
  onSwitchSession: (sessionId: string) => void;
  onClearAllSessions: () => void;
  onStartRenameSession: (sessionId: string, currentTitle: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenSettings: () => void;
}
export function AppSidebar({
  sessions,
  activeSessionId,
  onNewSession,
  onSwitchSession,
  onClearAllSessions,
  onStartRenameSession,
  onDeleteSession,
  onOpenSettings
}: AppSidebarProps): JSX.Element {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    toast.info("You have been logged out.");
    navigate('/auth');
  };
  return (
    <Sidebar>
      <SidebarHeader>
        <AetherMindLogo />
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        {isAuthenticated ? (
          <>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={onNewSession} className="w-full justify-start" aria-label="Start new session">
                    <Plus className="mr-2 size-4" />
                    <span>New Session</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <div className="px-4 py-1 text-xs font-semibold text-muted-foreground">Navigation</div>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => navigate('/channel')} className="w-full justify-start" aria-label="Go to Channel page">
                    <Hash className="mr-2 size-4" />
                    <span>Channel</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => navigate('/upload')} className="w-full justify-start" aria-label="Go to Upload page">
                    <UploadCloud className="mr-2 size-4" />
                    <span>Upload</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <div className="px-4 py-1 text-xs font-semibold text-muted-foreground">Research Sessions</div>
            <SidebarGroup className="flex-1 overflow-y-auto">
              <SidebarMenu>
                {sessions.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 bg-gradient-aether-hero rounded-full opacity-10 blur-lg"></div>
                      <Info className="mx-auto size-16 p-3 text-primary/30" />
                    </div>
                    <p>No sessions yet. Start a new chat to begin your research.</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <SidebarMenuItem key={session.id} className="group relative">
                      <SidebarMenuButton
                        onClick={() => onSwitchSession(session.id)}
                        isActive={session.id === activeSessionId}
                        className="truncate w-full justify-start"
                        aria-label={`Switch to session: ${session.title}`}
                      >
                        <MessageSquare className="mr-2 size-4 flex-shrink-0" />
                        <span className="truncate flex-1">{session.title}</span>
                      </SidebarMenuButton>
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartRenameSession(session.id, session.title);
                          }}
                          aria-label={`Rename session: ${session.title}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          aria-label={`Delete session: ${session.title}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroup>
            {sessions.length > 0 && (
              <div className="p-2 border-t">
                <Button variant="outline" size="sm" className="w-full" onClick={onClearAllSessions} aria-label="Clear all sessions">
                  <Trash2 className="mr-2 size-4" />
                  Clear All Sessions
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <Info className="size-8 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Please log in to manage your research sessions.</p>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          {isAuthenticated ? (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onOpenSettings} className="w-full justify-start" aria-label="Open settings">
                  <Settings className="mr-2 size-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="w-full justify-start" aria-label="Logout">
                  <LogOut className="mr-2 size-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate('/auth')} className="w-full justify-start" aria-label="Login">
                <LogIn className="mr-2 size-4" />
                <span>Login</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}