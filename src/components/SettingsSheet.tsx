import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MODELS } from '@/lib/chat';
interface SettingsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  defaultModelId: string;
  onDefaultModelChange: (modelId: string) => Promise<void>;
}
export function SettingsSheet({
  isOpen,
  onOpenChange,
  defaultModelId,
  onDefaultModelChange,
}: SettingsSheetProps) {
  const [selectedModel, setSelectedModel] = useState(defaultModelId);
  useEffect(() => {
    setSelectedModel(defaultModelId);
  }, [defaultModelId]);
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    onDefaultModelChange(modelId);
  };
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle id="settings-title">Settings</SheetTitle>
          <SheetDescription id="settings-description">
            Customize your AetherMind experience. Changes are saved automatically.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="theme-toggle-button" className="text-right">
              Theme
            </Label>
            <div className="col-span-2">
              <ThemeToggle className="relative" />
            </div>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="default-model" className="text-right">
              Default Model
            </Label>
            <div className="col-span-2">
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger id="default-model" className="focus:ring-2 focus:ring-primary" aria-labelledby="default-model-label">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}