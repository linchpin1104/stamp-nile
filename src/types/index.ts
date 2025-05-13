export interface ProgramCompletion {
  programId: string;
  completionDate: string;
  satisfactionScore?: number; // 1-5 stars
}

export interface Voucher {
  id: string; // Can be the code itself if unique
  code: string; // The 6-character voucher code
  programId: string; // ID of the program this voucher grants access to
  programTitle?: string; // For display purposes in admin
  registrationStartDate: string; // YYYY-MM-DD
  registrationEndDate: string; // YYYY-MM-DD
  accessDurationDays: number; // N days of access after registration
  status: 'available' | 'active' | 'expired' | 'void';
  registeredByUserId?: string;
  registeredByUserName?: string; // For display
  registeredDate?: string; // YYYY-MM-DD, when the user registered it
  accessExpiresDate?: string; // YYYY-MM-DD, calculated
  createdAt: string; // YYYY-MM-DD, when the voucher was generated
}

export interface UserPsychTestResponseItem {
  questionId: string;
  value: number;
  factorId: string;
}

export interface UserOXQuizResponseItem {
  questionId: string;
  userAnswer: boolean;
}

export interface UserQASessionResponseItem {
    promptId: string;
    answer: string;
}

export interface MoodOption {
  emoji: string;
  label: string; // English label (can be used as a key or fallback)
  koreanLabel: string; // Korean label for display
  value: string; 
}

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  moodValue: string; // Corresponds to MoodOption.value
  notes?: string;
  activity?: string; // e.g., 'work', 'childcare', 'exercise'
  withWhom?: string; // e.g., 'child', 'family', 'alone'
  customWithWhom?: string; // If 'other' is selected for withWhom
}

export interface User {
  id: string;
  name: string;
  email: string; 
  phoneNumber?: string; 
  avatarUrl?: string;
  children: ChildInfo[];
  residentialArea: string;
  parentalRole: 'mother' | 'father' | 'grandparent';
  customTodoLists?: TodoListActionItemContent[]; 
  userMissions?: UserMission[];
  programCompletions?: ProgramCompletion[];
  registeredVouchers?: Array<{
    voucherCode: string;
    programId: string;
    accessExpiresDate: string;
    registeredDate: string;
  }>;
  customChecklists?: Checklist[]; 
  registrationDate?: string;
  actionItemProgress?: Record<string, { 
    todoItemScores?: Record<string, number>; 
    notes?: string;
    isCompletedOverall?: boolean; 
  }>;
  scenarioResponses?: Record<string, Record<string, string | string[]>>; 
  psychTestResponses?: Record<string, UserPsychTestResponseItem[]>; 
  oxQuizResponses?: Record<string, UserOXQuizResponseItem[]>; 
  qaSessionResponses?: Record<string, UserQASessionResponseItem[]>; 
  moodLog?: MoodEntry[]; 
}

export interface ChildInfo {
  id: string;
  birthYear: number;
}

export interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  targetAudience?: string;
  paymentType: 'free' | 'paid';
  price?: number;
  currency?: string;
  paymentLink?: string;
  weeks?: Week[];
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  companySpecificDocuments?: CompanyDocument[];
  mobileOptimized?: boolean;
  mobileMetadata?: {
    estimatedReadingTime?: number;
    requiresWifi?: boolean;
    offlineSupport?: boolean;
    [key: string]: any;
  };
}

export interface Week {
  id: string;
  weekNumber: number;
  title: string;
  summary?: string;
  learningElements?: LearningElement[];
  videos?: VideoContent[]; 
  videoChoiceGroups?: VideoChoiceGroup[]; 
  checklists?: Checklist[]; 
  actionItems?: ActionItem[]; 
  interactiveScenarioId?: string; 
  additionalReadings?: TextContent[]; 
  sequentialCompletionRequired?: boolean;
}

export interface PsychologicalTestQuestionOption {
  id: string;
  text: string;
  value: number;
}

export interface PsychologicalTestQuestion {
  id: string;
  text: string;
  options: PsychologicalTestQuestionOption[];
}

export interface ResultComment {
  id: string;
  scoreRange: [number, number];
  categoryLabel: string;
  comment: string;
}

export interface PsychologicalFactor {
  id: string;
  title: string;
  scoringMethod?: 'sum' | 'average';
  questions: PsychologicalTestQuestion[];
  factorResultComments: ResultComment[];
}

export interface PsychologicalTestContent {
  id: string;
  title: string;
  description?: string;
  overallScoringMethod?: 'sum' | 'average';
  factors: PsychologicalFactor[];
  overallResultComments: ResultComment[];
}


export interface QAItem {
  id: string;
  question: string;
  answerPlaceholder?: string;
  userAnswer?: string; 
}

export interface QuestionAnswerSessionContent {
  id: string;
  title: string;
  description?: string;
  prompts: QAItem[];
}

export interface MissionReminderContent {
  id: string;
  title: string; 
  missionTitle: string; 
  missionDescription: string; 
}

export interface UserMission {
  id: string;
  linkedProgramMissionId?: string; 
  title: string;
  description?: string;
  progress: number; 
  isUserCreated: boolean;
}


export interface OXQuizQuestion {
  id: string;
  statement: string;
  correctAnswer: boolean; 
  explanation?: string;
}

