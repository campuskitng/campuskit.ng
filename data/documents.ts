import type { DocumentTemplate } from "@/lib/types";

/**
 * Templates with a `fields` array have an interactive mock form.
 * The rest are listed and selectable, and show a "form coming soon" state —
 * the interface is already shaped to take them.
 *
 * Preview bodies use {{fieldId}} tokens, resolved by renderTemplateLine().
 */
export const documentTemplates: DocumentTemplate[] = [
  {
    id: "guarantor-letter",
    name: "Guarantor letter",
    useCase: "Hostel or accommodation application",
    group: "Administrative",
    price: 500,
    fields: [
      { id: "guarantorName", label: "Guarantor's full name", placeholder: "Mr. Samuel Obaseki" },
      { id: "guarantorAddress", label: "Guarantor's address", placeholder: "12 Sapele Road, Benin City" },
      { id: "relationship", label: "Relationship to you", type: "select", options: ["Father", "Mother", "Guardian", "Uncle", "Aunt", "Elder sibling"] },
      { id: "studentName", label: "Your full name", placeholder: "Robin Eghosa Idahosa" },
      { id: "matricNumber", label: "Matriculation number", placeholder: "ENG1903456" },
      { id: "institution", label: "Institution", placeholder: "University of Benin" },
      { id: "purpose", label: "What you are being guaranteed for", placeholder: "Hostel accommodation, 2026/2027 session" },
    ],
    preview: {
      to: "The Dean of Student Affairs\n{{institution}}",
      subject: "Letter of guarantee for {{studentName}}",
      body: [
        "I, {{guarantorName}} of {{guarantorAddress}}, hereby stand as guarantor to {{studentName}} ({{matricNumber}}), a student of {{institution}}, who is my {{relationship}}.",
        "I confirm that I am aware of this application for {{purpose}}, and I accept responsibility for the conduct and obligations of the said student for the duration of the period covered by this guarantee.",
        "Any correspondence regarding this guarantee may be directed to me at the address stated above.",
      ],
    },
  },
  {
    id: "sponsorship-letter",
    name: "Sponsorship letter",
    useCase: "Proof that fees are covered by a sponsor",
    group: "Financial",
    price: 500,
    fields: [
      { id: "sponsorName", label: "Sponsor's full name", placeholder: "Mrs. Grace Okonkwo" },
      { id: "sponsorOccupation", label: "Sponsor's occupation", placeholder: "Civil servant" },
      { id: "relationship", label: "Relationship to you", type: "select", options: ["Parent", "Guardian", "Relative", "Employer", "Benefactor"] },
      { id: "studentName", label: "Your full name", placeholder: "Robin Eghosa Idahosa" },
      { id: "matricNumber", label: "Matriculation number", placeholder: "ENG1903456" },
      { id: "institution", label: "Institution", placeholder: "University of Benin" },
      { id: "session", label: "Academic session", placeholder: "2026/2027" },
    ],
    preview: {
      to: "The Bursar\n{{institution}}",
      subject: "Sponsorship undertaking for {{studentName}}",
      body: [
        "I, {{sponsorName}}, a {{sponsorOccupation}}, write to confirm that I am the sponsor of {{studentName}} ({{matricNumber}}), my {{relationship}}, currently studying at {{institution}}.",
        "I undertake to be fully responsible for the tuition, accommodation and related academic expenses of the said student for the {{session}} academic session.",
        "Kindly treat all financial correspondence concerning the student through me.",
      ],
    },
  },
  {
    id: "application-letter",
    name: "Application letter",
    useCase: "General application to a department or office",
    group: "Administrative",
    price: 500,
    fields: [
      { id: "studentName", label: "Your full name", placeholder: "Robin Eghosa Idahosa" },
      { id: "matricNumber", label: "Matriculation number", placeholder: "ENG1903456" },
      { id: "department", label: "Department", placeholder: "Computer Engineering" },
      { id: "recipient", label: "Addressed to", placeholder: "The Head of Department" },
      { id: "request", label: "What you are applying for", placeholder: "Approval to register an extra course" },
      { id: "reason", label: "Reason", type: "textarea", placeholder: "State the reason in one or two sentences." },
    ],
    preview: {
      to: "{{recipient}}\nDepartment of {{department}}",
      subject: "Application for {{request}}",
      body: [
        "I am {{studentName}} ({{matricNumber}}), a student of the Department of {{department}}. I write to formally apply for {{request}}.",
        "{{reason}}",
        "I will be grateful if my application receives a favourable consideration.",
      ],
    },
  },
  {
    id: "siwes-application",
    name: "SIWES / internship application",
    useCase: "Industrial training placement request",
    group: "Career",
    price: 500,
    fields: [
      { id: "studentName", label: "Your full name", placeholder: "Robin Eghosa Idahosa" },
      { id: "matricNumber", label: "Matriculation number", placeholder: "ENG1903456" },
      { id: "department", label: "Department", placeholder: "Computer Engineering" },
      { id: "institution", label: "Institution", placeholder: "University of Benin" },
      { id: "company", label: "Company or organisation", placeholder: "Seplat Energy Plc" },
      { id: "duration", label: "Duration", placeholder: "24 weeks, October 2026 to March 2027" },
    ],
    preview: {
      to: "The Human Resources Manager\n{{company}}",
      subject: "Application for industrial training placement (SIWES)",
      body: [
        "I am {{studentName}} ({{matricNumber}}), a student of {{department}} at {{institution}}. I write to apply for an industrial training placement in your organisation.",
        "The programme runs for {{duration}}, and it forms a compulsory part of my degree. Working with {{company}} would give me direct exposure to the practical side of my course.",
        "My logbook and institution-based supervisor details are available on request.",
      ],
    },
  },
  {
    id: "permission-letter",
    name: "Permission letter",
    useCase: "Leave of absence from lectures or exams",
    group: "Academic",
    price: 500,
    fields: [
      { id: "studentName", label: "Your full name", placeholder: "Robin Eghosa Idahosa" },
      { id: "matricNumber", label: "Matriculation number", placeholder: "ENG1903456" },
      { id: "department", label: "Department", placeholder: "Computer Engineering" },
      { id: "startDate", label: "From", type: "date" },
      { id: "endDate", label: "To", type: "date" },
      { id: "reason", label: "Reason", type: "textarea", placeholder: "Keep it short and factual." },
    ],
    preview: {
      to: "The Head of Department\nDepartment of {{department}}",
      subject: "Request for permission to be absent",
      body: [
        "I am {{studentName}} ({{matricNumber}}) of the Department of {{department}}. I write to request permission to be absent from academic activities from {{startDate}} to {{endDate}}.",
        "{{reason}}",
        "I will make arrangements to cover all lectures and assessments missed within the period.",
      ],
    },
  },
  { id: "course-change", name: "Course change request", useCase: "Move between courses or departments", group: "Academic", price: 500 },
  { id: "departmental-request", name: "Departmental request", useCase: "Any formal request to your department", group: "Academic", price: 500 },
  { id: "complaint-letter", name: "Complaint letter", useCase: "Raise an issue formally", group: "Administrative", price: 500 },
  { id: "scholarship-application", name: "Scholarship application", useCase: "Apply for funding", group: "Financial", price: 800 },
  { id: "recommendation-request", name: "Recommendation request", useCase: "Ask a lecturer for a reference", group: "Career", price: 500 },
  { id: "accommodation-request", name: "Accommodation request", useCase: "Hostel space or a room change", group: "Administrative", price: 500 },
  { id: "academic-appeal", name: "Academic appeal", useCase: "Appeal a decision or penalty", group: "Academic", price: 800 },
  { id: "result-correction", name: "Result correction request", useCase: "Missing or wrong result", group: "Academic", price: 500 },
  { id: "transcript-request", name: "Transcript or certificate request", useCase: "Request official records", group: "Administrative", price: 500 },
  { id: "undertaking-letter", name: "Undertaking letter", useCase: "Commit to a condition in writing", group: "Administrative", price: 500 },
  { id: "declaration-letter", name: "Declaration letter", useCase: "Declare age, name or status", group: "Administrative", price: 500 },
  { id: "consent-letter", name: "Consent letter", useCase: "Parental or guardian consent", group: "Administrative", price: 500 },
  { id: "authorization-letter", name: "Authorisation letter", useCase: "Let someone act on your behalf", group: "Administrative", price: 500 },
  { id: "introduction-letter", name: "Introduction letter", useCase: "Introduce yourself to an organisation", group: "Career", price: 500 },
  { id: "job-application", name: "Job application", useCase: "Apply for graduate or part-time roles", group: "Career", price: 800 },
  { id: "cover-letter", name: "Cover letter", useCase: "Pair with your CV", group: "Career", price: 800 },
  { id: "statement-of-purpose", name: "Statement of purpose", useCase: "Postgraduate and fellowship applications", group: "Career", price: 1000 },
];

