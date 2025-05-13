

import type { Program, User, InteractiveScenario, Week, ChecklistItem, ActionItem, TextContent, VideoContent, CompanyDocument, LearningElement, VideoChoiceGroup, PsychologicalTestContent, QuestionAnswerSessionContent, MissionReminderContent, OXQuizContent, PsychologicalTestQuestion, QAItem, OXQuizQuestion as OXQuizQuestionType, ActionItemContent, TodoListActionItemContent, ConversationalResponseActionItemContent, DialogueActivityActionItemContent, JournalPromptActionItemContent, ChildInfo, PsychologicalFactor, ResultComment, UserMission, ProgramCompletion, Voucher, Banner, TodoListItem, MoodEntry } from '@/types';
import { format, subDays, addDays } from 'date-fns';

const VOUCHERS_STORAGE_KEY = 'mockVouchers';
const BANNERS_STORAGE_KEY = 'mockBanners';
const DISCUSSIONS_STORAGE_KEY = 'initialMockDiscussionsData';
const LOCAL_STORAGE_KEY_PROGRAMS = 'mockPrograms';
const LOCAL_STORAGE_KEY_USERS = 'mockUsers';


const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const generateRandomDate = (start = new Date(2023, 0, 1), end = new Date()) => {
  return format(new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())), 'yyyy-MM-dd');
};

const generateRandomPastDateString = (daysAgoMax: number = 30): string => {
  const days = Math.floor(Math.random() * daysAgoMax) + 1;
  return format(subDays(new Date(), days), 'yyyy-MM-dd');
};

const generateRandomFutureDateString = (daysFutureMax: number = 30): string => {
    const days = Math.floor(Math.random() * daysFutureMax) + 1;
    return format(addDays(new Date(), days), 'yyyy-MM-dd');
};

const defaultQuestionOptions = (): Array<{ id: string; text: string; value: number }> => Array.from({length: 5}, (_, i) => ({id: generateId('opt'), text: `선택지 ${i+1}`, value: i+1}));
const scaleQuestionOptions = (labels: string[]): Array<{ id: string; text: string; value: number }> => labels.map((label, i) => ({ id: generateId('opt-scale'), text: label, value: i + 1 }));


const createVideo = (title: string, description: string, idSuffix: string, url?: string, thumbnailUrl?: string): VideoContent => ({
  id: generateId(`vid-content-${idSuffix}`),
  title,
  description,
  url: url || 'https://www.youtube.com/embed/LXb3EKWsInQ', // Placeholder, replace with actual video IDs
  thumbnailUrl: thumbnailUrl || `https://picsum.photos/seed/video${idSuffix}/300/200`,
  duration: `${Math.floor(Math.random() * 10) + 2}:${Math.floor(Math.random()*60).toString().padStart(2,'0')}`,
});

// --- Start Program 1: Returning to Work: Infancy ---
const p1Videos = {
  v1: createVideo('P1V1: Returning to Work Mindset', 'How prepared are you mentally and emotionally for returning to work?', 'p1v1'),
  v2: createVideo('P1V2: What to Prepare Based on Your Type', 'Actionable steps based on your readiness assessment.', 'p1v2'),
  v3_choice: createVideo('P1V3C: Childcare Methods When Returning', 'Exploring different childcare options and transitions.', 'p1v3c'),
  v4_choice: createVideo('P1V4C: Work-Life Balance Strategies', 'Tips for managing work and family life.', 'p1v4c'),
  v5_choice: createVideo('P1V5C: Communicating with Your Employer', 'Effectively discuss your needs and expectations.', 'p1v5c'),
  v6: createVideo('P1V6: Why is Work Important to You?', 'Reconnecting with your motivations and values.', 'p1v6'),
};

const p1Checklists = {
  readiness: {
    id: generateId('p1cl1'), title: 'P1C1: Return-to-Work Readiness Assessment', description: 'Assess your readiness across different areas.', type: 'readiness_assessment',
    items: [
      { id: generateId('chk'), text: 'Childcare arrangements confirmed', itemType: 'checkbox', category: 'Parenting' },
      { id: generateId('chk'), text: 'Household chore division discussed', itemType: 'checkbox', category: 'Household' },
      { id: generateId('chk'), text: 'Work schedule clarified with employer', itemType: 'checkbox', category: 'Work' },
      { id: generateId('chk'), text: 'How concerned are you about Parenting?', itemType: 'multiple_choice_single', category: 'Concerns', options: [{id:generateId('opt'), text:'Not Concerned', value:1}, {id:generateId('opt'),text:'Slightly', value:2}, {id:generateId('opt'),text:'Very', value:3}]},
      { id: generateId('chk'), text: 'Rate your current energy level (1=Low, 5=High)', itemType: 'scale', category: 'Well-being', options: scaleQuestionOptions(['Low','','','','High'])},
    ],
  } as ChecklistType,
};

const p1ActionItems = {
  initialTodo: { id: 'p1ai1', title: 'P1A1: Initial To-Do based on Readiness Check', description: 'List tasks based on your readiness assessment.', type: 'todo_list', todoItems: [{ id: generateId('task'), text: 'Example initial task from program.', progressScore: 0 }] } as TodoListActionItemContent,
  detailedTodo: { id: 'p1ai2', title: 'P1A2: Create Return-to-Work To-Do List', description: 'List specific tasks to prepare.', type: 'todo_list', todoItems: [{ id: generateId('task'), text: 'Finalize childcare schedule.', progressScore: 0 }, { id: generateId('task'), text: 'Prepare work outfits.', progressScore: 0 }] } as TodoListActionItemContent,
  dialogueActivity: {
    id: generateId('p1ai3'), title: 'P1A3: Multiple-Choice Dialogue Activity', description: 'Navigate a tricky conversation with your manager.', type: 'dialogue_activity', dialoguePrompt: 'Manager asks for an urgent project on day 1. Response?',
    dialogueChoices: [ { id: generateId('dc'), text: '"Yes, absolutely!"', feedback: "Ensure you're not overcommitting early on." }, { id: generateId('dc'), text: '"Can we discuss priorities to ensure I can deliver effectively?"', feedback: "Good approach for managing expectations!" } ],
  } as DialogueActivityActionItemContent,
  journalPrompt: { id: 'p1ai4', title: 'P1A4: Write a Message to Your Future Self', description: 'Compose a supportive message for when work feels overwhelming after your return.', type: 'journal_prompt' } as JournalPromptActionItemContent,
};