export interface OXQuizContent {
  id: string;
  title: string;
  description?: string;
  questions: OXQuizQuestion[];
}

export interface VideoContent {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  duration?: string;
  mobileUrl?: string;
  aspectRatio?: string;
  mobileAspectRatio?: string;
  playerOptions?: {
    controls?: boolean;
    autoplay?: boolean;
    preload?: 'auto' | 'metadata' | 'none';
    responsive?: boolean;
    fluid?: boolean;
    playbackRates?: number[];
    [key: string]: any;
  };
}

export interface VideoChoiceGroup {
  id: string;
  title: string;
  videos: VideoContent[];
  selectionRule: 'choose_one' | 'complete_all';
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
  type: 'readiness_assessment' | 'child_relationship_assessment' | 'generic_todo' | 'self_reflection';
  feedbackRules?: Array<{ condition: string; feedback: string; }>;
  userId?: string; 
  isUserCreated?: boolean; 
  programId?: string; 
  weekId?: string; 
}

export interface ChecklistItem {
  id:string;
  text: string;
  itemType: 'checkbox' | 'multiple_choice_single' | 'multiple_choice_multiple' | 'scale';
  options?: Array<{id: string; text: string; value: string | number}>;
  category?: string;
  details?: string;
  isChecked?: boolean; 
  selectedValue?: string | number | string[]; 
}

export interface BaseActionItemContent {
  id: string;
  title: string;
  description: string;
  isCompleted?: boolean; 
  userNotes?: string; 
  isUserCreated?: boolean; 
  userId?: string; 
  programId?: string; 
  weekId?: string; 
}

export interface TodoListItem {
  id: string;
  text: string;
  progressScore: number; 
}
export interface TodoListActionItemContent extends BaseActionItemContent {
  type: 'todo_list';
  todoItems: TodoListItem[];
}
export interface JournalPromptActionItemContent extends BaseActionItemContent {
  type: 'journal_prompt';
  
}
export interface DialogueActivityActionItemContent extends BaseActionItemContent {
  type: 'dialogue_activity';
  dialoguePrompt: string;
  dialogueChoices: Array<{ id: string; text: string; feedback?: string; nextActionItemId?: string }>;
  
}
export interface ConversationalResponseActionItemContent extends BaseActionItemContent {
  type: 'conversational_response_practice';
  dialoguePrompt: string;
  
}

export type ActionItemContent =
  | TodoListActionItemContent
  | JournalPromptActionItemContent
  | DialogueActivityActionItemContent
  | ConversationalResponseActionItemContent;


export interface ActionItem extends BaseActionItemContent {
   type: ActionItemContent['type'];
   todoItems?: TodoListItem[];
   dialoguePrompt?: string;
   dialogueChoices?: Array<{ id: string; text: string; feedback?: string; nextActionItemId?: string }>;
}


export interface TextContent {
  id: string;
  title: string;
  type: 'article' | 'resource_link' | 'policy_info' | 'support_document';
  content?: string; 
  url?: string; 
  imageUrl?: string; 
  richTextEditorComponent?: React.ComponentType<{ value: string; onChange?: (value: string) => void; readOnly?: boolean }>;
}

export interface CompanyDocument extends TextContent {
  audience?: 'all' | 'returning_parents' | string; 
}


export interface InteractiveScenario {
  id: string;
  title: string;
  description?: string;
  nodes: ScenarioNode[];
  startNodeId: string;
}

export interface ScenarioNode {
  id: string;
  type: 'message' | 'question_single_choice' | 'question_multi_choice' | 'reflection_prompt' | 'summary';
  text: string;
  imageUrl?: string;
  options?: ScenarioOption[];
  nextNodeId?: string;
  character?: 'user' | 'guide';
}

export interface ScenarioOption {
  id?: string;
  text: string;
  nextNodeId?: string;
  feedback?: string;
  endsScenario?: boolean;
}

export type LearningElement =
  | { type: 'video'; content: VideoContent; id: string; title?: string; }
  | { type: 'video_choice_group'; content: VideoChoiceGroup; id: string; title?: string; }
  | { type: 'checklist'; content: Checklist; id: string; title?: string; }
  | { type: 'action_item'; content: ActionItemContent; id: string; title?: string; }
  | { type: 'interactive_scenario_link'; scenarioId: string; title: string; id: string; }
  | { type: 'text_content'; content: TextContent; id: string; title?: string; }
  | { type: 'psychological_test'; content: PsychologicalTestContent; id: string; title?: string; }
  | { type: 'qa_session'; content: QuestionAnswerSessionContent; id: string; title?: string; }
  | { type: 'mission_reminder'; content: MissionReminderContent; id: string; title?: string; }
  | { type: 'ox_quiz'; content: OXQuizContent; id: string; title?: string; };


export type LearningElementType = LearningElement['type'];

export interface Banner {
  id: string;
  title?: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
}

export interface DiscussionPost {
    id: string;
    programId: string;
    programTitle?: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    tags?: string[];
    status: 'active' | 'closed' | 'flagged' | 'resolved';
    commentCount?: number;
    likeCount?: number;
}

export interface DiscussionComment {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    isReplyTo?: string;
}

