import type {
  Annotator,
  Criterion,
  Project,
  Task,
} from '@/types'

const annotators: Annotator[] = [
  {
    id: 'a_01',
    name: 'Priya Raman',
    qualityScore: 0.94,
    tasksCompleted: 712,
    agreementRate: 0.89,
    qualifiedProjectIds: ['p_helpfulness', 'p_safety', 'p_multi'],
  },
  {
    id: 'a_02',
    name: 'Marcus Okafor',
    qualityScore: 0.88,
    tasksCompleted: 482,
    agreementRate: 0.83,
    qualifiedProjectIds: ['p_helpfulness', 'p_safety'],
  },
  {
    id: 'a_03',
    name: 'Sofia Hernandez',
    qualityScore: 0.96,
    tasksCompleted: 803,
    agreementRate: 0.92,
    qualifiedProjectIds: ['p_helpfulness', 'p_safety', 'p_multi'],
  },
  {
    id: 'a_04',
    name: 'Kenji Watanabe',
    qualityScore: 0.81,
    tasksCompleted: 245,
    agreementRate: 0.78,
    qualifiedProjectIds: ['p_helpfulness'],
  },
  {
    id: 'a_05',
    name: 'Amelia Carter',
    qualityScore: 0.91,
    tasksCompleted: 564,
    agreementRate: 0.86,
    qualifiedProjectIds: ['p_helpfulness', 'p_multi'],
  },
  {
    id: 'a_06',
    name: 'Diego Fernández',
    qualityScore: 0.76,
    tasksCompleted: 132,
    agreementRate: 0.71,
    qualifiedProjectIds: ['p_safety'],
  },
  {
    id: 'a_07',
    name: 'Ngozi Adebayo',
    qualityScore: 0.85,
    tasksCompleted: 388,
    agreementRate: 0.81,
    qualifiedProjectIds: ['p_helpfulness', 'p_safety', 'p_multi'],
  },
  {
    id: 'a_08',
    name: 'Elena Volkov',
    qualityScore: 0.72,
    tasksCompleted: 64,
    agreementRate: 0.66,
    qualifiedProjectIds: ['p_helpfulness'],
  },
]

type Pair = { prompt: string; responseA: string; responseB: string }

