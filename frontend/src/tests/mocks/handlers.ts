import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:8000/api/v1';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE}/auth/register/`, () => {
    return HttpResponse.json({
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'student'
      },
      access: 'mock-access-token',
      refresh: 'mock-refresh-token'
    });
  }),

  http.post(`${API_BASE}/auth/login/`, () => {
    return HttpResponse.json({
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'student'
      },
      access: 'mock-access-token',
      refresh: 'mock-refresh-token'
    });
  }),

  // User endpoints
  http.get(`${API_BASE}/users/profile/`, () => {
    return HttpResponse.json({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'student',
      points: 150,
      level: 2,
      badges: ['first_lesson', 'quiz_master']
    });
  }),

  // Content endpoints
  http.get(`${API_BASE}/lessons/`, () => {
    return HttpResponse.json({
      results: [
        {
          id: 1,
          title: 'Introduction to Programming',
          description: 'Learn the basics of programming',
          content: 'Programming is the process of creating instructions...',
          difficulty: 'beginner',
          estimated_time: 30,
          is_completed: false,
          completion_date: null
        },
        {
          id: 2,
          title: 'Variables and Data Types',
          description: 'Understanding variables and data types',
          content: 'Variables are containers for storing data...',
          difficulty: 'beginner',
          estimated_time: 45,
          is_completed: true,
          completion_date: '2024-01-15T10:30:00Z'
        }
      ],
      count: 2,
      next: null,
      previous: null
    });
  }),

  http.get(`${API_BASE}/lessons/1/`, () => {
    return HttpResponse.json({
      id: 1,
      title: 'Introduction to Programming',
      description: 'Learn the basics of programming',
      content: 'Programming is the process of creating instructions for computers to follow. It involves writing code in various programming languages to solve problems and create applications.',
      difficulty: 'beginner',
      estimated_time: 30,
      is_completed: false,
      completion_date: null,
      quiz: {
        id: 1,
        questions: [
          {
            id: 1,
            question: 'What is programming?',
            options: [
              'Writing code',
              'Playing games',
              'Watching videos',
              'Reading books'
            ],
            correct_answer: 0
          }
        ]
      }
    });
  }),

  http.post(`${API_BASE}/lessons/1/complete/`, () => {
    return HttpResponse.json({
      message: 'Lesson completed successfully',
      points_earned: 10,
      new_badges: []
    });
  }),

  // Quiz endpoints
  http.get(`${API_BASE}/quizzes/1/`, () => {
    return HttpResponse.json({
      id: 1,
      lesson: 1,
      questions: [
        {
          id: 1,
          question: 'What is programming?',
          options: [
            'Writing code',
            'Playing games',
            'Watching videos',
            'Reading books'
          ]
        },
        {
          id: 2,
          question: 'Which of these is a programming language?',
          options: [
            'HTML',
            'Python',
            'CSS',
            'JSON'
          ]
        }
      ]
    });
  }),

  http.post(`${API_BASE}/quizzes/1/submit/`, () => {
    return HttpResponse.json({
      score: 85,
      total_questions: 2,
      correct_answers: 2,
      points_earned: 15,
      passed: true,
      results: [
        {
          question_id: 1,
          is_correct: true,
          selected_answer: 0,
          correct_answer: 0
        },
        {
          question_id: 2,
          is_correct: true,
          selected_answer: 1,
          correct_answer: 1
        }
      ]
    });
  }),

  // Challenge endpoints
  http.get(`${API_BASE}/challenges/`, () => {
    return HttpResponse.json({
      results: [
        {
          id: 1,
          title: 'Hello World Challenge',
          description: 'Write a program that prints "Hello, World!"',
          difficulty: 'easy',
          points: 20,
          language: 'python',
          starter_code: 'print("Hello, World!")',
          test_cases: [
            {
              input: '',
              expected_output: 'Hello, World!'
            }
          ]
        }
      ],
      count: 1,
      next: null,
      previous: null
    });
  }),

  http.post(`${API_BASE}/challenges/1/submit/`, () => {
    return HttpResponse.json({
      id: 1,
      status: 'accepted',
      score: 100,
      points_earned: 20,
      execution_time: 0.05,
      memory_used: 1024,
      test_results: [
        {
          test_case: 1,
          passed: true,
          input: '',
          expected_output: 'Hello, World!',
          actual_output: 'Hello, World!',
          execution_time: 0.05
        }
      ]
    });
  }),

  // Gamification endpoints
  http.get(`${API_BASE}/gamification/leaderboard/`, () => {
    return HttpResponse.json({
      results: [
        {
          user: {
            id: 1,
            username: 'testuser',
            first_name: 'Test',
            last_name: 'User'
          },
          total_points: 150,
          level: 2,
          rank: 1,
          badges_count: 2
        },
        {
          user: {
            id: 2,
            username: 'user2',
            first_name: 'User',
            last_name: 'Two'
          },
          total_points: 120,
          level: 2,
          rank: 2,
          badges_count: 1
        }
      ],
      count: 2,
      next: null,
      previous: null
    });
  }),

  http.get(`${API_BASE}/gamification/badges/`, () => {
    return HttpResponse.json({
      results: [
        {
          id: 1,
          name: 'First Lesson',
          description: 'Complete your first lesson',
          icon: 'trophy',
          earned_date: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          name: 'Quiz Master',
          description: 'Score 100% on a quiz',
          icon: 'star',
          earned_date: '2024-01-16T14:20:00Z'
        }
      ],
      count: 2,
      next: null,
      previous: null
    });
  }),

  http.get(`${API_BASE}/gamification/points/history/`, () => {
    return HttpResponse.json({
      results: [
        {
          id: 1,
          points: 10,
          reason: 'Lesson completed: Introduction to Programming',
          earned_date: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          points: 15,
          reason: 'Quiz completed with 85% score',
          earned_date: '2024-01-16T14:20:00Z'
        }
      ],
      count: 2,
      next: null,
      previous: null
    });
  })
];