// New Psychological Test for Program 1, Week 2
const p1w2StressTestContent: PsychologicalTestContent = {
  id: 'psych-test-multi-factor-1746900754816-xeo6z7y', 
  title: 'Return to Work Stress Assessment',
  description: 'This test helps identify potential stress areas as you prepare to return to work.',
  overallScoringMethod: 'average',
  factors: [
    {
      id: generateId('factor-childcare'),
      title: 'Childcare Stress',
      scoringMethod: 'average',
      questions: [
        { id: generateId('q-cc1'), text: 'I feel confident that my child will be well cared for while I am at work.', options: defaultQuestionOptions() },
        { id: generateId('q-cc2'), text: 'Arranging and managing childcare feels overwhelming.', options: defaultQuestionOptions() },
      ],
      factorResultComments: [
        { id: generateId('frc-cc-low'), scoreRange: [1, 2.5], categoryLabel: 'Low Stress', comment: 'You seem to have a good handle on childcare arrangements, which significantly reduces stress.' },
        { id: generateId('frc-cc-mod'), scoreRange: [2.6, 3.5], categoryLabel: 'Moderate Stress', comment: 'There might be some lingering concerns or details to iron out regarding childcare. Focus on addressing these.' },
        { id: generateId('frc-cc-high'), scoreRange: [3.6, 5], categoryLabel: 'High Stress', comment: 'Childcare is a major stressor for you. Prioritize finalizing plans and seeking support in this area.' },
      ],
    },
    {
      id: generateId('factor-workload'),
      title: 'Workload Management Stress',
      scoringMethod: 'average',
      questions: [
        { id: generateId('q-wl1'), text: 'I am worried about managing my job responsibilities effectively upon my return.', options: defaultQuestionOptions() },
        { id: generateId('q-wl2'), text: 'I feel prepared to communicate my needs and boundaries at work regarding my schedule and workload.', options: defaultQuestionOptions() },
      ],
      factorResultComments: [
        { id: generateId('frc-wl-low'), scoreRange: [1, 2.5], categoryLabel: 'Low Stress', comment: 'You appear confident in your ability to manage your workload and communicate effectively at work.' },
        { id: generateId('frc-wl-mod'), scoreRange: [2.6, 3.5], categoryLabel: 'Moderate Stress', comment: 'You may have some concerns about workload. Proactive communication and planning will be key.' },
        { id: generateId('frc-wl-high'), scoreRange: [3.6, 5], categoryLabel: 'High Stress', comment: 'Managing work responsibilities is a significant source of stress. Focus on strategies for prioritization and communication.' },
      ],
    },
  ],
  overallResultComments: [
    { id: generateId('orc-low'), scoreRange: [1, 2.5], categoryLabel: 'Generally Low Stress', comment: 'Your overall stress levels related to returning to work appear relatively low. Continue to build on your strengths and preparedness.' },
    { id: generateId('orc-mod'), scoreRange: [2.6, 3.5], categoryLabel: 'Moderate Stress Levels', comment: 'You are experiencing a moderate amount of stress. Identify specific areas of concern from the factor results and focus on strategies provided in this program.' },
    { id: generateId('orc-high'), scoreRange: [3.6, 5], categoryLabel: 'Higher Stress Levels Indicated', comment: 'Returning to work seems to be a significant source of stress for you. It’s important to utilize all available supports and strategies. This program is designed to help you navigate these challenges.' },
  ],
};


const p1QASession: QuestionAnswerSessionContent = { id: generateId('p1qa1'), title: 'P1QA1: Final Reflections: Returning to Work', description: 'Reflect on your journey and readiness.', prompts: [{id: generateId('qap'), question: 'What are you most proud of accomplishing in this program?', answerPlaceholder: 'Your thoughts...' }, {id:generateId('qap'), question: 'What is one strategy you will definitely use upon returning to work?', answerPlaceholder: 'My key strategy...'}] };
const p1MissionReminder: MissionReminderContent = { id: 'mission-rem-content1', title: 'P1MR1: Mission: Daily Connection', missionTitle: 'Connect with Your Child Daily (Infancy)', missionDescription: 'Spend 15 minutes of focused, uninterrupted quality time with your infant each day this week.'};
const p1OXQuiz: OXQuizContent = {
  id: generateId('p1ox1'), title: 'P1OX1: Quiz: Workplace Policies for Parents', description: 'Test your knowledge on common workplace policies.',
  questions: [ { id: generateId('oxq'), statement: 'Flexible work arrangements are legally guaranteed for all returning parents in most companies.', correctAnswer: false, explanation: 'Policies vary significantly by company and region. It\'s important to check your specific company\'s policy.'} ]
};
const p1TextContent: TextContent = { id: generateId('p1tc1'), title: 'P1TC1: Article: Navigating Your First Week Back', type: 'article', content: 'Tips and tricks for a smooth transition during your first week back at work. Focus on setting boundaries, managing expectations, and self-care.'};
const p1CompanyDoc: CompanyDocument = { id: generateId('csd-p1'), title: 'OurCompany Parental Leave Guidelines', type: 'policy_info', content: 'Details of OurCompany\'s parental leave policy, including duration, pay, and return-to-work support.', audience: 'All Employees', url: 'https://example.com/company-policy-doc' };


const program1ReturningParent: Program = {
  id: 'program1-returning-parent-infancy', slug: 'returning-parent-infant', title: 'Stamp36: Returning Parent Program (Infancy)',
  description: 'A 4-week program to support parents returning to work after parental leave with an infant.',
  longDescription: 'This comprehensive program guides parents through the emotional and practical aspects of returning to work while caring for an infant. It covers readiness assessment, action planning, child adjustment, and finding personal motivation. Includes tailored activities and company-specific resources.',
  imageUrl: 'https://picsum.photos/seed/program1/600/400', targetAudience: 'Parents of infants (0-12 months) returning to work',
  tags: ['returning to work', 'infant care', 'work-life balance', 'corporate', 'parental leave'],
  companySpecificDocuments: [p1CompanyDoc],
  weeks: [
    { id: 'p1w1', weekNumber: 1, title: 'Returning to Work: Are You Ready?', summary: 'Assess your readiness and identify key areas.',
      learningElements: [
        { id: generateId('le-p1w1-v1'), type: 'video', content: p1Videos.v1 },
        { id: generateId('le-p1w1-c1'), type: 'checklist', content: p1Checklists.readiness },
        { id: generateId('le-p1w1-m1'), type: 'mission_reminder', content: p1MissionReminder },
      ], sequentialCompletionRequired: true },
    { id: 'p1w2', weekNumber: 2, title: 'Preparing for Your Return: Action Plan', summary: 'Create a personalized to-do list and practice conversations.',
      learningElements: [
        { id: generateId('le-p1w2-v1'), type: 'video', content: p1Videos.v2 },
        { id: generateId('le-p1w2-a1'), type: 'action_item', content: p1ActionItems.detailedTodo },
        { id: 'p1le-s1', type: 'interactive_scenario_link', scenarioId: 'scenario1', title: 'P1IS1: Interactive: Planning Your Return' },
        { id: 'psych-test-multi-factor-1746900754816-xeo6z7y', type: 'psychological_test', content: p1w2StressTestContent }, 
      ], sequentialCompletionRequired: true },
    { id: 'p1w3', weekNumber: 3, title: 'Is Your Child Okay? Childcare & Relationship', summary: 'Ensure a smooth childcare transition and maintain your bond.',
      learningElements: [
        { id: generateId('le-p1w3-vcg1'), type: 'video_choice_group', content: { id: generateId('vcg'), title: 'P1VCG1: Focus Areas (Choose 1)', videos: [p1Videos.v3_choice, p1Videos.v4_choice, p1Videos.v5_choice], selectionRule: 'choose_one' }},
        { id: generateId('le-p1w3-a1'), type: 'action_item', content: p1ActionItems.dialogueActivity },
        { id: generateId('le-p1w3-ox1'), type: 'ox_quiz', content: p1OXQuiz },
      ], sequentialCompletionRequired: true },
    { id: 'p1w4', weekNumber: 4, title: 'Why Do I Need to Work? Finding Your Motivation', summary: 'Reconnect with your motivations and values.',
      learningElements: [
        { id: generateId('le-p1w4-v1'), type: 'video', content: p1Videos.v6 },
        { id: generateId('le-p1w4-a1'), type: 'action_item', content: p1ActionItems.journalPrompt },
        { id: generateId('le-p1w4-tc1'), type: 'text_content', content: p1TextContent },
        { id: generateId('le-p1w4-qa1'), type: 'qa_session', content: p1QASession },
      ] },
  ]
};
// --- End Program 1 ---

