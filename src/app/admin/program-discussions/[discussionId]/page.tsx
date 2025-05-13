
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown, Send, Flag, UserX, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Extended mock discussion data for detail view
const mockDiscussionsData = [
  { 
    id: 'd1', 
    programId: 'program1', 
    program: 'Stamp36: Returning Parent Program (Infancy)', 
    topic: 'Childcare anxieties', 
    user: 'Alex Doe', 
    avatarSeed: 'alexdoe',
    date: '2024-07-20', 
    fullContent: 'I\'m starting back at work in a few weeks and feeling really anxious about finding reliable childcare for my 6-month-old. Does anyone have advice on how to vet daycares or nannies? What are some red flags to look out for? Any positive experiences or tips would be greatly appreciated!',
    status: 'active',
    comments: [
      { id: 'c1', user: 'Jamie Lee', avatarSeed: 'jamielee', date: '2024-07-20', text: 'Totally understand! We went through this. Make a list of non-negotiables and visit multiple places. Ask for references and trust your gut!', likes: 5, dislikes: 0 },
      { id: 'c2', user: 'Admin Mod', avatarSeed: 'adminmod', date: '2024-07-21', text: 'Great discussion, Alex! We have a resource guide on choosing childcare in Week 2, it might be helpful. Also, remember our community guidelines for respectful interaction.', likes: 2, dislikes: 0, isAdmin: true },
      { id: 'c3', user: 'Pat K.', avatarSeed: 'patk', date: '2024-07-21', text: 'Don\'t forget to check online reviews and state licensing websites!', likes: 3, dislikes: 0 },
    ]
  },
   { id: 'd2', programId: 'program2', program: 'Navigating Toddler Transitions', topic: 'Tantrum tips?', user: 'Jamie Lee', date: '2024-07-19', snippet: 'My toddler has been having major tantrums. Any advice?', status: 'active', fullContent: 'My 2-year-old has started throwing intense tantrums whenever they don\'t get their way. It usually happens in public and it\'s really embarrassing. I\'ve tried ignoring, time-outs, and talking calmly, but nothing seems to work. What are some effective strategies for managing toddler tantrums, especially when out and about?', comments: [{ id: 'c4', user: 'Dana S.', avatarSeed: 'danas', date: '2024-07-19', text: 'Oh, I feel you! Consistency is key. And try to preempt them by noticing triggers - hunger, tiredness etc. Sometimes a quick distraction works wonders too.', likes: 4, dislikes: 0}, { id: 'c5', user: 'Admin Mod', avatarSeed: 'adminmod', date: '2024-07-19', text: 'Solid advice Dana. We also cover tantrum management in our "Toddler Challenges" module (Week 3). It has a video on the "acknowledge, validate, redirect" technique.', likes: 1, dislikes: 0, isAdmin: true}]},
  // ... add other discussions here if needed for testing detail view for them
];

const BANNED_USERS_STORAGE_KEY = 'bannedUsers';

type MockComment = {
  id: string;
  user: string;
  avatarSeed: string;
  date: string;
  text: string;
  likes: number;
  dislikes: number;
  isAdmin?: boolean;
};

type MockDiscussion = {
  id: string;
  programId: string;
  program: string;
  topic: string;
  user: string;
  avatarSeed: string;
  date: string;
  fullContent: string;
  status: string;
  comments: MockComment[];
};


