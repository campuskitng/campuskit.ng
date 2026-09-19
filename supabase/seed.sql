-- CampusKit seed data — run after supabase/schema.sql.
-- Transcribed 1:1 from the mock arrays in /data so the site reads the same
-- content whether it comes from the local files (admin, for now) or here.

insert into public.tools (id, name, description, icon, href, category, popular, is_new, note) values
('past-questions', 'Past questions', 'Papers from previous sessions, sorted by course code.', 'papers', '/past-questions', 'academics', true, false, 'Free'),
('document-generator', 'Document generator', 'Formal letters and requests, formatted correctly.', 'document', '/documents', 'documents', true, false, 'From ₦500'),
('cv-generator', 'CV generator', 'A one-page CV that fits internship applications.', 'cv', '/tools/cv-generator', 'documents', true, false, 'From ₦800'),
('anonymous', 'Anonymous', 'Your own link for messages, with photos attached.', 'anonymous', '/anonymous/robin', 'community', true, true, 'Free'),
('exam-guide', 'Exam guide', 'Topic breakdowns and what lecturers repeat.', 'guide', '/tools/exam-guide', 'academics', false, false, null),
('gp-calculator', 'GP calculator', 'Work out your CGPA across semesters.', 'calculator', '/tools/gp-calculator', 'academics', false, false, null),
('scholarships', 'Scholarships', 'Open scholarships with deadlines you can still meet.', 'scholarship', '/opportunities?category=Scholarship', 'opportunities', false, false, null),
('events', 'Events', 'What is happening on campus this week.', 'event', '/opportunities?category=Event', 'opportunities', false, false, null),
('timetable', 'Timetable', 'Your lectures and tests in one week view.', 'timetable', '/tools/timetable', 'academics', false, true, null),
('marketplace', 'Marketplace', 'Buy and sell within your campus.', 'market', '/marketplace', 'community', false, false, null)
on conflict (id) do nothing;

insert into public.opportunities (id, title, organization, category, deadline, eligibility, location, href) values
('nnpc-seplat', 'NNPC/Seplat undergraduate scholarship', 'Seplat Energy', 'Scholarship', '2026-10-03', '200 level, engineering and sciences', 'Nationwide', '/opportunities/nnpc-seplat'),
('flutterwave-internship', 'Frontend engineering internship', 'Flutterwave', 'Internship', '2026-09-28', 'SIWES placement accepted', 'Lagos · Hybrid', '/opportunities/flutterwave-internship'),
('hult-prize', 'Hult Prize campus round', 'Hult Prize Foundation', 'Competition', '2026-10-12', 'Teams of 3–4 students', 'UNIBEN', '/opportunities/hult-prize'),
('career-fair', 'Faculty of Engineering career fair', 'UNIBEN Careers Office', 'Event', '2026-09-22', null, 'Akenzua Hall', '/opportunities/career-fair'),
('campus-night', 'Campus Night 2026', 'UNIBEN Students'' Union', 'Event', '2026-09-25', 'Free entry with student ID', 'UNIBEN, Main Bowl', '/opportunities/campus-night'),
('mtn-foundation', 'MTN Foundation science scholarship', 'MTN Foundation', 'Scholarship', '2026-11-01', 'CGPA 3.5 and above', 'Nationwide', '/opportunities/mtn-foundation'),
('data-fellowship', 'Data analysis fellowship, cohort 4', 'Data Science Nigeria', 'Fellowship', '2026-10-19', 'Final year and recent graduates', 'Remote', '/opportunities/data-fellowship')
on conflict (id) do nothing;

insert into public.marketplace_items (id, title, price, location, condition, image, seller, posted_at, href) values
('hp-elitebook', 'HP EliteBook 840 G5, 8GB/256GB', 235000, 'Ekosodin', 'Good', '/mock/market-laptop.svg', 'Ife A.', '2 hours ago', '/marketplace/hp-elitebook'),
('mini-fridge', 'Hisense mini fridge, 90L', 78000, 'BDPA', 'Like new', '/mock/market-fridge.svg', 'Chidera O.', 'Yesterday', '/marketplace/mini-fridge'),
('engineering-set', 'Engineering drawing set and board', 12500, 'Osasogie', 'Good', '/mock/market-drawing-set.svg', 'Tobi M.', '2 days ago', '/marketplace/engineering-set'),
('rechargeable-fan', '18-inch rechargeable standing fan', 46000, 'Ugbowo', 'New', '/mock/market-fan.svg', 'Zainab K.', '3 days ago', '/marketplace/rechargeable-fan')
on conflict (id) do nothing;

-- The five templates with an interactive form carry fields + preview as
-- JSONB. Dollar-quoting avoids escaping the apostrophes in labels like
-- "Guarantor's full name".