// --- Start Program 2: Toddler Time: Positive Discipline ---
const p2Videos = {
  v1: createVideo("P2V1: Understanding Your Toddler's Big Emotions", "Insights into toddler emotional development.", "p2v1"),
  vcg1_v1: createVideo("P2VCG1V1: Positive Reinforcement Techniques", "Effective ways to encourage good behavior.", "p2vcg1v1"),
  vcg1_v2: createVideo("P2VCG1V2: Setting Gentle Boundaries", "How to set limits lovingly.", "p2vcg1v2"),
  vcg1_v3: createVideo("P2VCG1V3: Time-In vs. Time-Out", "Exploring different discipline approaches.", "p2vcg1v3"),
  v4: createVideo("P2V4: Building a Strong Parent-Child Connection", "Activities to foster connection.", "p2v4"),
};
const p2TextContents = {
  tc1: { id: generateId('p2tc1'), title: "P2TC1: Article: The Science of Toddler Brains", type: 'article', content: 'Understanding how your toddler\'s brain works can help you parent more effectively. This article covers key developmental milestones relevant to behavior.' } as TextContent,
  tc2_resourcelink: { id: generateId('p2tc2'), title: "P2TC2: External Resource: Toddler Development Stages", type: 'resource_link', url: 'https://example.com/toddler-dev-stages', content: "A helpful guide on typical toddler development." } as TextContent,
};
const p2ActionItems = {
  ai1_journal: { id: generateId('p2ai1'), title: "P2A1: Reflect: My Toddler's Triggers", description: "Identify situations or times of day when your toddler is most likely to have challenging behaviors. What patterns do you notice?", type: 'journal_prompt' } as JournalPromptActionItemContent,
  ai2_convo: { id: generateId('p2ai2'), title: "P2A2: Practice: Responding to 'No!'", description: "Your toddler shouts 'No!' when asked to clean up toys. How do you respond calmly and effectively to encourage cooperation?", type: 'conversational_response_practice', dialoguePrompt: 'Your toddler shouts "No!" when asked to clean. Your response?' } as ConversationalResponseActionItemContent,
};
const p2Checklists = {
  cl1: { id: generateId('p2cl1'), title: "P2C1: Checklist: Creating a Calm-Down Corner", description: "Set up a cozy space for your toddler to self-regulate.", type: 'generic_todo', items: [
    {id:generateId('chk'), text:'Soft rug or mat', itemType:'checkbox'}, 
    {id:generateId('chk'), text:'Pillows or cushions', itemType:'checkbox'}, 
    {id:generateId('chk'), text:'Calming toys (e.g., squishy ball, soft book)', itemType:'checkbox'},
    {id:generateId('chk'), text:'Does your child respond well to verbal redirection?', itemType:'multiple_choice_single', options: [{id:generateId('opt'),text:'Yes', value:1}, {id:generateId('opt'),text:'Sometimes',value:2}, {id:generateId('opt'),text:'Rarely',value:3}]}
  ]} as ChecklistType,
};
const p2OXQuizzes = {
  ox1: { id: generateId('p2ox1'), title: "P2OX1: Quiz: Toddler Discipline Myths", description: "Test your knowledge about common toddler discipline misconceptions.", questions: [ {id:generateId('oxq'), statement: "Ignoring tantrums makes them worse.", correctAnswer: false, explanation: "Strategic ignoring of certain behaviors (while ensuring safety) can sometimes be effective if the tantrum is for attention."}, {id:generateId('oxq'), statement: "Toddlers are intentionally manipulative when they misbehave.", correctAnswer: false, explanation: "Toddlers are still developing impulse control and emotional regulation; their behavior is often a sign of unmet needs or underdeveloped skills."}, {id:generateId('oxq'), statement: "Consistency is key in toddler discipline.", correctAnswer: true, explanation: "Consistent responses help toddlers understand expectations and boundaries, which provides security."}] } as OXQuizContent,
};
const p2PsychTests = {
  pt1: { id: generateId('p2pt1'), title: "P2PT1: Test: Your Default Discipline Style", description: "Understand your go-to discipline approach and its impact.", overallScoringMethod: 'average',
    factors: [ 
      {id:generateId('factor'), title: "Responsiveness", scoringMethod:'average', questions: [{id:generateId('q'), text:"When my child is upset, I try to understand their feelings before reacting.", options: defaultQuestionOptions()}], factorResultComments: [{id:generateId('frc'), scoreRange:[1,2], categoryLabel:'Low Responsiveness', comment:'Consider focusing more on emotional connection and validation during challenging moments.'}, {id:generateId('frc'), scoreRange:[3,5], categoryLabel:'High Responsiveness', comment:'You actively try to understand your child\'s feelings, which is great for connection.'}]}, 
      {id:generateId('factor'), title: "Demandingness", scoringMethod:'average', questions: [{id:generateId('q'), text:"I have clear expectations for my child's behavior and consistently enforce them.", options: defaultQuestionOptions()}], factorResultComments: [{id:generateId('frc'), scoreRange:[1,2], categoryLabel:'Low Demandingness', comment:'While warmth is important, clear and consistent expectations are also crucial for toddlers.'}, {id:generateId('frc'), scoreRange:[3,5], categoryLabel:'High Demandingness', comment:'Clear expectations are good; ensure they are age-appropriate and balanced with warmth.'}]} 
    ],
    overallResultComments: [
      {id:generateId('orc'), scoreRange:[1,2.5], categoryLabel:'More Permissive Tendencies', comment:'Your style leans towards being highly responsive but less demanding. Focus on setting loving limits consistently.'}, 
      {id:generateId('orc'), scoreRange:[2.6,3.5], categoryLabel:'Balanced Approach', comment:'You show a good balance of warmth and expectations. Keep up the great work!'}, 
      {id:generateId('orc'), scoreRange:[3.6,5], categoryLabel:'More Authoritarian Tendencies', comment:'Your style leans towards being highly demanding. Consider incorporating more warmth, understanding, and flexibility.'} 
    ]
  } as PsychologicalTestContent,
};
const p2QASessions = {
  qa1: { id: generateId('p2qa1'), title: "P2QA1: Session: Common Toddler Challenges Q&A", description: "Share and learn from common toddler parenting hurdles.", prompts: [{id:generateId('qap'), question:"What's your biggest challenge with your toddler this week?", answerPlaceholder:"Your thoughts..."}, {id:generateId('qap'), question:"Share one success story or positive moment with your toddler recently.", answerPlaceholder:"A win!"}, {id:generateId('qap'), question:"What specific support or advice are you seeking regarding toddler behavior?", answerPlaceholder:"I need help with..."}] } as QuestionAnswerSessionContent,
};
const p2MissionReminders = {
  mr1: { id: generateId('p2mr1'), title: "P2MR1: Mission: Daily Connection Time", missionTitle: "Connect with Your Toddler", missionDescription: "Spend 10 minutes of uninterrupted, focused playtime with your toddler each day this week, following their lead and interests." } as MissionReminderContent,
};

