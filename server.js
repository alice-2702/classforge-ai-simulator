const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const lessonTopics = {
  math: 'Math: Patterns & Logic',
  science: 'Science: Energy & Motion',
  history: 'History: Creative Storytelling',
  language: 'Language: Writing a Story',
};

const studentProfiles = {
  motivated: {
    name: 'Motivated learner',
    style: 'responds quickly, asks for extension, enjoys challenges.',
  },
  distracted: {
    name: 'Distracted learner',
    style: 'needs short prompts, frequent re-engagement, and humor.',
  },
  curious: {
    name: 'Curious learner',
    style: 'asks deeper questions, wants examples, and prefers exploration.',
  },
  shy: {
    name: 'Shy learner',
    style: 'gives brief answers, appreciates encouragement, and needs a calm tone.',
  },
};

function createReply(studentType) {
  const responses = {
    motivated: [
      'I love this explanation! Can we do a harder example next?',
      'This makes sense — I want to try a challenge problem.',
      'I understand the idea. What if we change one part of the problem?'
    ],
    distracted: [
      'Can we try that again with a fun example?',
      'I got distracted. Could you remind me what we are doing?',
      'This is okay. Maybe a shorter explanation would help.'
    ],
    curious: [
      'Why does that happen? Can you give me another reason?',
      'How does this relate to real life? That sounds interesting.',
      'What would happen if we changed the question slightly?'
    ],
    shy: [
      'I think I understand, but I am not sure.',
      'Could you say that again slowly, please?',
      'I’m a little nervous, but that example helped.'
    ],
  };
  const list = responses[studentType] || responses.motivated;
  return list[Math.floor(Math.random() * list.length)];
}

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Invalid email or password.' });
  }

  const teacherName = email.split('@')[0];
  res.json({
    success: true,
    teacherName,
    token: 'simulator-token-123',
  });
});

app.post('/api/lesson/start', (req, res) => {
  const { studentType, lessonTopic } = req.body || {};
  const student = studentProfiles[studentType] || studentProfiles.motivated;
  const topic = lessonTopics[lessonTopic] || lessonTopics.math;

  res.json({
    success: true,
    summary: `You are teaching a ${student.name} about ${topic}. This learner ${student.style}`,
    messages: [
      `Today you are teaching a ${student.name} about ${topic}.`,
      `Focus on an approach that fits the learner: ${student.style}`,
      createReply(studentType),
    ],
  });
});

app.post('/api/lesson/action', (req, res) => {
  const { action, studentType } = req.body || {};
  const student = studentProfiles[studentType] || studentProfiles.motivated;
  let teacherAdvice = 'Try a new teaching move.';

  if (action === 'explain') {
    teacherAdvice = 'Explain the concept with a fresh concrete example and smaller steps.';
  } else if (action === 'encourage') {
    teacherAdvice = 'Use encouraging language: "You’re on the right track, keep going."';
  } else if (action === 'strategy') {
    teacherAdvice = 'Switch strategy: tell a story or use an analogy that matches the learner type.';
  }

  res.json({
    success: true,
    teacherAdvice,
    studentReply: createReply(studentType),
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`AI Teaching Simulator backend running on http://localhost:${port}`);
});
