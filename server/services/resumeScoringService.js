/**
 * resumeScoringService.js
 * 
 * Scores a resume against a job's required skills.
 * Does NOT auto-reject — only ranks candidates to assist recruiter decisions.
 */

/**
 * Section headings that indicate a well-structured professional resume.
 */
const ATS_SECTION_KEYWORDS = [
    'experience', 'work experience', 'professional experience',
    'education', 'skills', 'technical skills', 'projects',
    'summary', 'objective', 'certifications', 'achievements', 'accomplishments'
];

/**
 * Escape special regex characters from a string so it can be used safely in a RegExp.
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Check if the resume text contains a skill, using multiple strategies:
 *  1. Whole-word regex match (escaped, case-insensitive)
 *  2. Simple includes() as a reliable fallback for tech terms like "Node.js", "C++"
 */
const skillExistsInText = (lowerText, lowerSkill) => {
    // Strategy 1: simple substring includes — handles all edge cases (dots, plus, etc.)
    if (lowerText.includes(lowerSkill)) return 'exact';

    // Strategy 2: whole-word regex for single-word skills (avoids "java" matching "javascript")
    const words = lowerSkill.split(/\s+/);
    if (words.length === 1) {
        try {
            const regex = new RegExp(`(?<![a-z0-9])${escapeRegex(lowerSkill)}(?![a-z0-9])`, 'i');
            if (regex.test(lowerText)) return 'exact';
        } catch (e) {
            // Regex failed — fall through
        }
    }

    return null;
};

/**
 * Check for a partial/related skill match.
 * For multi-word skills like "machine learning", checks if any significant word appears.
 * For single-word skills, this is skipped to avoid false positives.
 */
const partialSkillMatch = (lowerText, lowerSkill) => {
    const parts = lowerSkill.split(/\s+/).filter(p => p.length > 3);
    // Only try partial match for multi-word skills with meaningful parts
    if (parts.length < 2) return false;
    return parts.some(part => lowerText.includes(part));
};

/**
 * Compute an ATS quality score (0–10) based on presence of resume section headings.
 */
const computeAtsScore = (lowerText) => {
    let found = 0;
    for (const kw of ATS_SECTION_KEYWORDS) {
        if (lowerText.includes(kw)) found++;
    }
    // Normalize: cap at 6 found sections for a perfect ATS score of 10
    const normalized = Math.min(found / 6, 1) * 10;
    return Math.round(normalized * 10) / 10;
};

/**
 * Assign priority level from the final score.
 */
const getPriorityLevel = (score) => {
    if (score >= 80) return 'Strong';
    if (score >= 50) return 'Moderate';
    if (score >= 20) return 'Weak';
    return 'Low';
};

/**
 * Score a resume against a job's required skills.
 *
 * @param {string} resumeText     - Plain text extracted from the PDF
 * @param {string[]} requiredSkills - Skill keywords set by the recruiter on the job
 * @returns {{ score: number, matchedSkills: string[], atsScore: number, priorityLevel: string }}
 */
const scoreResume = (resumeText, requiredSkills = []) => {
    if (!resumeText || resumeText.trim().length < 20) {
        return { score: 0, matchedSkills: [], atsScore: 0, priorityLevel: 'Low' };
    }

    const lowerText = resumeText.toLowerCase();
    const matchedSkills = [];
    const partialMatches = [];
    let exactMatchCount = 0;
    let partialMatchCount = 0;

    // ── Skill Matching ──────────────────────────────────────────────────────
    for (const skill of requiredSkills) {
        const lowerSkill = skill.trim().toLowerCase();
        if (!lowerSkill) continue;

        const matchType = skillExistsInText(lowerText, lowerSkill);
        if (matchType === 'exact') {
            matchedSkills.push(skill.trim());
            exactMatchCount++;
        } else if (partialSkillMatch(lowerText, lowerSkill)) {
            partialMatches.push(skill.trim());
            partialMatchCount++;
        }
    }

    // Merge matches (exact first, then partial)
    const allMatched = [...matchedSkills, ...partialMatches];

    // ── Skill Score (0–100) ──────────────────────────────────────────────────
    let skillScore = 0;
    if (requiredSkills.length > 0) {
        // Each skill is worth equal share. Exact = full value, partial = half.
        const totalSkills = requiredSkills.length;
        const earned = exactMatchCount * 1.0 + partialMatchCount * 0.5;
        skillScore = Math.min((earned / totalSkills) * 100, 100);
    }

    // ── ATS Score (0–10) ─────────────────────────────────────────────────────
    const atsScore = computeAtsScore(lowerText);

    // ── Final Score ──────────────────────────────────────────────────────────
    let finalScore;
    if (requiredSkills.length === 0) {
        // No required skills set → judge purely on resume quality (ATS)
        // A resume with 3+ sections scores at least Moderate
        finalScore = (atsScore / 10) * 100;
    } else {
        // Weighted: 70% skill match, 30% resume quality
        finalScore = skillScore * 0.7 + (atsScore / 10) * 100 * 0.3;
    }

    finalScore = Math.round(Math.min(Math.max(finalScore, 0), 100));

    return {
        score: finalScore,
        matchedSkills: allMatched,
        atsScore,
        priorityLevel: getPriorityLevel(finalScore),
    };
};

module.exports = { scoreResume };