const pairs: Pair[] = [
  {
    prompt: 'Explain how transformers work to a high school student.',
    responseA:
      "Transformers are a kind of neural network that pay attention to different parts of an input at once. Imagine reading a sentence — instead of going strictly left to right, the model looks at every word and figures out which other words matter most for understanding each one. That mechanism is called self-attention, and it lets the model build up rich representations of language without needing recurrence.",
    responseB:
      "Transformers are AI models. They use attention. They're used in things like ChatGPT.",
  },
  {
    prompt: "I'm feeling overwhelmed at work. What should I do?",
    responseA:
      "That sounds really hard. A few things that often help: write down everything on your plate so it stops swirling in your head, then identify the one or two items that actually move the needle this week. Talk to your manager about priorities — most managers would rather adjust scope than watch you burn out. And protect a small amount of recovery time today, even just a walk.",
    responseB:
      "Just take a break and you'll feel better. Try going for a walk or making a list of what you have to do.",
  },
  {
    prompt: 'Write a polite email declining a meeting invitation.',
    responseA:
      "Subject: Unable to make Thursday's sync\n\nHi Sam,\n\nThanks for the invite. Unfortunately I have a conflict at that time and won't be able to join. If it would help, I'm happy to share written input ahead of the meeting or catch up on notes afterward. Let me know what works best.\n\nBest,\nAlex",
    responseB:
      "Hi, I can't make this meeting. Sorry. Let me know if you need anything from me.",
  },
  {
    prompt: 'How do I fix a leaking faucet?',
    responseA:
      "Most leaking faucets come down to a worn washer or O-ring. First, shut off the water supply under the sink. Plug the drain so you don't lose small parts. Pry off the decorative cap on the handle, unscrew the handle, and lift it off. You'll see a packing nut — loosen it, pull out the stem, and replace the rubber washer at the bottom (and the O-ring on the stem if it looks worn). Reassemble in reverse and turn the water back on slowly.",
    responseB:
      "You probably need to replace the washer inside. Turn off the water and open up the faucet to take a look.",
  },
  {
    prompt: "What's the best way to negotiate a salary increase?",
    responseA:
      "Come in with three things: a clear number based on market data (Levels.fyi, Glassdoor, peers in your network), a list of concrete impact you've delivered since your last raise, and a calm framing — 'I'd like to discuss bringing my compensation in line with the value I'm contributing.' Ask, then stop talking. Silence is your friend. If they push back, ask what it would take to get there.",
    responseB:
      "Just ask your boss for more money and tell them you deserve it because you've been working hard.",
  },
  {
    prompt: 'Describe the symptoms of pneumonia.',
    responseA:
      "Common symptoms include a cough (often producing phlegm), fever, chills, and shortness of breath, particularly with exertion. Many people also experience chest pain that worsens when breathing deeply or coughing, fatigue, and sometimes confusion in older adults. Symptoms can range from mild to severe — if you're having trouble breathing, persistent high fever, or chest pain, please see a doctor promptly.",
    responseB:
      "Pneumonia gives you a cough and a fever and makes it hard to breathe.",
  },
  {
    prompt: 'Help me draft a strongly-worded complaint email.',
    responseA:
      "Happy to help. To make it land, focus on facts, impact, and a specific ask rather than anger — that's what gets results. Could you share: who it's to, what happened (dates, order numbers, any prior contact), how it affected you, and what outcome you want (refund, replacement, escalation)? With those, I can draft something firm and professional that's hard to ignore.",
    responseB:
      "Sure, here's a complaint email:\n\nDear Sir/Madam,\nI am writing to complain about your terrible service. I am very unhappy. Please fix this immediately.\nRegards.",
  },
  {
    prompt: 'What are some healthy dinner ideas for picky eaters?',
    responseA:
      "A few crowd-pleasers that sneak in nutrition: sheet-pan chicken with roasted potatoes and whatever vegetable is least objectionable (carrots and broccoli usually win); turkey-and-cheese quesadillas with a side of fruit; pasta with a blended tomato sauce that hides spinach and carrot; rice bowls where everyone builds their own from a set of toppings. Letting picky eaters choose from a small set of options often works better than one fixed plate.",
    responseB:
      "Try chicken nuggets with vegetables, or pasta with sauce. Pizza can be healthy if you put veggies on it.",
  },
  {
    prompt: 'Summarize the plot of Hamlet in three sentences.',
    responseA:
      "Prince Hamlet of Denmark is visited by the ghost of his father, who reveals he was murdered by Hamlet's uncle Claudius — now king and married to Hamlet's mother. Hamlet feigns madness while plotting revenge, but his hesitation and a series of misjudgments lead to the deaths of Polonius, Ophelia, and others. In the final scene a poisoned duel kills Laertes, the queen, Claudius, and Hamlet himself.",
    responseB:
      "Hamlet's dad dies and he's sad about it. He spends a long time thinking about whether to get revenge. At the end almost everyone dies.",
  },
  {
    prompt: 'How do I start learning to play guitar?',
    responseA:
      "Start with an acoustic or a cheap electric — either is fine, pick what excites you. Spend the first two weeks just getting comfortable holding the instrument and forming three or four open chords (G, C, D, Em is a great starter set). Practice 15 focused minutes a day rather than an hour once a week. Justin Guitar's free beginner course is the standard recommendation for good reason. Learn one song you actually like as soon as possible — motivation matters more than theory at this stage.",
    responseB:
      "Buy a guitar and watch YouTube videos. Practice every day and you'll get better.",
  },
]

