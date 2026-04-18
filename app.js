const loginView = document.getElementById('login-view');
const simulatorView = document.getElementById('simulator-view');
const loginForm = document.getElementById('login-form');
const welcomeText = document.getElementById('welcome-text');
const logoutButton = document.getElementById('logout-button');
const studentTypeInput = document.getElementById('student-type');
const lessonTopicInput = document.getElementById('lesson-topic');
const startSessionButton = document.getElementById('start-session');
const lessonSummary = document.getElementById('lesson-summary');
const simulatorOutput = document.getElementById('simulator-output');
const sessionLabel = document.getElementById('session-label');
const explainButton = document.getElementById('explain-button');
const encourageButton = document.getElementById('encourage-button');
const changeStrategyButton = document.getElementById('change-strategy-button');

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

const lessonTopics = {
  math: 'Math: Patterns & Logic - introduce an accessible problem and provide a strategy that fits the learner.',
  science: 'Science: Energy & Motion - explain physical concepts with examples and analogies.',
  history: 'History: Creative Storytelling - turn facts into a narrative with characters and emotions.',
  language: 'Language: Writing a Story - build a beginning, middle, and end with guided prompts.',
};

let authToken = null;
let teacherName = 'Teacher';

function showView(view) {
  loginView.classList.toggle('active', view === 'login');
  simulatorView.classList.toggle('active', view === 'simulator');
}

function writeMessage(content, type = 'info') {
  const message = document.createElement('p');
  message.className = 'message';
  message.innerHTML = content;
  if (type === 'student') {
    message.innerHTML = `<strong>Student:</strong> ${content}`;
  } else if (type === 'teacher') {
    message.innerHTML = `<strong>Teacher:</strong> ${content}`;
  }
  simulatorOutput.appendChild(message);
  simulatorOutput.scrollTop = simulatorOutput.scrollHeight;
}

function renderLessonSummary() {
  const studentType = studentTypeInput.value;
  const lessonTopic = lessonTopicInput.value;
  const student = studentProfiles[studentType];
  lessonSummary.textContent = `Prepare to teach a ${student.name}. This student ${student.style} with the lesson topic: ${lessonTopics[lessonTopic]}`;
}

async function requestJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response.json();
}

async function startLesson() {
  if (!authToken) {
    alert('Please log in before starting the lesson.');
    return;
  }

  const studentType = studentTypeInput.value;
  const lessonTopic = lessonTopicInput.value;

  simulatorOutput.innerHTML = '';
  sessionLabel.textContent = `${studentProfiles[studentType].name} session active`;

  const data = await requestJson('/api/lesson/start', { studentType, lessonTopic });
  if (!data.success) {
    writeMessage('Unable to start the lesson. Please try again.');
    return;
  }

  data.messages.forEach((message) => writeMessage(message, 'student'));
}

async function teacherAction(action) {
  if (!authToken) {
    alert('Please log in before using simulator controls.');
    return;
  }

  const studentType = studentTypeInput.value;
  writeMessage(`Action: ${action}`, 'teacher');

  const data = await requestJson('/api/lesson/action', { action, studentType });
  if (!data.success) {
    writeMessage('Unable to perform action. Please try again.');
    return;
  }

  writeMessage(data.teacherAdvice, 'teacher');
  writeMessage(data.studentReply, 'student');
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!email || password.length < 6) {
    alert('Please enter a valid email and password with at least 6 characters.');
    return;
  }

  const data = await requestJson('/api/login', { email, password });
  if (!data.success) {
    alert(data.message || 'Login failed.');
    return;
  }

  authToken = data.token;
  teacherName = data.teacherName;
  welcomeText.textContent = `Welcome, ${teacherName}!`;
  showView('simulator');
});

logoutButton.addEventListener('click', () => {
  authToken = null;
  teacherName = 'Teacher';
  showView('login');
  loginForm.reset();
  lessonSummary.textContent = 'Choose a student and topic to prepare your lesson.';
  simulatorOutput.innerHTML = '<p class="hint">After you start, the AI will simulate student responses and suggest teaching moves.</p>';
  sessionLabel.textContent = 'Ready to teach';
});

studentTypeInput.addEventListener('change', renderLessonSummary);
lessonTopicInput.addEventListener('change', renderLessonSummary);
startSessionButton.addEventListener('click', startLesson);
explainButton.addEventListener('click', () => teacherAction('explain'));
encourageButton.addEventListener('click', () => teacherAction('encourage'));
changeStrategyButton.addEventListener('click', () => teacherAction('strategy'));

renderLessonSummary();
