"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCircle, Baby, Edit3, Save, Users, MapPin, Smile, Phone, CalendarDays, PlusCircle, Trash2, ListTodo, Target, Award, BookOpenCheck, Ticket, AlertCircle, Mail, HeartPulse } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { mockUser as fallbackMockUser, mockPrograms as initialMockPrograms, initialMockVouchers } from '@/lib/mock-data';
import type { User as UserType, TodoListActionItemContent, UserMission, Program, Voucher, MoodEntry } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { UserTodoListForm, UserTodoListFormData } from '@/components/user-content/user-todo-list-form';
import { ActionItemCardView } from '@/components/action-item-card-view';
import { MoodLogDisplay } from '@/components/mood/mood-log-display';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format, addDays, isWithinInterval, parseISO, isAfter } from 'date-fns';
import { Separator } from '@/components/ui/separator';


const generateId = (prefix = "item") => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
const MAX_USER_MISSIONS = 3;
const VOUCHERS_STORAGE_KEY = 'mockVouchers';

// parentalRole 타입 정의
type ParentalRoleType = 'mother' | 'father' | 'grandparent' | '';


export default function ProfilePage() {
  const _router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserType | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Form states for profile
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [residentialArea, setResidentialArea] = useState('');
  const [parentalRole, setParentalRole] = useState<ParentalRoleType>('');
  const [childrenInfo, setChildrenInfo] = useState<Array<{id: string, birthYear: string}>>([]);

  const [allProgramsData, setAllProgramsData] = useState<Program[]>([]);
  const [customTodoLists, setCustomTodoLists] = useState<TodoListActionItemContent[]>([]);
  const [isCustomTodoModalOpen, setIsCustomTodoModalOpen] = useState(false);
  const [editingCustomTodo, setEditingCustomTodo] = useState<TodoListActionItemContent | null>(null);

  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [isUserMissionModalOpen, setIsUserMissionModalOpen] = useState(false);
  const [editingUserMission, setEditingUserMission] = useState<UserMission | null>(null);
  const [newUserMissionTitle, setNewUserMissionTitle] = useState('');
  const [newUserMissionDescription, setNewUserMissionDescription] = useState('');

  const [completedProgramIds, setCompletedProgramIds] = useState<string[]>([]);
  const [userMoodLog, setUserMoodLog] = useState<MoodEntry[]>([]); // State for mood log

  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [voucherError, setVoucherError] = useState('');


  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      _router.push('/auth/login');
      return;
    }

    const storedProgramsString = localStorage.getItem('mockPrograms');
    if (storedProgramsString) {
      try {
        setAllProgramsData(JSON.parse(storedProgramsString));
      } catch (error) {
        console.error("Error parsing programs from localStorage:", error);
        setAllProgramsData(initialMockPrograms);
      }
    } else {
      setAllProgramsData(initialMockPrograms);
    }

    const storedUserProfileString = localStorage.getItem('userProfile');
    let currentUser: UserType;

    if (storedUserProfileString) {
        currentUser = JSON.parse(storedUserProfileString);
    } else {
        const storedUserName = localStorage.getItem('userName');
        currentUser = {
            ...fallbackMockUser,
            name: storedUserName || fallbackMockUser.name,
        };
        localStorage.setItem('userProfile', JSON.stringify(currentUser));
    }

    setUser(currentUser);
    
    // Calculate program completion stats
    const enrolledPrograms = currentUser.enrolledPrograms || [];
    
    if (enrolledPrograms.length > 0) {
      const _completedCount = enrolledPrograms.filter((p: {status: string}) => p.status === 'completed').length;
      const _inProgressCount = enrolledPrograms.filter((p: {status: string}) => p.status === 'in_progress').length;
      
      setCompletedProgramIds(enrolledPrograms.map((p: {id: string}) => p.id));
    }

    // Load mood log data
    setUserMoodLog(currentUser.moodLog || []);
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_router]); // Dependencies are limited to router to prevent re-runs with mutable mock data

  const handleChildBirthYearChange = (index: number, year: string) => {
    const updatedBirthYears = [...childrenInfo];
    updatedBirthYears[index] = { ...updatedBirthYears[index], birthYear: year };
    setChildrenInfo(updatedBirthYears);
  };

  const handleAddChild = () => {
    setChildrenInfo([...childrenInfo, { id: generateId('profileChild'), birthYear: '' }]);
  };

  const handleRemoveChild = (childIdToRemove: string) => {
    setChildrenInfo(childrenInfo.filter((child) => child.id !== childIdToRemove));
  };

  const persistUserProfile = (updatedUser: UserType) => {
    setUser(updatedUser);
    localStorage.setItem('userName', updatedUser.name);
    localStorage.setItem('userEmail', updatedUser.email); 
    if (updatedUser.phoneNumber) {
        localStorage.setItem('userPhoneNumber', updatedUser.phoneNumber);
    } else {
        localStorage.removeItem('userPhoneNumber');
    }
    localStorage.setItem('userProfile', JSON.stringify(updatedUser));
  };

  const handleProfileSave = (_e: FormEvent) => {
    _e.preventDefault();
    if(user) {
        const updatedUser: UserType = {
            ...user,
            name,
            email, 
            phoneNumber: phoneNumber.trim() || undefined, 
            residentialArea,
            parentalRole: parentalRole as UserType['parentalRole'],
            children: childrenInfo
                .filter(c => c.birthYear && !isNaN(parseInt(c.birthYear)))
                .map(c => ({ id: c.id, birthYear: parseInt(c.birthYear) })),
            customTodoLists: customTodoLists,
            userMissions: userMissions,
            completedProgramIds: completedProgramIds,
            registeredVouchers: user.registeredVouchers || [],
            moodLog: userMoodLog, // Include moodLog
        };
        persistUserProfile(updatedUser);
        toast({ title: "Profile Updated", description: "Your profile information has been saved." });
    }
    setIsEditingProfile(false);
  };

  const handleSaveCustomTodo = (data: UserTodoListFormData) => {
    let updatedLists;
    if (editingCustomTodo) {
      updatedLists = customTodoLists.map(list => list.id === data.id ? { ...data, type: 'todo_list' as const, isUserCreated: true } : list);
      toast({ title: "To-Do List Updated", description: `"${data.title}" has been updated.` });
    } else {
      const newList: TodoListActionItemContent = { ...data, id: generateId('customTodo'), type: 'todo_list', isUserCreated: true };
      updatedLists = [...customTodoLists, newList];
      toast({ title: "To-Do List Added", description: `"${data.title}" has been added.` });
    }
    setCustomTodoLists(updatedLists);
    if (user) {
        persistUserProfile({ ...user, customTodoLists: updatedLists, moodLog: userMoodLog });
    }
    setEditingCustomTodo(null);
    setIsCustomTodoModalOpen(false);
  };

  const handleDeleteCustomTodo = (todoId: string) => {
    if (confirm("Are you sure you want to delete this to-do list?")) {
        const updatedLists = customTodoLists.filter(list => list.id !== todoId);
        setCustomTodoLists(updatedLists);
        if (user) {
            persistUserProfile({ ...user, customTodoLists: updatedLists, moodLog: userMoodLog });
        }
        toast({ title: "To-Do List Deleted", variant: "destructive" });
    }
  };

  const openEditCustomTodoModal = (todoList: TodoListActionItemContent) => {
    setEditingCustomTodo(todoList);
    setIsCustomTodoModalOpen(true);
  };

  const openNewCustomTodoModal = () => {
    setEditingCustomTodo(null);
    setIsCustomTodoModalOpen(true);
  };

  const handleUserMissionProgressChange = (missionId: string, newProgress: number) => {
    const updatedMissions = userMissions.map(m =>
      m.id === missionId ? { ...m, progress: newProgress } : m
    );
    setUserMissions(updatedMissions);
    if (user) {
      persistUserProfile({ ...user, userMissions: updatedMissions, moodLog: userMoodLog });
    }
  };

  const openNewUserMissionModal = () => {
    setNewUserMissionTitle('');
    setNewUserMissionDescription('');
    setEditingUserMission(null);
    setIsUserMissionModalOpen(true);
  };

  const openEditUserMissionModal = (mission: UserMission) => {
    setEditingUserMission(mission);
    setNewUserMissionTitle(mission.title);
    setNewUserMissionDescription(mission.description || '');
    setIsUserMissionModalOpen(true);
  };

  const handleSaveUserMission = () => {
    if (!newUserMissionTitle.trim()) {
      toast({ title: "Error", description: "Mission title cannot be empty.", variant: "destructive" });
      return;
    }
    let updatedMissions;
    if (editingUserMission) {
      updatedMissions = userMissions.map(m =>
        m.id === editingUserMission.id
          ? { ...m, title: newUserMissionTitle, description: newUserMissionDescription }
          : m
      );
      toast({ title: "Mission Updated", description: `"${newUserMissionTitle}" details saved.` });
    } else {
      if (userMissions.filter(m => m.isUserCreated).length >= MAX_USER_MISSIONS) {
        toast({ title: "Limit Reached", description: `You can only add up to ${MAX_USER_MISSIONS} custom missions.`, variant: "destructive" });
        setIsUserMissionModalOpen(false);
        return;
      }
      const newMission: UserMission = {
        id: generateId('userMission'),
        title: newUserMissionTitle,
        description: newUserMissionDescription,
        progress: 0,
        isUserCreated: true,
      };
      updatedMissions = [...userMissions, newMission];
      toast({ title: "Mission Added", description: `"${newUserMissionTitle}" added to your missions.` });
    }

    setUserMissions(updatedMissions);
    if (user) {
      persistUserProfile({ ...user, userMissions: updatedMissions, moodLog: userMoodLog });
    }
    setIsUserMissionModalOpen(false);
    setEditingUserMission(null);
  };

  const handleDeleteUserMission = (missionId: string) => {
    const missionToDelete = userMissions.find(m => m.id === missionId);
    if (!missionToDelete || !missionToDelete.isUserCreated) {
        toast({title: "Error", description: "Program-defined missions cannot be deleted here.", variant: "destructive"});
        return;
    }
    if (confirm(`Are you sure you want to delete the mission: "${missionToDelete.title}"?`)) {
      const updatedMissions = userMissions.filter(m => m.id !== missionId);
      setUserMissions(updatedMissions);
      if (user) {
        persistUserProfile({ ...user, userMissions: updatedMissions, moodLog: userMoodLog });
      }
      toast({ title: "Mission Deleted", variant: "destructive" });
    }
  };

  const handleVoucherRegistration = () => {
    setVoucherError('');
    if (!voucherCodeInput.trim()) {
      setVoucherError("Please enter a voucher code.");
      return;
    }
    if (!user) {
      setVoucherError("User not found. Please try logging in again.");
      return;
    }

    const storedVouchersString = localStorage.getItem(VOUCHERS_STORAGE_KEY);
    let allVouchers: Voucher[] = [];
    if (storedVouchersString) {
      try {
        allVouchers = JSON.parse(storedVouchersString);
      } catch (_e) {
        console.error("Failed to parse vouchers:", _e);
        setVoucherError("Error reading voucher data. Please try again later.");
        return;
      }
    } else {
      allVouchers = initialMockVouchers;
      localStorage.setItem(VOUCHERS_STORAGE_KEY, JSON.stringify(initialMockVouchers));
    }

    const voucherToRegister = allVouchers.find(v => v.code.toUpperCase() === voucherCodeInput.toUpperCase());

    if (!voucherToRegister) {
      setVoucherError("Invalid voucher code.");
      return;
    }

    const now = new Date();
    const regStartDate = parseISO(voucherToRegister.registrationStartDate);
    const regEndDate = parseISO(voucherToRegister.registrationEndDate);

    if (!isWithinInterval(now, { start: regStartDate, end: addDays(regEndDate, 1) })) {
      setVoucherError("This voucher is outside its registration validity period.");
      return;
    }
    if (voucherToRegister.status !== 'available') {
      setVoucherError(`This voucher is ${voucherToRegister.status} and cannot be registered.`);
      return;
    }
    if (user.registeredVouchers?.some(rv => rv.voucherCode === voucherToRegister.code)) {
        setVoucherError("You have already registered this voucher.");
        return;
    }
    const programForVoucher = allProgramsData.find(p => p.id === voucherToRegister.programId);
    if (user.registeredVouchers?.some(rv => rv.programId === voucherToRegister.programId && isAfter(parseISO(rv.accessExpiresDate), now))) {
        setVoucherError(`You already have active access to the program "${programForVoucher?.title || 'this program'}" from another voucher.`);
        return;
    }

    const registeredDate = format(now, 'yyyy-MM-dd');
    const accessExpiresDate = format(addDays(now, voucherToRegister.accessDurationDays), 'yyyy-MM-dd');

    const updatedVoucher: Voucher = {
      ...voucherToRegister,
      status: 'active',
      programTitle: programForVoucher?.title || voucherToRegister.programTitle, 
      registeredByUserId: user.id,
      registeredByUserName: user.name,
      registeredDate: registeredDate,
      accessExpiresDate: accessExpiresDate,
    };

    const updatedAllVouchers = allVouchers.map(v => v.id === updatedVoucher.id ? updatedVoucher : v);
    localStorage.setItem(VOUCHERS_STORAGE_KEY, JSON.stringify(updatedAllVouchers));

    const newRegisteredVoucherEntry = {
      voucherCode: updatedVoucher.code,
      programId: updatedVoucher.programId,
      accessExpiresDate: accessExpiresDate,
      registeredDate: registeredDate,
    };
    const updatedUserRegisteredVouchers = [...(user.registeredVouchers || []), newRegisteredVoucherEntry];
    persistUserProfile({ ...user, registeredVouchers: updatedUserRegisteredVouchers, moodLog: userMoodLog });

    toast({
      title: "Voucher Registered!",
      description: `You now have access to "${updatedVoucher.programTitle}" until ${accessExpiresDate}.`,
    });
    setVoucherCodeInput('');
  };

  if (!user || (allProgramsData.length === 0 && initialMockPrograms.length > 0)) { 
    return <div className="text-center py-10">Loading profile...</div>;
  }

  const currentYear = new Date().getFullYear();
  const userCreatedMissionsCount = userMissions.filter(m => m.isUserCreated).length;
  const programsUserCompleted = allProgramsData.filter(p => completedProgramIds.includes(p.id));

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b gap-4 sm:gap-0">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-primary">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar large"/>
            <AvatarFallback className="text-2xl sm:text-3xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">{user.name}</h1>
            <p className="text-sm sm:text-base text-muted-foreground flex items-center">
                <Mail className="h-4 w-4 mr-1.5"/>{user.email}
            </p>
          </div>
        </div>
         <Button variant="outline" size="lg" onClick={() => setIsEditingProfile(!isEditingProfile)} className="w-full sm:w-auto">
            <Edit3 className="mr-2 h-5 w-5" /> {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
        </Button>
      </header>

      {isEditingProfile ? (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl text-primary">Edit Your Profile</CardTitle>
                <CardDescription>Update your personal and child information.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative mt-1">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="email">Email Address</Label>
                         <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required/>
                        </div>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                         <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="pl-10" placeholder="010-1234-5678"/>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="parentalRole">Your Role</Label>
                        <Select onValueChange={(value) => setParentalRole(value as ParentalRoleType)} value={parentalRole} >
                            <SelectTrigger className="mt-1">
                                <Smile className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <span className="pl-6"><SelectValue placeholder="Select your role" /></span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mother">Mother (엄마)</SelectItem>
                                <SelectItem value="father">Father (아빠)</SelectItem>
                                <SelectItem value="grandparent">Grandparent (조부모)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                    <Label htmlFor="residentialArea">Residential Area</Label>
                    <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="residentialArea" value={residentialArea} onChange={(e) => setResidentialArea(e.target.value)} className="pl-10" />
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">Children Information</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddChild}><Users className="mr-2 h-4 w-4" /> Add Child</Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                    {childrenInfo.map((child, index) => (
                        <div key={child.id} className="flex items-end space-x-2 p-2 border rounded-md">
                            <div className="flex-grow">
                                <Label htmlFor={`childBirthYearEdit-${child.id}`}>Child {index + 1} Birth Year</Label>
                                <div className="relative mt-1">
                                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                id={`childBirthYearEdit-${child.id}`}
                                type="number"
                                placeholder={`YYYY (e.g., ${currentYear - 2})`}
                                value={child.birthYear}
                                onChange={(e) => handleChildBirthYearChange(index, e.target.value)}
                                min="1950"
                                max={currentYear.toString()}
                                className="pl-10"
                                />
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveChild(child.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {childrenInfo.length === 0 && <p className="text-sm text-muted-foreground">No children added.</p>}
                    </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="ghost" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                    <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Save className="mr-2 h-4 w-4" /> Save All Changes
                    </Button>
                </div>
            </form>
            </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8">
                <TabsTrigger value="profile" className="py-3 text-base"><UserCircle className="mr-2 h-5 w-5" />My Profile</TabsTrigger>
                <TabsTrigger value="child-info" className="py-3 text-base"><Baby className="mr-2 h-5 w-5" />Child Info</TabsTrigger>
                <TabsTrigger value="mood-tracker" className="py-3 text-base"><HeartPulse className="mr-2 h-5 w-5" />Mood Log</TabsTrigger>
                <TabsTrigger value="my-programs" className="py-3 text-base"><BookOpenCheck className="mr-2 h-5 w-5"/>My Programs</TabsTrigger>
                <TabsTrigger value="vouchers" id="vouchers_tab" className="py-3 text-base"><Ticket className="mr-2 h-5 w-5"/>Vouchers</TabsTrigger>
                <TabsTrigger value="custom-todos" className="py-3 text-base"><ListTodo className="mr-2 h-5 w-5" />My To-Do Lists</TabsTrigger>
                <TabsTrigger value="my-missions" className="py-3 text-base"><Target className="mr-2 h-5 w-5" />My Missions</TabsTrigger>
                <TabsTrigger value="achievements" className="py-3 text-base"><Award className="mr-2 h-5 w-5" />Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl text-primary">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-foreground/90">
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    {user.phoneNumber && <p><strong>Phone:</strong> {user.phoneNumber}</p>}
                    <p><strong>Role:</strong> <span className="capitalize">{user.parentalRole}</span></p>
                    <p><strong>Residential Area:</strong> {user.residentialArea}</p>
                </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="child-info" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl text-primary">Children Information</CardTitle>
                </CardHeader>
                <CardContent>
                {user.children && user.children.length > 0 ? (
                    <ul className="space-y-3">
                    {user.children.map((child, index) => (
                        <li key={child.id || index} className="p-3 border rounded-md bg-muted/30">
                        <p><strong>Child {index + 1} Birth Year:</strong> {child.birthYear}</p>
                        <p className="text-sm text-muted-foreground">Approx. Age: {currentYear - child.birthYear} years old</p>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground">No child information added yet.</p>
                )}
                </CardContent>
            </Card>
            </TabsContent>
            
            <TabsContent value="mood-tracker" className="mt-6">
              <MoodLogDisplay moodLog={userMoodLog} />
            </TabsContent>

            <TabsContent value="my-programs" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl text-primary">My Enrolled Programs</CardTitle>
                        <CardDescription>Track your progress and access your programs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">You are not currently enrolled in any programs. Register a voucher or explore available programs.</p>
                        <Button asChild variant="link" className="p-0 h-auto text-accent mt-2">
                            <Link href="/programs">
                                Browse Programs
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="vouchers" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl text-primary">Register a Voucher</CardTitle>
                        <CardDescription>Enter your voucher code to get access to a program.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-end gap-2">
                            <div className="flex-grow space-y-1">
                                <Label htmlFor="voucherCode">Voucher Code</Label>
                                <Input
                                    id="voucherCode"
                                    value={voucherCodeInput}
                                    onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                                    placeholder="e.g., AB1234"
                                    className="text-base"
                                />
                            </div>
                            <Button onClick={handleVoucherRegistration} className="bg-accent hover:bg-accent/90 text-accent-foreground h-10">
                                Register Code
                            </Button>
                        </div>
                        {voucherError && <p className="text-sm text-destructive flex items-center"><AlertCircle className="h-4 w-4 mr-1"/>{voucherError}</p>}

                        <Separator className="my-6"/>
                        <h3 className="text-lg font-medium text-primary">Your Active Vouchers</h3>
                        {user.registeredVouchers && user.registeredVouchers.length > 0 ? (
                            <ul className="space-y-2">
                                {user.registeredVouchers.filter(rv => isAfter(parseISO(rv.accessExpiresDate), new Date())).map(rv => {
                                    const program = allProgramsData.find(p => p.id === rv.programId);
                                    return (
                                        <li key={rv.voucherCode} className="p-3 border rounded-md bg-muted/30">
                                            <p className="font-semibold">{program?.title || `Program ID: ${rv.programId}`}</p>
                                            <p className="text-sm text-muted-foreground">Code: {rv.voucherCode}</p>
                                            <p className="text-sm text-muted-foreground">Access Expires: {format(parseISO(rv.accessExpiresDate), 'PP')}</p>
                                        </li>
                                    );
                                })}
                                {user.registeredVouchers.filter(rv => isAfter(parseISO(rv.accessExpiresDate), new Date())).length === 0 && (
                                    <p className="text-sm text-muted-foreground">You don&apos;t have any active vouchers at the moment.</p>
                                )}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">You have no registered vouchers.</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

             <TabsContent value="custom-todos" className="mt-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl text-primary">My Custom To-Do Lists</CardTitle>
                            <CardDescription>Create and manage your personal to-do lists.</CardDescription>
                        </div>
                        <Button onClick={openNewCustomTodoModal} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New List
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {customTodoLists.length > 0 ? (
                            customTodoLists.map(todoList => (
                                <ActionItemCardView
                                    key={todoList.id}
                                    actionItem={todoList}
                                    onEdit={() => openEditCustomTodoModal(todoList)}
                                    onDelete={() => handleDeleteCustomTodo(todoList.id)}
                                />
                            ))
                        ) : (
                            <p className="text-muted-foreground mb-3">You haven&apos;t created any to-do lists yet.</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="my-missions" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl text-primary">My Missions</CardTitle>
                        <CardDescription>Track your progress on program missions and personal goals.</CardDescription>
                    </div>
                    <Button
                        onClick={openNewUserMissionModal}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        disabled={userCreatedMissionsCount >= MAX_USER_MISSIONS}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Personal Mission
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {userMissions.length > 0 ? (
                        userMissions.map(mission => (
                            <Card key={mission.id} className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{mission.title}</CardTitle>
                                        {mission.isUserCreated && (
                                            <div className="flex space-x-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEditUserMissionModal(mission)} className="h-7 w-7">
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteUserMission(mission.id)} className="h-7 w-7 text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    {!mission.isUserCreated && <Badge variant="secondary" className="mt-1">Program Mission</Badge>}
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {mission.description && <p className="text-sm text-muted-foreground">{mission.description}</p>}
                                    <div className="flex items-center space-x-2 pt-1">
                                        <Slider
                                            value={[mission.progress]}
                                            max={10}
                                            step={1}
                                            onValueChange={(value) => handleUserMissionProgressChange(mission.id, value[0])}
                                            className="flex-grow"
                                            aria-labelledby={`mission-label-${mission.id}`}
                                        />
                                        <span id={`mission-label-${mission.id}`} className="text-sm font-medium w-8 text-right">{mission.progress}/10</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No missions being tracked yet. Program missions will appear here as you encounter them.</p>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl text-primary">My Achievements</CardTitle>
                        <CardDescription>View programs you've completed and other milestones.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-semibold mb-3">Completed Programs</h3>
                        {programsUserCompleted.length > 0 ? (
                            <ul className="space-y-2">
                                {programsUserCompleted.map(program => (
                                    <li key={program.id} className="p-3 border rounded-md bg-muted/30 flex items-center">
                                        <Award className="h-5 w-5 text-accent mr-3"/>
                                        <span>{program.title}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">You haven't completed any programs yet.</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

        </Tabs>
      )}

      <Dialog open={isCustomTodoModalOpen} onOpenChange={setIsCustomTodoModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingCustomTodo ? 'Edit To-Do List' : 'Create New To-Do List'}</DialogTitle>
            <DialogDescription>
              {editingCustomTodo ? 'Modify your existing to-do list.' : 'Add a new personal to-do list.'}
            </DialogDescription>
          </DialogHeader>
          <UserTodoListForm
            initialData={editingCustomTodo || {} as TodoListActionItemContent}
            onSubmit={handleSaveCustomTodo}
            onCancel={() => {
              setEditingCustomTodo(null);
              setIsCustomTodoModalOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isUserMissionModalOpen} onOpenChange={setIsUserMissionModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{editingUserMission ? 'Edit Personal Mission' : 'Add New Personal Mission'}</DialogTitle>
                <DialogDescription>
                    {editingUserMission ? 'Update the details of your mission.' : `Define a new personal goal. You can add ${MAX_USER_MISSIONS - userCreatedMissionsCount} more.`}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <div>
                    <Label htmlFor="missionTitle">Mission Title</Label>
                    <Input
                        id="missionTitle"
                        value={newUserMissionTitle}
                        onChange={(e) => setNewUserMissionTitle(e.target.value)}
                        placeholder="e.g., Practice patience daily"
                    />
                </div>
                <div>
                    <Label htmlFor="missionDescription">Description (Optional)</Label>
                    <Textarea
                        id="missionDescription"
                        value={newUserMissionDescription}
                        onChange={(e) => setNewUserMissionDescription(e.target.value)}
                        placeholder="e.g., Take 3 deep breaths before reacting"
                        rows={3}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsUserMissionModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveUserMission} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    {editingUserMission ? 'Save Changes' : 'Add Mission'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