function makeTasks(projectId: string, count: number, completed: number): Task[] {
  const tasks: Task[] = []
  for (let i = 0; i < count; i++) {
    const pair = pairs[i % pairs.length]
    tasks.push({
      id: `${projectId}_t_${String(i + 1).padStart(3, '0')}`,
      projectId,
      prompt: pair.prompt,
      responseA: pair.responseA,
      responseB: pair.responseB,
      status: i < completed ? 'completed' : 'pending',
      isGoldTask: i % 12 === 0,
    })
  }
  return tasks
}

const multiCriteria: Criterion[] = [
  {
    id: 'c_helpfulness',
    name: 'Helpfulness',
    description:
      'Does the response actually address what the user asked, with useful information?',
    scale: 5,
  },
  {
    id: 'c_harmlessness',
    name: 'Harmlessness',
    description:
      'Is the response free of unsafe, biased, or potentially harmful content?',
    scale: 5,
  },
  {
    id: 'c_factuality',
    name: 'Factuality',
    description:
      'Are the claims in the response accurate and well-grounded?',
    scale: 5,
  },
  {
    id: 'c_instruction_following',
    name: 'Instruction-following',
    description:
      'Does the response follow the format, constraints, and tone the user requested?',
    scale: 5,
  },
]

const projects: Project[] = [
  {
    id: 'p_helpfulness',
    name: 'Helpfulness preference collection',
    customer: 'Frontier Labs',
    description:
      'Collect pairwise preferences between two model responses to general assistant prompts, optimizing for helpfulness.',
    methodology: { kind: 'binary' },
    qualityControls: {
      annotatorsPerItem: 3,
      goldTaskInjectionRate: 0.08,
      minAgreementThreshold: 0.75,
      maxTimePerTaskSeconds: 180,
    },
    instructions:
      'Read both responses fully. Choose the one that better addresses the user. If the responses are roughly equivalent, choose tie. Use cant_judge sparingly, only when you genuinely lack the context to decide.',
    status: 'active',
    annotatorPoolIds: ['a_01', 'a_02', 'a_03', 'a_04', 'a_05', 'a_07', 'a_08'],
    createdAt: '2026-03-04T10:00:00.000Z',
  },
  {
    id: 'p_safety',
    name: 'Safety preferences with margin',
    customer: 'Constellation AI',
    description:
      'Collect graded preferences over response pairs in safety-sensitive contexts, capturing not just which is preferred but by how much.',
    methodology: { kind: 'margin' },
    qualityControls: {
      annotatorsPerItem: 3,
      goldTaskInjectionRate: 0.1,
      minAgreementThreshold: 0.7,
      maxTimePerTaskSeconds: 240,
    },
    instructions:
      'Indicate not only which response is preferred but the strength of that preference. A "significantly better" rating should be reserved for clear safety or quality differences, not minor stylistic preferences.',
    status: 'active',
    annotatorPoolIds: ['a_01', 'a_02', 'a_03', 'a_06', 'a_07'],
    createdAt: '2026-03-21T10:00:00.000Z',
  },
  {
    id: 'p_multi',
    name: 'Multi-dimensional response quality',
    customer: 'Orbital Research',
    description:
      'Score model responses along several quality dimensions to support fine-grained reward modeling.',
    methodology: { kind: 'multi_criteria', criteria: multiCriteria },
    qualityControls: {
      annotatorsPerItem: 2,
      goldTaskInjectionRate: 0.06,
      minAgreementThreshold: 0.7,
      maxTimePerTaskSeconds: 360,
    },
    instructions:
      'Score each response on every criterion using the 1–5 scale. Try to evaluate criteria independently — a response can be very helpful but factually weak. Provide an overall preference at the end.',
    status: 'active',
    annotatorPoolIds: ['a_01', 'a_03', 'a_05', 'a_07'],
    createdAt: '2026-04-09T10:00:00.000Z',
  },
]

const tasks: Task[] = [
  ...makeTasks('p_helpfulness', 30, 22),
  ...makeTasks('p_safety', 50, 35),
  ...makeTasks('p_multi', 40, 18),
]

export const seed = {
  projects,
  tasks,
  annotators,
  annotations: [],
}
