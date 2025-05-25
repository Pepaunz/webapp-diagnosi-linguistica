/**
 * JSON Schema for questionnaire validation
 */
export const localizedTextSchema = {
  type: "object",
  properties: {
    it: { type: "string" },
    en: { type: "string" },
    es: { type: "string" },
    ar: { type: "string" }
  },
  additionalProperties: { type: "string" }
};

export const optionSchema = {
  type: "object",
  properties: {
    value: { type: "string" },
    text: localizedTextSchema
  },
  required: ["value", "text"]
};

export const questionSchema = {
  type: "object",
  properties: {
    questionId: { type: "string" },
    text: localizedTextSchema,
    type: { 
      type: "string", 
      enum: ["text", "multiple-choice", "rating", "date"] 
    },
    helpText: localizedTextSchema,
    required: { type: "boolean" },
    options: {
      type: "array",
      items: optionSchema
    },
    minValue: { type: "number" },
    maxValue: { type: "number" }
  },
  required: ["questionId", "text", "type"],
  allOf: [
    {
      if: {
        properties: { type: { const: "multiple-choice" } }
      },
      then: {
        required: ["options"]
      }
    },
    {
      if: {
        properties: { type: { const: "rating" } }
      },
      then: {
        properties: {
          minValue: { type: "number" },
          maxValue: { type: "number" }
        }
      }
    }
  ]
};

export const sectionSchema = {
  type: "object",
  properties: {
    sectionId: { type: "string" },
    title: localizedTextSchema,
    description: localizedTextSchema,
    questions: {
      type: "array",
      items: questionSchema
    }
  },
  required: ["sectionId", "title", "questions"]
};

export const questionnaireSchema = {
  type: "object",
  properties: {
    questionnaireTitle: localizedTextSchema,
    description: localizedTextSchema,
    version: { type: "string" },
    defaultLanguage: { type: "string", enum: ["it", "en", "es", "ar"] },
    sections: {
      type: "array",
      items: sectionSchema
    }
  },
  required: ["questionnaireTitle", "description", "version", "defaultLanguage", "sections"]
};