insert into public.document_templates (id, name, use_case, doc_group, price, fields, preview) values
(
  'guarantor-letter', 'Guarantor letter', 'Hostel or accommodation application', 'Administrative', 500,
  $json$[
    {"id":"guarantorName","label":"Guarantor's full name","placeholder":"Mr. Samuel Obaseki"},
    {"id":"guarantorAddress","label":"Guarantor's address","placeholder":"12 Sapele Road, Benin City"},
    {"id":"relationship","label":"Relationship to you","type":"select","options":["Father","Mother","Guardian","Uncle","Aunt","Elder sibling"]},
    {"id":"studentName","label":"Your full name","placeholder":"Robin Eghosa Idahosa"},
    {"id":"matricNumber","label":"Matriculation number","placeholder":"ENG1903456"},
    {"id":"institution","label":"Institution","placeholder":"University of Benin"},
    {"id":"purpose","label":"What you are being guaranteed for","placeholder":"Hostel accommodation, 2026/2027 session"}
  ]$json$,
  $json${
    "to": "The Dean of Student Affairs\n{{institution}}",
    "subject": "Letter of guarantee for {{studentName}}",
    "body": [
      "I, {{guarantorName}} of {{guarantorAddress}}, hereby stand as guarantor to {{studentName}} ({{matricNumber}}), a student of {{institution}}, who is my {{relationship}}.",
      "I confirm that I am aware of this application for {{purpose}}, and I accept responsibility for the conduct and obligations of the said student for the duration of the period covered by this guarantee.",
      "Any correspondence regarding this guarantee may be directed to me at the address stated above."
    ]
  }$json$
),
(
  'sponsorship-letter', 'Sponsorship letter', 'Proof that fees are covered by a sponsor', 'Financial', 500,
  $json$[
    {"id":"sponsorName","label":"Sponsor's full name","placeholder":"Mrs. Grace Okonkwo"},
    {"id":"sponsorOccupation","label":"Sponsor's occupation","placeholder":"Civil servant"},
    {"id":"relationship","label":"Relationship to you","type":"select","options":["Parent","Guardian","Relative","Employer","Benefactor"]},
    {"id":"studentName","label":"Your full name","placeholder":"Robin Eghosa Idahosa"},
    {"id":"matricNumber","label":"Matriculation number","placeholder":"ENG1903456"},
    {"id":"institution","label":"Institution","placeholder":"University of Benin"},
    {"id":"session","label":"Academic session","placeholder":"2026/2027"}
  ]$json$,
  $json${
    "to": "The Bursar\n{{institution}}",
    "subject": "Sponsorship undertaking for {{studentName}}",
    "body": [
      "I, {{sponsorName}}, a {{sponsorOccupation}}, write to confirm that I am the sponsor of {{studentName}} ({{matricNumber}}), my {{relationship}}, currently studying at {{institution}}.",
      "I undertake to be fully responsible for the tuition, accommodation and related academic expenses of the said student for the {{session}} academic session.",
      "Kindly treat all financial correspondence concerning the student through me."
    ]
  }$json$
),
(
  'application-letter', 'Application letter', 'General application to a department or office', 'Administrative', 500,
  $json$[
    {"id":"studentName","label":"Your full name","placeholder":"Robin Eghosa Idahosa"},
    {"id":"matricNumber","label":"Matriculation number","placeholder":"ENG1903456"},
    {"id":"department","label":"Department","placeholder":"Computer Engineering"},
    {"id":"recipient","label":"Addressed to","placeholder":"The Head of Department"},
    {"id":"request","label":"What you are applying for","placeholder":"Approval to register an extra course"},
    {"id":"reason","label":"Reason","type":"textarea","placeholder":"State the reason in one or two sentences."}
  ]$json$,
  $json${
    "to": "{{recipient}}\nDepartment of {{department}}",
    "subject": "Application for {{request}}",
    "body": [
      "I am {{studentName}} ({{matricNumber}}), a student of the Department of {{department}}. I write to formally apply for {{request}}.",
      "{{reason}}",
      "I will be grateful if my application receives a favourable consideration."
    ]
  }$json$
),
(
  'siwes-application', 'SIWES / internship application', 'Industrial training placement request', 'Career', 500,
  $json$[
    {"id":"studentName","label":"Your full name","placeholder":"Robin Eghosa Idahosa"},
    {"id":"matricNumber","label":"Matriculation number","placeholder":"ENG1903456"},
    {"id":"department","label":"Department","placeholder":"Computer Engineering"},
    {"id":"institution","label":"Institution","placeholder":"University of Benin"},
    {"id":"company","label":"Company or organisation","placeholder":"Seplat Energy Plc"},
    {"id":"duration","label":"Duration","placeholder":"24 weeks, October 2026 to March 2027"}
  ]$json$,
  $json${
    "to": "The Human Resources Manager\n{{company}}",
    "subject": "Application for industrial training placement (SIWES)",
    "body": [
      "I am {{studentName}} ({{matricNumber}}), a student of {{department}} at {{institution}}. I write to apply for an industrial training placement in your organisation.",
      "The programme runs for {{duration}}, and it forms a compulsory part of my degree. Working with {{company}} would give me direct exposure to the practical side of my course.",
      "My logbook and institution-based supervisor details are available on request."
    ]
  }$json$
),
(
  'permission-letter', 'Permission letter', 'Leave of absence from lectures or exams', 'Academic', 500,
  $json$[
    {"id":"studentName","label":"Your full name","placeholder":"Robin Eghosa Idahosa"},
    {"id":"matricNumber","label":"Matriculation number","placeholder":"ENG1903456"},
    {"id":"department","label":"Department","placeholder":"Computer Engineering"},
    {"id":"startDate","label":"From","type":"date"},
    {"id":"endDate","label":"To","type":"date"},
    {"id":"reason","label":"Reason","type":"textarea","placeholder":"Keep it short and factual."}
  ]$json$,
  $json${
    "to": "The Head of Department\nDepartment of {{department}}",
    "subject": "Request for permission to be absent",
    "body": [
      "I am {{studentName}} ({{matricNumber}}) of the Department of {{department}}. I write to request permission to be absent from academic activities from {{startDate}} to {{endDate}}.",
      "{{reason}}",
      "I will make arrangements to cover all lectures and assessments missed within the period."
    ]
  }$json$
)
on conflict (id) do nothing;