export default function DiscussionDetailPage() {
  const { discussionId: routeDiscussionId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [discussionId, setDiscussionIdState] = useState<string | null>(null);
  const [discussion, setDiscussion] = useState<MockDiscussion | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof routeDiscussionId === 'string') {
      setDiscussionIdState(routeDiscussionId);
    } else {
      setDiscussionIdState(null);
    }
  }, [routeDiscussionId]);

  useEffect(() => {
    if (discussionId) {
      setIsLoading(true);
      const foundDiscussion = mockDiscussionsData.find(d => d.id === discussionId);
      setDiscussion(foundDiscussion || null);
      setIsLoading(false);
    } else if (routeDiscussionId === null) { // If param resolved to null
        setIsLoading(false);
    }
  }, [discussionId, routeDiscussionId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Loading discussion...</p></div>;
  }

  if (!discussion) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground mb-2">Discussion not found.</h2>
        <p className="text-muted-foreground mb-6">The discussion thread may have been moved, deleted, or the original poster may have been banned.</p>
        <Button onClick={() => router.push('/admin/program-discussions')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Discussions
        </Button>
      </div>
    );
  }

  const handlePostComment = () => {
    if(!newComment.trim()) return;
    console.log("New comment:", newComment);
    const newMockComment: MockComment = {
        id: `c${Date.now()}`,
        user: 'Admin Reply',
        avatarSeed: 'adminreply',
        date: new Date().toISOString().split('T')[0],
        text: newComment,
        likes: 0,
        dislikes: 0,
        isAdmin: true,
    }
    setDiscussion(prev => prev ? ({...prev, comments: [...prev.comments, newMockComment]}) : null);
    setNewComment('');
    toast({ title: "Comment Posted", description: "Your reply has been added to the thread." });
  }

  const handleBanUser = (userName: string) => {
    if (confirm(`Are you sure you want to ban the user "${userName}"? This will hide all their posts across the platform and cannot be undone through this interface.`)) {
      const storedBannedUsers = localStorage.getItem(BANNED_USERS_STORAGE_KEY);
      let bannedUsers: string[] = [];
      if (storedBannedUsers) {
        bannedUsers = JSON.parse(storedBannedUsers);
      }
      if (!bannedUsers.includes(userName)) {
        bannedUsers.push(userName);
      }
      localStorage.setItem(BANNED_USERS_STORAGE_KEY, JSON.stringify(bannedUsers));
      toast({
        title: "User Banned",
        description: `User "${userName}" has been banned. Their posts will be hidden. You might be redirected if this was their post.`,
      });
      // Optionally, redirect if the current discussion belongs to the banned user
      if (discussion.user === userName) {
        router.push('/admin/program-discussions');
      }
    }
  };


  return (
    <div className="space-y-6">
       <Button variant="outline" size="sm" asChild>
          <Link href="/admin/program-discussions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Discussions
          </Link>
        </Button>

      <Card className="shadow-xl">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl text-primary">{discussion.topic}</CardTitle>
          <CardDescription>
            In <Link href={`/admin/programs/${discussion.programId}/edit`} className="text-accent hover:underline">{discussion.program}</Link> by {discussion.user} on {discussion.date}
          </CardDescription>
            <span className={`mt-2 text-xs px-2 py-0.5 rounded-full capitalize font-medium w-fit ${
                discussion.status === 'flagged' ? 'bg-destructive/20 text-destructive-foreground' :
                discussion.status === 'resolved' ? 'bg-green-500/20 text-green-700' :
                'bg-muted text-muted-foreground'
            }`}>
                Status: {discussion.status}
            </span>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3 mb-6">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://picsum.photos/seed/${discussion.avatarSeed}/100/100`} alt={discussion.user} data-ai-hint="user avatar" />
              <AvatarFallback>{discussion.user.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="bg-muted/50 p-4 rounded-lg flex-1">
                <p className="text-sm font-semibold text-foreground">{discussion.user}</p>
                <p className="text-xs text-muted-foreground mb-2">{discussion.date}</p>
                <p className="text-foreground/90 whitespace-pre-wrap">{discussion.fullContent}</p>
            </div>
          </div>

          <div className="space-x-2 mb-6">
            <Button variant="outline"><Flag className="mr-2 h-4 w-4" /> Flag Thread</Button>
            <Button 
                variant="outline" 
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => handleBanUser(discussion.user)}
            >
                <UserX className="mr-2 h-4 w-4" /> Ban User ({discussion.user})
            </Button>
          </div>
          
          <h3 className="text-xl font-semibold text-primary mb-4 border-t pt-4">Comments ({discussion.comments.length})</h3>
          <div className="space-y-4">
            {discussion.comments.map(comment => (
              <Card key={comment.id} className={`p-4 ${comment.isAdmin ? 'bg-primary/10 border-primary/30' : 'bg-card'}`}>
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://picsum.photos/seed/${comment.avatarSeed}/80/80`} alt={comment.user} data-ai-hint="commenter avatar"/>
                    <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">{comment.user} {comment.isAdmin && <span className="text-xs text-primary font-bold">(Admin)</span>}</p>
                        <span className="text-xs text-muted-foreground">{comment.date}</span>
                    </div>
                    <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap">{comment.text}</p>
                    <div className="flex items-center space-x-3 mt-2">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500 p-1 h-auto">
                            <ThumbsUp className="mr-1 h-4 w-4" /> {comment.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 p-1 h-auto">
                            <ThumbsDown className="mr-1 h-4 w-4" /> {comment.dislikes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-1 h-auto">
                           Hide
                        </Button>
                         {/* Added ban user button for commenters */}
                        {!comment.isAdmin && (
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="text-muted-foreground hover:text-destructive p-1 h-auto"
                             onClick={() => handleBanUser(comment.user)}
                           >
                             <UserX className="mr-1 h-4 w-4" /> Ban
                           </Button>
                        )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <Label htmlFor="newComment" className="text-md font-semibold text-primary">Post a Reply (as Admin)</Label>
            <Textarea 
                id="newComment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your reply here..."
                className="mt-2"
                rows={3}
            />
            <Button onClick={handlePostComment} className="mt-3 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Send className="mr-2 h-4 w-4" /> Post Reply
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
