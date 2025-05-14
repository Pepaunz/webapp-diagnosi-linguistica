// src/data/questionnaireTemplates.ts

import { QuestionnaireData } from "../types/questionnaire";

export const bilingualismQuestionnaire: QuestionnaireData = {
  questionnaireTitle: {
    it: "Questionario Bilinguismo",
    en: "Bilingualism Questionnaire",
    es: "Cuestionario de Bilingüismo",
    ar: "",
  },
  description: {
    it: "Questionario per la valutazione dello sviluppo linguistico nei bambini bilingui",
    en: "Questionnaire for assessing language development in bilingual children",
    es: "Cuestionario para evaluar el desarrollo del lenguaje en niños bilingües",
    ar: "",
  },
  version: "1.0",
  defaultLanguage: "it",
  sections: [
    {
      sectionId: "s1",
      title: {
        it: "Informazioni Generali",
        en: "General Information",
        es: "Información General",
        ar: "",
      },
      description: {
        it: "Informazioni di base sul bambino e la famiglia",
        en: "Basic information about the child and family",
        es: "Información básica sobre el niño y la familia",
        ar: "",
      },
      questions: [
        {
          questionId: "s1_q1",
          text: {
            it: "Quando è nato il tuo bambino?",
            en: "When was your child born?",
            es: "¿Cuándo nació tu hijo/a?",
            ar: "",
          },
          type: "text",
          required: true,
        },
        {
          questionId: "s1_q2",
          text: {
            it: "Dove è nato il bambino?",
            en: "Where was the child born?",
            es: "¿Dónde nació el niño/a?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            {
              value: "italia",
              text: { it: "Italia", en: "Italy", es: "Italia", ar: "" },
            },
            {
              value: "peru",
              text: { it: "Perù", en: "Peru", es: "Perú", ar: "" },
            },
            {
              value: "marocco",
              text: { it: "Marocco", en: "Morocco", es: "Marruecos", ar: "" },
            },
            {
              value: "nigeria",
              text: { it: "Nigeria", en: "Nigeria", es: "Nigeria", ar: "" },
            },
            {
              value: "egitto",
              text: { it: "Egitto", en: "Egypt", es: "Egipto", ar: "" },
            },
          ],
        },
        {
          questionId: "s1_q3",
          text: {
            it: "Quando è arrivato il bambino in Italia?",
            en: "When did the child arrive in Italy?",
            es: "¿Cuándo llegó el niño/a a Italia?",
            ar: "",
          },
          type: "text",
          required: false,
        },
        {
          questionId: "s1_q4",
          text: {
            it: "Indica il nome del luogo in cui è nato il bambino",
            en: "Indicate the name of the place where the child was born",
            es: "Indica el nombre del lugar donde nació el niño/a",
            ar: "",
          },
          type: "text",
          required: true,
        },
        {
          questionId: "s1_q5",
          text: {
            it: "Avete altri figli?",
            en: "Do you have other children?",
            es: "¿Tienen otros hijos?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            { value: "si", text: { it: "Sì", en: "Yes", es: "Sí", ar: "" } },
            { value: "no", text: { it: "No", en: "No", es: "No", ar: "" } },
          ],
        },
        {
          questionId: "s1_q6",
          text: {
            it: "Quante lingue si parlano in famiglia?",
            en: "How many languages are spoken in the family?",
            es: "¿Cuántos idiomas se hablan en la familia?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            { value: "1", text: { it: "Una", en: "One", es: "Uno", ar: "" } },
            { value: "2", text: { it: "Due", en: "Two", es: "Dos", ar: "" } },
            {
              value: "3",
              text: { it: "Tre", en: "Three", es: "Tres", ar: "" },
            },
            {
              value: "4+",
              text: {
                it: "Più di tre",
                en: "More than three",
                es: "Más de tres",
                ar: "",
              },
            },
          ],
        },
        {
          questionId: "s1_q7",
          text: {
            it: "Quali?",
            en: "Which ones?",
            es: "¿Cuáles?",
            ar: "",
          },
          type: "text",
          required: true,
        },
        {
          questionId: "s1_q8",
          text: {
            it: "Qualcuno di voi frequenta un corso di lingua italiana?",
            en: "Does anyone in your family attend an Italian language course?",
            es: "¿Alguien de ustedes asiste a un curso de italiano?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            { value: "si", text: { it: "Sì", en: "Yes", es: "Sí", ar: "" } },
            { value: "no", text: { it: "No", en: "No", es: "No", ar: "" } },
          ],
        },
        {
          questionId: "s1_q9",
          text: {
            it: "Chi ha un lavoro in famiglia?",
            en: "Who has a job in the family?",
            es: "¿Quién tiene trabajo en la familia?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            {
              value: "solo_madre",
              text: {
                it: "Solo la madre",
                en: "Only the mother",
                es: "Solo la madre",
                ar: "",
              },
            },
            {
              value: "solo_padre",
              text: {
                it: "Solo il padre",
                en: "Only the father",
                es: "Solo el padre",
                ar: "",
              },
            },
            {
              value: "entrambi",
              text: {
                it: "Entrambi i genitori",
                en: "Both parents",
                es: "Ambos padres",
                ar: "",
              },
            },
            {
              value: "nessuno",
              text: { it: "Nessuno", en: "Neither", es: "Ninguno", ar: "" },
            },
          ],
        },
      ],
    },
    {
      sectionId: "s2",
      title: {
        it: "Sviluppo e Competenze Linguistiche",
        en: "Development and Language Skills",
        es: "Desarrollo y Competencias Lingüísticas",
        ar: "",
      },
      description: {
        it: "Informazioni sullo sviluppo linguistico e motorio del bambino",
        en: "Information about the child's linguistic and motor development",
        es: "Información sobre el desarrollo lingüístico y motor del niño",
        ar: "",
      },
      questions: [
        {
          questionId: "s2_q1",
          text: {
            it: "Il tuo bambino quando ha cominciato a camminare?",
            en: "When did your child start walking?",
            es: "¿Cuándo empezó a caminar tu hijo/a?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            {
              value: "9-12",
              text: {
                it: "9-12 mesi",
                en: "9-12 months",
                es: "9-12 meses",
                ar: "",
              },
            },
            {
              value: "12-15",
              text: {
                it: "12-15 mesi",
                en: "12-15 months",
                es: "12-15 meses",
                ar: "",
              },
            },
            {
              value: "15-18",
              text: {
                it: "15-18 mesi",
                en: "15-18 months",
                es: "15-18 meses",
                ar: "",
              },
            },
            {
              value: "dopo18",
              text: {
                it: "Dopo i 18 mesi",
                en: "After 18 months",
                es: "Después de 18 meses",
                ar: "",
              },
            },
          ],
        },
        {
          questionId: "s2_q2",
          text: {
            it: "Il tuo bambino quando ha cominciato a dire le prime parole?",
            en: "When did your child start saying the first words?",
            es: "¿Cuándo empezó tu hijo/a a decir las primeras palabras?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            {
              value: "10-12",
              text: {
                it: "10-12 mesi",
                en: "10-12 months",
                es: "10-12 meses",
                ar: "",
              },
            },
            {
              value: "12-18",
              text: {
                it: "12-18 mesi",
                en: "12-18 months",
                es: "12-18 meses",
                ar: "",
              },
            },
            {
              value: "18-24",
              text: {
                it: "18-24 mesi",
                en: "18-24 months",
                es: "18-24 meses",
                ar: "",
              },
            },
            {
              value: "dopo24",
              text: {
                it: "Dopo i 24 mesi",
                en: "After 24 months",
                es: "Después de 24 meses",
                ar: "",
              },
            },
          ],
        },
        {
          questionId: "s2_q3",
          text: {
            it: "Pensate ad altri bambini della stessa età di vostro figlio. Come parla il tuo bambino?",
            en: "Think about other children of the same age as your child. How does your child speak?",
            es: "Pensando en otros niños de la misma edad que tu hijo/a. ¿Cómo habla tu hijo/a?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            {
              value: "meglio",
              text: {
                it: "Meglio degli altri",
                en: "Better than others",
                es: "Mejor que otros",
                ar: "",
              },
            },
            {
              value: "uguale",
              text: {
                it: "Come gli altri",
                en: "Same as others",
                es: "Igual que otros",
                ar: "",
              },
            },
            {
              value: "poco_meno",
              text: {
                it: "Un po' meno degli altri",
                en: "A little less than others",
                es: "Un poco menos que otros",
                ar: "",
              },
            },
            {
              value: "molto_meno",
              text: {
                it: "Molto meno degli altri",
                en: "Much less than others",
                es: "Mucho menos que otros",
                ar: "",
              },
            },
          ],
        },
        {
          questionId: "s2_q4",
          text: {
            it: "Il vostro bambino riesce a parlare in modo chiaro con i vostri parenti e amici?",
            en: "Can your child speak clearly with your relatives and friends?",
            es: "¿Tu hijo/a puede hablar claramente con sus parientes y amigos?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            {
              value: "sempre",
              text: { it: "Sempre", en: "Always", es: "Siempre", ar: "" },
            },
            {
              value: "spesso",
              text: { it: "Spesso", en: "Often", es: "A menudo", ar: "" },
            },
            {
              value: "qualche_volta",
              text: {
                it: "Qualche volta",
                en: "Sometimes",
                es: "A veces",
                ar: "",
              },
            },
            {
              value: "raramente",
              text: { it: "Raramente", en: "Rarely", es: "Raramente", ar: "" },
            },
          ],
        },
        {
          questionId: "s2_q5",
          text: {
            it: "Nelle vostre famiglie, c'è qualcuno che ha avuto difficoltà nel parlare?",
            en: "In your families, is there anyone who has had difficulties speaking?",
            es: "¿En sus familias, hay alguien que haya tenido dificultades para hablar?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            { value: "si", text: { it: "Sì", en: "Yes", es: "Sí", ar: "" } },
            { value: "no", text: { it: "No", en: "No", es: "No", ar: "" } },
          ],
        },
        {
          questionId: "s2_q6",
          text: {
            it: "Chi?",
            en: "Who?",
            es: "¿Quién?",
            ar: "",
          },
          type: "text",
          required: false,
        },
        {
          questionId: "s2_q7",
          text: {
            it: "Al vostro bambino piace leggere libri o ascoltare qualcuno che li legge?",
            en: "Does your child like reading books or listening to someone reading them?",
            es: "¿A tu hijo/a le gusta leer libros o escuchar a alguien que los lee?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            { value: "si", text: { it: "Sì", en: "Yes", es: "Sí", ar: "" } },
            { value: "no", text: { it: "No", en: "No", es: "No", ar: "" } },
          ],
        },
        {
          questionId: "s2_q8",
          text: {
            it: "Quanto gli piace?",
            en: "How much does he/she like it?",
            es: "¿Cuánto le gusta?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            {
              value: "molto",
              text: { it: "Molto", en: "A lot", es: "Mucho", ar: "" },
            },
            {
              value: "abbastanza",
              text: {
                it: "Abbastanza",
                en: "Quite a bit",
                es: "Bastante",
                ar: "",
              },
            },
            {
              value: "poco",
              text: { it: "Poco", en: "A little", es: "Poco", ar: "" },
            },
            {
              value: "per_niente",
              text: { it: "Per niente", en: "Not at all", es: "Nada", ar: "" },
            },
          ],
        },
        {
          questionId: "s2_q9",
          text: {
            it: "Cosa piace fare al vostro bambino quando è a casa?",
            en: "What does your child like to do when at home?",
            es: "¿Qué le gusta hacer a tu hijo/a cuando está en casa?",
            ar: "",
          },
          type: "text",
          required: true,
        },
        {
          questionId: "s2_q10",
          text: {
            it: "Avete paura che vostro figlio si dimentichi la lingua che si parla a casa?",
            en: "Are you afraid that your child will forget the language spoken at home?",
            es: "¿Tienen miedo de que su hijo/a olvide el idioma que se habla en casa?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            { value: "si", text: { it: "Sì", en: "Yes", es: "Sí", ar: "" } },
            { value: "no", text: { it: "No", en: "No", es: "No", ar: "" } },
          ],
        },
        {
          questionId: "s2_q11",
          text: {
            it: "Ha frequentato il nido?",
            en: "Did he/she attend nursery school?",
            es: "¿Ha asistido a la guardería?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            { value: "si", text: { it: "Sì", en: "Yes", es: "Sí", ar: "" } },
            { value: "no", text: { it: "No", en: "No", es: "No", ar: "" } },
          ],
        },
        {
          questionId: "s2_q12",
          text: {
            it: "Da che età?",
            en: "From what age?",
            es: "¿Desde qué edad?",
            ar: "",
          },
          type: "multiple-choice",
          required: false,
          options: [
            {
              value: "0-6",
              text: {
                it: "0-6 mesi",
                en: "0-6 months",
                es: "0-6 meses",
                ar: "",
              },
            },
            {
              value: "6-12",
              text: {
                it: "6-12 mesi",
                en: "6-12 months",
                es: "6-12 meses",
                ar: "",
              },
            },
            {
              value: "12-24",
              text: {
                it: "12-24 mesi",
                en: "12-24 months",
                es: "12-24 meses",
                ar: "",
              },
            },
            {
              value: "dopo24",
              text: {
                it: "Dopo i 24 mesi",
                en: "After 24 months",
                es: "Después de 24 meses",
                ar: "",
              },
            },
          ],
        },
        {
          questionId: "s2_q13",
          text: {
            it: "Frequenta la scuola dell'infanzia?",
            en: "Does he/she attend kindergarten?",
            es: "¿Asiste al jardín de infancia?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            { value: "si", text: { it: "Sì", en: "Yes", es: "Sí", ar: "" } },
            { value: "no", text: { it: "No", en: "No", es: "No", ar: "" } },
          ],
        },
        {
          questionId: "s2_q14",
          text: {
            it: "Da quando?",
            en: "Since when?",
            es: "¿Desde cuándo?",
            ar: "",
          },
          type: "text",
          required: false,
        },
        {
          questionId: "s2_q15",
          text: {
            it: "Durante la settimana, il vostro bambino fa qualche attività anche con persone che parlano italiano? Ad esempio Sport, ludoteca, parco giochi etc?",
            en: "During the week, does your child do any activities with people who speak Italian? For example sports, play center, playground etc?",
            es: "¿Durante la semana, tu hijo/a hace alguna actividad con personas que hablan italiano? Por ejemplo deportes, ludoteca, parque infantil, etc?",
            ar: "",
          },
          type: "multiple-choice",
          required: true,
          options: [
            { value: "si", text: { it: "Sì", en: "Yes", es: "Sí", ar: "" } },
            { value: "no", text: { it: "No", en: "No", es: "No", ar: "" } },
          ],
        },
      ],
    },
  ],
};

// Puoi aggiungere altri template predefiniti qui
export const followUpQuestionnaire: QuestionnaireData = {
  questionnaireTitle: {
    it: "Follow-up",
    en: "Follow-up",
    es: "Seguimiento",
    ar: "",
  },
  description: {
    it: "Questionario di follow-up",
    en: "Follow-up questionnaire",
    es: "Cuestionario de seguimiento",
    ar: "",
  },
  version: "1.0",
  defaultLanguage: "it",
  sections: [],
};

// Export di tutti i template
export const questionnaireTemplates = {
  "Standard Bilinguismo": bilingualismQuestionnaire,
  "Follow-up": followUpQuestionnaire,
  // Aggiungi altri template qui
};
