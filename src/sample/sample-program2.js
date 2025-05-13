// Sample program for testing: "Stamp36 첫 분리 프로그램 (영아기)"
// This file contains structured data for a program about first separation for parents of infants

const program2 = {
  title: 'Stamp36: 첫 분리 프로그램 (영아기)',
  slug: 'first-separation-infant',
  description: '영아를 처음으로 다른 사람에게 맡기고 분리하는 상황을 준비하는 부모를 위한 3주 프로그램',
  longDescription: '이 프로그램은 아이와의 첫 분리를 준비하는 영아기 부모님들을 위해 설계되었습니다. 분리 불안, 애착 관계, 안전한 양육 환경 조성, 그리고 신뢰할 수 있는 양육자 선택 방법 등에 대한 전문적인 지침을 제공합니다. 감정적, 실질적인 준비를 통해 부모와 아이 모두에게 긍정적인 경험이 될 수 있도록 돕습니다.',
  imageUrl: 'https://picsum.photos/seed/separation/600/400',
  targetAudience: '처음으로 영아(0-12개월)를 다른 사람에게 맡기려는 부모',
  paymentType: 'paid',
  price: 29.99,
  currency: 'USD',
  paymentLink: 'https://example.com/payment/first-separation',
  tags: ['분리 불안', '영아 케어', '애착 형성', '신뢰 구축', '양육자 선택'],
  companySpecificDocuments: [
    {
      title: '우리회사 임시 양육 지원 제도',
      type: 'policy_info',
      content: '긴급 상황 발생 시 회사에서 제공하는 임시 양육 지원 서비스와 혜택에 대한 안내.',
      audience: '영유아 자녀가 있는 직원'
    },
    {
      title: '신뢰할 수 있는 양육자 찾기 가이드',
      type: 'support_document',
      content: '좋은 보육사나 어린이집을 선택하는 방법과 체크리스트, 인터뷰 질문 등이 포함된 가이드.',
      audience: '모든 직원'
    }
  ],
  weeks: [
    {
      weekNumber: 1,
      title: '분리란 무엇인가?: 애착과 분리의 이해',
      summary: '건강한 애착과 분리의 기본 개념을 이해합니다.',
      sequentialCompletionRequired: true,
      learningElements: [
        {
          type: 'video',
          content: {
            title: '영아기 애착과 건강한 분리의 중요성',
            description: '영아와의 안정적인 애착 관계가 건강한 분리의 기반이 되는 이유를 설명합니다.',
            url: 'https://www.youtube.com/embed/sample5',
            duration: '9:30'
          }
        },
        {
          type: 'text_content',
          content: {
            title: '애착 이론과 영아 발달',
            type: 'article',
            content: '애착 이론의 기본 개념과 영아기 발달에 미치는 영향을 쉽게 설명합니다. 안정적인 애착이 형성된 아이들은 새로운 환경과 사람들에게 더 잘 적응할 수 있습니다. 부모의 일관된 반응과 정서적 지원이 중요한 이유를 과학적 근거와 함께 설명합니다.'
          }
        },
        {
          type: 'psychological_test',
          content: {
            title: '부모 분리 불안 자가 진단',
            description: '아이를 처음 떠나는 것에 대한 당신의 불안 수준을 평가합니다.',
            overallScoringMethod: 'average',
            factors: [
              {
                title: '분리에 대한 정서적 반응',
                scoringMethod: 'average',
                questions: [
                  { text: '아이와 떨어져 있을 때 지속적으로 걱정하게 됩니다.', options: Array.from({length: 5}, (_, i) => ({text: String(i+1), value: i+1})) },
                  { text: '다른 사람이 내 아이를 잘 돌볼 수 있을지 의심스럽습니다.', options: Array.from({length: 5}, (_, i) => ({text: String(i+1), value: i+1})) }
                ],
                factorResultComments: [
                  { scoreRange: [1, 2.5], categoryLabel: '낮은 불안', comment: '분리에 대한 정서적 반응이 균형적입니다. 이는 건강한 시작점입니다.' },
                  { scoreRange: [2.6, 3.5], categoryLabel: '중간 불안', comment: '약간의 불안을 경험하고 있으며, 이는 매우 정상적입니다. 이 프로그램이 도움이 될 것입니다.' },
                  { scoreRange: [3.6, 5], categoryLabel: '높은 불안', comment: '상당한 수준의 분리 불안을 느끼고 있습니다. 이 감정을 인정하고 단계적으로 접근하는 것이 중요합니다.' }
                ]
              },
              {
                title: '신뢰와 위임 능력',
                scoringMethod: 'average',
                questions: [
                  { text: '다른 사람에게 내 아이의 돌봄에 관한 결정을 맡기는 것이 어렵습니다.', options: Array.from({length: 5}, (_, i) => ({text: String(i+1), value: i+1})) },
                  { text: '내가 없을 때 아이에게 무슨 일이 생길까 두렵습니다.', options: Array.from({length: 5}, (_, i) => ({text: String(i+1), value: i+1})) }
                ],
                factorResultComments: [
                  { scoreRange: [1, 2.5], categoryLabel: '높은 신뢰', comment: '다른 사람들에게 돌봄을 위임하는 데 상대적으로 편안함을 느끼는 것 같습니다.' },
                  { scoreRange: [2.6, 3.5], categoryLabel: '중간 신뢰', comment: '돌봄을 위임하는 데 약간의 어려움이 있습니다. 천천히 신뢰를 쌓아가는 것이 도움이 될 것입니다.' },
                  { scoreRange: [3.6, 5], categoryLabel: '낮은 신뢰', comment: '돌봄을 다른 사람에게 맡기는 것에 상당한 어려움을 느끼고 있습니다. 작은 단계부터 시작해보세요.' }
                ]
              }
            ],
            overallResultComments: [
              { scoreRange: [1, 2.5], categoryLabel: '준비된 상태', comment: '아이와의 분리에 대해 비교적 준비가 잘 되어 있습니다. 이 프로그램을 통해 추가적인 전략을 배우고 자신감을 더욱 키울 수 있을 것입니다.' },
              { scoreRange: [2.6, 3.5], categoryLabel: '보통 준비 상태', comment: '일부 영역에서 불안을 느끼고 있지만, 이는 완전히 정상적인 반응입니다. 이 프로그램의 도구와 전략이 도움이 될 것입니다.' },
              { scoreRange: [3.6, 5], categoryLabel: '추가 지원 필요', comment: '분리에 대해 상당한 불안을 느끼고 있습니다. 이 프로그램의 단계별 접근법이 특히 유용할 것입니다. 필요하다면 추가적인 지원을 고려해보세요.' }
            ]
          }
        }
      ]
    },
    {
      weekNumber: 2,
      title: '분리 준비하기: 단계적 접근',
      summary: '실제적인 분리 준비 전략과 단계별 접근법을 배웁니다.',
      sequentialCompletionRequired: true,
      learningElements: [
        {
          type: 'video_choice_group',
          content: {
            title: '영아 연령별 분리 전략',
            videos: [
              {
                title: '0-6개월 영아의 분리 준비',
                description: '어린 영아와의 첫 분리를 위한 전략',
                url: 'https://www.youtube.com/embed/sample6a',
                duration: '8:45'
              },
              {
                title: '7-12개월 영아의 분리 준비',
                description: '낯가림이 시작된 영아와의 분리 전략',
                url: 'https://www.youtube.com/embed/sample6b',
                duration: '9:30'
              }
            ],
            selectionRule: 'choose_one'
          }
        },
        {
          type: 'checklist',
          content: {
            title: '분리 준비 체크리스트',
            description: '첫 분리 전 준비해야 할 사항들을 확인합니다.',
            type: 'readiness_assessment',
            items: [
              { text: '아이의 일상 루틴을 문서화했습니까?', itemType: 'checkbox' },
              { text: '양육자에게 아이의 선호도와 특성을 설명했습니까?', itemType: 'checkbox' },
              { text: '아이의 편안한 물건(인형, 담요 등)을 준비했습니까?', itemType: 'checkbox' },
              { text: '비상 연락망을 공유했습니까?', itemType: 'checkbox' },
              { text: '분리 전 얼마나 많은 시간을 양육자와 아이가 함께 보냈습니까?', itemType: 'multiple_choice_single', options: [
                {text: '없음', value: 1},
                {text: '1-2회 짧은 만남', value: 2},
                {text: '여러 번의 짧은 만남', value: 3},
                {text: '장시간 함께 보냄', value: 4}
              ]},
              { text: '얼마나 자주 아이를 다른 사람에게 맡겨봤습니까?', itemType: 'multiple_choice_single', options: [
                {text: '처음', value: 1},
                {text: '1-2번', value: 2},
                {text: '가끔', value: 3},
                {text: '자주', value: 4}
              ]}
            ]
          }
        },
        {
          type: 'action_item',
          content: {
            title: '단계적 분리 연습 계획',
            description: '첫 분리를 위한 단계별 연습 계획을 세웁니다.',
            type: 'todo_list',
            todoItems: [
              { text: '양육자가 있는 동안 짧게(15-30분) 아이와 떨어져 있기', progressScore: 0 },
              { text: '양육자와 아이만 집에 두고 근처에서 30분 보내기', progressScore: 0 },
              { text: '양육자와 아이만 1-2시간 두고 외출하기', progressScore: 0 },
              { text: '전화나 화상통화로 확인하며 반나절 분리 연습하기', progressScore: 0 }
            ]
          }
        },
        {
          type: 'ox_quiz',
          content: {
            title: '영아 분리에 관한 사실과 오해',
            description: '영아 분리에 관한 일반적인 믿음이 사실인지 오해인지 확인하세요.',
            questions: [
              {
                statement: '아이가 울지 않고 쉽게 부모와 헤어지면 애착이 약한 것이다.',
                correctAnswer: false,
                explanation: '아이들의 분리 반응은 다양하며, 울지 않는다고 해서 애착이 약한 것은 아닙니다. 안정적인 애착이 형성된 아이들은 오히려 새로운 상황에 더 잘 적응할 수 있습니다.'
              },
              {
                statement: '짧고 점진적인 분리 연습이 아이의 적응에 도움이 된다.',
                correctAnswer: true,
                explanation: '단계적인 분리 연습은 아이가 부모의 부재와 귀환을 경험하며 안정감을 형성하는 데 도움이 됩니다.'
              },
              {
                statement: '영아는 부모가 없어도 금방 잊고 놀기 때문에 걱정할 필요가 없다.',
                correctAnswer: false,
                explanation: '영아도 부모의 부재를 인식하며, 객체영속성(물체가 보이지 않아도 존재한다는 개념)은 생후 8개월 경부터 발달합니다. 아이의 감정을 존중하는 것이 중요합니다.'
              }
            ]
          }
        }
      ]
    },
    {
      weekNumber: 3,
      title: '믿을 수 있는 양육자 선택과 관계 구축',
      summary: '신뢰할 수 있는 양육자를 선택하고 긍정적인 관계를 구축하는 방법을 배웁니다.',
      sequentialCompletionRequired: true,
      learningElements: [
        {
          type: 'video',
          content: {
            title: '신뢰할 수 있는 양육자의 특성',
            description: '좋은 양육자를 찾고 평가하는 방법',
            url: 'https://www.youtube.com/embed/sample7',
            duration: '10:15'
          }
        },
        {
          type: 'text_content',
          content: {
            title: '양육자 인터뷰 가이드',
            type: 'support_document',
            content: '보육사나 어린이집을 인터뷰할 때 물어봐야 할 핵심 질문들과 확인해야 할 사항들을 포함합니다. 경험, 자격증, 응급처치 훈련, 양육 철학 등에 관한 질문과 참고인 체크 방법, 안전 확인 사항 등이 포함되어 있습니다.'
          }
        },
        {
          type: 'action_item',
          content: {
            title: '양육자와의 원활한 소통 연습',
            description: '양육자와 효과적으로 소통하는 방법을 연습합니다.',
            type: 'dialogue_activity',
            dialoguePrompt: '양육자에게 당신의 아이의 특별한 요구사항이나 선호도를 어떻게 전달하시겠습니까?',
            dialogueChoices: [
              { 
                text: '자세한 문서로 모든 것을 적어 전달한다', 
                feedback: '문서화는 중요하지만, 너무 많은 정보는 부담될 수 있습니다. 핵심 정보를 간결하게 전달하고, 필요시 참고할 수 있는 상세 문서를 준비하세요.' 
              },
              { 
                text: '직접 만나서 아이의 습관과 루틴을 보여주며 설명한다', 
                feedback: '실제 시연과 함께하는 대화는 매우 효과적입니다. 양육자가 직접 보고 연습할 기회를 제공하세요.' 
              },
              { 
                text: '중요한 몇 가지만 말하고 나머지는 양육자의 방식을 존중한다', 
                feedback: '핵심 사항 위주의 소통과 유연성은 좋은 균형입니다. 단, 건강이나 안전과 관련된 중요한 정보는 반드시 공유해야 합니다.' 
              }
            ]
          }
        },
        {
          type: 'interactive_scenario_link',
          scenarioId: 'scenario3',
          title: '인터랙티브: 첫 분리 날 시뮬레이션'
        },
        {
          type: 'mission_reminder',
          content: {
            title: '미션: 긍정적인 분리 연습',
            missionTitle: '일주일간의 점진적 분리 연습',
            missionDescription: '이번 주에 계획한 단계적 분리 연습을 실천하고, 각 경험 후 아이와 본인의 반응을 기록해보세요.'
          }
        }
      ]
    },
    {
      weekNumber: 4,
      title: '분리 후: 재결합과 성장',
      summary: '분리 후 건강한 재결합 방법과 지속적인 관계 발전 전략을 배웁니다.',
      learningElements: [
        {
          type: 'video',
          content: {
            title: '건강한 재결합 의식 만들기',
            description: '아이와 다시 만날 때 긍정적인 경험을 만드는 방법',
            url: 'https://www.youtube.com/embed/sample8',
            duration: '7:55'
          }
        },
        {
          type: 'action_item',
          content: {
            title: '우리 가족만의 재결합 의식 만들기',
            description: '아이와 다시 만날 때 사용할 특별한 인사, 노래, 또는 활동을 계획해보세요.',
            type: 'journal_prompt'
          }
        },
        {
          type: 'qa_session',
          content: {
            title: '분리 경험 성찰과 나눔',
            description: '첫 분리 경험에 대한 생각과 감정을 나누고 다른 부모들의 경험을 배웁니다.',
            prompts: [
              {
                question: '첫 분리에서 예상보다 더 잘 된 것은 무엇이었나요?',
                answerPlaceholder: '긍정적인 경험...'
              },
              {
                question: '가장 어려웠던 순간은 언제였으며, 어떻게 대처하셨나요?',
                answerPlaceholder: '어려움과 대처법...'
              },
              {
                question: '다른 부모에게 첫 분리에 관해 한 가지 조언을 준다면 무엇인가요?',
                answerPlaceholder: '나의 조언...'
              }
            ]
          }
        },
        {
          type: 'text_content',
          content: {
            title: '양육자와의 장기적 파트너십 구축',
            type: 'article',
            content: '아이의 발달에 함께 기여하는 파트너로서 양육자와 건강한 관계를 유지하는 방법. 정기적인 소통, 감사 표현, 피드백 주고받기, 명확한 경계 설정 등의 전략을 포함합니다.'
          }
        }
      ]
    }
  ]
};

// Export the program for use in the application
export default program2; 