const program2ToddlerDiscipline: Program = {
  id: 'program2-toddler-time-positive-discipline', slug: 'toddler-time-positive-discipline', title: 'Toddler Time: Positive Discipline',
  description: 'Learn effective and positive strategies for navigating common toddler behaviors.',
  longDescription: 'This program focuses on understanding toddler development and applying positive discipline techniques to foster cooperation, manage tantrums, and build a strong parent-child bond. Explore practical tools and reflective exercises.',
  imageUrl: 'https://picsum.photos/seed/program2/600/400', targetAudience: 'Parents of toddlers (18 months - 3 years)',
  tags: ['toddler behavior', 'positive discipline', 'tantrums', 'parenting skills'],
  weeks: [
    { id: 'p2w1', weekNumber: 1, title: 'The Toddler Brain & Big Emotions', summary: 'Understand the "why" behind toddler behavior.',
      learningElements: [
        { id: generateId('le-p2w1-v1'), type: 'video', content: p2Videos.v1 },
        { id: generateId('le-p2w1-tc1'), type: 'text_content', content: p2TextContents.tc1 },
        { id: generateId('le-p2w1-ai1'), type: 'action_item', content: p2ActionItems.ai1_journal },
      ], sequentialCompletionRequired: true },
    { id: 'p2w2', weekNumber: 2, title: 'Tools for Positive Guidance', summary: 'Learn practical techniques for everyday challenges.',
      learningElements: [
        { id: generateId('le-p2w2-vcg1'), type: 'video_choice_group', content: { id: generateId('vcg-p2w2'), title: 'P2VCG1: Discipline Approaches (View All)', videos: [p2Videos.vcg1_v1, p2Videos.vcg1_v2, p2Videos.vcg1_v3], selectionRule: 'complete_all' } },
        { id: generateId('le-p2w2-cl1'), type: 'checklist', content: p2Checklists.cl1 },
        { id: generateId('le-p2w2-ox1'), type: 'ox_quiz', content: p2OXQuizzes.ox1 },
      ], sequentialCompletionRequired: true },
    { id: 'p2w3', weekNumber: 3, title: 'Real-Life Scenarios & Practice', summary: 'Apply your learning to common situations.',
      learningElements: [
        { id: 'p2le-s2', type: 'interactive_scenario_link', scenarioId: 'scenario2', title: 'P2IS1: Interactive: Mindful Response Practice' },
        { id: generateId('le-p2w3-pt1'), type: 'psychological_test', content: p2PsychTests.pt1 },
        { id: generateId('le-p2w3-ai1'), type: 'action_item', content: p2ActionItems.ai2_convo },
      ], sequentialCompletionRequired: true },
    { id: 'p2w4', weekNumber: 4, title: 'Building Connection & Long-Term Strategies', summary: 'Focus on relationship building and ongoing support.',
      learningElements: [
        { id: generateId('le-p2w4-v1'), type: 'video', content: p2Videos.v4 },
        { id: generateId('le-p2w4-qa1'), type: 'qa_session', content: p2QASessions.qa1 },
        { id: generateId('le-p2w4-mr1'), type: 'mission_reminder', content: p2MissionReminders.mr1 },
        { id: generateId('le-p2w4-tc1'), type: 'text_content', content: p2TextContents.tc2_resourcelink },
      ] },
  ]
};
// --- End Program 2 ---

