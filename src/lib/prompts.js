// Prompt builders kept in one place so the AI behavior is easy to tune and review.

export function extractionMessages(jobDescription) {
  return [
    {
      role: "system",
      content:
        "You extract structured data from job postings. Return ONLY a JSON object, no prose. " +
        "Schema: { \"company\": string, \"role\": string, \"seniority\": " +
        "\"intern\"|\"junior\"|\"mid\"|\"senior\"|\"lead\"|\"unknown\", " +
        "\"required_skills\": string[], \"keywords\": string[], " +
        "\"salary\": string|null }. " +
        "required_skills: concrete technologies/skills the role needs (max 15). " +
        "keywords: other notable terms (domain, methodology). " +
        "If a field is unknown, use \"unknown\", an empty array, or null.",
    },
    {
      role: "user",
      content: `Job posting:\n\n${jobDescription.slice(0, 6000)}`,
    },
  ];
}

export function gapMessages(resumeText, parsed) {
  return [
    {
      role: "system",
      content:
        "You are a candid job-search coach. Given a resume and a job's required " +
        "skills, return ONLY JSON: { \"matched\": string[], \"missing\": string[], " +
        "\"advice\": string }. matched = required skills clearly evidenced in the " +
        "resume. missing = required skills not evidenced. advice = 2 short, " +
        "specific sentences on how to close the biggest gap.",
    },
    {
      role: "user",
      content:
        `Required skills: ${JSON.stringify(parsed?.required_skills ?? [])}\n\n` +
        `Resume:\n${resumeText.slice(0, 6000)}`,
    },
  ];
}

export function coverLetterMessages(resumeText, parsed, company, role) {
  return [
    {
      role: "system",
      content:
        "Write a tailored cover letter. Rules: 180-260 words, 3 short paragraphs, " +
        "specific to the role and company, grounded ONLY in facts from the resume " +
        "(never invent experience), confident but not boastful, no clichés like " +
        "'I am writing to express'. Return plain text only, no markdown.",
    },
    {
      role: "user",
      content:
        `Company: ${company}\nRole: ${role}\n` +
        `Key skills they want: ${JSON.stringify(parsed?.required_skills ?? [])}\n\n` +
        `My resume:\n${resumeText.slice(0, 6000)}`,
    },
  ];
}
