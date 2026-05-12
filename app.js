(function () {
  const SUPABASE_URL = window.CAREERFIT_SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = window.CAREERFIT_SUPABASE_ANON_KEY || "";
  const hasSupabaseLibrary = typeof window.supabase !== "undefined";
  const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && hasSupabaseLibrary);

  const storageKeys = {
    draft: "careerfit-survey-draft",
    respondentType: "careerfit-respondent-type",
    localUsers: "careerfit-local-users",
    localSession: "careerfit-local-session",
    localProfiles: "careerfit-local-profiles",
    localSubmissions: "careerfit-local-submissions",
    results: "careerfit-last-results"
  };

  const respondentTypes = {
    student: {
      label: "College Student",
      surveyTitle: "College Student CareerFit Survey",
      description: "Original college-student wording for currently enrolled respondents."
    },
    incoming: {
      label: "Incoming College Student",
      surveyTitle: "Incoming College CareerFit Survey",
      description: "College-student items adjusted for students preparing to enter college."
    },
    working: {
      label: "Working Respondent",
      surveyTitle: "Working Respondent CareerFit Survey",
      description: "College-student items adjusted for respondents who already graduated or are working."
    }
  };

  const degreeMatches = [
    {
      cluster_key: "early_childhood_education",
      title: "Bachelor of Early Childhood Education",
      keywords: ["early childhood education", "bece", "beed early childhood", "preschool education"],
      roles: ["Preschool Teacher", "Early Childhood Educator", "Daycare Worker", "Learning Support Aide", "Child Development Worker"],
      search_keywords: ["preschool", "early childhood", "daycare", "child development", "learning support"],
      guidance: "Search schools, daycare centers, child-development programs, and local learning centers."
    },
    {
      cluster_key: "elementary_education",
      title: "Bachelor of Elementary Education",
      keywords: ["elementary education", "beed", "bachelor of elementary education", "elementary teacher"],
      roles: ["Elementary Teacher", "Tutor", "Instructional Aide", "Learning Resource Assistant", "Academic Coordinator"],
      search_keywords: ["elementary teacher", "tutorial", "learning support", "curriculum", "school hiring"],
      guidance: "Check DepEd and private-school hiring, tutoring centers, review centers, and learning-support roles."
    },
    {
      cluster_key: "secondary_education_english",
      title: "Bachelor of Secondary Education - English",
      keywords: ["secondary education english", "bsed english", "bachelor of secondary education english", "english education"],
      roles: ["English Teacher", "ESL Tutor", "Content Writer", "Learning Module Writer", "Academic Editor"],
      search_keywords: ["english teacher", "esl", "content writing", "module writer", "academic editing"],
      guidance: "Use both teaching and language-content keywords to find school-based and communication roles."
    },
    {
      cluster_key: "secondary_education_filipino",
      title: "Bachelor of Secondary Education - Filipino",
      keywords: ["secondary education filipino", "bsed filipino", "bachelor of secondary education filipino", "filipino education"],
      roles: ["Filipino Teacher", "Tutor", "Translator", "Instructional Materials Writer", "Cultural Program Assistant"],
      search_keywords: ["filipino teacher", "translation", "instructional materials", "culture", "tutorial"],
      guidance: "Pair Filipino-language expertise with teaching, translation, content, and cultural-program searches."
    },
    {
      cluster_key: "secondary_education_mathematics",
      title: "Bachelor of Secondary Education - Mathematics",
      keywords: ["secondary education mathematics", "secondary education math", "bsed mathematics", "bsed math", "mathematics education"],
      roles: ["Mathematics Teacher", "Math Tutor", "Assessment Assistant", "Learning Module Developer", "Academic Coordinator"],
      search_keywords: ["math teacher", "math tutor", "assessment", "learning modules", "school hiring"],
      guidance: "Search both school hiring and tutorial/review-center roles where math specialization is required."
    },
    {
      cluster_key: "secondary_education_science",
      title: "Bachelor of Secondary Education - Science",
      keywords: ["secondary education science", "bsed science", "science education"],
      roles: ["Science Teacher", "Laboratory Aide", "STEM Tutor", "Science Module Writer", "Academic Coordinator"],
      search_keywords: ["science teacher", "stem tutor", "laboratory", "learning module", "school hiring"],
      guidance: "Include STEM tutoring, school laboratory support, and science-content roles in your search."
    },
    {
      cluster_key: "secondary_education_social_studies",
      title: "Bachelor of Secondary Education - Social Studies",
      keywords: ["secondary education social studies", "bsed social studies", "social studies education", "social science education"],
      roles: ["Social Studies Teacher", "Research Assistant", "Community Program Assistant", "Museum Education Assistant", "Learning Module Writer"],
      search_keywords: ["social studies teacher", "research", "community program", "museum education", "module writer"],
      guidance: "Search education roles first, then add research, civic, and community-program pathways."
    },
    {
      cluster_key: "secondary_education_values",
      title: "Bachelor of Secondary Education - Values Education",
      keywords: ["secondary education values", "bsed values", "values education", "values teacher"],
      roles: ["Values Education Teacher", "Guidance Support Staff", "Student Formation Assistant", "Campus Ministry Assistant", "Community Program Facilitator"],
      search_keywords: ["values education", "guidance", "student formation", "campus ministry", "community program"],
      guidance: "Use values education with guidance, formation, and community-extension keywords."
    },
    {
      cluster_key: "technology_livelihood_education",
      title: "Bachelor of Technology and Livelihood Education",
      keywords: ["technology and livelihood education", "btled", "tle", "livelihood education"],
      roles: ["TLE Teacher", "Livelihood Program Instructor", "Skills Trainer", "Workshop Facilitator", "TESDA Training Assistant"],
      search_keywords: ["tle teacher", "livelihood", "skills training", "workshop", "tesda"],
      guidance: "Search both school-based TLE roles and skills-training opportunities in livelihood programs."
    },
    {
      cluster_key: "physical_education",
      title: "Bachelor of Physical Education",
      keywords: ["physical education", "bped", "pe teacher"],
      roles: ["PE Teacher", "Sports Coach", "Fitness Instructor", "Recreation Coordinator", "Athletics Assistant"],
      search_keywords: ["pe teacher", "sports coach", "fitness instructor", "recreation", "athletics"],
      guidance: "Check schools, gyms, sports clubs, local government sports programs, and wellness providers."
    },
    {
      cluster_key: "exercise_sports_sciences",
      title: "Bachelor of Science in Exercise and Sports Sciences",
      keywords: ["exercise and sports sciences", "exercise sports sciences", "bsess", "sports sciences"],
      roles: ["Exercise Specialist", "Fitness Coach", "Sports Program Coordinator", "Wellness Assistant", "Strength and Conditioning Assistant"],
      search_keywords: ["exercise science", "fitness coach", "sports program", "wellness", "strength conditioning"],
      guidance: "Use sports science and wellness terms so searches include fitness, coaching, and program roles."
    },
    {
      cluster_key: "fitness_sports_coaching",
      title: "Bachelor of Science in Fitness and Sports Coaching",
      keywords: ["fitness and sports coaching", "sports coaching", "fsc", "fitness coaching"],
      roles: ["Sports Coach", "Fitness Coach", "Personal Trainer", "Athletics Assistant", "Training Program Coordinator"],
      search_keywords: ["sports coaching", "fitness coaching", "personal trainer", "athletics", "training program"],
      guidance: "Search coaching titles together with the sport, age group, or fitness setting you prefer."
    },
    {
      cluster_key: "fitness_sports_management",
      title: "Bachelor of Science in Fitness and Sports Management",
      keywords: ["fitness and sports management", "sports management", "fsm", "fitness management"],
      roles: ["Sports Facility Coordinator", "Fitness Club Administrator", "Events Coordinator", "Recreation Officer", "Athletics Operations Assistant"],
      search_keywords: ["sports management", "fitness club", "events", "recreation", "facility coordinator"],
      guidance: "Use operations, events, and facility keywords to capture management-side sports openings."
    },
    {
      cluster_key: "nursing",
      title: "Bachelor of Science in Nursing",
      keywords: ["nursing", "bsn", "bachelor of science in nursing"],
      roles: ["Staff Nurse", "Clinic Nurse", "Community Health Nurse", "Patient Care Coordinator", "Health Program Assistant"],
      search_keywords: ["staff nurse", "clinic nurse", "community health", "patient care", "health program"],
      guidance: "Search hospital, clinic, community health, school health, and public-health program openings."
    },
    {
      cluster_key: "nutrition_dietetics",
      title: "Bachelor of Science in Nutrition and Dietetics",
      keywords: ["nutrition and dietetics", "nutrition", "dietetics", "bsnd", "dietitian"],
      roles: ["Nutritionist-Dietitian", "Dietitian Assistant", "Community Nutrition Worker", "Food Service Dietetics Assistant", "Health Program Officer"],
      search_keywords: ["nutritionist", "dietitian", "community nutrition", "food service", "health program"],
      guidance: "Search clinical, community, school-feeding, food service, and wellness nutrition roles."
    },
    {
      cluster_key: "veterinary_medicine",
      title: "Doctor of Veterinary Medicine",
      keywords: ["doctor of veterinary medicine", "veterinary medicine", "dvm", "veterinarian", "vet medicine"],
      roles: ["Veterinarian", "Veterinary Clinic Associate", "Animal Health Officer", "Livestock Inspector", "Veterinary Research Assistant"],
      search_keywords: ["veterinarian", "veterinary clinic", "animal health", "livestock", "research assistant"],
      guidance: "Look at veterinary clinics, animal-health companies, farms, livestock programs, and government roles."
    },
    {
      cluster_key: "psychology",
      title: "Bachelor of Science in Psychology",
      keywords: ["psychology", "bs psychology", "ab psychology", "ba psychology"],
      roles: ["HR Assistant", "Recruitment Associate", "Guidance Office Staff", "Behavioral Program Assistant", "Research Assistant"],
      search_keywords: ["human resources", "guidance", "research", "community services", "behavioral programs"],
      guidance: "Search beyond clinic roles and include HR, guidance, research, and community-based pathways."
    },
    {
      cluster_key: "social_work",
      title: "Bachelor of Science in Social Work",
      keywords: ["social work", "bs social work", "bachelor of science in social work"],
      roles: ["Social Welfare Assistant", "Case Management Assistant", "Community Organizer", "Program Coordinator", "Child Protection Assistant"],
      search_keywords: ["social welfare", "case management", "community organizer", "program coordinator", "child protection"],
      guidance: "Search NGOs, LGUs, social welfare offices, child protection programs, and community projects."
    },
    {
      cluster_key: "theology",
      title: "Bachelor of Arts in Theology",
      keywords: ["theology", "ba theology", "bachelor of arts in theology"],
      roles: ["Ministry Worker", "Values Education Teacher", "Campus Ministry Assistant", "Community Outreach Worker", "Program Coordinator"],
      search_keywords: ["ministry", "values education", "campus ministry", "community outreach", "program coordinator"],
      guidance: "Pair theology with education, formation, outreach, nonprofit, and community-service searches."
    },
    {
      cluster_key: "communication",
      title: "Bachelor of Arts in Communication",
      keywords: ["communication", "ba communication", "mass communication", "communications"],
      roles: ["Communications Assistant", "Content Writer", "Public Relations Assistant", "Social Media Coordinator", "Media Researcher"],
      search_keywords: ["communications", "content writing", "public relations", "social media", "media research"],
      guidance: "Search communication roles across media, schools, businesses, government, and nonprofit offices."
    },
    {
      cluster_key: "english_language",
      title: "Bachelor of Arts in English Language",
      keywords: ["english language", "ba english language", "english", "bachelor of arts in english language"],
      roles: ["Content Writer", "Copy Editor", "ESL Teacher", "Technical Writer", "Proofreader"],
      search_keywords: ["content writer", "copy editor", "esl", "technical writer", "proofreader"],
      guidance: "Use writing, editing, ESL, and documentation keywords to expand beyond classroom roles."
    },
    {
      cluster_key: "filipino_language",
      title: "Bachelor of Arts in Filipino Language",
      keywords: ["filipino language", "ba filipino language", "filipino", "bachelor of arts in filipino language"],
      roles: ["Filipino Content Writer", "Translator", "Language Instructor", "Cultural Program Assistant", "Proofreader"],
      search_keywords: ["filipino writer", "translation", "language instructor", "culture", "proofreader"],
      guidance: "Search language, culture, education, translation, and content roles."
    },
    {
      cluster_key: "history",
      title: "Bachelor of Arts in History",
      keywords: ["history", "ba history", "bachelor of arts in history"],
      roles: ["Research Assistant", "Museum Assistant", "Archives Assistant", "Cultural Heritage Officer", "Social Studies Teacher"],
      search_keywords: ["research assistant", "museum", "archives", "cultural heritage", "social studies"],
      guidance: "Search history together with archives, heritage, museums, education, and research."
    },
    {
      cluster_key: "criminology",
      title: "Bachelor of Science in Criminology",
      keywords: ["criminology", "bs criminology", "bachelor of science in criminology"],
      roles: ["Police Officer Candidate", "Jail Officer Candidate", "Fire Officer Candidate", "Security Investigator", "Loss Prevention Associate"],
      search_keywords: ["criminology", "police officer", "jail officer", "fire officer", "security investigator"],
      guidance: "Monitor government hiring and private-sector security, investigation, and compliance roles."
    },
    {
      cluster_key: "accountancy",
      title: "Bachelor of Science in Accountancy",
      keywords: ["accountancy", "bs accountancy", "bsa", "bachelor of science in accountancy"],
      roles: ["Accounting Associate", "Audit Assistant", "Tax Associate", "Bookkeeper", "Finance Assistant"],
      search_keywords: ["accounting associate", "audit assistant", "tax associate", "bookkeeper", "finance assistant"],
      guidance: "Use accounting, audit, tax, bookkeeping, and finance-assistant titles for entry-level searches."
    },
    {
      cluster_key: "accounting_information_systems",
      title: "Bachelor of Science in Accounting Information Systems",
      keywords: ["accounting information systems", "bsais", "accounting systems", "accounting information"],
      roles: ["Accounting Systems Analyst", "ERP Support Associate", "IT Audit Assistant", "Accounting Associate", "Data Control Assistant"],
      search_keywords: ["accounting systems", "erp support", "it audit", "accounting associate", "data control"],
      guidance: "Search across accounting and systems-support roles because the degree sits between finance and IT."
    },
    {
      cluster_key: "business_financial_management",
      title: "Bachelor of Science in Business Administration - Financial Management",
      keywords: ["business administration financial management", "financial management", "bsba financial", "bsba fm", "finance management"],
      roles: ["Finance Associate", "Bank Teller", "Credit Analyst Assistant", "Accounts Assistant", "Payroll Assistant"],
      search_keywords: ["finance associate", "bank teller", "credit analyst", "accounts assistant", "payroll"],
      guidance: "Use finance function names and banking terms to find aligned business-administration roles."
    },
    {
      cluster_key: "entrepreneurship",
      title: "Bachelor of Science in Entrepreneurship",
      keywords: ["entrepreneurship", "bs entrepreneurship", "bachelor of science in entrepreneurship"],
      roles: ["Business Development Assistant", "Sales Coordinator", "Operations Assistant", "Marketing Assistant", "Startup Program Assistant"],
      search_keywords: ["business development", "sales coordinator", "operations assistant", "marketing assistant", "startup"],
      guidance: "Search roles that combine sales, operations, marketing, and small-business development."
    },
    {
      cluster_key: "agribusiness",
      title: "Bachelor of Science in Agribusiness",
      keywords: ["agribusiness", "bs agribusiness", "agribusiness marketing", "agribusiness finance", "local agribusiness marketing"],
      roles: ["Agribusiness Marketing Assistant", "Agricultural Sales Associate", "Farm Operations Coordinator", "Supply Chain Assistant", "Agribusiness Finance Assistant"],
      search_keywords: ["agribusiness", "agricultural sales", "farm operations", "supply chain", "agribusiness finance"],
      guidance: "Search agriculture businesses, cooperatives, farm suppliers, trading firms, and food supply chains."
    },
    {
      cluster_key: "office_administration",
      title: "BS Office Administration / BS Office Management",
      keywords: ["office administration", "office management", "bs office administration", "bs office management", "office management program"],
      roles: ["Administrative Assistant", "Executive Assistant", "Office Staff", "Records Assistant", "Customer Service Associate"],
      search_keywords: ["administrative assistant", "executive assistant", "office staff", "records assistant", "customer service"],
      guidance: "Use admin, records, executive support, front office, and customer-service terms."
    },
    {
      cluster_key: "hospitality_management",
      title: "Bachelor of Science in Hospitality / Hotel and Restaurant Management",
      keywords: ["hospitality management", "hotel and restaurant management", "bshm", "bshrm", "hrm"],
      roles: ["Front Office Associate", "Food and Beverage Service Associate", "Housekeeping Supervisor Trainee", "Events Assistant", "Guest Relations Associate"],
      search_keywords: ["front office", "food beverage", "housekeeping", "events assistant", "guest relations"],
      guidance: "Search hotels, restaurants, resorts, events companies, and customer-experience roles."
    },
    {
      cluster_key: "tourism_management",
      title: "Bachelor of Science in Tourism Management",
      keywords: ["tourism management", "bstm", "bachelor of science in tourism management", "tourism"],
      roles: ["Travel Consultant", "Tour Coordinator", "Reservation Agent", "Tourism Officer Assistant", "Guest Relations Associate"],
      search_keywords: ["travel consultant", "tour coordinator", "reservation agent", "tourism officer", "guest relations"],
      guidance: "Search travel agencies, hotels, LGU tourism offices, tour operators, and reservation teams."
    },
    {
      cluster_key: "agriculture",
      title: "Bachelor of Science in Agriculture",
      keywords: ["agriculture", "bs agriculture", "ba agriculture", "bachelor of science in agriculture", "bachelor of arts in agriculture", "agricultural economics", "horticulture", "agronomy", "organic agriculture", "agroforestry", "plant breeding", "plant pathology", "entomology", "soil science", "extension education"],
      roles: ["Agricultural Technician", "Farm Manager Trainee", "Crop Production Assistant", "Agricultural Extension Worker", "Agronomist Assistant"],
      search_keywords: ["agricultural technician", "farm manager", "crop production", "extension worker", "agronomy"],
      guidance: "Use your major as a keyword, then add agriculture, farm, crop, extension, and agribusiness terms."
    },
    {
      cluster_key: "forestry",
      title: "Bachelor of Science in Forestry",
      keywords: ["forestry", "bs forestry", "bachelor of science in forestry"],
      roles: ["Forester", "Forest Ranger", "Conservation Technician", "Nursery Supervisor", "GIS Mapping Assistant"],
      search_keywords: ["forester", "forest ranger", "conservation", "nursery", "gis mapping"],
      guidance: "Search government environment offices, conservation groups, nurseries, mapping, and fieldwork roles."
    },
    {
      cluster_key: "environmental_science",
      title: "Bachelor of Science in Environmental Science",
      keywords: ["environmental science", "bs environmental science", "environment science"],
      roles: ["Environmental Officer", "Pollution Control Assistant", "Sustainability Assistant", "Environmental Research Assistant", "Compliance Assistant"],
      search_keywords: ["environmental officer", "pollution control", "sustainability", "environmental research", "compliance"],
      guidance: "Use environmental compliance, pollution control, sustainability, and research keywords."
    },
    {
      cluster_key: "agricultural_biosystems_engineering",
      title: "Bachelor of Science in Agricultural and Biosystems Engineering",
      keywords: ["agricultural and biosystems engineering", "agricultural biosystems engineering", "bsabe", "agricultural engineering", "biosystems engineering"],
      roles: ["Agricultural Engineer", "Irrigation Technician", "Farm Machinery Specialist", "Postharvest Facility Assistant", "Project Engineer"],
      search_keywords: ["agricultural engineer", "irrigation", "farm machinery", "postharvest", "project engineer"],
      guidance: "Search engineering roles in irrigation, mechanization, farm systems, postharvest, and facilities."
    },
    {
      cluster_key: "civil_engineering",
      title: "Bachelor of Science in Civil Engineering",
      keywords: ["civil engineering", "bs civil engineering", "bsce", "civil engineer"],
      roles: ["Site Engineer", "Project Engineer", "Quantity Surveyor", "CAD Operator", "Materials Testing Assistant"],
      search_keywords: ["site engineer", "project engineer", "quantity surveyor", "cad", "materials testing"],
      guidance: "Search construction firms, contractors, LGUs, materials labs, and engineering consultancies."
    },
    {
      cluster_key: "electrical_engineering",
      title: "Bachelor of Science in Electrical Engineering",
      keywords: ["electrical engineering", "bs electrical engineering", "bsee", "electrical engineer"],
      roles: ["Electrical Engineer", "Maintenance Engineer", "Facilities Engineer", "Electrical Design Assistant", "Power Systems Technician"],
      search_keywords: ["electrical engineer", "maintenance engineer", "facilities", "electrical design", "power systems"],
      guidance: "Search power, facilities, maintenance, construction, and electrical-design roles."
    },
    {
      cluster_key: "industrial_engineering",
      title: "Bachelor of Science in Industrial Engineering",
      keywords: ["industrial engineering", "bs industrial engineering", "bsie", "industrial engineer"],
      roles: ["Process Improvement Analyst", "Operations Analyst", "Quality Assurance Analyst", "Production Planner", "Supply Chain Analyst"],
      search_keywords: ["process improvement", "operations analyst", "quality assurance", "production planning", "supply chain"],
      guidance: "Use operations, process, quality, production, logistics, and supply-chain keywords."
    },
    {
      cluster_key: "food_technology",
      title: "Bachelor of Science in Food Technology",
      keywords: ["food technology", "bsft", "food tech", "bachelor of science in food technology"],
      roles: ["Food Technologist", "Quality Assurance Analyst", "Product Development Assistant", "Food Safety Associate", "Laboratory Analyst"],
      search_keywords: ["food technologist", "quality assurance", "product development", "food safety", "laboratory analyst"],
      guidance: "Search food manufacturing, QA, product development, food safety, and lab roles."
    },
    {
      cluster_key: "development_communication",
      title: "Bachelor of Science in Development Communication",
      keywords: ["development communication", "bsdc", "devcom", "development comm"],
      roles: ["Development Communication Specialist", "IEC Materials Writer", "Community Information Officer", "Project Communications Assistant", "Advocacy Officer"],
      search_keywords: ["development communication", "iec materials", "community information", "project communications", "advocacy"],
      guidance: "Search NGOs, government projects, research offices, and community-development programs."
    },
    {
      cluster_key: "information_technology",
      title: "Bachelor of Science in Information Technology",
      keywords: ["information technology", "bsit", "it", "it degree", "bachelor of science in information technology"],
      roles: ["Junior Web Developer", "IT Support Specialist", "QA Analyst", "Data Analyst", "Systems Support Associate"],
      search_keywords: ["technical support", "web developer", "quality assurance", "data analyst", "systems support"],
      guidance: "Use title clusters like support, testing, analytics, software, and web to widen your search."
    },
    {
      cluster_key: "library_information_science",
      title: "Bachelor of Science in Library and Information Science",
      keywords: ["library and information science", "library information science", "blis", "library science"],
      roles: ["Librarian", "Library Assistant", "Records Officer", "Archives Assistant", "Information Services Assistant"],
      search_keywords: ["librarian", "library assistant", "records officer", "archives", "information services"],
      guidance: "Search libraries, schools, archives, records offices, and information-management roles."
    },
    {
      cluster_key: "web_mobile_development",
      title: "Bachelor of Science in Web and Mobile Application Development",
      keywords: ["web and mobile application development", "web mobile application development", "mobile application development", "web development", "mobile development"],
      roles: ["Web Developer", "Mobile App Developer", "Front-End Developer", "QA Tester", "UI Support Associate"],
      search_keywords: ["web developer", "mobile developer", "front end", "qa tester", "ui"],
      guidance: "Search web, mobile, front-end, QA, and UI implementation titles with your portfolio links ready."
    },
    {
      cluster_key: "business_analytics_big_data",
      title: "Bachelor of Science in Business Analytics and Big Data",
      keywords: ["business analytics and big data", "business analytics", "big data", "data analytics", "analytics and big data"],
      roles: ["Data Analyst", "Business Intelligence Analyst", "Reporting Analyst", "Analytics Associate", "Data Quality Assistant"],
      search_keywords: ["data analyst", "business intelligence", "reporting analyst", "analytics associate", "data quality"],
      guidance: "Search analytics roles using tools, reporting, BI, data quality, and entry-level analyst terms."
    },
    {
      cluster_key: "biology",
      title: "Bachelor of Science in Biology",
      keywords: ["biology", "bs biology", "bachelor of science in biology"],
      roles: ["Laboratory Analyst", "Research Assistant", "Biology Teacher", "Quality Control Assistant", "Environmental Field Assistant"],
      search_keywords: ["laboratory analyst", "research assistant", "biology teacher", "quality control", "environmental field"],
      guidance: "Search labs, research projects, quality-control teams, environmental programs, and teaching roles."
    },
    {
      cluster_key: "chemistry",
      title: "Bachelor of Science in Chemistry",
      keywords: ["chemistry", "bs chemistry", "chemist", "bachelor of science in chemistry"],
      roles: ["Chemist", "Laboratory Analyst", "Quality Control Analyst", "Research Assistant", "Chemical Safety Assistant"],
      search_keywords: ["chemist", "laboratory analyst", "quality control", "research assistant", "chemical safety"],
      guidance: "Search laboratories, manufacturing QA, food/pharma firms, environmental testing, and research roles."
    },
    {
      cluster_key: "statistics",
      title: "Bachelor of Science in Statistics",
      keywords: ["statistics", "bs statistics", "statistician", "bachelor of science in statistics"],
      roles: ["Statistician", "Data Analyst", "Research Analyst", "Survey Data Assistant", "Monitoring and Evaluation Assistant"],
      search_keywords: ["statistician", "data analyst", "research analyst", "survey data", "monitoring evaluation"],
      guidance: "Use statistics, data, research, survey, and monitoring-evaluation keywords."
    },
    {
      cluster_key: "mathematics",
      title: "Bachelor of Science in Mathematics",
      keywords: ["mathematics", "bs mathematics", "math degree", "bachelor of science in mathematics"],
      roles: ["Mathematics Teacher", "Data Analyst", "Actuarial Assistant", "Research Assistant", "Operations Analyst"],
      search_keywords: ["mathematics teacher", "data analyst", "actuarial assistant", "research assistant", "operations analyst"],
      guidance: "Search teaching, analytics, actuarial support, research, and operations roles."
    },
    {
      cluster_key: "public_administration",
      title: "Bachelor of Public Administration",
      keywords: ["public administration", "bpa", "bachelor of public administration", "public admin"],
      roles: ["Administrative Officer", "Policy Research Assistant", "LGU Program Staff", "Project Coordinator", "Public Service Assistant"],
      search_keywords: ["administrative officer", "policy research", "lgu", "project coordinator", "public service"],
      guidance: "Search government, NGOs, project offices, policy units, and administrative roles."
    }
  ];

  const verifiedJobstreetJobs = {
    agriculture: [
      {
        title: "Farm Supervisor (Broiler Farms)",
        company: "Bounty Fresh Food, Inc.",
        location: "Tarlac, Central Luzon",
        listed: "Listed 16h ago on JobStreet",
        url: "https://ph.jobstreet.com/job/90641507",
        aligned_role: "Farm Supervisor / Agriculture-related field"
      },
      {
        title: "Farm Operations Manager",
        company: "SCS Placement Services Inc.",
        location: "Lipa City, Batangas",
        listed: "Posted 25d ago on JobStreet",
        url: "https://ph.jobstreet.com/job/90367453",
        aligned_role: "Farm Operations / Agriculture or Horticulture"
      },
      {
        title: "Agriculturist",
        company: "BukidAmara Agri Farm",
        location: "Lucban, Quezon",
        listed: "Listed 3d ago on JobStreet",
        url: "https://ph.jobstreet.com/job/90623882",
        aligned_role: "Agriculturist / Farm Production"
      },
      {
        title: "Product & Application Specialist (Agriculture)",
        company: "Guill-Bern Corporation",
        location: "Pasig City, Metro Manila",
        listed: "Listed 14d ago on JobStreet",
        url: "https://ph.jobstreet.com/job/90355450",
        aligned_role: "Agriculture Product Specialist"
      }
    ],
    education: [
      {
        title: "Part-Time WFH Kids ESL Tutor",
        company: "EDGE Tutor International",
        location: "Manila City, Metro Manila (Remote)",
        listed: "Listed 8h ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91990675",
        aligned_role: "Tutor / Teacher"
      },
      {
        title: "No Experience Home-Based ESL Teacher",
        company: "51Talk",
        location: "Philippines (Home-based)",
        listed: "Listed 1d ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91976074",
        aligned_role: "ESL Teacher"
      }
    ],
    information_technology: [
      {
        title: "IT Support Specialist",
        company: "Concentrix Philippines",
        location: "Taguig City, Metro Manila",
        listed: "Listed 1d ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91924171",
        aligned_role: "IT Support"
      },
      {
        title: "IT Specialist",
        company: "Clinique de Paris Inc.",
        location: "Makati City, Metro Manila",
        listed: "Listed 4h ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91962565",
        aligned_role: "IT Specialist"
      }
    ],
    business_accounting: [
      {
        title: "Investment/Fund Accounting Associate (Open to Fresh Grads!)",
        company: "John Clements Consultants, Inc.",
        location: "Taguig City, Metro Manila",
        listed: "Listed 5h ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91904084",
        aligned_role: "Accounting Associate"
      },
      {
        title: "Admin Assistant",
        company: "Handling Innovation, Inc.",
        location: "Canlubang, Laguna",
        listed: "Listed 2h ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91994376",
        aligned_role: "Administrative / Business Support"
      }
    ],
    health: [
      {
        title: "Philippine Registered Nurse (PHRN)",
        company: "Carelon Global Solutions",
        location: "Taguig City, Metro Manila",
        listed: "Listed 1d ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91952656",
        aligned_role: "Registered Nurse"
      },
      {
        title: "Emergency Nurse Operations Specialist",
        company: "Global Rescue Pacific LLC Philippines",
        location: "Ortigas, Metro Manila",
        listed: "Listed 2d ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91924987",
        aligned_role: "Emergency Nurse"
      }
    ],
    human_services: [
      {
        title: "HR Assistant",
        company: "Philsaga Mining Corporation",
        location: "Davao City, Davao del Sur",
        listed: "Listed 23h ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91962214",
        aligned_role: "HR Assistant / Recruitment"
      },
      {
        title: "HR Assistant (Project Based)",
        company: "St. Luke's Medical Center",
        location: "Bonifacio Global City, Metro Manila",
        listed: "Listed 19h ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91972492",
        aligned_role: "HR / Administrative Support"
      }
    ],
    communication: [
      {
        title: "Content Writer",
        company: "KDCI",
        location: "Metro Manila (Hybrid)",
        listed: "Listed 3h ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91931945",
        aligned_role: "Content Writer"
      },
      {
        title: "Marketing | Copywriter",
        company: "Optum, a UnitedHealth Group Company",
        location: "Makati City, Metro Manila (Hybrid)",
        listed: "Listed 1d ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91896923",
        aligned_role: "Copywriter / Communications"
      }
    ],
    engineering: [
      {
        title: "Project Site Engineer",
        company: "Intergiro Builders Inc.",
        location: "Calamba City, Laguna",
        listed: "Listed 21d ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91459867",
        aligned_role: "Site Engineer"
      },
      {
        title: "Civil Engineer",
        company: "Steel Fab Building Solutions Inc.",
        location: "Subic Bay Freeport Zone, Zambales",
        listed: "Listed 4d ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91768473",
        aligned_role: "Civil / Structural Engineer"
      }
    ],
    hospitality_tourism: [
      {
        title: "Hotel Front Desk Officer",
        company: "Oriental Zen Suites",
        location: "Santa Cruz, Metro Manila",
        listed: "Listed 16d ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91660151",
        aligned_role: "Hotel Front Desk / Hospitality"
      },
      {
        title: "Corporate Travel Consultant",
        company: "Cloudstaff Philippines Inc.",
        location: "Ortigas, Metro Manila",
        listed: "Listed 9h ago on JobStreet",
        url: "https://ph.jobstreet.com/job/91970608",
        aligned_role: "Travel Consultant"
      }
    ],
    science_research: [
      {
        title: "Laboratory Analyst",
        company: "San Miguel Foods",
        location: "Pasig City, Metro Manila",
        listed: "Listed 6d ago on JobStreet",
        url: "https://ph.jobstreet.com/job/89919630",
        aligned_role: "Laboratory Analyst"
      },
      {
        title: "Research and Development Technologist",
        company: "CDO Foodsphere, Inc.",
        location: "Valenzuela City, Metro Manila",
        listed: "Listed 12h ago on JobStreet",
        url: "https://ph.jobstreet.com/job/90648927",
        aligned_role: "R&D / Food Technology"
      }
    ],
    criminology_security: [
      {
        title: "Operator - Surveillance",
        company: "Okada Manila",
        location: "Metro Manila",
        listed: "Listed 1h ago on JobStreet",
        url: "https://ph.jobstreet.com/job/90176833",
        aligned_role: "Surveillance / Security"
      },
      {
        title: "Officer, Surveillance",
        company: "Melco Resorts Leisure (PHP) Corporation",
        location: "Paranaque City, Metro Manila",
        listed: "Listed 1d ago on JobStreet",
        url: "https://ph.jobstreet.com/job/90150695",
        aligned_role: "Security Officer"
      }
    ]
  };

  const collegeStudentSections = [
    {
      key: "HCM",
      title: "Horizontal Career Mismatch Survey",
      scaleText: "1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree",
      scale: [1, 2, 3, 4, 5],
      questions: [
        "I worry that my future job may not be fully related to the degree I am taking.",
        "I think my future job may not fully use the knowledge and skills from my course.",
        "I may accept a job that requires skills mostly unrelated to my academic program.",
        "I sometimes feel that my future work may be more aligned with another field of study, not my own.",
        "I feel uncertain if my course will lead me to a career that matches my academic specialization.",
        "I worry that my first job after graduation may not help me build a career in my chosen field."
      ]
    },
    {
      key: "PJA",
      title: "Perceived Job Availability Survey",
      scaleText: "1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree",
      scale: [1, 2, 3, 4, 5],
      questions: [
        "I believe there are enough job opportunities related to my course.",
        "I often see job openings that match the degree I am taking.",
        "I know where to find job opportunities related to my field.",
        "I believe employers are looking for graduates from my course.",
        "I feel confident that I can find a degree-aligned job after graduation.",
        "Overall, I believe my course has realistic career opportunities."
      ]
    },
    {
      key: "PS",
      title: "Perceived Salary Survey",
      scaleText: "1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree",
      scale: [1, 2, 3, 4, 5],
      questions: [
        "I believe jobs related to my course can provide a reasonable starting salary.",
        "I believe salaries in my chosen field are competitive compared to other fields.",
        "I believe a job related to my course can help cover my basic living expenses in the future.",
        "I believe jobs in my field provide useful benefits (e.g., allowances, insurance, leave benefits).",
        "I am satisfied with the possible salary growth in careers related to my course.",
        "Overall, I believe my future salary in my field can support my career goals."
      ]
    },
    {
      key: "LCC",
      title: "Location and Commuting Constraints Survey",
      scaleText: "1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree",
      scale: [1, 2, 3, 4, 5],
      questions: [
        "I prefer future work opportunities that are close to my home.",
        "Transportation costs may affect the type of job I choose after graduation.",
        "I may choose a job near my home even if it is not fully related to my degree.",
        "I would rather work near my home even if it meant earning less.",
        "I am not willing to stay away from home for job-related duties, training, or employment."
      ]
    },
    {
      key: "FI",
      title: "Family Influence Scale",
      scaleText: "1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree",
      scale: [1, 2, 3, 4, 5],
      questions: [
        "My family shared information with me about how to obtain a job.",
        "My family discussed career issues with me at an early age.",
        "My family expects me to select a career that has a certain status.",
        "My family expects my career to match our family’s values and beliefs."
      ]
    },
    {
      key: "CA",
      title: "Career Adapt Abilities Short Form (CAAS-SF)",
      scaleText: "1 = Not Strong, 2 = Somewhat Strong, 3 = Strong, 4 = Very Strong, 5 = Strongest",
      scale: [1, 2, 3, 4, 5],
      questions: [
        "Thinking about what my future will be like.",
        "Preparing for the future.",
        "Becoming aware of the educational and vocational choices that I must make.",
        "Making decisions by myself.",
        "Taking responsibility for my actions.",
        "Counting on myself.",
        "Looking for opportunities to grow as a person.",
        "Investigating options before making a choice.",
        "Observing different ways of doing things.",
        "Taking care to do things well.",
        "Learning new skills.",
        "Working up to my ability."
      ]
    },
    {
      key: "ER",
      title: "Employee Resilience Scale (EmpRes)",
      scaleText: "1 = Never, 2 = Very Rarely, 3 = Rarely, 4 = Sometimes, 5 = Often, 6 = Very Often, 7 = Almost Always",
      scale: [1, 2, 3, 4, 5, 6, 7],
      questions: [
        "I effectively collaborate with others to handle unexpected challenges in school.",
        "I successfully manage a high academic workload for long periods of time.",
        "I handle difficult school-related problems competently.",
        "I learn from mistakes in school and improve the way I study or complete tasks.",
        "I re-evaluate my performance and continually improve the way I do my academic work.",
        "I effectively respond to feedback from teachers, classmates, or supervisors, even criticism.",
        "I seek assistance when I need specific academic or career-related resources.",
        "I approach teachers, advisers, or supervisors when I need support.",
        "I use changes in school or career plans as an opportunity for growth."
      ]
    },
    {
      key: "WSE",
      title: "Work Self-Efficacy Scale (WSES)",
      scaleText: "1 = Not Well at All, 2 = Slightly Well, 3 = Moderately Well, 4 = Quite Well, 5 = Very Well",
      scale: [1, 2, 3, 4, 5],
      questions: [
        "Achieve goals that are assigned to me in school.",
        "Respect schedules and academic deadlines.",
        "Learn new academic or work-related methods.",
        "Concentrate my energy on school or career preparation tasks.",
        "Finish assigned schoolwork or training tasks.",
        "Collaborate with classmates or groupmates.",
        "Work with people of diverse experiences and ages.",
        "Have good relationships with teachers, supervisors, or advisers.",
        "Behave effectively when communicating with classmates, teachers, or clients during school activities.",
        "Work in a team."
      ]
    }
  ];

  const incomingSections = adaptSections(collegeStudentSections, "incoming");
  const workingSections = adaptSections(collegeStudentSections, "working");
  const questionSets = {
    student: collegeStudentSections,
    incoming: incomingSections,
    working: workingSections
  };
  const totalQuestionCount = collegeStudentSections.reduce((sum, section) => sum + section.questions.length, 0);

  const state = {
    client: null,
    authMode: "local",
    currentUser: null,
    profile: null,
    submission: null,
    respondentType: normalizeRespondentType(localStorage.getItem(storageKeys.respondentType)),
    lastResults: readJson(storageKeys.results, null),
    draft: readJson(storageKeys.draft, {}),
    assessmentStarted: false,
    currentSectionIndex: 0,
    adminRows: []
  };

  const nodes = {
    authForm: document.getElementById("authForm"),
    authMessage: document.getElementById("authMessage"),
    authToggleBtn: document.getElementById("authToggleBtn"),
    signOutBtn: document.getElementById("signOutBtn"),
    profileForm: document.getElementById("profileForm"),
    profileMessage: document.getElementById("profileMessage"),
    profileShortcutBtn: document.getElementById("profileShortcutBtn"),
    dashboardToggleBtn: document.getElementById("dashboardToggleBtn"),
    menuToggleBtn: document.getElementById("menuToggleBtn"),
    mobileNav: document.getElementById("mobileNav"),
    floatingProgressText: document.getElementById("floatingProgressText"),
    floatingProgressBar: document.getElementById("floatingProgressBar"),
    connectionStatus: document.getElementById("connectionStatus"),
    degreeInput: document.getElementById("degreeInput"),
    matchDegreeBtn: document.getElementById("matchDegreeBtn"),
    useProfileDegreeBtn: document.getElementById("useProfileDegreeBtn"),
    degreeMatchOutput: document.getElementById("degreeMatchOutput"),
    assessmentIntro: document.getElementById("assessmentIntro"),
    beginAssessmentBtn: document.getElementById("beginAssessmentBtn"),
    surveyLayout: document.querySelector(".survey-layout"),
    surveyActions: document.querySelector(".survey-actions"),
    surveyForm: document.getElementById("surveyForm"),
    saveDraftBtn: document.getElementById("saveDraftBtn"),
    clearDraftBtn: document.getElementById("clearDraftBtn"),
    prevSectionBtn: document.getElementById("prevSectionBtn"),
    nextSectionBtn: document.getElementById("nextSectionBtn"),
    submitSurveyBtn: document.getElementById("submitSurveyBtn"),
    submissionMessage: document.getElementById("submissionMessage"),
    progressSummary: document.getElementById("progressSummary"),
    progressBar: document.getElementById("progressBar"),
    overallResultCard: document.getElementById("overallResultCard"),
    resultsChartWrap: document.getElementById("resultsChartWrap"),
    sectionResultsWrap: document.getElementById("sectionResultsWrap"),
    downloadResultCsvBtn: document.getElementById("downloadResultCsvBtn"),
    printResultsBtn: document.getElementById("printResultsBtn"),
    reloadSavedResultBtn: document.getElementById("reloadSavedResultBtn"),
    adminSearchInput: document.getElementById("adminSearchInput"),
    refreshAdminBtn: document.getElementById("refreshAdminBtn"),
    downloadAdminCsvBtn: document.getElementById("downloadAdminCsvBtn"),
    adminTableBody: document.getElementById("adminTableBody"),
    adminDetailPanel: document.getElementById("adminDetailPanel"),
    adminMessage: document.getElementById("adminMessage")
  };

  function adaptSections(baseSections, respondentType) {
    return baseSections.map((section) => ({
      ...section,
      questions: section.questions.map((question) => adaptQuestion(question, respondentType))
    }));
  }

  function adaptQuestion(question, respondentType) {
    if (respondentType === "incoming") {
      return applyReplacements(question, [
        ["I worry that my future job may not be fully related to the degree I am taking.", "I worry that my future job may not be fully related to the degree or course I plan to take."],
        ["I think my future job may not fully use the knowledge and skills from my course.", "I think my future job may not fully use the knowledge and skills from my planned course."],
        ["I may accept a job that requires skills mostly unrelated to my academic program.", "I may accept a job that requires skills mostly unrelated to my planned academic program."],
        ["I sometimes feel that my future work may be more aligned with another field of study, not my own.", "I sometimes feel that my future work may be more aligned with another field of study, not the one I plan to pursue."],
        ["I feel uncertain if my course will lead me to a career that matches my academic specialization.", "I feel uncertain if my planned course will lead me to a career that matches my intended academic specialization."],
        ["I worry that my first job after graduation may not help me build a career in my chosen field.", "I worry that my first job after I graduate may not help me build a career in my chosen field."],
        ["related to my course", "related to my planned course"],
        ["the degree I am taking", "the degree or course I plan to take"],
        ["from my course", "from my planned course"],
        ["my course", "my planned course"],
        ["after graduation", "after I graduate"],
        ["jobs in my field", "jobs in my intended field"],
        ["my field", "my intended field"],
        ["academic program", "planned academic program"],
        ["Becoming aware of the educational and vocational choices that I must make.", "Becoming aware of the college, educational, and vocational choices that I must make."],
        ["I effectively collaborate with others to handle unexpected challenges in school.", "I effectively collaborate with others to handle unexpected challenges in school or college preparation."],
        ["I successfully manage a high academic workload for long periods of time.", "I successfully manage a high school workload and college preparation tasks for long periods of time."],
        ["I handle difficult school-related problems competently.", "I handle difficult school or college-preparation problems competently."],
        ["I learn from mistakes in school and improve the way I study or complete tasks.", "I learn from mistakes in school and improve the way I study or prepare for college tasks."],
        ["I re-evaluate my performance and continually improve the way I do my academic work.", "I re-evaluate my performance and continually improve the way I do my academic work and college preparation."],
        ["teachers, classmates, or supervisors", "teachers, classmates, or advisers"],
        ["teachers, advisers, or supervisors", "teachers, advisers, or school personnel"],
        ["school or career plans", "school, college, or career plans"],
        ["assigned to me in school", "assigned to me in school or college preparation"],
        ["academic or work-related methods", "academic or career-preparation methods"],
        ["school or career preparation tasks", "school or college-preparation tasks"],
        ["assigned schoolwork or training tasks", "assigned schoolwork or college-preparation tasks"],
        ["teachers, supervisors, or advisers", "teachers, classmates, or advisers"],
        ["clients during school activities", "participants during school activities"]
      ]);
    }

    if (respondentType === "working") {
      return applyReplacements(question, [
        ["I worry that my future job may not be fully related to the degree I am taking.", "I worry that my current or future job may not be fully related to the degree I completed or field I trained for."],
        ["I think my future job may not fully use the knowledge and skills from my course.", "I think my current or future job may not fully use the knowledge and skills from my degree, training, or work background."],
        ["I may accept a job that requires skills mostly unrelated to my academic program.", "I may accept or keep a job that requires skills mostly unrelated to my educational background."],
        ["I sometimes feel that my future work may be more aligned with another field of study, not my own.", "I sometimes feel that my current or future work may be more aligned with another field, not my own background."],
        ["I feel uncertain if my course will lead me to a career that matches my academic specialization.", "I feel uncertain if my educational background will support a career that matches my specialization."],
        ["I worry that my first job after graduation may not help me build a career in my chosen field.", "I worry that my current or next job may not help me build a career in my chosen field."],
        ["I believe there are enough job opportunities related to my course.", "I believe there are enough job opportunities related to my degree, training, or work experience."],
        ["I often see job openings that match the degree I am taking.", "I often see job openings that match my degree, training, or work experience."],
        ["I believe employers are looking for graduates from my course.", "I believe employers are looking for people with my background."],
        ["I feel confident that I can find a degree-aligned job after graduation.", "I feel confident that I can find a role aligned with my background."],
        ["Overall, I believe my course has realistic career opportunities.", "Overall, I believe my background has realistic career opportunities."],
        ["related to my course", "related to my degree, training, or work experience"],
        ["jobs in my field", "jobs in my field or work background"],
        ["my course", "my background"],
        ["the degree I am taking", "my degree, training, or work experience"],
        ["academic program", "educational background"],
        ["after graduation", "in my current or next job search"],
        ["future work opportunities", "current or future work opportunities"],
        ["Becoming aware of the educational and vocational choices that I must make.", "Becoming aware of the work and career choices that I must make."],
        ["in school", "at work"],
        ["a high academic workload", "a heavy work workload"],
        ["school-related", "work-related"],
        ["study or complete tasks", "work or complete tasks"],
        ["academic work", "work"],
        ["teachers, classmates, or supervisors", "supervisors, coworkers, or clients"],
        ["academic or career-related resources", "work or career-related resources"],
        ["teachers, advisers, or supervisors", "supervisors, coworkers, or advisers"],
        ["school or career plans", "work or career plans"],
        ["assigned to me in school", "assigned to me at work"],
        ["academic deadlines", "work deadlines"],
        ["academic or work-related methods", "work-related methods"],
        ["school or career preparation tasks", "work or career tasks"],
        ["assigned schoolwork or training tasks", "assigned work or training tasks"],
        ["classmates or groupmates", "coworkers or team members"],
        ["teachers, supervisors, or advisers", "supervisors, coworkers, or advisers"],
        ["classmates, teachers, or clients during school activities", "coworkers, supervisors, or clients during work activities"]
      ]);
    }

    return question;
  }

  function applyReplacements(value, replacements) {
    return replacements.reduce((text, [from, to]) => text.split(from).join(to), value);
  }

  function normalizeRespondentType(type) {
    return respondentTypes[type] ? type : "student";
  }

  function normalizeProfileRole(role) {
    return role === "admin" ? "admin" : "respondent";
  }

  function getCurrentSections() {
    return questionSets[state.respondentType] || questionSets.student;
  }

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    attachEventListeners();
    placeResourcesAfterExplorer();
    initStorageMode();
    renderDegreeMatch();
    initRespondentTypeUi();
    initGuidanceTabs();
    applyRespondentType(state.respondentType);
    hydrateDraft();
    renderStoredResults(state.lastResults);
    updateProgress();
    updateAssessmentUi();
    await restoreSession();
  }

  function placeResourcesAfterExplorer() {
    const explorer = document.getElementById("career-explorer");
    const resources = document.getElementById("resources");
    if (explorer && resources) {
      explorer.insertAdjacentElement("afterend", resources);
    }
  }

  function initRespondentTypeUi() {
    const form = nodes.profileForm;
    const typeRadios = form.querySelectorAll("input[name='respondent_type']");
    typeRadios.forEach((radio) => {
      radio.addEventListener("change", () => applyRespondentType(radio.value));
    });
  }

  function applyRespondentType(type) {
    state.respondentType = normalizeRespondentType(type);
    state.currentSectionIndex = 0;
    state.assessmentStarted = false;
    localStorage.setItem(storageKeys.respondentType, state.respondentType);
    const form = nodes.profileForm;

    // Label changes
    const selectedMeta = respondentTypes[state.respondentType];
    const typeRadios = form.querySelectorAll("input[name='respondent_type']");
    const degreeLabel = document.getElementById("degreeLabel");
    const degreeInput = document.getElementById("degreeInput2");
    const yearLevelWrap = document.getElementById("yearLevelWrap");
    const yearLevelLabel = document.getElementById("yearLevelLabel");
    const yearLevelInput = document.getElementById("yearLevelInput");
    const schoolLabel = document.getElementById("schoolLabel");
    const schoolInput = document.getElementById("schoolInput");
    const workingFields = document.getElementById("workingFields");
    const incomingFields = document.getElementById("incomingFields");
    const jobTitleInput = form.querySelector("input[name='job_title']");
    const employerInput = form.querySelector("input[name='employer']");
    const industryInput = form.querySelector("input[name='industry']");
    const shsStrandInput = form.querySelector("input[name='shs_strand']");
    const intendedDegreeInput = form.querySelector("input[name='intended_degree']");
    const surveyTitle = document.getElementById("activeSurveyTitle");
    const surveyDescription = document.getElementById("activeSurveyDescription");

    typeRadios.forEach((radio) => {
      radio.checked = radio.value === state.respondentType;
    });

    if (surveyTitle) surveyTitle.textContent = selectedMeta.surveyTitle;
    if (surveyDescription) surveyDescription.textContent = selectedMeta.description;

    if (workingFields) workingFields.style.display = "none";
    if (incomingFields) incomingFields.style.display = "none";
    [jobTitleInput, employerInput, industryInput, shsStrandInput, intendedDegreeInput].forEach((field) => {
      if (field) {
        field.required = false;
        field.disabled = true;
      }
    });

    if (state.respondentType === "student") {
      if (degreeLabel) degreeLabel.textContent = "Course or degree";
      if (degreeInput) { degreeInput.placeholder = "Example: BS Psychology"; degreeInput.required = true; }
      if (yearLevelLabel) yearLevelLabel.textContent = "Year level / status";
      if (yearLevelInput) { yearLevelInput.placeholder = "Example: 4th Year or Graduate"; yearLevelInput.required = true; }
      if (schoolLabel) schoolLabel.textContent = "School / institution";
      if (schoolInput) schoolInput.required = true;
    } else if (state.respondentType === "incoming") {
      if (degreeLabel) degreeLabel.textContent = "Intended course or degree";
      if (degreeInput) { degreeInput.placeholder = "Example: BS Nursing"; degreeInput.required = true; }
      if (yearLevelLabel) yearLevelLabel.textContent = "Current student status";
      if (yearLevelInput) { yearLevelInput.placeholder = "Example: SHS Grade 12 or SHS Graduate"; yearLevelInput.required = true; }
      if (schoolLabel) schoolLabel.textContent = "Senior high school";
      if (schoolInput) schoolInput.required = true;
      if (incomingFields) incomingFields.style.display = "";
      [shsStrandInput, intendedDegreeInput].forEach((field) => {
        if (field) field.disabled = false;
      });
    } else if (state.respondentType === "working") {
      if (degreeLabel) degreeLabel.textContent = "Completed degree / training";
      if (degreeInput) { degreeInput.placeholder = "Example: BS Psychology, TESDA training, or work field"; degreeInput.required = true; }
      if (yearLevelLabel) yearLevelLabel.textContent = "Highest educational attainment";
      if (yearLevelInput) { yearLevelInput.placeholder = "Example: College Graduate"; yearLevelInput.required = false; }
      if (schoolLabel) schoolLabel.textContent = "School graduated from";
      if (schoolInput) schoolInput.required = false;
      if (workingFields) workingFields.style.display = "";
      [jobTitleInput, employerInput, industryInput].forEach((field) => {
        if (field) field.disabled = false;
      });
      if (jobTitleInput) jobTitleInput.required = true;
    }

    renderSurvey();
    hydrateDraft();
    updateProgress();
    renderSurveyContextBanner(state.respondentType);
    updateAssessmentUi();
  }

  function renderSurveyContextBanner(type) {
    const existing = document.getElementById("surveyContextBanner");
    if (existing) existing.remove();

    if (type === "working") {
      const banner = document.createElement("div");
      banner.id = "surveyContextBanner";
      banner.className = "survey-context-banner";
      banner.innerHTML = `<strong>Working respondent survey:</strong> The profile and questions are adjusted for graduates or employed respondents. Items refer to your current work, completed degree, training, or work background.`;
      nodes.surveyForm.insertAdjacentElement("beforebegin", banner);
    } else if (type === "incoming") {
      const banner = document.createElement("div");
      banner.id = "surveyContextBanner";
      banner.className = "survey-context-banner is-incoming";
      banner.innerHTML = `<strong>Incoming college survey:</strong> The profile and questions are adjusted for respondents preparing to enter college. Answer based on your planned course and expected future career.`;
      nodes.surveyForm.insertAdjacentElement("beforebegin", banner);
    }
  }

  function updateAssessmentUi() {
    const canAssess = Boolean(state.currentUser && state.profile && state.profile.consent && !state.submission);
    const sections = getCurrentSections();
    const isLastSection = state.currentSectionIndex >= sections.length - 1;

    if (nodes.assessmentIntro) {
      nodes.assessmentIntro.style.display = canAssess && !state.assessmentStarted ? "" : "none";
    }
    if (nodes.surveyLayout) {
      nodes.surveyLayout.style.display = canAssess && state.assessmentStarted ? "" : "none";
    }
    if (nodes.surveyActions) {
      nodes.surveyActions.style.display = canAssess && state.assessmentStarted ? "flex" : "none";
    }
    if (nodes.prevSectionBtn) {
      nodes.prevSectionBtn.disabled = state.currentSectionIndex === 0;
    }
    if (nodes.nextSectionBtn) {
      nodes.nextSectionBtn.style.display = isLastSection ? "none" : "";
    }
    if (nodes.submitSurveyBtn) {
      nodes.submitSurveyBtn.style.display = isLastSection ? "" : "none";
    }
    if (state.submission && nodes.submissionMessage) {
      setMessage(nodes.submissionMessage, "A completed assessment is already saved for this account.", "");
    } else if (!canAssess && nodes.submissionMessage) {
      setMessage(nodes.submissionMessage, "Save your respondent profile first to proceed to the assessment.", "");
    } else if (canAssess && nodes.submissionMessage && !state.assessmentStarted) {
      setMessage(nodes.submissionMessage, "", "");
    }
  }

  function startAssessment() {
    if (!state.currentUser || !state.profile || !state.profile.consent) {
      setMessage(nodes.submissionMessage, "Please sign in and save your respondent profile before beginning the assessment.", "error");
      jumpTo("#account");
      return;
    }
    state.assessmentStarted = true;
    renderSurvey();
    hydrateDraft();
    updateProgress();
    setMessage(nodes.submissionMessage, "", "");
    updateAssessmentUi();
  }

  function initGuidanceTabs() {
    const tabs = document.querySelectorAll(".guidance-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        document.querySelectorAll(".guidance-panel").forEach((panel) => {
          panel.style.display = "none";
          panel.classList.remove("is-active");
        });
        const target = document.getElementById(tab.dataset.target);
        if (target) {
          target.style.display = "";
          target.classList.add("is-active");
        }
      });
    });
  }

  function initStorageMode() {
    if (isSupabaseConfigured) {
      state.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      state.authMode = "supabase";
      nodes.connectionStatus.hidden = true;
    } else {
      state.authMode = "local";
      nodes.connectionStatus.hidden = false;
      nodes.connectionStatus.textContent = "Supabase is not configured yet. The site is running in local demo mode for preview and UI testing.";
    }
  }

  async function restoreSession() {
    if (state.authMode === "supabase") {
      const { data } = await state.client.auth.getSession();
      state.currentUser = data.session ? data.session.user : null;
      state.client.auth.onAuthStateChange(async (_event, session) => {
        state.currentUser = session ? session.user : null;
        await afterAuthChange();
      });
    } else {
      state.currentUser = readJson(storageKeys.localSession, null);
    }

    await afterAuthChange();
  }

  async function afterAuthChange() {
    syncAuthUi();
    if (!state.currentUser) {
      state.profile = null;
      state.submission = null;
      state.assessmentStarted = false;
      state.currentSectionIndex = 0;
      discardSurveyDraft({ resetForm: true });
      updateAssessmentUi();
      return;
    }

    await loadProfile();
    await loadSubmission();
    populateProfileForm();
    if (state.submission && state.submission.payload) {
      renderStoredResults(state.submission.payload);
    }
    updateAssessmentUi();

  }

  async function refreshCurrentSession() {
    if (state.authMode !== "supabase") return;
    const { data, error } = await state.client.auth.getSession();
    if (error) {
      setMessage(nodes.authMessage, normalizeError(error), "error");
      return;
    }
    state.currentUser = data.session ? data.session.user : null;
    syncAuthUi();
  }

  function attachEventListeners() {
    let scrollHideTimer = null;
    window.addEventListener("scroll", () => {
      document.body.classList.add("is-page-scrolling");
      window.clearTimeout(scrollHideTimer);
      scrollHideTimer = window.setTimeout(() => {
        document.body.classList.remove("is-page-scrolling");
      }, 260);
    }, { passive: true });
    window.addEventListener("pagehide", () => {
      discardSurveyDraft({ resetForm: false });
    });

    nodes.authForm.addEventListener("click", (event) => {
      const submitButton = event.target.closest("button[type='submit']");
      if (!submitButton) return;
      nodes.authForm.dataset.mode = submitButton.dataset.authMode || "signin";
    });

    nodes.authForm.addEventListener("submit", handleAuthSubmit);
    nodes.signOutBtn.addEventListener("click", handleSignOut);
    nodes.authToggleBtn.addEventListener("click", () => jumpTo("#account"));
    nodes.profileShortcutBtn.addEventListener("click", () => jumpTo("#account"));
    if (nodes.dashboardToggleBtn) {
      nodes.dashboardToggleBtn.addEventListener("click", () => {
        const isOpen = document.body.classList.toggle("dashboard-open");
        nodes.dashboardToggleBtn.setAttribute("aria-expanded", String(isOpen));
      });
      document.querySelectorAll(".desktop-nav a").forEach((link) => {
        link.addEventListener("click", () => {
          document.body.classList.remove("dashboard-open");
          nodes.dashboardToggleBtn.setAttribute("aria-expanded", "false");
        });
      });
    }
    if (nodes.menuToggleBtn && nodes.mobileNav) {
      nodes.menuToggleBtn.addEventListener("click", () => {
        const isOpen = nodes.mobileNav.classList.toggle("is-open");
        nodes.menuToggleBtn.setAttribute("aria-expanded", String(isOpen));
      });
      nodes.mobileNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          nodes.mobileNav.classList.remove("is-open");
          nodes.menuToggleBtn.setAttribute("aria-expanded", "false");
        });
      });
    }
    nodes.profileForm.addEventListener("submit", handleProfileSubmit);
    nodes.matchDegreeBtn.addEventListener("click", () => renderDegreeMatch(nodes.degreeInput.value));
    nodes.useProfileDegreeBtn.addEventListener("click", useProfileDegree);
    nodes.beginAssessmentBtn.addEventListener("click", startAssessment);
    nodes.surveyForm.addEventListener("change", handleSurveyChange);
    nodes.surveyForm.addEventListener("submit", handleSurveySubmit);
    nodes.saveDraftBtn.addEventListener("click", saveDraftFromForm);
    nodes.clearDraftBtn.addEventListener("click", clearDraft);
    nodes.prevSectionBtn.addEventListener("click", goToPreviousSection);
    nodes.nextSectionBtn.addEventListener("click", goToNextSection);
    nodes.downloadResultCsvBtn.addEventListener("click", downloadOwnCsv);
    nodes.printResultsBtn.addEventListener("click", () => window.print());
    nodes.reloadSavedResultBtn.addEventListener("click", async () => {
      await loadSubmission();
      renderStoredResults(state.submission ? state.submission.payload : state.lastResults);
    });
  }

  function renderSurvey() {
    const sections = getCurrentSections();
    const section = sections[state.currentSectionIndex] || sections[0];
    if (!section) {
      nodes.surveyForm.innerHTML = "";
      return;
    }

    const questionsHtml = section.questions.map((question, index) => {
      const itemKey = `${section.key}${index + 1}`;
      const options = section.scale.map((value) => `
        <label>
          <input type="radio" name="${itemKey}" value="${value}" required>
          <span>${value}</span>
        </label>
      `).join("");

      return `
        <div class="survey-question">
          <label class="question-title">${index + 1}. ${escapeHtml(question)}</label>
          <div class="choice-grid">${options}</div>
        </div>
      `;
    }).join("");

    const html = `
      <section class="survey-section-card" data-section-key="${section.key}">
        <p class="section-counter">Section ${state.currentSectionIndex + 1} of ${sections.length}</p>
        <h3>${escapeHtml(section.title)}</h3>
        <p class="survey-note">${escapeHtml(section.scaleText)}</p>
        ${questionsHtml}
      </section>
    `;

    nodes.surveyForm.innerHTML = html;
  }

  function handleSurveyChange() {
    if (!state.currentUser) {
      discardSurveyDraft({ resetForm: true });
      setMessage(nodes.submissionMessage, "Please sign in before answering the survey.", "error");
      jumpTo("#account");
      return;
    }
    updateProgress();
    persistDraft({ ...state.draft, ...collectFormValues(nodes.surveyForm) });
  }

  function updateProgress() {
    const values = { ...state.draft, ...collectFormValues(nodes.surveyForm) };
    const answered = Object.keys(values).length;
    const percent = Math.round((answered / totalQuestionCount) * 100);
    nodes.progressSummary.textContent = `${answered} of ${totalQuestionCount} answered`;
    nodes.progressBar.style.width = `${percent}%`;
    if (nodes.floatingProgressText) {
      nodes.floatingProgressText.textContent = `${answered} of ${totalQuestionCount} answered`;
    }
    if (nodes.floatingProgressBar) {
      nodes.floatingProgressBar.style.width = `${percent}%`;
    }
  }

  function hydrateDraft() {
    Object.entries(state.draft || {}).forEach(([key, value]) => {
      const field = nodes.surveyForm.elements.namedItem(key);
      if (!field) return;
      const radio = nodes.surveyForm.querySelector(`input[name="${cssEscape(key)}"][value="${cssEscape(String(value))}"]`);
      if (radio) radio.checked = true;
    });
  }

  function persistDraft(values) {
    state.draft = values;
    localStorage.setItem(storageKeys.draft, JSON.stringify(values));
  }

  function persistCurrentSectionDraft() {
    persistDraft({ ...state.draft, ...collectFormValues(nodes.surveyForm) });
  }

  function validateCurrentSection() {
    const section = getCurrentSections()[state.currentSectionIndex];
    if (!section) return true;
    const values = collectFormValues(nodes.surveyForm);
    const missing = section.questions.some((_question, index) => !values[`${section.key}${index + 1}`]);
    if (missing) {
      nodes.surveyForm.reportValidity();
      setMessage(nodes.submissionMessage, "Please answer all items in this section before continuing.", "error");
      return false;
    }
    return true;
  }

  function goToPreviousSection() {
    persistCurrentSectionDraft();
    state.currentSectionIndex = Math.max(0, state.currentSectionIndex - 1);
    renderSurvey();
    hydrateDraft();
    updateProgress();
    updateAssessmentUi();
  }

  function goToNextSection() {
    if (!validateCurrentSection()) return;
    persistCurrentSectionDraft();
    const sections = getCurrentSections();
    state.currentSectionIndex = Math.min(sections.length - 1, state.currentSectionIndex + 1);
    renderSurvey();
    hydrateDraft();
    updateProgress();
    updateAssessmentUi();
  }

  function discardSurveyDraft(options = {}) {
    localStorage.removeItem(storageKeys.draft);
    state.draft = {};
    if (options.resetForm && nodes.surveyForm) {
      nodes.surveyForm.reset();
      updateProgress();
    }
  }

  function saveDraftFromForm() {
    persistCurrentSectionDraft();
    updateProgress();
    setMessage(nodes.submissionMessage, "Draft saved in this browser.", "success");
  }

  function clearDraft() {
    discardSurveyDraft({ resetForm: true });
    state.currentSectionIndex = 0;
    renderSurvey();
    updateAssessmentUi();
    setMessage(nodes.submissionMessage, "Draft cleared from this browser.", "success");
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    const mode = nodes.authForm.dataset.mode || "signin";
    const formData = new FormData(nodes.authForm);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    try {
      if (!email || !password) {
        throw new Error("Please provide both email and password.");
      }

      if (state.authMode === "supabase") {
        if (mode === "signup") {
          const { data, error } = await state.client.auth.signUp({ email, password });
          if (error) throw error;
          state.currentUser = data.session ? data.user : null;
          if (state.currentUser) {
            await afterAuthChange();
            setMessage(nodes.authMessage, "Account created and signed in successfully.", "success");
          } else {
            setMessage(nodes.authMessage, "Account created. Check your email if confirmation is enabled, then sign in.", "success");
          }
        } else {
          const { data, error } = await state.client.auth.signInWithPassword({ email, password });
          if (error) throw error;
          state.currentUser = data.user || null;
          await afterAuthChange();
          setMessage(nodes.authMessage, "Signed in successfully.", "success");
        }
      } else {
        const users = readJson(storageKeys.localUsers, []);
        let user = users.find((entry) => entry.email === email);
        if (mode === "signup") {
          if (user) throw new Error("That email already exists in local demo mode.");
          user = {
            id: crypto.randomUUID(),
            email,
            password,
            role: email.includes("admin") ? "admin" : "respondent"
          };
          users.push(user);
          localStorage.setItem(storageKeys.localUsers, JSON.stringify(users));
          localStorage.setItem(storageKeys.localSession, JSON.stringify(user));
          state.currentUser = user;
          setMessage(nodes.authMessage, "Local demo account created and signed in.", "success");
        } else {
          if (!user || user.password !== password) throw new Error("Invalid local demo credentials.");
          localStorage.setItem(storageKeys.localSession, JSON.stringify(user));
          state.currentUser = user;
          setMessage(nodes.authMessage, "Signed in using local demo storage.", "success");
        }
        await afterAuthChange();
      }
    } catch (error) {
      setMessage(nodes.authMessage, normalizeError(error), "error");
    }
  }

  async function handleSignOut() {
    try {
      if (state.authMode === "supabase") {
        const { error } = await state.client.auth.signOut();
        if (error) throw error;
      } else {
        localStorage.removeItem(storageKeys.localSession);
        state.currentUser = null;
        await afterAuthChange();
      }
      discardSurveyDraft({ resetForm: true });
      setMessage(nodes.authMessage, "Signed out.", "success");
    } catch (error) {
      setMessage(nodes.authMessage, normalizeError(error), "error");
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();

    if (!state.currentUser) {
      setMessage(nodes.profileMessage, "Please sign in before saving a profile.", "error");
      jumpTo("#account");
      return;
    }

    const payload = Object.fromEntries(new FormData(nodes.profileForm).entries());
    payload.consent = Boolean(nodes.profileForm.querySelector("input[name='consent']").checked);
    payload.email = state.currentUser.email || payload.email || "";
    payload.role = normalizeProfileRole(state.profile?.role || state.currentUser.role);
    payload.respondent_type = normalizeRespondentType(payload.respondent_type || state.respondentType);
    payload.student_number = state.profile?.student_number || state.currentUser.id || payload.email || `respondent-${Date.now()}`;
    payload.city = "";
    payload.province = "";

    try {
      if (!payload.consent) {
        throw new Error("Consent is required before the survey can be saved.");
      }

      if (state.authMode === "supabase") {
        const row = {
          id: state.currentUser.id,
          email: payload.email,
          first_name: payload.first_name,
          last_name: payload.last_name,
          student_number: payload.student_number,
          age: numberOrNull(payload.age),
          sex: payload.sex,
          year_level: payload.year_level,
          degree: payload.degree,
          school: payload.school,
          job_title: payload.job_title,
          employer: payload.employer,
          industry: payload.industry,
          years_experience: numberOrNull(payload.years_experience),
          shs_strand: payload.shs_strand,
          intended_degree: payload.intended_degree,
          respondent_type: payload.respondent_type,
          city: payload.city,
          province: payload.province,
          consent: payload.consent,
          role: payload.role,
          updated_at: new Date().toISOString()
        };
        const { error } = await state.client.from("profiles").upsert(row);
        if (error) throw error;
      } else {
        const profiles = readJson(storageKeys.localProfiles, []);
        const others = profiles.filter((entry) => entry.id !== state.currentUser.id);
        others.push({ id: state.currentUser.id, ...payload });
        localStorage.setItem(storageKeys.localProfiles, JSON.stringify(others));
      }

      await loadProfile();
      populateProfileForm();
      applyRespondentType(payload.respondent_type);
      state.assessmentStarted = false;
      state.currentSectionIndex = 0;
      renderSurvey();
      hydrateDraft();
      updateProgress();
      updateAssessmentUi();
      setMessage(nodes.profileMessage, "Profile saved successfully.", "success");
      jumpTo("#survey");
    } catch (error) {
      setMessage(nodes.profileMessage, normalizeError(error), "error");
    }
  }

  async function loadProfile() {
    if (!state.currentUser) {
      state.profile = null;
      return;
    }

    if (state.authMode === "supabase") {
      const { data, error } = await state.client
        .from("profiles")
        .select("*")
        .eq("id", state.currentUser.id)
        .maybeSingle();
      if (error) {
        setMessage(nodes.profileMessage, normalizeError(error), "error");
        state.profile = null;
        return;
      }
      state.profile = data;
    } else {
      const profiles = readJson(storageKeys.localProfiles, []);
      state.profile = profiles.find((entry) => entry.id === state.currentUser.id) || null;
    }
  }

  async function loadSubmission() {
    if (!state.currentUser) {
      state.submission = null;
      return;
    }

    if (state.authMode === "supabase") {
      const { data, error } = await state.client
        .from("submissions")
        .select("*")
        .eq("respondent_id", state.currentUser.id)
        .maybeSingle();
      if (error) {
        setMessage(nodes.submissionMessage, normalizeError(error), "error");
        state.submission = null;
        return;
      }
      state.submission = data;
    } else {
      const submissions = readJson(storageKeys.localSubmissions, []);
      state.submission = submissions.find((entry) => entry.respondent_id === state.currentUser.id) || null;
    }
  }

  function populateProfileForm() {
    const profile = state.profile;
    if (!profile) return;

    Object.entries(profile).forEach(([key, value]) => {
      const field = nodes.profileForm.elements.namedItem(key);
      if (!field) return;
      if (field.type === "checkbox") {
        field.checked = Boolean(value);
      } else if (field.type === "radio") {
        if (field.value === value) field.checked = true;
      } else {
        field.value = value ?? "";
      }
    });

    // Trigger UI for saved respondent type
    if (profile.respondent_type) {
      applyRespondentType(profile.respondent_type);
    }
  }

  async function handleSurveySubmit(event) {
    event.preventDefault();

    await refreshCurrentSession();

    if (!state.currentUser) {
      setMessage(nodes.submissionMessage, "You are not signed in. Please sign in first, then submit again.", "error");
      return;
    }

    if (!state.profile || !state.profile.consent) {
      await loadProfile();
    }

    if (!state.profile || !state.profile.consent) {
      setMessage(nodes.submissionMessage, "Please save your respondent profile with consent first, then submit again.", "error");
      return;
    }

    await loadSubmission();
    if (state.submission) {
      setMessage(nodes.submissionMessage, "A final survey submission already exists for this account.", "error");
      renderStoredResults(state.submission.payload);
      jumpTo("#results");
      return;
    }

    if (!validateCurrentSection()) return;
    persistCurrentSectionDraft();
    const answers = { ...state.draft, ...collectFormValues(nodes.surveyForm) };
    if (Object.keys(answers).length !== totalQuestionCount) {
      setMessage(nodes.submissionMessage, "Please answer all survey items before submitting.", "error");
      return;
    }

    const results = computeResults(answers);

    try {
      if (state.authMode === "supabase") {
        const submissionRow = {
          respondent_id: state.currentUser.id,
          hcm_total: results.savedResults.HCM_Total,
          hcm_average: Number(results.savedResults.HCM_Average),
          hcm_interpretation: results.savedResults.HCM_Interpretation,
          payload: results
        };

        const { data: insertedSubmission, error: submissionError } = await state.client
          .from("submissions")
          .insert(submissionRow)
          .select("*")
          .single();
        if (submissionError) throw submissionError;

        const answerRows = results.answerRows.map((entry) => ({
          submission_id: insertedSubmission.id,
          section_key: entry.section_key,
          item_key: entry.item_key,
          value: entry.value
        }));
        const scoreRows = results.scoreRows.map((entry) => ({
          submission_id: insertedSubmission.id,
          section_key: entry.section_key,
          section_title: entry.section_title,
          total: entry.total,
          average: entry.average,
          interpretation: entry.interpretation
        }));

        const { error: answersError } = await state.client.from("submission_answers").insert(answerRows);
        if (answersError) throw answersError;
        const { error: scoresError } = await state.client.from("submission_scores").insert(scoreRows);
        if (scoresError) throw scoresError;
      } else {
        const submissions = readJson(storageKeys.localSubmissions, []);
        submissions.push({
          id: crypto.randomUUID(),
          respondent_id: state.currentUser.id,
          submitted_at: new Date().toISOString(),
          hcm_total: results.savedResults.HCM_Total,
          hcm_average: Number(results.savedResults.HCM_Average),
          hcm_interpretation: results.savedResults.HCM_Interpretation,
          payload: results
        });
        localStorage.setItem(storageKeys.localSubmissions, JSON.stringify(submissions));
      }

      localStorage.removeItem(storageKeys.draft);
      state.draft = {};
      localStorage.setItem(storageKeys.results, JSON.stringify(results));
      state.lastResults = results;
      await loadSubmission();
      renderStoredResults(results);
      setMessage(nodes.submissionMessage, "Assessment complete. Thank you for completing the CareerFit Self-Assessment.", "success");
      jumpTo("#results");
    } catch (error) {
      setMessage(nodes.submissionMessage, normalizeError(error), "error");
    }
  }

  function computeResults(answers) {
    const savedResults = {};
    const scoreRows = [];
    const answerRows = [];
    const sections = getCurrentSections();
    const activeType = respondentTypes[state.respondentType] || respondentTypes.student;

    sections.forEach((section) => {
      let total = 0;
      section.questions.forEach((question, index) => {
        const itemKey = `${section.key}${index + 1}`;
        const value = Number(answers[itemKey]);
        total += value;
        savedResults[itemKey] = value;
        answerRows.push({
          section_key: section.key,
          item_key: itemKey,
          question,
          value
        });
      });

      const average = total / section.questions.length;
      const interpretation = interpretScore(section.key, average);
      savedResults[`${section.key}_Total`] = total;
      savedResults[`${section.key}_Average`] = average.toFixed(2);
      savedResults[`${section.key}_Interpretation`] = interpretation;

      scoreRows.push({
        section_key: section.key,
        section_title: section.title,
        total,
        average: Number(average.toFixed(2)),
        interpretation
      });
    });

    return {
      submittedAt: new Date().toISOString(),
      respondentType: state.respondentType,
      respondentTypeLabel: activeType.label,
      savedResults,
      scoreRows,
      answerRows
    };
  }

  function interpretScore(key, average) {
    if (key === "HCM") {
      if (average >= 3.67) return "High Horizontal Career Mismatch";
      if (average >= 2.34) return "Moderate Horizontal Career Mismatch";
      return "Low Horizontal Career Mismatch";
    }

    if (key === "ER") {
      if (average >= 5.01) return "High";
      if (average >= 3.01) return "Moderate";
      return "Low";
    }

    if (average >= 3.67) return "High";
    if (average >= 2.34) return "Moderate";
    return "Low";
  }

  function renderStoredResults(results) {
    if (!results || !results.savedResults) {
      nodes.overallResultCard.innerHTML = `<p class="placeholder-copy">Submit the assessment to view your career reflection summary.</p>`;
      nodes.resultsChartWrap.innerHTML = `<p class="placeholder-copy">A visual summary of your eight assessment dimensions will appear here after submission.</p>`;
      nodes.sectionResultsWrap.innerHTML = `<p class="placeholder-copy">Section-by-section totals, averages, and interpretations will appear here.</p>`;
      return;
    }

    const hcmAverage = results.savedResults.HCM_Average;
    const hcmInterpretation = results.savedResults.HCM_Interpretation;
    const submittedAt = new Date(results.submittedAt || Date.now()).toLocaleString();
    const summaryCards = [
      { label: "Main result", value: hcmInterpretation },
      { label: "HCM average", value: hcmAverage },
      { label: "Survey type", value: results.respondentTypeLabel || respondentTypes[results.respondentType]?.label || "College Student" },
      { label: "Submitted", value: submittedAt }
    ].map((entry) => `
      <article class="metric-card">
        <strong>${escapeHtml(entry.value)}</strong>
        <span>${escapeHtml(entry.label)}</span>
      </article>
    `).join("");

    const scoreCards = results.scoreRows.map((row) => `
      <article class="score-card">
        <strong>${escapeHtml(row.section_title)}</strong>
        <div>Total Score: ${escapeHtml(String(row.total))}</div>
        <div>Average: ${escapeHtml(String(row.average))}</div>
        <small>${escapeHtml(row.interpretation)}</small>
      </article>
    `).join("");

    const tableRows = results.scoreRows.map((row) => `
      <tr>
        <td>${escapeHtml(row.section_title)}</td>
        <td>${escapeHtml(String(row.total))}</td>
        <td>${escapeHtml(String(row.average))}</td>
        <td>${escapeHtml(row.interpretation)}</td>
      </tr>
    `).join("");

    const chartRows = results.scoreRows.map((row) => {
      const section = collegeStudentSections.find((entry) => entry.key === row.section_key);
      const maxScale = section ? Math.max(...section.scale) : 5;
      const width = Math.max(6, Math.round((Number(row.average) / maxScale) * 100));
      return `
        <div class="chart-row">
          <span class="chart-label">${escapeHtml(row.section_key)}</span>
          <div class="chart-track"><span class="chart-fill" style="width:${width}%"></span></div>
          <span class="chart-value">${escapeHtml(String(row.average))}</span>
        </div>
      `;
    }).join("");

    nodes.overallResultCard.innerHTML = `
      <p class="panel-label">Career Reflection Summary</p>
      <h3>${escapeHtml(hcmInterpretation)}</h3>
      <p>Your HCM average is <strong>${escapeHtml(String(hcmAverage))}</strong>. The full result set below includes all variable scores from the thesis survey.</p>
      <div class="results-summary-grid">${summaryCards}</div>
    `;

    nodes.resultsChartWrap.innerHTML = `
      <div class="chart-card">
        <h3>Dimension overview</h3>
        <p class="hint">This chart gives a quick visual summary of your scores across the eight survey dimensions.</p>
        <div class="chart-grid">${chartRows}</div>
        <div class="chart-legend">
          <span><i></i> Higher bars reflect stronger averages within each dimension's scale.</span>
        </div>
      </div>
    `;

    nodes.sectionResultsWrap.innerHTML = `
      <div class="score-card-grid">${scoreCards}</div>
      <table class="results-table">
        <thead>
          <tr>
            <th>Variable</th>
            <th>Total Score</th>
            <th>Average</th>
            <th>Interpretation</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
  }

  function renderDegreeMatch(rawInput) {
    const input = normalizeDegreeSearch(rawInput || "");
    if (!input) {
      nodes.degreeMatchOutput.innerHTML = `<p class="placeholder-copy">Enter a degree above or use your saved profile degree to see aligned roles, search terms, and guidance.</p>`;
      return;
    }

    const match = degreeMatches.find((entry) => entry.keywords.some((keyword) => degreeKeywordMatches(input, keyword)));
    if (!match) {
      const fallbackRoles = ["Assistant", "Associate", "Coordinator", "Analyst", "Trainee", "Aide"];
      const fallbackCards = fallbackRoles
        .map((role) => renderRoleJobCard(`${rawInput} ${role}`.trim(), rawInput || "General degree search"))
        .join("");
      nodes.degreeMatchOutput.innerHTML = `
        <h3>No exact degree cluster found yet</h3>
        <p class="hint">These live-search buttons open current listings from job platforms using your degree and common entry-level titles.</p>
        <div class="job-link-grid">
          ${fallbackCards}
        </div>
      `;
      return;
    }

    const verifiedJobs = getVerifiedJobstreetJobs(match);
    const jobCards = verifiedJobs.map((job) => renderJobstreetPostingCard(job)).join("");
    const keywordList = match.search_keywords.map((keyword) => `<span class="eyebrow">${escapeHtml(keyword)}</span>`).join(" ");
    const searchQuery = encodeURIComponent(`${match.title} ${match.roles.slice(0, 2).join(" ")} Philippines`);

    nodes.degreeMatchOutput.innerHTML = `
      <p class="card-kicker">${escapeHtml(match.title)}</p>
      <h3>Verified JobStreet postings from hiring companies</h3>
      <p class="hint">These are direct JobStreet job ads verified from live listings on May 8, 2026. Job ads may expire when the employer closes hiring.</p>
      <div class="job-link-grid">
        ${jobCards}
      </div>
      <p><strong>Search keywords:</strong></p>
      <p>${keywordList}</p>
      <p class="hint">${escapeHtml(match.guidance)}</p>
      <div class="field-row">
        <a class="button button-secondary" href="https://www.jobstreet.com.ph/jobs?keywords=${searchQuery}" target="_blank" rel="noreferrer">Search JobStreet</a>
        <a class="button button-muted" href="https://ph.indeed.com/jobs?q=${searchQuery}" target="_blank" rel="noreferrer">Search Indeed</a>
        <a class="button button-muted" href="https://www.linkedin.com/jobs/search/?keywords=${searchQuery}&location=Philippines" target="_blank" rel="noreferrer">Search LinkedIn</a>
      </div>
    `;
  }

  function getVerifiedJobstreetJobs(match) {
    const group = getVerifiedJobGroup(match);
    return verifiedJobstreetJobs[group] || verifiedJobstreetJobs.business_accounting;
  }

  function getVerifiedJobGroup(match) {
    const key = match.cluster_key;
    if ([
      "agriculture",
      "agribusiness",
      "forestry",
      "environmental_science",
      "agricultural_biosystems_engineering",
      "veterinary_medicine"
    ].includes(key)) return "agriculture";
    if (key.includes("education") || key.includes("physical_education") || key.includes("technology_livelihood") || key.includes("theology")) return "education";
    if ([
      "information_technology",
      "web_mobile_development",
      "library_information_science"
    ].includes(key)) return "information_technology";
    if ([
      "accountancy",
      "accounting_information_systems",
      "business_financial_management",
      "entrepreneurship",
      "office_administration",
      "public_administration"
    ].includes(key)) return "business_accounting";
    if (["nursing", "nutrition_dietetics"].includes(key)) return "health";
    if (["psychology", "social_work"].includes(key)) return "human_services";
    if ([
      "communication",
      "english_language",
      "filipino_language",
      "history",
      "development_communication"
    ].includes(key)) return "communication";
    if (key.includes("engineering")) return "engineering";
    if ([
      "hospitality_management",
      "tourism_management",
      "fitness_sports_management",
      "fitness_sports_coaching",
      "exercise_sports_sciences"
    ].includes(key)) return "hospitality_tourism";
    if ([
      "food_technology",
      "biology",
      "chemistry"
    ].includes(key)) return "science_research";
    if ([
      "statistics",
      "mathematics",
      "business_analytics_big_data"
    ].includes(key)) return "information_technology";
    if (key === "criminology") return "criminology_security";
    return "business_accounting";
  }

  function renderJobstreetPostingCard(job) {
    return `
      <article class="job-role-card">
        <span class="job-source">JobStreet verified</span>
        <strong>${escapeHtml(job.title)}</strong>
        <small>${escapeHtml(job.company)}</small>
        <div class="job-posting-meta">${escapeHtml(job.location)}</div>
        <div class="job-posting-meta">${escapeHtml(job.listed)}</div>
        <div class="job-posting-meta">Aligned role: ${escapeHtml(job.aligned_role)}</div>
        <div class="job-platforms">
          <a href="${escapeHtml(job.url)}" target="_blank" rel="noreferrer">Open JobStreet Job</a>
        </div>
      </article>
    `;
  }

  function renderRoleJobCard(role, degreeTitle) {
    const links = buildJobPlatformLinks(role, degreeTitle);
    return `
      <article class="job-role-card">
        <strong>${escapeHtml(role)}</strong>
        <small>${escapeHtml(degreeTitle)}</small>
        <div class="job-platforms">
          <a href="${links.jobstreet}" target="_blank" rel="noreferrer">JobStreet</a>
          <a href="${links.indeed}" target="_blank" rel="noreferrer">Indeed</a>
          <a href="${links.linkedin}" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </article>
    `;
  }

  function buildJobPlatformLinks(role, degreeTitle) {
    const query = encodeURIComponent(`${role} ${degreeTitle} Philippines`);
    return {
      jobstreet: `https://www.jobstreet.com.ph/jobs?keywords=${query}`,
      indeed: `https://ph.indeed.com/jobs?q=${query}`,
      linkedin: `https://www.linkedin.com/jobs/search/?keywords=${query}&location=Philippines`
    };
  }

  function normalizeDegreeSearch(value) {
    return String(value)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/\b(bachelor|of|science|arts|in|program|major|majors)\b/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function degreeKeywordMatches(normalizedInput, keyword) {
    const normalizedKeyword = normalizeDegreeSearch(keyword);
    if (!normalizedKeyword) return false;
    if (normalizedKeyword.length <= 3) {
      return normalizedInput.split(" ").includes(normalizedKeyword);
    }
    return normalizedInput.includes(normalizedKeyword);
  }

  function useProfileDegree() {
    if (!state.profile || !state.profile.degree) {
      renderDegreeMatch("");
      nodes.degreeMatchOutput.innerHTML = `<p class="placeholder-copy">Save your respondent profile first so the site can reuse your degree here.</p>`;
      return;
    }
    nodes.degreeInput.value = state.profile.degree;
    renderDegreeMatch(state.profile.degree);
  }

  async function loadAdminData() {
    if (!isAdmin()) {
      setAdminMessage("This account is not marked as an admin.", true);
      renderAdminTable([]);
      return;
    }

    try {
      let rows = [];

      if (state.authMode === "supabase") {
        const { data, error } = await state.client
          .from("submissions")
          .select("id, submitted_at, respondent_id, hcm_average, hcm_interpretation, payload, profiles!inner(first_name,last_name,degree,email,student_number,respondent_type,role)")
          .order("submitted_at", { ascending: false });
        if (error) throw error;
        rows = (data || []).map((entry) => normalizeSupabaseAdminRow(entry));
      } else {
        const profiles = readJson(storageKeys.localProfiles, []);
        const submissions = readJson(storageKeys.localSubmissions, []);
        rows = submissions.map((submission) => {
          const profile = profiles.find((entry) => entry.id === submission.respondent_id) || {};
          return {
            id: submission.id,
            respondent_id: submission.respondent_id,
            submitted_at: submission.submitted_at,
            hcm_average: submission.hcm_average,
            hcm_interpretation: submission.hcm_interpretation,
            payload: submission.payload,
            profile
          };
        }).sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
      }

      state.adminRows = rows;
      renderAdminTable(filterAdminRows(nodes.adminSearchInput.value));
      renderAdminDetail(rows[0] || null);
      setAdminMessage(`Loaded ${rows.length} submission(s).`, false);
    } catch (error) {
      setAdminMessage(normalizeError(error), true);
    }
  }

  function normalizeSupabaseAdminRow(entry) {
    const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
    return {
      id: entry.id,
      respondent_id: entry.respondent_id,
      submitted_at: entry.submitted_at,
      hcm_average: entry.hcm_average,
      hcm_interpretation: entry.hcm_interpretation,
      payload: entry.payload,
      profile: profile || {}
    };
  }

  function filterAdminRows(query) {
    const term = String(query || "").trim().toLowerCase();
    if (!term) return state.adminRows;
    return state.adminRows.filter((row) => {
      const haystack = [
        row.profile?.first_name,
        row.profile?.last_name,
        row.profile?.degree,
        row.profile?.email,
        row.hcm_interpretation
      ].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }

  function renderAdminTable(rows) {
    if (!rows.length) {
      nodes.adminTableBody.innerHTML = `<tr><td colspan="5" class="table-placeholder">No submissions found for the current admin view.</td></tr>`;
      return;
    }

    nodes.adminTableBody.innerHTML = rows.map((row) => {
      const name = `${row.profile?.first_name || ""} ${row.profile?.last_name || ""}`.trim() || "Unnamed respondent";
      return `
        <tr>
          <td>${escapeHtml(name)}<br><small>${escapeHtml(row.profile?.email || "")}</small></td>
          <td>${escapeHtml(row.profile?.degree || "")}</td>
          <td>${escapeHtml(new Date(row.submitted_at).toLocaleString())}</td>
          <td>${escapeHtml(String(row.hcm_average ?? ""))}<br><small>${escapeHtml(row.hcm_interpretation || "")}</small></td>
          <td><button type="button" class="button button-muted" data-row-id="${escapeHtml(row.id)}">View</button></td>
        </tr>
      `;
    }).join("");

    nodes.adminTableBody.querySelectorAll("button[data-row-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const row = state.adminRows.find((entry) => entry.id === button.dataset.rowId);
        renderAdminDetail(row || null);
      });
    });
  }

  function renderAdminDetail(row) {
    if (!row) {
      nodes.adminDetailPanel.innerHTML = `<p class="placeholder-copy">Choose a submission to inspect profile details, raw answers, and computed scores.</p>`;
      return;
    }

    const profile = row.profile || {};
    const resultPayload = row.payload || {};
    const scoreRows = (resultPayload.scoreRows || []).map((score) => `
      <li>${escapeHtml(score.section_key)}: ${escapeHtml(String(score.average))} (${escapeHtml(score.interpretation)})</li>
    `).join("");
    const answerPreview = (resultPayload.answerRows || []).slice(0, 12).map((answer) => `
      <li>${escapeHtml(answer.item_key)} = ${escapeHtml(String(answer.value))}</li>
    `).join("");

    nodes.adminDetailPanel.innerHTML = `
      <h3>${escapeHtml(`${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Respondent")}</h3>
      <p><strong>Email:</strong> ${escapeHtml(profile.email || "")}</p>
      <p><strong>Degree:</strong> ${escapeHtml(profile.degree || "")}</p>
      <p><strong>Submitted:</strong> ${escapeHtml(new Date(row.submitted_at).toLocaleString())}</p>
      <hr>
      <p><strong>Score summary</strong></p>
      <ul>${scoreRows || "<li>No score rows saved.</li>"}</ul>
      <p><strong>Answer preview</strong></p>
      <ul>${answerPreview || "<li>No answers saved.</li>"}</ul>
    `;
  }

  function syncAuthUi() {
    const label = state.currentUser ? `Signed in: ${state.currentUser.email || "respondent"}` : "Sign In";
    nodes.authToggleBtn.textContent = label;
    if (!state.currentUser) {
      nodes.profileShortcutBtn.textContent = "My Profile";
    } else {
      nodes.profileShortcutBtn.textContent = "My Profile";
    }
  }

  function isAdmin() {
    return Boolean(state.profile?.role === "admin" || state.currentUser?.role === "admin");
  }

  async function downloadOwnCsv() {
    const results = state.submission?.payload || state.lastResults;
    if (!results || !results.savedResults) {
      setMessage(nodes.submissionMessage, "No saved result is available yet.", "error");
      return;
    }

    const profile = state.profile || {};
    const row = {
      respondent_id: state.currentUser?.id || "",
      email: state.currentUser?.email || profile.email || "",
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      respondent_type: results.respondentTypeLabel || respondentTypes[results.respondentType]?.label || profile.respondent_type || "",
      degree: profile.degree || "",
      submitted_at: results.submittedAt || ""
    };

    Object.assign(row, results.savedResults);
    downloadCsv([row], "careerfit_my_submission.csv");
  }

  async function downloadAdminCsv() {
    if (!isAdmin()) {
      setAdminMessage("Only admin users can export all submissions.", true);
      return;
    }

    if (!state.adminRows.length) {
      await loadAdminData();
    }

    const rows = state.adminRows.map((row) => flattenAdminRowForCsv(row));
    if (!rows.length) {
      setAdminMessage("No submissions are available to export.", true);
      return;
    }

    downloadCsv(rows, "careerfit_all_submissions.csv");
  }

  function flattenAdminRowForCsv(row) {
    const resultRow = {
      submission_id: row.id,
      respondent_id: row.respondent_id,
      submitted_at: row.submitted_at,
      email: row.profile?.email || "",
      first_name: row.profile?.first_name || "",
      last_name: row.profile?.last_name || "",
      respondent_type: row.payload?.respondentTypeLabel || respondentTypes[row.payload?.respondentType]?.label || row.profile?.respondent_type || "",
      degree: row.profile?.degree || "",
      role: row.profile?.role || "",
      hcm_average: row.hcm_average || "",
      hcm_interpretation: row.hcm_interpretation || ""
    };

    if (row.payload?.savedResults) {
      Object.assign(resultRow, row.payload.savedResults);
    }

    return resultRow;
  }

  function downloadCsv(rows, filename) {
    const headers = Array.from(rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set()));
    const lines = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => headers.map((key) => escapeCsv(row[key] ?? "")).join(","))
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  function collectFormValues(form) {
    const values = {};
    new FormData(form).forEach((value, key) => {
      values[key] = value;
    });
    return values;
  }

  function setMessage(node, message, tone) {
    if (!message) {
      node.textContent = "";
      node.className = "message-box";
      return;
    }
    node.textContent = message;
    if (!tone) {
      node.className = "message-box is-visible";
      return;
    }
    node.className = `message-box is-visible ${tone === "error" ? "is-error" : "is-success"}`;
  }

  function setAdminMessage(message, isError) {
    setMessage(nodes.adminMessage, message, isError ? "error" : "success");
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function escapeCsv(value) {
    return `"${String(value).replace(/"/g, "\"\"")}"`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") {
      return window.CSS.escape(value);
    }
    return String(value).replace(/["\\]/g, "\\$&");
  }

  function normalizeError(error) {
    return error?.message || "Something went wrong. Please try again.";
  }

  function numberOrNull(value) {
    return value === "" || value == null ? null : Number(value);
  }

  function jumpTo(hash) {
    const target = document.querySelector(hash);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
})();
