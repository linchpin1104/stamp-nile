"use client";

import type { User, MoodEntry, MoodOption } from '@/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Activity, Users, HeartPulse } from 'lucide-react';

export const MOOD_OPTIONS: MoodOption[] = [
  { emoji: '😄', label: 'Joyful', koreanLabel: '기쁨', value: 'joyful' },
  { emoji: '😊', label: 'Happy', koreanLabel: '행복', value: 'happy' },
  { emoji: '🙂', label: 'Okay', koreanLabel: '보통', value: 'okay' },
  { emoji: '😌', label: 'Calm', koreanLabel: '평온', value: 'calm' },
  { emoji: '😟', label: 'Worried', koreanLabel: '걱정', value: 'worried' },
  { emoji: '😔', label: 'Sad', koreanLabel: '슬픔', value: 'sad' },
  { emoji: '😠', label: 'Angry', koreanLabel: '화남', value: 'angry' },
  { emoji: '😩', label: 'Tired', koreanLabel: '피곤', value: 'tired' },
  { emoji: '🤩', label: 'Excited', koreanLabel: '신남', value: 'excited' },
];

const ACTIVITY_OPTIONS = [
  { label: '업무 (Work)', value: 'work' },
  { label: '육아 (Childcare)', value: 'childcare' },
  { label: '운동 (Exercise)', value: 'exercise' },
  { label: '휴식 (Rest)', value: 'rest' },
  { label: '취미 (Hobby)', value: 'hobby' },
  { label: '식사 (Meal)', value: 'meal' },
  { label: '외출 (Outing)', value: 'outing' },
  { label: '수면 (Sleep)', value: 'sleep' },
  { label: '공부 (Study)', value: 'study' },
  { label: '기타 (Other)', value: 'other_activity' },
];

const WITH_WHOM_OPTIONS = [
  { label: '아이 (Child)', value: 'child' },
  { label: '가족 (Family)', value: 'family' },
  { label: '부모님 (Parents)', value: 'parents' },
  { label: '친구 (Friend)', value: 'friend' },
  { label: '직장동료 (Colleague)', value: 'colleague' },
  { label: '배우자 (Spouse)', value: 'spouse' },
  { label: '혼자 (Alone)', value: 'alone' },
  { label: '기타 (Other)', value: 'other_with_whom' },
];


const generateId = (prefix = "mood") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

interface MoodSelectorProps {
  currentUser: User;
  onMoodSaved: (updatedUser: User) => void;
}

