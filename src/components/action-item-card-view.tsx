"use client";

import type { ActionItem, ActionItemContent, TodoListItem } from '@/types'; 
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Edit3, BookOpen, MessageSquare, ListTodo, Trash2, Star } from 'lucide-react';
import { Slider } from '@/components/ui/slider'; 
import { cn } from '@/lib/utils';

interface ActionItemCardProps {
  actionItem: ActionItem; 
  onCompletionChange?: (itemId: string, isCompleted: boolean) => void;
  onNotesChange?: (itemId: string, notes: string) => void;
  onEdit?: (itemId: string) => void; 
  onDelete?: (itemId: string) => void;
  onTodoItemProgressChange?: (actionItemId: string, todoItemId: string, score: number) => void;
  initialProgress?: Record<string, number>; 
}

const typeIcons: Record<ActionItem['type'], React.ElementType> = {
  todo_list: ListTodo, 
  journal_prompt: Edit3, 
  dialogue_activity: MessageSquare, 
  conversational_response_practice: MessageSquare, 
  journal: Edit3,
  practice: CheckCircle,
  discussion: MessageSquare,
  todo: ListTodo,
};


export function ActionItemCardView({ 
    actionItem, 
    onCompletionChange, 
    onNotesChange, 
    onEdit, 
    onDelete,
    onTodoItemProgressChange,
    initialProgress = {}
}: ActionItemCardProps) {
  const [isCompletedOverall, setIsCompletedOverall] = useState(actionItem.isCompleted || false);
  const [notes, setNotes] = useState(actionItem.userNotes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const [localTodoItems, setLocalTodoItems] = useState<TodoListItem[]>(() => {
    if (actionItem.type === 'todo_list' && actionItem.todoItems) {
      return actionItem.todoItems.map(item => ({
        ...item,
        progressScore: initialProgress[item.id] !== undefined ? initialProgress[item.id] : (item.progressScore || 0),
      }));
    }
    return [];
  });

  // Effect to synchronize localTodoItems with props if they change from parent
  useEffect(() => {
    if (actionItem.type === 'todo_list' && actionItem.todoItems) {
      const newCalculatedItems = actionItem.todoItems.map(newItem => {
        const currentLocalItem = localTodoItems.find(li => li.id === newItem.id);
        return {
          ...newItem,
          progressScore: initialProgress[newItem.id] !== undefined 
                          ? initialProgress[newItem.id] 
                          : (currentLocalItem?.progressScore !== undefined ? currentLocalItem.progressScore : (newItem.progressScore || 0)),
        };
      });

      if (JSON.stringify(newCalculatedItems) !== JSON.stringify(localTodoItems)) {
        setLocalTodoItems(newCalculatedItems);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionItem.todoItems, actionItem.type, initialProgress]);


  useEffect(() => {
    if (actionItem.type === 'todo_list' && localTodoItems.length > 0) {
      const allTasksComplete = localTodoItems.every(item => item.progressScore === 5);
      if (allTasksComplete !== isCompletedOverall) {
        setIsCompletedOverall(allTasksComplete);
        if (onCompletionChange) {
          onCompletionChange(actionItem.id, allTasksComplete);
        }
      }
    }
  }, [localTodoItems, actionItem.type, actionItem.id, onCompletionChange, isCompletedOverall]);


  const IconComponent = typeIcons[actionItem.type] || BookOpen;

  const handleOverallCompletionToggle = () => {
    if (actionItem.type !== 'todo_list') {
        const newCompletionStatus = !isCompletedOverall;
        setIsCompletedOverall(newCompletionStatus);
        if (onCompletionChange) {
          onCompletionChange(actionItem.id, newCompletionStatus);
        }
    }
  };

  const handleNotesSave = () => {
    setIsEditingNotes(false);
    if (onNotesChange) {
      onNotesChange(actionItem.id, notes);
    }
  };

  const handleTodoItemScoreChange = (todoItemId: string, score: number) => {
    setLocalTodoItems(prevItems => 
      prevItems.map(item => 
        item.id === todoItemId ? { ...item, progressScore: score } : item
      )
    );
    if (onTodoItemProgressChange) {
      onTodoItemProgressChange(actionItem.id, todoItemId, score);
    }
  };

  return (
    <Card className={`shadow-md ${isCompletedOverall ? 'bg-muted/50' : 'bg-card'} relative`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-primary flex items-center">
              <IconComponent className="h-5 w-5 mr-2 shrink-0" />
              {actionItem.title}
            </CardTitle>
            <CardDescription className="text-sm capitalize mt-1">{actionItem.type.replace(/_/g, ' ')}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {actionItem.isUserCreated && onEdit && onDelete && (
              <div className="flex items-center space-x-1 mr-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(actionItem.id)} className="h-7 w-7">
                  <Edit3 className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(actionItem.id)} className="h-7 w-7 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            )}
            {actionItem.type !== 'todo_list' && !actionItem.isUserCreated && (
              <>
                <Checkbox
                  id={`action-${actionItem.id}-complete`}
                  checked={isCompletedOverall}
                  onCheckedChange={handleOverallCompletionToggle}
                  aria-label="Mark as complete"
                />
                <Label htmlFor={`action-${actionItem.id}-complete`} className="text-sm cursor-pointer">
                  {isCompletedOverall ? 'Completed' : 'Mark Complete'}
                </Label>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/80 mb-4 whitespace-pre-wrap">{actionItem.description}</p>
        
        {actionItem.type === 'todo_list' && localTodoItems.length > 0 && (
          <div className="space-y-4 mb-4">
            <Label className="text-base font-medium">Tasks:</Label>
            {localTodoItems.map((item) => (
              <div key={item.id} className="p-3 border rounded-md bg-secondary/10 space-y-2">
                <p className={cn("text-sm", item.progressScore === 5 ? "line-through text-muted-foreground" : "")}>
                  {item.text}
                </p>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[item.progressScore]} // Use value to make it controlled
                    onValueChange={(value) => handleTodoItemScoreChange(item.id, value[0])}
                    min={0}
                    max={5}
                    step={1}
                    className="flex-grow"
                    aria-label={`Progress for ${item.text}`}
                  />
                  <span className="text-xs font-medium w-8 text-right">{item.progressScore}/5</span>
                </div>
              </div>
            ))}
          </div>
        )}

        { (actionItem.type === 'journal_prompt' || actionItem.userNotes !== undefined || isEditingNotes) && (
          <div className="space-y-2">
            <Label htmlFor={`notes-${actionItem.id}`} className="text-sm font-medium">Your Notes/Reflections:</Label>
            {isEditingNotes || (notes === '' && actionItem.isUserCreated) ? ( 
              <Textarea
                id={`notes-${actionItem.id}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={`Add your notes for "${actionItem.title}"...`}
                rows={3}
                className="bg-background"
                onFocus={() => setIsEditingNotes(true)}
              />
            ) : (
              <div 
                onClick={() => actionItem.isUserCreated ? setIsEditingNotes(true) : null} 
                className={`p-3 border rounded-md bg-background min-h-[60px] ${actionItem.isUserCreated ? 'cursor-text' : ''} whitespace-pre-wrap text-sm text-foreground`}
              >
                {notes || (actionItem.isUserCreated ? "Click to add notes..." : "No notes provided.")}
              </div>
            )}
          </div>
        )}
      </CardContent>
      {isEditingNotes && (
        <CardFooter>
          <Button onClick={handleNotesSave} size="sm" className="ml-auto">Save Notes</Button>
        </CardFooter>
      )}
    </Card>
  );
}