export const documentGroups: DocumentTemplate["group"][] = [
  "Academic",
  "Administrative",
  "Financial",
  "Career",
];

/** Templates surfaced on the homepage selector. */
export const homeDocumentIds = [
  "guarantor-letter",
  "sponsorship-letter",
  "application-letter",
  "siwes-application",
  "permission-letter",
];

export const homeDocuments = homeDocumentIds
  .map((id) => documentTemplates.find((template) => template.id === id))
  .filter((template): template is DocumentTemplate => Boolean(template));

export function getTemplate(id: string): DocumentTemplate | undefined {
  return documentTemplates.find((template) => template.id === id);
}

/**
 * Replaces {{fieldId}} tokens with the student's answers, falling back to the
 * field label in brackets so an empty form still previews as a real letter.
 */
export function renderTemplateLine(
  line: string,
  template: DocumentTemplate,
  values: Record<string, string>,
): string {
  return line.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = values[key]?.trim();
    if (value) return value;
    const field = template.fields?.find((item) => item.id === key);
    return field ? `[${field.label}]` : `[${key}]`;
  });
}

export function formatPreviewDate(date = new Date()): string {
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Sample answers used by the homepage preview, so the document looks like a
 * finished letter rather than a form full of brackets.
 */
export const demoValues: Record<string, string> = {
  guarantorName: "Mr. Samuel Obaseki",
  guarantorAddress: "12 Sapele Road, Benin City",
  relationship: "Father",
  studentName: "Robin Eghosa Idahosa",
  matricNumber: "ENG1903456",
  institution: "University of Benin",
  purpose: "hostel accommodation for the 2026/2027 session",
  sponsorName: "Mrs. Grace Okonkwo",
  sponsorOccupation: "civil servant",
  session: "2026/2027",
  department: "Computer Engineering",
  recipient: "The Head of Department",
  request: "approval to register an extra course",
  reason:
    "I was unable to complete registration within the approved window because my results were released late.",
  company: "Seplat Energy Plc",
  duration: "24 weeks, October 2026 to March 2027",
  startDate: "28 September 2026",
  endDate: "5 October 2026",
};