// --- Start Program 3: Preschool Power: School Readiness ---
const p3Videos = {
  v1: createVideo("P3V1: Is My Preschooler Ready for School?", "Key indicators and areas to focus on for school readiness.", "p3v1"),
  v3: createVideo("P3V3: Fostering Independence in Preschoolers", "Practical tips for building self-help skills like dressing and eating.", "p3v3"),
  vcg1_v1: createVideo("P3VCG1V1: Building Early Literacy Skills", "Fun ways to introduce reading and writing concepts.", "p3vcg1v1"),
  vcg1_v2: createVideo("P3VCG1V2: Nurturing Social-Emotional Skills", "Preparing for group settings, sharing, and friendships.", "p3vcg1v2"),
  vcg1_v3: createVideo("P3VCG1V3: The Importance of Play in Learning", "How play supports cognitive and social development for school.", "p3vcg1v3"),
};
const p3Checklists = {
  cl1: { id: generateId('p3cl1'), title: "P3C1: Checklist: Preschool Readiness Skills", description: "Assess your child's development in key areas for preschool.", type: 'readiness_assessment', items: [
    {id:generateId('chk'), text:'Can use toilet independently', itemType:'checkbox'}, 
    {id:generateId('chk'), text:'Can dress self (mostly, e.g., pulls up pants, puts on shoes)', itemType:'checkbox'}, 
    {id:generateId('chk'), text:'Follows 2-step directions (e.g., "Pick up your toy and put it in the box.")', itemType:'checkbox'}, 
    {id:generateId('chk'), text:'Separates from parent without excessive distress', itemType:'checkbox'},
    {id:generateId('chk'), text:'Shows interest in other children and group activities', itemType:'multiple_choice_single', options: scaleQuestionOptions(['Rarely', 'Sometimes', 'Often'])},
    {id:generateId('chk'), text:'How well does your child communicate their needs?', itemType:'scale', options: scaleQuestionOptions(['Needs help', 'With gestures', 'With words', 'Clearly verbalizes', 'Very articulate'])},
  ]} as ChecklistType,
};
const p3ActionItems = {
  ai1_todo: { id: generateId('p3ai1'), title: "P3A1: To-Do: Preschool Prep Plan", description: "Outline concrete steps to prepare your child and family for preschool.", type: 'todo_list', todoItems: [{id: generateId('task'), text:'Visit potential preschools with your child.', progressScore: 0}, {id: generateId('task'), text:'Talk to your child about starting school in a positive way.', progressScore: 0}, {id: generateId('task'), text:'Practice a consistent morning routine.', progressScore: 0}] } as TodoListActionItemContent,
  ai2_dialogue: {
    id: generateId('p3ai2'), title: "P3A2: Dialogue: Talking to Your Child's Teacher", description: "Practice communicating effectively with educators about your child's needs.", type: 'dialogue_activity', dialoguePrompt: 'You have a concern about your child\'s social interaction at preschool. How do you approach the teacher for a constructive conversation?',
    dialogueChoices: [ {id:generateId('dc'), text:'Email the teacher immediately demanding action for the issue.', feedback:'This might put the teacher on the defensive. A collaborative approach is often better.'}, {id:generateId('dc'), text:'Schedule a brief, positive meeting to share your observations and ask for their perspective.', feedback:'Excellent! This is a constructive and collaborative way to address concerns and partner with the teacher.'}, {id:generateId('dc'), text:'Wait and see if the problem resolves itself over the next few weeks without talking to the teacher.', feedback:'While some issues resolve with time, proactive communication is usually best for early intervention and understanding.'} ],
  } as DialogueActivityActionItemContent,
};
const p3TextContents = {
  tc1_policy: { id: generateId('p3tc1'), title: "P3TC1: Mock Company Policy: Childcare Support Options", type: 'policy_info', content: "OurCompany provides various resources for employees seeking childcare, including preferred provider lists and dependent care FSA options. Refer to the internal HR portal for full details regarding eligibility and application processes.", audience: "All Employees", url: 'https://example.com/company-childcare-policy' } as TextContent,
  tc2_supportdoc: {id: generateId('p3tc2'), title: "P3TC2: Support Doc: Choosing a Preschool", type: 'support_document', content: "A guide with questions to ask and factors to consider when selecting a preschool for your child. Includes tips on visiting schools and assessing fit.", audience: "Parents of Preschoolers"} as TextContent,
};
const p3OXQuizzes = {
  ox1: { id: generateId('p3ox1'), title: "P3OX1: Quiz: Preschool Learning Facts", description: "Debunk common myths about preschool learning and development.", questions: [ {id:generateId('oxq'), statement:"Play is the primary way preschoolers learn and develop critical skills.", correctAnswer:true, explanation:"Play is crucial for cognitive, social, emotional, and physical development in preschoolers."}, {id:generateId('oxq'), statement:"Preschoolers should already know how to read and write before starting school.", correctAnswer:false, explanation:"Preschool is about developing pre-literacy skills, a love for books, and foundational concepts, not formal reading and writing instruction."}, {id:generateId('oxq'), statement:"Social skills are just as important as academic skills for school readiness.", correctAnswer:true, explanation:"Being able to interact with peers, share, follow group instructions, and manage emotions are vital for a successful school start."} ] } as OXQuizContent,
};
const p3MissionReminders = {
  mr1: { id: generateId('p3mr1'), title: "P3MR1: Mission: Read Together Daily", missionTitle: "Daily Reading Habit", missionDescription: "Read at least one age-appropriate book with your preschooler every day to foster a love of reading and build vocabulary." } as MissionReminderContent,
};
const p3QASessions = {
  qa1: { id: generateId('p3qa1'), title: "P3QA1: Session: Preschool Jitters & Joys", description: "Share experiences and tips about the transition to preschool.", prompts: [{id:generateId('qap'), question:"What are you most excited about for your child starting preschool?", answerPlaceholder:"My hopes and excitement..."}, {id:generateId('qap'), question:"What are your biggest worries or concerns about this transition?", answerPlaceholder:"My anxieties..."}, {id:generateId('qap'), question:"Share one tip or idea for a smooth transition to preschool that you've heard or plan to use.", answerPlaceholder:"A helpful strategy..."}] } as QuestionAnswerSessionContent,
};
const p3PsychTests = {
  pt1: { id: generateId('p3pt1'), title: "P3PT1: Test: Parent's School Readiness Mindset", description: "Explore your own feelings and expectations about your child starting school.", overallScoringMethod: 'average',
    factors: [ 
      {id:generateId('factor'), title: "Parental Separation Anxiety", scoringMethod:'average', questions:[{id:generateId('q'), text:"I feel anxious about my child being away from me at preschool.", options:defaultQuestionOptions()}, {id:generateId('q'), text:"I worry about how my child will cope without me.", options:defaultQuestionOptions()}], factorResultComments: [{id:generateId('frc'), scoreRange:[1,2], categoryLabel:'Low Anxiety', comment:'You seem comfortable and confident about the separation, which is helpful for your child.'}, {id:generateId('frc'), scoreRange:[3,5], categoryLabel:'High Anxiety', comment:'It\'s normal to feel some anxiety. This program offers strategies to manage these feelings for both you and your child.'}]}, 
      {id:generateId('factor'), title: "Confidence in Child's Abilities", scoringMethod:'average', questions:[{id:generateId('q'), text:"I am confident my child will adapt well to the preschool environment.", options:defaultQuestionOptions()}, {id:generateId('q'), text:"I believe my child has the necessary skills to succeed in preschool.", options:defaultQuestionOptions()}], factorResultComments: [{id:generateId('frc'), scoreRange:[1,2], categoryLabel:'Low Confidence', comment:'Let\'s explore ways to build your confidence in your child\'s readiness and abilities.'}, {id:generateId('frc'), scoreRange:[3,5], categoryLabel:'High Confidence', comment:'Your confidence in your child is a great asset for their transition to preschool!'}]} 
    ],
    overallResultComments: [
      {id:generateId('orc'), scoreRange:[1,2.5], categoryLabel:'Apprehensive Mindset', comment:'You may have some significant worries about this transition. Focus on building your confidence and your child\'s skills; this program will help.'}, 
      {id:generateId('orc'), scoreRange:[2.6,3.5], categoryLabel:'Neutral/Mixed Mindset', comment:'You have a balanced perspective with some excitement and some concerns. This is very common!'}, 
      {id:generateId('orc'), scoreRange:[3.6,5], categoryLabel:'Confident & Positive Mindset', comment:'Your positive outlook and confidence are wonderful for supporting your child through this new chapter!'}
    ]
  } as PsychologicalTestContent,
};