export function MoodSelector({ currentUser, onMoodSaved }: MoodSelectorProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaysEntry = currentUser.moodLog?.find(entry => entry.date === todayStr);

  const [selectedMoodValue, setSelectedMoodValue] = useState<string | null>(todaysEntry?.moodValue || null);
  const [notes, setNotes] = useState<string>(todaysEntry?.notes || '');
  const [selectedActivity, setSelectedActivity] = useState<string | undefined>(todaysEntry?.activity);
  const [selectedWithWhom, setSelectedWithWhom] = useState<string | undefined>(todaysEntry?.withWhom);
  const [customWithWhomText, setCustomWithWhomText] = useState<string>(todaysEntry?.customWithWhom || '');
  const [isSubmittedToday, setIsSubmittedToday] = useState<boolean>(!!todaysEntry);
  const { toast } = useToast();

  useEffect(() => {
    const currentEntry = currentUser.moodLog?.find(entry => entry.date === todayStr);
    setSelectedMoodValue(currentEntry?.moodValue || null);
    setNotes(currentEntry?.notes || '');
    setSelectedActivity(currentEntry?.activity);
    setSelectedWithWhom(currentEntry?.withWhom);
    setCustomWithWhomText(currentEntry?.customWithWhom || '');
    setIsSubmittedToday(!!currentEntry);
  }, [currentUser.moodLog, todayStr]);


  const handleMoodSelect = (moodValue: string) => {
    setSelectedMoodValue(moodValue);
    setIsSubmittedToday(false);
  };

  const handleSaveMood = () => {
    if (!selectedMoodValue) {
      toast({
        title: "기분 선택 필요",
        description: "저장하기 전에 오늘의 기분을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    if (selectedWithWhom === 'other_with_whom' && !customWithWhomText.trim()) {
      toast({
        title: "함께한 사람 입력 필요",
        description: "'기타'를 선택한 경우, 누구와 함께 했는지 직접 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: MoodEntry = {
      id: todaysEntry?.id || generateId('moodEntry'),
      date: todayStr,
      moodValue: selectedMoodValue,
      notes: notes.trim() || undefined,
      activity: selectedActivity,
      withWhom: selectedWithWhom,
      customWithWhom: selectedWithWhom === 'other_with_whom' ? customWithWhomText.trim() : undefined,
    };

    const updatedMoodLog = [...(currentUser.moodLog || [])];
    const existingEntryIndex = updatedMoodLog.findIndex(entry => entry.date === todayStr);

    if (existingEntryIndex > -1) {
      updatedMoodLog[existingEntryIndex] = newEntry;
    } else {
      updatedMoodLog.push(newEntry);
    }
    
    updatedMoodLog.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const updatedUser = { ...currentUser, moodLog: updatedMoodLog };
    onMoodSaved(updatedUser);
    setIsSubmittedToday(true);

    toast({
      title: "기분 저장 완료!",
      description: "오늘의 기분이 기록되었습니다.",
    });
  };
  
  const selectedMoodDetails = MOOD_OPTIONS.find(opt => opt.value === selectedMoodValue);

  return (
    <Card className="shadow-lg w-full max-w-lg mx-auto my-8 bg-card">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center">
          <HeartPulse className="mr-2 h-6 w-6" /> 오늘 기분이 어떠세요?
        </CardTitle>
        <CardDescription>매일의 기분을 기록하여 감정 변화를 파악해보세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleMoodSelect(option.value)}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent space-y-1",
                selectedMoodValue === option.value ? "bg-accent/20 ring-2 ring-accent scale-105" : "hover:bg-accent/10"
              )}
              aria-label={option.label}
              title={option.label}
            >
              <span className="text-3xl sm:text-4xl">{option.emoji}</span>
              <span className="text-xs text-muted-foreground">{option.koreanLabel}</span>
            </button>
          ))}
        </div>

        {selectedMoodValue && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                <Label htmlFor="moodActivity">주요 활동</Label>
                <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                    <SelectTrigger id="moodActivity">
                        <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="오늘 한 주요 활동은 무엇인가요?" />
                    </SelectTrigger>
                    <SelectContent>
                        {ACTIVITY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-1">
                <Label htmlFor="moodWithWhom">함께한 사람</Label>
                <Select value={selectedWithWhom} onValueChange={setSelectedWithWhom}>
                    <SelectTrigger id="moodWithWhom">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="주로 누구와 함께 시간을 보냈나요?" />
                    </SelectTrigger>
                    <SelectContent>
                        {WITH_WHOM_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                </div>
            </div>
            {selectedWithWhom === 'other_with_whom' && (
              <div className="space-y-1">
                <Label htmlFor="customWithWhom">함께한 사람 (직접 입력)</Label>
                <Input 
                  id="customWithWhom" 
                  value={customWithWhomText}
                  onChange={(e) => setCustomWithWhomText(e.target.value)}
                  placeholder="예: 반려동물, 동네 이웃"
                />
              </div>
            )}
             <div className="space-y-1">
              <Label htmlFor="moodNotes" className="text-sm font-medium text-muted-foreground">
                메모 (선택 사항)
              </Label>
              <Textarea
                id="moodNotes"
                value={notes}
                onChange={(e) => {
                    setNotes(e.target.value);
                    setIsSubmittedToday(false);
                }}
                placeholder="오늘 기분에 대해 더 남기고 싶은 이야기가 있나요?"
                rows={2}
                className="bg-background focus:border-primary"
              />
            </div>
          </div>
        )}


        <Button onClick={handleSaveMood} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!selectedMoodValue || isSubmittedToday}>
          {isSubmittedToday && selectedMoodDetails ? `오늘의 기분 (${selectedMoodDetails.emoji} ${selectedMoodDetails.koreanLabel}) 저장됨!` : "오늘의 기분 저장하기"}
        </Button>
        {isSubmittedToday && <p className="text-xs text-muted-foreground text-center">기분이나 메모를 변경하고 다시 저장할 수 있습니다.</p>}
      </CardContent>
    </Card>
  );
}