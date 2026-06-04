export const onboardingConfig = {
  student: [
    {
      key: "education_level",
      question: "What is your current education level?",
      type: "select",
      options: [
        "High School",
        "Diploma",
        "Undergraduate",
        "Postgraduate",
      ],
    },
    {
      key: "field_of_study",
      question: "What is your field of study?",
      type: "text",
    },
    {
      key: "graduation_year",
      question: "What is your expected graduation year?",
      type: "number",
    },
  ],
  job_seeker: [
    {
      key: "career_stage",
      question: "Where are you in your career?",
      type: "select",
      options: ["Student", "Fresher", "Experienced"],
    },
    {
      key: "goal",
      question: "What is your goal?",
      type: "text",
    },
    {
      key: "has_resume",
      question: "Do you have a resume?",
      type: "boolean",
    },
  ],

  institute: [
    {
      key: "institute_type",
      question: "What type of institute is this?",
      type: "text",
    },
    {
      key: "total_students",
      question: "How many students do you have?",
      type: "number",
    },
    {
      key: "courses",
      question: "Which courses do you offer?",
      type: "text",
    },
  ],

  company: [
    {
      key: "company_size",
      question: "How many employees do you have?",
      type: "number",
    },
    {
      key: "years_active",
      question: "How many years old is your company?",
      type: "number",
    },
    {
      key: "industry",
      question: "Which industry?",
      type: "text",
    },
  ],

  coach: [
    {
      key: "experience",
      question: "How many years of experience?",
      type: "number",
    },
    {
      key: "specialization",
      question: "Your specialization?",
      type: "text",
    },
  ],
};