const program3PreschoolReadiness: Program = {
  id: 'program3-preschool-power-school-readiness', slug: 'preschool-power-school-readiness', title: 'Preschool Power: School Readiness',
  description: 'Prepare your child (and yourself!) for a successful and happy start to preschool.',
  longDescription: 'This program covers key developmental areas for preschool readiness, including social-emotional skills, independence, pre-literacy, and a positive mindset for both parent and child. Features practical checklists, activities, and expert advice.',
  imageUrl: 'https://picsum.photos/seed/program3/600/400', targetAudience: 'Parents of children preparing for preschool (3-5 years)',
  tags: ['preschool', 'school readiness', 'child development', 'social skills', 'independence'],
  companySpecificDocuments: [
    { id: generateId('csd-p3'), title: 'OurCompany Preschool Partnership Program', type: 'support_document', content: 'Information about OurCompany\'s partnerships with local preschools, including potential discounts or preferred enrollment.', audience: 'Employees with Preschoolers' }
  ],
  weeks: [
    { id: 'p3w1', weekNumber: 1, title: 'Getting Ready: Skills & Mindset', summary: 'Assess readiness and make a plan.',
      learningElements: [
        { id: generateId('le-p3w1-v1'), type: 'video', content: p3Videos.v1 },
        { id: generateId('le-p3w1-cl1'), type: 'checklist', content: p3Checklists.cl1 },
        { id: generateId('le-p3w1-ai1'), type: 'action_item', content: p3ActionItems.ai1_todo },
      ], sequentialCompletionRequired: true },
    { id: 'p3w2', weekNumber: 2, title: 'Fostering Key Abilities', summary: 'Focus on social skills, independence, and pre-literacy.',
      learningElements: [
        { id: generateId('le-p3w2-tc1'), type: 'text_content', content: p3TextContents.tc1_policy },
        { id: generateId('le-p3w2-tc2'), type: 'text_content', content: p3TextContents.tc2_supportdoc },
        { id: generateId('le-p3w2-ox1'), type: 'ox_quiz', content: p3OXQuizzes.ox1 },
        { id: generateId('le-p3w2-mr1'), type: 'mission_reminder', content: p3MissionReminders.mr1 },
      ], sequentialCompletionRequired: true },
    { id: 'p3w3', weekNumber: 3, title: 'Smooth Transitions & Communication', summary: 'Strategies for separation and talking with teachers.',
      learningElements: [
        { id: generateId('le-p3w3-v1'), type: 'video', content: p3Videos.v3 },
        { id: 'p3le-s1', type: 'interactive_scenario_link', scenarioId: 'scenario1', title: 'P3IS1: Interactive: Preschool Morning Routine Planner' },
        { id: generateId('le-p3w3-qa1'), type: 'qa_session', content: p3QASessions.qa1 },
      ], sequentialCompletionRequired: true },
    { id: 'p3w4', weekNumber: 4, title: 'Final Prep & Celebrating Milestones', summary: 'Review your journey and your child\'s growth, prepare for the big day.',
      learningElements: [
        { id: generateId('le-p3w4-pt1'), type: 'psychological_test', content: p3PsychTests.pt1 },
        { id: generateId('le-p3w4-vcg1'), type: 'video_choice_group', content: {id: generateId('vcg-p3w4'), title: 'P3VCG1: Key Readiness Areas (Choose 1 to review)', videos: [p3Videos.vcg1_v1, p3Videos.vcg1_v2, p3Videos.vcg1_v3], selectionRule: 'choose_one'} },
        { id: generateId('le-p3w4-ai1'), type: 'action_item', content: p3ActionItems.ai2_dialogue },
      ] },
  ]
};
// --- End Program 3 ---

export const mockPrograms: Program[] = [
  program1ReturningParent,
  program2ToddlerDiscipline,
  program3PreschoolReadiness,
];

export const mockUser: User = {
  id: 'user123',
  name: 'Alex Doe',
  email: 'alex.doe@example.com', 
  phoneNumber: '010-1234-5678', 
  avatarUrl: 'https://picsum.photos/seed/user123/100/100',
  children: [
    { id: 'child1', birthYear: 2022 },
  ],
  residentialArea: 'Seoul, Gangnam-gu',
  parentalRole: 'mother',
  moodLog: [
    { id: generateId('moodEntry'), date: generateRandomPastDateString(1), moodValue: 'happy', notes: 'Productive day at work and good playtime with baby.', activity: 'work', withWhom: 'child' },
    { id: generateId('moodEntry'), date: generateRandomPastDateString(2), moodValue: 'tired', notes: 'Feeling exhausted after a long week.', activity: 'rest', withWhom: 'alone' },
    { id: generateId('moodEntry'), date: generateRandomPastDateString(3), moodValue: 'worried', notes: 'Upcoming deadline at work is stressful.', activity: 'work', withWhom: 'colleague', customWithWhom: 'Project Team' },
  ], 
  userMissions: [
    {
      id: generateId('userMissionProg'),
      linkedProgramMissionId: 'mission-rem-content1', 
      title: 'Prioritize Daily Self-Care',
      description: 'Throughout this program, commit to at least 15 minutes of dedicated self-care each day.',
      progress: 5,
      isUserCreated: false
    },
    {
      id: generateId('userMissionCustom'),
      title: 'Read a parenting book chapter weekly',
      description: 'Finish "The Whole-Brain Child"',
      progress: 2,
      isUserCreated: true
    }
  ],
  customTodoLists: [
    {
      id: generateId('customTodo'),
      title: 'Household Tasks for the Week',
      description: 'Things to get done around the house.',
      type: 'todo_list',
      todoItems: [
        { id: generateId('customTask1'), text: 'Grocery shopping', progressScore: 0 },
        { id: generateId('customTask2'), text: 'Plan weekly meals', progressScore: 5 },
      ],
      isUserCreated: true,
    }
  ],
  programCompletions: [
    { programId: 'program1-returning-parent-infancy', completionDate: generateRandomPastDateString(10), satisfactionScore: 5 },
  ],
  registeredVouchers: [
    { voucherCode: 'PP1234', programId: 'program2-toddler-time-positive-discipline', accessExpiresDate: generateRandomFutureDateString(15), registeredDate: generateRandomPastDateString(5)},
  ],
  registrationDate: generateRandomDate(),
   customChecklists: [ 
    {
      id: generateId('usercl-program1-week1'),
      title: "My Week 1 Goals (Returning Parent)",
      description: "Personal goals for the first week back.",
      items: [
        { id: generateId('uitem'), text: "Arrange a backup childcare option discussion", itemType: 'checkbox', isChecked: false },
        { id: generateId('uitem'), text: "Meal prep for 3 days", itemType: 'checkbox', isChecked: true },
      ],
      type: 'generic_todo',
      isUserCreated: true,
      userId: 'user123',
      programId: 'program1-returning-parent-infancy',
      weekId: 'p1w1',
    }
  ],
  actionItemProgress: {
    'p1ai2': { 
        todoItemScores: {
            [(program1ReturningParent.weeks.find(w=>w.id==='p1w2')?.learningElements?.find(le => le.type === 'action_item' && (le.content as ActionItemContent).id === 'p1ai2')?.content as TodoListActionItemContent)?.todoItems[0]?.id || 'dummyId1'] : 3,
            [(program1ReturningParent.weeks.find(w=>w.id==='p1w2')?.learningElements?.find(le => le.type === 'action_item' && (le.content as ActionItemContent).id === 'p1ai2')?.content as TodoListActionItemContent)?.todoItems[1]?.id || 'dummyId2'] : 5,
        },
        isCompletedOverall: false,
    },
    'p1ai4': { 
        notes: "Feeling a bit overwhelmed but hopeful. I need to remember to be kind to myself during this transition.",
        isCompletedOverall: true,
    }
  },
  qaSessionResponses: {}, 
  psychTestResponses: {},
  oxQuizResponses: {},
  scenarioResponses: {},
};