-- The remaining 17 templates are catalogue-only (no interactive form yet),
-- exactly matching the bare entries in data/documents.ts.
insert into public.document_templates (id, name, use_case, doc_group, price) values
('course-change', 'Course change request', 'Move between courses or departments', 'Academic', 500),
('departmental-request', 'Departmental request', 'Any formal request to your department', 'Academic', 500),
('complaint-letter', 'Complaint letter', 'Raise an issue formally', 'Administrative', 500),
('scholarship-application', 'Scholarship application', 'Apply for funding', 'Financial', 800),
('recommendation-request', 'Recommendation request', 'Ask a lecturer for a reference', 'Career', 500),
('accommodation-request', 'Accommodation request', 'Hostel space or a room change', 'Administrative', 500),
('academic-appeal', 'Academic appeal', 'Appeal a decision or penalty', 'Academic', 800),
('result-correction', 'Result correction request', 'Missing or wrong result', 'Academic', 500),
('transcript-request', 'Transcript or certificate request', 'Request official records', 'Administrative', 500),
('undertaking-letter', 'Undertaking letter', 'Commit to a condition in writing', 'Administrative', 500),
('declaration-letter', 'Declaration letter', 'Declare age, name or status', 'Administrative', 500),
('consent-letter', 'Consent letter', 'Parental or guardian consent', 'Administrative', 500),
('authorization-letter', 'Authorisation letter', 'Let someone act on your behalf', 'Administrative', 500),
('introduction-letter', 'Introduction letter', 'Introduce yourself to an organisation', 'Career', 500),
('job-application', 'Job application', 'Apply for graduate or part-time roles', 'Career', 800),
('cover-letter', 'Cover letter', 'Pair with your CV', 'Career', 800),
('statement-of-purpose', 'Statement of purpose', 'Postgraduate and fellowship applications', 'Career', 1000)
on conflict (id) do nothing;

-- All seeded templates are paid by default; flip is_free where price = 0.
update public.document_templates set is_free = (price = 0);

-- Past questions (admin-managed academic resources). file_path points at
-- objects you upload into the private `past-questions` Storage bucket —
-- these rows are metadata only until real PDFs are uploaded, so downloads
-- will 404 until you replace file_path with a real object path.
insert into public.past_questions (id, title, institution, department, course_code, course_title, level, session, semester, file_path, file_size, status) values
(gen_random_uuid(), 'CSC301 Data Structures — Past Questions', 'University of Benin', 'Computer Science', 'CSC301', 'Data Structures and Algorithms', '300', '2023/2024', 'First', 'sample/csc301-2023.pdf', 245000, 'published'),
(gen_random_uuid(), 'MTH201 Mathematical Methods — Past Questions', 'University of Benin', 'Mathematics', 'MTH201', 'Mathematical Methods I', '200', '2023/2024', 'First', 'sample/mth201-2023.pdf', 198000, 'published'),
(gen_random_uuid(), 'EEE305 Circuit Theory — Past Questions', 'University of Benin', 'Electrical Engineering', 'EEE305', 'Circuit Theory II', '300', '2022/2023', 'Second', 'sample/eee305-2022.pdf', 312000, 'published')
on conflict do nothing;
