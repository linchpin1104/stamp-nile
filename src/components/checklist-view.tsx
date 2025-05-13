"use client";

import type { Checklist as ChecklistType, ChecklistItem as ChecklistItemType } from '@/types';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';

interface ChecklistProps {
  checklist: ChecklistType;
  onChecklistItemChange?: (checklistId: string, itemId: string, isChecked: boolean) => void;
  onEdit?: (checklistId: string) => void; // For user-created items
  onDelete?: (checklistId: string) => void; // For user-created items
}

const generateId = (prefix = "item") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

const ensureItemIds = (items: ChecklistItemType[]): ChecklistItemType[] => {
  return items.map(item => ({ ...item, id: item.id || generateId('cl-item-auto') }));
};


export function ChecklistView({ checklist, onChecklistItemChange, onEdit, onDelete }: ChecklistProps) {
  const [items, setItems] = useState<ChecklistItemType[]>(() =>
    ensureItemIds(checklist.items || []).map(item => ({ ...item, isChecked: !!item.isChecked }))
  );
  
  const prevChecklistIdRef = useRef<string>(checklist.id);
  const prevItemsRef = useRef<ChecklistItemType[]>(checklist.items || []);

  useEffect(() => {
    // Only re-initialize items if the checklist ID changes or if items have changed
    const prevChecklistId = prevChecklistIdRef.current;
    const prevItems = prevItemsRef.current;
    
    if (checklist.id !== prevChecklistId || 
        JSON.stringify(checklist.items) !== JSON.stringify(prevItems)) {
      setItems(
        ensureItemIds(checklist.items || []).map(item => ({ ...item, isChecked: !!item.isChecked }))
      );
      prevChecklistIdRef.current = checklist.id;
      prevItemsRef.current = [...(checklist.items || [])];
    }
  }, [checklist.id, checklist.items]);

  const handleCheckedChange = useCallback((itemId: string, checked: boolean) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, isChecked: checked } : item
      )
    );
    if (onChecklistItemChange) {
      onChecklistItemChange(checklist.id, itemId, checked);
    }
  }, [checklist.id, onChecklistItemChange]);

  const completedItems = items.filter(item => item.isChecked).length;
  const totalItems = items.length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <Card className={`shadow-md ${checklist.isUserCreated ? 'bg-accent/10 border-accent' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-primary">{checklist.title}</CardTitle>
            {checklist.description && (
                <CardDescription>{checklist.description}</CardDescription>
            )}
             {checklist.isUserCreated && <Badge variant="outline" className="mt-1 text-xs border-accent text-accent">My Checklist</Badge>}
          </div>
          {checklist.isUserCreated && onEdit && onDelete && (
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(checklist.id)} className="h-8 w-8">
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(checklist.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {totalItems > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor={`progress-${checklist.id}`} className="text-sm text-muted-foreground">
                Progress: {completedItems} / {totalItems}
              </Label>
            </div>
            <Progress id={`progress-${checklist.id}`} value={progressPercentage} className="w-full h-2" />
          </div>
        )}
        <ul className="space-y-3">
          {items.map(item => (
            <li key={item.id} className={`flex items-start space-x-3 p-3 ${checklist.isUserCreated ? 'bg-background' : 'bg-secondary/10'} rounded-md hover:bg-secondary/20 transition-colors`}>
              <Checkbox
                id={`${checklist.id}-${item.id}`}
                checked={!!item.isChecked} // Ensure boolean
                onCheckedChange={(checkedValue) => handleCheckedChange(item.id, Boolean(checkedValue))}
                className="mt-1 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <div className="flex-1">
                <Label
                  htmlFor={`${checklist.id}-${item.id}`}
                  className={`text-base ${item.isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                >
                  {item.text}
                </Label>
                {item.details && <p className="text-xs text-muted-foreground mt-1">{item.details}</p>}
              </div>
            </li>
          ))}
        </ul>
        {totalItems === 0 && <p className="text-muted-foreground">No items in this checklist.</p>}
      </CardContent>
    </Card>
  );
}