export const mockUsers: User[] = [
  mockUser,
  {
    id: 'user456',
    name: 'Jamie Lee',
    email: 'jamie.lee@example.com', 
    phoneNumber: '010-9876-5432', 
    avatarUrl: 'https://picsum.photos/seed/user456/100/100',
    children: [
      { id: 'child3', birthYear: 2020 },
    ],
    residentialArea: 'Busan, Haeundae-gu',
    parentalRole: 'father',
    moodLog: [], 
    userMissions: [],
    customTodoLists: [],
    programCompletions: [
        { programId: 'program2-toddler-time-positive-discipline', completionDate: generateRandomPastDateString(20), satisfactionScore: 4 },
        { programId: 'program1-returning-parent-infancy', completionDate: generateRandomPastDateString(5), satisfactionScore: 4 },
    ],
    registeredVouchers: [],
    registrationDate: generateRandomDate(),
    qaSessionResponses: {},
    psychTestResponses: {},
    oxQuizResponses: {},
    scenarioResponses: {},
  },
  {
    id: 'user789',
    name: 'Chris P.',
    email: 'chris.p@example.com', 
    avatarUrl: 'https://picsum.photos/seed/user789/100/100',
    children: [
      { id: 'child4', birthYear: 2019 },
      { id: 'child5', birthYear: 2023 },
    ],
    residentialArea: 'Incheon, Yeonsu-gu',
    parentalRole: 'grandparent',
    moodLog: [], 
    userMissions: [],
    customTodoLists: [],
    programCompletions: [],
    registeredVouchers: [],
    registrationDate: generateRandomDate(),
    qaSessionResponses: {},
    psychTestResponses: {},
    oxQuizResponses: {},
    scenarioResponses: {},
  },
   {
    id: 'user101',
    name: 'Pat K.',
    email: 'pat.k@example.com', 
    avatarUrl: 'https://picsum.photos/seed/user101/100/100',
    children: [],
    residentialArea: 'Daegu, Suseong-gu',
    parentalRole: 'mother',
    moodLog: [], 
    userMissions: [],
    customTodoLists: [],
    programCompletions: [
        { programId: 'program3-preschool-power-school-readiness', completionDate: generateRandomPastDateString(15), satisfactionScore: 5 },
    ],
    registeredVouchers: [],
    registrationDate: generateRandomDate(),
    qaSessionResponses: {},
    psychTestResponses: {},
    oxQuizResponses: {},
    scenarioResponses: {},
  }
];


export const mockScenarios: InteractiveScenario[] = [
  {
    id: 'scenario1',
    title: 'Interactive: Planning Your Return to Work',
    description: 'A scenario to help you build your to-do list for returning to work.',
    startNodeId: 's1n1_welcome',
    nodes: [
      {
        id: 's1n1_welcome',
        type: 'message',
        text: "Welcome! This interactive scenario will help you think through key areas as you prepare to return to work. Let's start with how you're feeling.",
        nextNodeId: 's1n2_feeling_prompt',
        character: 'guide',
      },
      {
        id: 's1n2_feeling_prompt',
        type: 'reflection_prompt',
        text: 'Thinking about returning to work, what are the main emotions or thoughts that come to mind right now? (e.g., excited, anxious, overwhelmed, ready for a change)',
        nextNodeId: 's1n3_feeling_response',
        character: 'guide',
      },
      {
        id: 's1n3_feeling_response',
        type: 'message',
        text: "Thanks for sharing that. It's completely normal to have a mix of feelings. Recognizing them is a great first step.\n\nNow, let's talk about childcare. How would you rate your confidence in your current childcare arrangements?",
        nextNodeId: 's1n4_childcare_question',
        character: 'guide',
      },
      {
        id: 's1n4_childcare_question',
        type: 'question_single_choice',
        text: 'Childcare Confidence Level:',
        character: 'guide',
        options: [
          { id: 's1opt_cc_confident', text: 'Very confident, all sorted!', nextNodeId: 's1n5_household_intro' },
          { id: 's1opt_cc_somewhat', text: 'Somewhat confident, a few things to iron out.', nextNodeId: 's1n4b_childcare_todo_prompt' },
          { id: 's1opt_cc_not_confident', text: 'Not very confident, need to make significant progress.', nextNodeId: 's1n4b_childcare_todo_prompt' },
          { id: 's1opt_cc_overwhelmed', text: 'Feeling too overwhelmed by childcare to continue now.', endsScenario: true, feedback: "It's okay to pause if childcare feels overwhelming. Focus on this crucial step first. You can always come back to this scenario later." }
        ],
      },
      {
        id: 's1n4b_childcare_todo_prompt',
        type: 'reflection_prompt',
        text: "Okay, let's identify some action items for childcare. What are 1-2 specific tasks you need to do to feel more secure about your childcare plan? (e.g., 'Visit two more daycares,' 'Finalize contract with nanny,' 'Confirm backup care options').",
        nextNodeId: 's1n5_household_intro',
        character: 'guide',
      },
      {
        id: 's1n5_household_intro',
        type: 'message',
        text: "Great. Now, let's move on to household responsibilities. Often, routines and task divisions need to be re-evaluated when a parent returns to work.",
        nextNodeId: 's1n6_household_question',
        character: 'guide',
      },
      {
        id: 's1n6_household_question',
        type: 'question_single_choice',
        text: 'Have you and your partner (or support system) discussed how household chores and tasks will be managed once you return to work?',
        character: 'guide',
        options: [
          { id: 's1opt_hh_clear_plan', text: 'Yes, we have a clear plan and have divided tasks.', nextNodeId: 's1n7_work_communication_intro' },
          { id: 's1opt_hh_talked_vague', text: "We've talked a bit, but it's still quite vague.", nextNodeId: 's1n6b_household_todo_prompt' },
          { id: 's1opt_hh_not_yet', text: "No, we haven't discussed this specifically yet.", nextNodeId: 's1n6b_household_todo_prompt' },
        ],
      },
      {
        id: 's1n6b_household_todo_prompt',
        type: 'reflection_prompt',
        text: "This is an important conversation to have to ensure a smoother transition for everyone. What's one specific household area or task you can discuss and try to create a plan for this week? (e.g., 'Meal planning/prep,' 'Morning routine for getting everyone ready,' 'Evening clean-up')",
        nextNodeId: 's1n7_work_communication_intro',
        character: 'guide',
      },
      {
        id: 's1n7_work_communication_intro',
        type: 'message',
        text: "Excellent. Lastly, let's briefly touch on communication with your workplace. Are there any conversations you need to have with your manager or HR regarding your return, schedule, or any specific needs (e.g., pumping breaks if applicable)?",
        nextNodeId: 's1n8_work_comm_prompt',
        character: 'guide',
      },
       {
        id: 's1n8_work_comm_prompt',
        type: 'reflection_prompt',
        text: 'Jot down any key points or questions you need to discuss with your employer. Even if it\'s just a note to "Schedule a check-in with manager before return." This is your third interaction point where you provide input.',
        nextNodeId: 's1n9_summary',
        character: 'guide',
      },
      {
        id: 's1n9_summary',
        type: 'summary',
        text: "Fantastic! We've covered your initial feelings, childcare, household responsibilities, and workplace communication. Remember to transfer any action items you identified into your personal to-do list for this week's program. You're taking great steps to prepare!",
        character: 'guide',
      },
    ],
  },
  {
    id: 'scenario2',
    title: 'Interactive: Mindful Listening Practice',
    description: 'A short practice for mindful listening to connect with your child.',
    startNodeId: 's2n1',
    nodes: [
      {
        id: 's2n1',
        type: 'message',
        text: 'Welcome to mindful listening. This practice helps you connect more deeply with your child. First, find a comfortable, quiet space where you can be undisturbed for a few minutes.',
        nextNodeId: 's2n2',
        character: 'guide',
      },
      {
        id: 's2n2',
        type: 'reflection_prompt',
        text: 'Close your eyes if that feels comfortable. Take three slow, deep breaths. Notice the sensation of the air entering and leaving your body. When you\'re ready and feel a bit more settled, type "ready" or a similar word.',
        nextNodeId: 's2n3',
        character: 'guide',
      },
      {
        id: 's2n3',
        type: 'message',
        text: 'Now, bring to mind a recent interaction with your child, perhaps one where they were trying to tell you something. Try to recall it without judgment. What did you notice about their words? Their tone of voice? Their body language or facial expressions?',
        nextNodeId: 's2n4',
        character: 'guide',
      },
       {
        id: 's2n4',
        type: 'reflection_prompt',
        text: 'Jot down 1-2 things you recall noticing about your child during that interaction. What were they trying to communicate, beyond just their words?',
        nextNodeId: 's2n5',
        character: 'guide',
      },
      {
        id: 's2n5',
        type: 'summary',
        text: 'This is a simple start to mindful listening. Regular practice can make a big difference in understanding your child and strengthening your connection. You can journal more about your reflections or try this again after another interaction.',
        character: 'guide',
      },
    ],
  },
];

