function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function ensureRecord(value: unknown, context: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`${context} must be an object.`);
  }

  return value;
}

function ensureString(
  value: unknown,
  fieldPath: string,
  { allowEmpty }: { allowEmpty: boolean },
): string {
  if (typeof value !== "string") {
    throw new Error(`${fieldPath} must be a string.`);
  }

  if (!allowEmpty && value.trim().length === 0) {
    throw new Error(`${fieldPath} must be a non-empty string.`);
  }

  return value;
}

function ensureStringArray(value: unknown, fieldPath: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldPath} must be an array of strings.`);
  }

  return value.map((item, index) =>
    ensureString(item, `${fieldPath}[${index}]`, { allowEmpty: false }),
  );
}

function ensureOptionalString(value: unknown, fieldPath: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return ensureString(value, fieldPath, { allowEmpty: true });
}

export interface CVExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
  highlights: string[];
}

export interface CVEducationItem {
  degree: string;
  school: string;
  period: string;
  description?: string;
}

export interface CVSkillCategory {
  name: string;
  items: string[];
}

function ensureArray(value: unknown, fieldPath: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldPath} must be an array.`);
  }

  return value;
}

export function parseCvExperienceItems(
  raw: unknown,
  locale: string,
): CVExperienceItem[] {
  const entries = ensureArray(raw, `cv.experience.items (${locale})`);

  return entries.map((entry, index) => {
    const record = ensureRecord(entry, `cv.experience.items[${index}] (${locale})`);

    return {
      role: ensureString(
        record.role,
        `cv.experience.items[${index}].role (${locale})`,
        { allowEmpty: false },
      ),
      company: ensureString(
        record.company,
        `cv.experience.items[${index}].company (${locale})`,
        { allowEmpty: false },
      ),
      period: ensureString(
        record.period,
        `cv.experience.items[${index}].period (${locale})`,
        { allowEmpty: false },
      ),
      description: ensureString(
        record.description,
        `cv.experience.items[${index}].description (${locale})`,
        { allowEmpty: true },
      ),
      highlights: ensureStringArray(
        record.highlights,
        `cv.experience.items[${index}].highlights (${locale})`,
      ),
    };
  });
}

export function parseCvEducationItems(
  raw: unknown,
  locale: string,
): CVEducationItem[] {
  const entries = ensureArray(raw, `cv.education.items (${locale})`);

  return entries.map((entry, index) => {
    const record = ensureRecord(entry, `cv.education.items[${index}] (${locale})`);

    return {
      degree: ensureString(
        record.degree,
        `cv.education.items[${index}].degree (${locale})`,
        { allowEmpty: false },
      ),
      school: ensureString(
        record.school,
        `cv.education.items[${index}].school (${locale})`,
        { allowEmpty: false },
      ),
      period: ensureString(
        record.period,
        `cv.education.items[${index}].period (${locale})`,
        { allowEmpty: false },
      ),
      description: ensureOptionalString(
        record.description,
        `cv.education.items[${index}].description (${locale})`,
      ),
    };
  });
}

export function parseCvSkillCategories(
  raw: unknown,
  locale: string,
): CVSkillCategory[] {
  const entries = ensureArray(raw, `cv.skills.categories (${locale})`);

  return entries.map((entry, index) => {
    const record = ensureRecord(entry, `cv.skills.categories[${index}] (${locale})`);

    return {
      name: ensureString(
        record.name,
        `cv.skills.categories[${index}].name (${locale})`,
        { allowEmpty: false },
      ),
      items: ensureStringArray(
        record.items,
        `cv.skills.categories[${index}].items (${locale})`,
      ),
    };
  });
}
