
"use client";

import type { MoodEntry, MoodOption } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { MOOD_OPTIONS } from './mood-selector'; 
import { CalendarDays, Edit3, Activity, Users, MessageSquare } from 'lucide-react'; // Added Activity, Users, MessageSquare
import { Badge } from '@/components/ui/badge';

interface MoodLogDisplayProps {
  moodLog?: MoodEntry[];
}

const getMoodDetails = (moodValue: string): MoodOption | undefined => {
  return MOOD_OPTIONS.find(opt => opt.value === moodValue);
};

const ACTIVITY_OPTIONS_MAP: Record<string, string> = {
  work: '업무', childcare: '육아', exercise: '운동', rest: '휴식', hobby: '취미',
  meal: '식사', outing: '외출', sleep: '수면', study: '공부', other_activity: '기타 활동'
};

const WITH_WHOM_OPTIONS_MAP: Record<string, string> = {
  child: '아이', family: '가족', parents: '부모님', friend: '친구',
  colleague: '직장동료', spouse: '배우자', alone: '혼자', other_with_whom: '기타'
};


export function MoodLogDisplay({ moodLog = [] }: MoodLogDisplayProps) {
  if (moodLog.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-primary">나의 기분 기록</CardTitle>
          <CardDescription>시간에 따른 감정 변화를 추적해보세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">아직 기분 기록이 없습니다. 홈페이지에서 오늘의 기분을 기록해보세요!</p>
        </CardContent>
      </Card>
    );
  }
  
  const sortedLog = [...moodLog].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-primary">나의 기분 기록</CardTitle>
        <CardDescription>기록된 감정 내역입니다. 패턴을 파악하고 스스로를 돌보세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {sortedLog.map((entry) => {
              const moodDetail = getMoodDetails(entry.moodValue);
              const activityLabel = entry.activity ? ACTIVITY_OPTIONS_MAP[entry.activity] || entry.activity : null;
              let withWhomLabel = entry.withWhom ? WITH_WHOM_OPTIONS_MAP[entry.withWhom] || entry.withWhom : null;
              if (entry.withWhom === 'other_with_whom' && entry.customWithWhom) {
                withWhomLabel = entry.customWithWhom;
              }

              return (
                <Card key={entry.id} className="bg-card shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{moodDetail?.emoji || '❓'}</span>
                        <div>
                          <p className="text-md font-semibold text-foreground">
                            {moodDetail?.koreanLabel || moodDetail?.label || entry.moodValue}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <CalendarDays className="h-3 w-3 mr-1"/> {format(parseISO(entry.date), 'PPP')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        {activityLabel && (
                            <Badge variant="outline" className="text-xs font-normal">
                                <Activity className="h-3 w-3 mr-1.5"/> 활동: {activityLabel}
                            </Badge>
                        )}
                        {withWhomLabel && (
                             <Badge variant="outline" className="text-xs font-normal ml-1.5">
                                <Users className="h-3 w-3 mr-1.5"/> 함께: {withWhomLabel}
                            </Badge>
                        )}
                    </div>

                    {entry.notes && (
                      <div className="mt-2.5 text-sm text-foreground/80 bg-muted/50 p-3 rounded-md whitespace-pre-wrap flex items-start">
                         <MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground shrink-0"/>
                         <span>{entry.notes}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