export const initialMockVouchers: Voucher[] = [
    {
        id: 'PP1234',
        code: 'PP1234',
        programId: 'program2-toddler-time-positive-discipline',
        programTitle: 'Toddler Time: Positive Discipline',
        registrationStartDate: generateRandomPastDateString(10),
        registrationEndDate: generateRandomFutureDateString(20),
        accessDurationDays: 30,
        status: 'active', 
        registeredByUserId: 'user123',
        registeredByUserName: 'Alex Doe',
        registeredDate: generateRandomPastDateString(5),
        accessExpiresDate: format(addDays(new Date(generateRandomPastDateString(5)), 30), 'yyyy-MM-dd'),
        createdAt: generateRandomPastDateString(40),
    },
    {
        id: 'AB5678',
        code: 'AB5678',
        programId: 'program1-returning-parent-infancy',
        programTitle: 'Stamp36: Returning Parent Program (Infancy)',
        registrationStartDate: generateRandomPastDateString(5),
        registrationEndDate: generateRandomFutureDateString(25),
        accessDurationDays: 60,
        status: 'available',
        createdAt: generateRandomPastDateString(30),
    },
    {
        id: 'EX0001',
        code: 'EX0001',
        programId: 'program3-preschool-power-school-readiness',
        programTitle: 'Preschool Power: School Readiness',
        registrationStartDate: generateRandomPastDateString(40),
        registrationEndDate: generateRandomPastDateString(10), 
        accessDurationDays: 30,
        status: 'available', 
        createdAt: generateRandomPastDateString(50),
    }
];

export const mockBanners: Banner[] = [
  {
    id: 'banner1',
    title: 'Welcome to Parenting Pathways!',
    description: 'Your journey to confident and joyful parenting starts here. Explore programs tailored to your child\'s age and your needs.',
    imageUrl: 'https://picsum.photos/seed/heroBanner1/1200/450',
    linkUrl: '/programs',
    order: 1,
    isActive: true,
  },
  {
    id: 'banner2',
    title: 'New Program: Toddler Adventures',
    description: 'Discover engaging activities and tips for your energetic toddler. Early bird discount available!',
    imageUrl: 'https://picsum.photos/seed/heroBanner2/1200/450',
    linkUrl: '/programs/toddler-time-positive-discipline', 
    order: 2,
    isActive: true,
  },
  {
    id: 'banner3',
    title: 'Expert Q&A Session Next Week',
    description: 'Join our live Q&A with Dr. Jane Smith on infant sleep patterns. Sign up now!',
    imageUrl: 'https://picsum.photos/seed/heroBanner3/1200/450',
    linkUrl: '/community/events', 
    order: 3,
    isActive: true,
  },
   {
    id: 'banner4-no-text',
    imageUrl: 'https://picsum.photos/seed/heroBanner4Nature/1200/450',
    linkUrl: '/about',
    order: 4,
    isActive: true,
  },
];


export const initialMockDiscussionsData = [
  { id: 'd1', programId: 'program1-returning-parent-infancy', program: 'Stamp36: Returning Parent Program (Infancy)', topic: 'Childcare anxieties', user: 'Alex Doe', date: '2024-07-20', snippet: 'I\'m feeling really anxious about finding reliable childcare...', status: 'active' },
  { id: 'd2', programId: 'program2-toddler-time-positive-discipline', program: 'Navigating Toddler Transitions', topic: 'Tantrum tips?', user: 'Jamie Lee', date: '2024-07-19', snippet: 'My toddler has been having major tantrums. Any advice?', status: 'active' },
  { id: 'd3', programId: 'program1-returning-parent-infancy', program: 'Stamp36: Returning Parent Program (Infancy)', topic: 'Balancing work and pumping', user: 'Chris P.', date: '2024-07-18', snippet: 'Looking for tips on how to manage pumping schedules once I\'m back in the office.', status: 'flagged' },
  { id: 'd4', programId: 'program3-preschool-power-school-readiness', program: 'Mindful Parenting for Preschoolers', topic: 'Mindful listening success story!', user: 'Pat K.', date: '2024-07-17', snippet: 'Tried the mindful listening exercise and it really helped connect with my preschooler!', status: 'resolved' },
];


if (typeof window !== 'undefined') {
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_PROGRAMS)) {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROGRAMS, JSON.stringify(mockPrograms));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_USERS)) {
     const usersWithDatesAndEmail = mockUsers.map(u => ({
        ...u, 
        email: u.email || `${u.name.toLowerCase().replace(/\s/g, '.')}@example.com`, 
        registrationDate: u.registrationDate || generateRandomDate(),
        moodLog: u.moodLog || [], 
    }));
    localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(usersWithDatesAndEmail));
  }
  if (!localStorage.getItem(BANNERS_STORAGE_KEY)) { 
    localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(mockBanners));
  }
  if(!localStorage.getItem(DISCUSSIONS_STORAGE_KEY)){
    localStorage.setItem(DISCUSSIONS_STORAGE_KEY, JSON.stringify(initialMockDiscussionsData));
  }
  if (!localStorage.getItem(VOUCHERS_STORAGE_KEY)) {
    localStorage.setItem(VOUCHERS_STORAGE_KEY, JSON.stringify(initialMockVouchers));
  }
}
    
    







