// Sample program for testing: "Stamp36 복직하는 부모 프로그램 (영아기)"
// This file contains structured data for a program about returning to work for parents of infants

const program1 = {
  title: 'Stamp36: 복직하는 부모 프로그램 (영아기)',
  slug: 'returning-parent-infant',
  description: '영아를 둔 부모가 안정적으로 직장 복귀를 할 수 있도록 지원하는 4주 프로그램',
  longDescription: '이 프로그램은 영아를 둔 부모가 직장에 복귀할 때 겪을 수 있는 감정적, 실질적 어려움을 다룹니다. 준비도 평가, 행동 계획, 자녀 적응, 개인 동기 발견 등을 포함하여 포괄적인 지원을 제공합니다. 맞춤형 활동과 기업별 리소스가 포함되어 있습니다.',
  imageUrl: 'https://picsum.photos/seed/returnwork/600/400',
  targetAudience: '직장에 복귀하는 영아(0-12개월) 부모',
  paymentType: 'free',
  tags: ['직장 복귀', '영아 케어', '워라밸', '기업', '육아휴직'],
  companySpecificDocuments: [
    {
      title: '우리회사 육아휴직 가이드라인',
      type: 'policy_info',
      content: '우리회사의 육아휴직 정책에 대한 상세 내용, 기간, 급여, 복귀 지원 등 포함.',
      audience: '전 직원'
    },
    {
      title: '복직 준비 체크리스트',
      type: 'support_document',
      content: '복직 전 확인해야 할 사항들과 필요한 서류, 절차 등에 관한 안내.',
      audience: '육아휴직 복귀 예정자'
    }
  ],
  weeks: [
    {
      weekNumber: 1,
      title: '복직하는 마음, 얼마나 준비되었나요?',
      summary: '복직 준비도를 평가하고 주요 영역을 식별합니다.',
      sequentialCompletionRequired: true,
      learningElements: [
        {
          type: 'video',
          content: {
            title: '복직하는 마음, 얼마나 준비되었나요?',
            description: '복직에 대한 정신적, 감정적 준비 상태를 점검합니다.',
            url: 'https://www.youtube.com/embed/sample1',
            duration: '8:45'
          }
        },
        {
          type: 'checklist',
          content: {
            title: '복직 준비도 검사',
            description: '다양한 영역에서의 복직 준비도를 평가합니다.',
            type: 'readiness_assessment',
            items: [
              { text: '양육 대안이 확정되었습니까?', itemType: 'checkbox', category: '양육' },
              { text: '가사 분담에 대해 논의했습니까?', itemType: 'checkbox', category: '가정' },
              { text: '고용주와 업무 일정을 명확히 했습니까?', itemType: 'checkbox', category: '업무' },
              { text: '파트너와 역할 분담에 대해 이야기 했습니까?', itemType: 'checkbox', category: '파트너십' },
              { text: '자신의 건강 관리 계획이 있습니까?', itemType: 'checkbox', category: '건강' },
              { text: '양육에 대해 얼마나 걱정하고 계신가요?', itemType: 'multiple_choice_single', category: '걱정 정도', options: [
                {text: '전혀 걱정 없음', value: 1},
                {text: '약간 걱정됨', value: 2},
                {text: '매우 걱정됨', value: 3}
              ]},
              { text: '현재 에너지 수준을 평가해주세요(1=낮음, 5=높음)', itemType: 'scale', category: '웰빙', options: [
                {text: '매우 낮음', value: 1},
                {text: '낮음', value: 2},
                {text: '보통', value: 3},
                {text: '높음', value: 4},
                {text: '매우 높음', value: 5}
              ]}
            ]
          }
        },
        {
          type: 'mission_reminder',
          content: {
            title: '미션: 일일 연결',
            missionTitle: '아이와 매일 연결하기 (영아기)',
            missionDescription: '이번 주에 매일 15분간 영아와 집중적이고 방해받지 않는 질 높은 시간을 보내세요.'
          }
        }
      ]
    },
    {
      weekNumber: 2,
      title: '복직 준비 유형 별 무엇을 준비해야할까요?',
      summary: '개인화된 할 일 목록을 만들고 대화를 연습합니다.',
      sequentialCompletionRequired: true,
      learningElements: [
        {
          type: 'video',
          content: {
            title: '복직 준비 유형 별 무엇을 준비해야할까요?',
            description: '준비도 평가를 기반으로 한 실행 가능한 단계.',
            url: 'https://www.youtube.com/embed/sample2',
            duration: '10:22'
          }
        },
        {
          type: 'action_item',
          content: {
            title: '나는 무엇을 준비해야할까요?: 나의 to do 만들기',
            description: '준비해야 할 구체적인 작업을 나열하세요.',
            type: 'todo_list',
            todoItems: [
              { text: '양육 일정 확정하기', progressScore: 0 },
              { text: '출근할 때 입을 옷 준비하기', progressScore: 0 },
              { text: '점심 식사 계획 세우기', progressScore: 0 },
              { text: '업무 우선순위 목록 만들기', progressScore: 0 }
            ]
          }
        },
        {
          type: 'interactive_scenario_link',
          scenarioId: 'scenario1',
          title: '인터랙티브: 복직 계획 세우기'
        },
        {
          type: 'psychological_test',
          content: {
            title: '복직 스트레스 평가',
            description: '복직 준비 중 잠재적 스트레스 영역을 식별하는 데 도움이 되는 테스트입니다.',
            overallScoringMethod: 'average',
            factors: [
              {
                title: '양육 스트레스',
                scoringMethod: 'average',
                questions: [
                  { text: '일하는 동안 아이가 잘 돌봐질 것이라고 확신합니다.', options: Array.from({length: 5}, (_, i) => ({text: String(i+1), value: i+1})) },
                  { text: '양육 방식을 마련하고 관리하는 것이 압도적으로 느껴집니다.', options: Array.from({length: 5}, (_, i) => ({text: String(i+1), value: i+1})) }
                ],
                factorResultComments: [
                  { scoreRange: [1, 2.5], categoryLabel: '낮은 스트레스', comment: '양육 준비가 잘 되어 있어 스트레스가 크게 줄어든 것 같습니다.' },
                  { scoreRange: [2.6, 3.5], categoryLabel: '중간 스트레스', comment: '양육에 관한 몇 가지 우려나 세부 사항이 있을 수 있습니다. 이에 집중하세요.' },
                  { scoreRange: [3.6, 5], categoryLabel: '높은 스트레스', comment: '양육은 주요 스트레스 요인입니다. 이 영역에서 지원을 구하세요.' }
                ]
              },
              {
                title: '업무량 관리 스트레스',
                scoringMethod: 'average',
                questions: [
                  { text: '복귀 시 직무 책임을 효과적으로 관리하는 것에 대해 걱정됩니다.', options: Array.from({length: 5}, (_, i) => ({text: String(i+1), value: i+1})) },
                  { text: '일정과 업무량에 관한 나의 필요와 경계를 직장에서 소통할 준비가 되어 있습니다.', options: Array.from({length: 5}, (_, i) => ({text: String(i+1), value: i+1})) }
                ],
                factorResultComments: [
                  { scoreRange: [1, 2.5], categoryLabel: '낮은 스트레스', comment: '업무량을 관리하고 효과적으로 소통할 수 있는 능력에 자신감이 있는 것 같습니다.' },
                  { scoreRange: [2.6, 3.5], categoryLabel: '중간 스트레스', comment: '업무량에 대한 우려가 있을 수 있습니다. 사전 소통과 계획이 중요합니다.' },
                  { scoreRange: [3.6, 5], categoryLabel: '높은 스트레스', comment: '업무 책임 관리가 주요 스트레스 원인입니다. 우선순위 지정과 소통 전략에 집중하세요.' }
                ]
              }
            ],
            overallResultComments: [
              { scoreRange: [1, 2.5], categoryLabel: '전반적으로 낮은 스트레스', comment: '직장 복귀와 관련된 전반적인 스트레스 수준이 상대적으로 낮습니다. 계속해서 강점과 준비성을 키우세요.' },
              { scoreRange: [2.6, 3.5], categoryLabel: '중간 수준의 스트레스', comment: '중간 정도의 스트레스를 경험하고 있습니다. 요인 결과에서 구체적인 우려 영역을 파악하고 이 프로그램에서 제공하는 전략에 집중하세요.' },
              { scoreRange: [3.6, 5], categoryLabel: '높은 스트레스 수준', comment: '직장 복귀가 상당한 스트레스의 원천인 것 같습니다. 모든 지원과 전략을 활용하는 것이 중요합니다. 이 프로그램은 이러한 과제를 탐색하는 데 도움이 되도록 설계되었습니다.' }
            ]
          }
        }
      ]
    },
    {
      weekNumber: 3,
      title: '아이는 괜찮을까요?: 양육과 관계',
      summary: '원활한 양육 전환과 유대 관계 유지를 확보합니다.',
      sequentialCompletionRequired: true,
      learningElements: [
        {
          type: 'video_choice_group',
          content: {
            title: '중점 영역 (하나 선택)',
            videos: [
              {
                title: '복직 시 양육 방법',
                description: '다양한 양육 옵션과 전환 탐색.',
                url: 'https://www.youtube.com/embed/sample3a',
                duration: '9:15'
              },
              {
                title: '일과 가정의 균형 전략',
                description: '일과 가정 생활 관리를 위한 팁.',
                url: 'https://www.youtube.com/embed/sample3b',
                duration: '8:30'
              },
              {
                title: '고용주와 소통하기',
                description: '필요와 기대를 효과적으로 논의합니다.',
                url: 'https://www.youtube.com/embed/sample3c',
                duration: '7:45'
              }
            ],
            selectionRule: 'choose_one'
          }
        },
        {
          type: 'checklist',
          content: {
            title: '복직 전, 아이와의 관계 점검',
            description: '현재 아이와의 관계를 평가하고 복직 전 개선할 영역을 찾습니다.',
            type: 'child_relationship_assessment',
            items: [
              { text: '아이와 하루에 얼마나 많은 시간을 보내십니까?', itemType: 'multiple_choice_single', options: [
                {text: '1시간 미만', value: 1},
                {text: '1-3시간', value: 2},
                {text: '3-5시간', value: 3},
                {text: '5시간 이상', value: 4}
              ]},
              { text: '아이가 울 때 얼마나 빨리 반응하십니까?', itemType: 'scale', options: [
                {text: '매우 느림', value: 1},
                {text: '느림', value: 2},
                {text: '보통', value: 3},
                {text: '빠름', value: 4},
                {text: '매우 빠름', value: 5}
              ]},
              { text: '아이의 기본 일정을 다른 보호자가 알고 있습니까?', itemType: 'checkbox' },
              { text: '아이가 다른 보호자와 편안하게 지내는 연습을 했습니까?', itemType: 'checkbox' }
            ]
          }
        },
        {
          type: 'action_item',
          content: {
            title: '가장 걱정 되는 부분 대비하기',
            description: '불안 요소에 대비한 대화형 활동',
            type: 'dialogue_activity',
            dialoguePrompt: '아이를 떠나 일하러 갈 때 가장 걱정되는 상황은?',
            dialogueChoices: [
              { 
                text: '아이가 나를 잊거나 낯설어하는 것', 
                feedback: '이는 많은 부모의 걱정이지만, 일관된 루틴과 짧지만 질 높은 상호작용으로 유대를 유지할 수 있습니다.' 
              },
              { 
                text: '내가 중요한 발달 순간을 놓치는 것', 
                feedback: '사진과 비디오를 통해 보호자와 소통하고, 집에 있을 때 온전히 함께하는 데 집중하세요.' 
              },
              { 
                text: '양육자가 내 지시를 따르지 않는 것', 
                feedback: '명확한 안내서를 작성하고 정기적인 체크인을 설정하여 소통 채널을 개방하세요.' 
              }
            ]
          }
        },
        {
          type: 'ox_quiz',
          content: {
            title: '퀴즈: 직장 복귀 부모를 위한 정책',
            description: '일반적인 직장 정책에 대한 지식을 테스트하세요.',
            questions: [
              {
                statement: '유연한 근무 형태는 대부분의 회사에서 복귀하는 모든 부모에게 법적으로 보장됩니다.',
                correctAnswer: false,
                explanation: '정책은 회사와 지역에 따라 크게 다릅니다. 귀하의 특정 회사 정책을 확인하는 것이 중요합니다.'
              },
              {
                statement: '모유 수유 중인 어머니는 업무 시간 중 유축을 위한 시간과 공간에 대한 법적 권리가 있습니다.',
                correctAnswer: true,
                explanation: '많은 국가에서 고용주는 모유 수유 중인 어머니에게 합리적인 유축 편의를 제공해야 합니다.'
              }
            ]
          }
        }
      ]
    },
    {
      weekNumber: 4,
      title: '왜 나에게 일이 필요할까?: 동기 찾기',
      summary: '당신의 동기와 가치와 재연결합니다.',
      learningElements: [
        {
          type: 'video',
          content: {
            title: '왜 나에게 일이 필요할까?',
            description: '당신의 동기와 가치와 재연결합니다.',
            url: 'https://www.youtube.com/embed/sample4',
            duration: '11:05'
          }
        },
        {
          type: 'action_item',
          content: {
            title: '업무에 대한 나의 동기와 가치 찾기',
            description: '당신의 직업적 동기를 탐색하는 활동',
            type: 'dialogue_activity',
            dialoguePrompt: '직장 복귀의 가장 중요한 이유는 무엇입니까?',
            dialogueChoices: [
              { 
                text: '경제적 안정과 가족 지원', 
                feedback: '재정적 동기는 실용적이고 중요합니다. 이것이 어떻게 가족의 장기적 목표에 기여하는지 생각해보세요.' 
              },
              { 
                text: '경력 성장과 개인적 성취', 
                feedback: '자기 개발은 강력한 동기입니다. 이는 아이에게도 성장 마인드셋의 롤모델이 됩니다.' 
              },
              { 
                text: '사회적 연결과 성인 상호작용', 
                feedback: '인간 관계는 정신 건강에 필수적입니다. 건강한 사회적 연결을 유지하면 더 충만한 부모가 될 수 있습니다.' 
              }
            ]
          }
        },
        {
          type: 'action_item',
          content: {
            title: '일이 버겁다고 느껴질 때 나에게 보내는 메세지',
            description: '복귀 후 일이 부담스러울 때를 위한 지지 메시지를 작성하세요.',
            type: 'journal_prompt'
          }
        },
        {
          type: 'text_content',
          content: {
            title: '복직한 부모 이렇게 도움받으세요',
            type: 'article',
            content: '직장에 복귀한 후 첫 주를 원활하게 보내기 위한 팁과 요령. 경계 설정, 기대치 관리, 자기 관리에 중점을 둡니다. 비상 상황을 위한 백업 계획을 항상 준비하고, 회사의 지원 서비스를 활용하세요.'
          }
        },
        {
          type: 'text_content',
          content: {
            title: '우리회사 가정복지제도 소개',
            type: 'policy_info',
            content: '회사에서 제공하는 가족 친화적인 정책과 혜택에 대한 상세 정보. 유연 근무제, 재택근무 옵션, 긴급 돌봄 휴가 등이 포함됩니다.'
          }
        },
        {
          type: 'qa_session',
          content: {
            title: '최종 성찰: 직장 복귀',
            description: '당신의 여정과 준비 상태를 성찰하세요.',
            prompts: [
              {
                question: '이 프로그램에서 달성한 것 중 가장 자랑스러운 점은 무엇입니까?',
                answerPlaceholder: '당신의 생각...'
              },
              {
                question: '직장에 복귀할 때 반드시 사용할 한 가지 전략은 무엇입니까?',
                answerPlaceholder: '나의 핵심 전략...'
              }
            ]
          }
        }
      ]
    }
  ]
};

// Export the program for use in the application
export default program1; 