import { SubmissionDetailDTO } from "@bilinguismo/shared";

export const bilingualismSubmission: SubmissionDetailDTO = {
  submission: {
    id: 1,
    fiscalCode: "RSSMRA85L01H501R",
    status: "Completed",
    lastUpdated: "2025-04-22T14:30:00",
    completedOn: "2025-04-22T15:45:00",
    progress: "4/5",
    template: "base",
    language: "it",
  },
  template: {
    template_id: "base",
    name: "Questionario Bilinguismo",
    description: "Questionario per la valutazione dello sviluppo linguistico nei bambini bilingui",
    available_languages: ["it", "en", "es", "ar"],
    created_at: "2024-01-15T10:00:00",
    structure_definition: {
      questionnaireTitle: {
        it: "Questionario Bilinguismo",
        en: "",
        es: "",
        ar: "",
      },
      description: {
        it: "Questionario per la valutazione dello sviluppo linguistico nei bambini bilingui",
        en: "",
        es: "",
        ar: "",
      },
      version: "1.0",
      defaultLanguage: "it",
      sections: [
        {
          sectionId: "s1",
          title: {
            it: "Informazioni Generali",
            en: "",
            es: "",
            ar: "",
          },
          description: {
            it: "Informazioni di base sul bambino e la famiglia",
            en: "",
            es: "",
            ar: "",
          },
          questions: [
            {
              questionId: "s1_q1",
              text: {
                it: "Quando è nato il tuo bambino?",
                en: "",
                es: "",
                ar: "",
              },
              type: "date",
              required: true,
            },
            {
              questionId: "s1_q2",
              text: {
                it: "Dove è nato il bambino?",
                en: "born",
                es: "",
                ar: "",
              },
              type: "multiple-choice",
              required: true,
              options: [
                {
                  value: "italia",
                  text: { it: "Italia", en: "", es: "", ar: "" },
                },
                { value: "peru", text: { it: "Perù", en: "", es: "", ar: "" } },
                {
                  value: "marocco",
                  text: { it: "Marocco", en: "", es: "", ar: "" },
                },
                {
                  value: "nigeria",
                  text: { it: "Nigeria", en: "", es: "", ar: "" },
                },
                {
                  value: "egitto",
                  text: { it: "Egitto", en: "", es: "", ar: "" },
                },
              ],
            },
            {
              questionId: "s1_q3",
              text: {
                it: "Quando è arrivato il bambino in Italia?",
                en: "",
                es: "",
                ar: "",
              },
              type: "text",
              required: false,
            },
            {
              questionId: "s1_q4",
              text: {
                it: "Indica il nome del luogo in cui è nato il bambino",
                en: "",
                es: "",
                ar: "",
              },
              type: "text",
              required: true,
            },
            {
              questionId: "s1_q5",
              text: {
                it: "Avete altri figli?",
                en: "",
                es: "",
                ar: "",
              },
              type: "multiple-choice",
              required: true,
              options: [
                { value: "si", text: { it: "Sì", en: "", es: "", ar: "" } },
                { value: "no", text: { it: "No", en: "", es: "", ar: "" } },
              ],
            },
            {
              questionId: "s1_q6",
              text: {
                it: "Quante lingue si parlano in famiglia?",
                en: "",
                es: "",
                ar: "",
              },
              type: "multiple-choice",
              required: true,
              options: [
                { value: "1", text: { it: "Una", en: "", es: "", ar: "" } },
                { value: "2", text: { it: "Due", en: "", es: "", ar: "" } },
                { value: "3", text: { it: "Tre", en: "", es: "", ar: "" } },
                {
                  value: "4+",
                  text: { it: "Più di tre", en: "", es: "", ar: "" },
                },
              ],
            },
            {
              questionId: "s1_q7",
              text: {
                it: "Quali?",
                en: "",
                es: "",
                ar: "",
              },
              type: "text",
              required: true,
            },
            {
              questionId: "s1_q8",
              text: {
                it: "Qualcuno di voi frequenta un corso di lingua italiana?",
                en: "",
                es: "",
                ar: "",
              },
              type: "multiple-choice",
              required: true,
              options: [
                { value: "si", text: { it: "Sì", en: "", es: "", ar: "" } },
                { value: "no", text: { it: "No", en: "", es: "", ar: "" } },
              ],
            },
            {
              questionId: "s1_q9",
              text: {
                it: "Chi ha un lavoro in famiglia?",
                en: "",
                es: "",
                ar: "",
              },
              type: "multiple-choice",
              required: true,
              options: [
                {
                  value: "solo_madre",
                  text: { it: "Solo la madre", en: "", es: "", ar: "" },
                },
                {
                  value: "solo_padre",
                  text: { it: "Solo il padre", en: "", es: "", ar: "" },
                },
                {
                  value: "entrambi",
                  text: { it: "Entrambi i genitori", en: "", es: "", ar: "" },
                },
                {
                  value: "nessuno",
                  text: { it: "Nessuno", en: "", es: "", ar: "" },
                },
              ],
            },
          ],
        },
        {
          sectionId: "s2",
          title: {
            it: "Sviluppo e Competenze Linguistiche",
            en: "",
            es: "",
            ar: "",
          },
          description: {
            it: "Informazioni sullo sviluppo linguistico e motorio del bambino",
            en: "",
            es: "",
            ar: "",
          },
          questions: [
            {
              questionId: "s2_q1",
              text: {
                it: "Il tuo bambino quando ha cominciato a camminare?",
                en: "",
                es: "",
                ar: "",
              },
              type: "multiple-choice",
              required: true,
              options: [
                {
                  value: "9-12",
                  text: { it: "9-12 mesi", en: "", es: "", ar: "" },
                },
                {
                  value: "12-15",
                  text: { it: "12-15 mesi", en: "", es: "", ar: "" },
                },
                {
                  value: "15-18",
                  text: { it: "15-18 mesi", en: "", es: "", ar: "" },
                },
                {
                  value: "dopo18",
                  text: { it: "Dopo i 18 mesi", en: "", es: "", ar: "" },
                },
              ],
            },
            {
              questionId: "s2_q2",
              text: {
                it: "Il tuo bambino quando ha cominciato a dire le prime parole?",
                en: "",
                es: "",
                ar: "",
              },
              type: "multiple-choice",
              required: true,
              options: [
                {
                  value: "10-12",
                  text: { it: "10-12 mesi", en: "", es: "", ar: "" },
                },
                {
                  value: "12-18",
                  text: { it: "12-18 mesi", en: "", es: "", ar: "" },
                },
                {
                  value: "18-24",
                  text: { it: "18-24 mesi", en: "", es: "", ar: "" },
                },
                {
                  value: "dopo24",
                  text: { it: "Dopo i 24 mesi", en: "", es: "", ar: "" },
                },
              ],
            },
            {
              questionId: "s2_q3",
              text: {
                it: "Pensate ad altri bambini della stessa età di vostro figlio. Come parla il tuo bambino?",
                en: "",
                es: "",
                ar: "",
              },
              type: "multiple-choice",
              required: true,
              options: [
                {
                  value: "meglio",
                  text: { it: "Meglio degli altri", en: "", es: "", ar: "" },
                },
                {
                  value: "uguale",
                  text: { it: "Come gli altri", en: "", es: "", ar: "" },
                },
                {
                  value: "poco_meno",
                  text: { it: "Un po' meno degli altri", en: "", es: "", ar: "" },
                },
                {
                  value: "molto_meno",
                  text: { it: "Molto meno degli altri", en: "", es: "", ar: "" },
                },
              ],
            },
            {
              questionId: "s2_q4",
              text: {
                it: "Il vostro bambino riesce a parlare in modo chiaro con i vostri parenti e amici?",
                en: "",
                es: "",
                ar: "",
              },
              type: "multiple-choice",
              required: true,
              options: [
                {
                  value: "sempre",
                  text: { it: "Sempre", en: "", es: "", ar: "" },
                },
                {
                  value: "spesso",
                  text: { it: "Spesso", en: "", es: "", ar: "" },
                },
                {
                  value: "qualche_volta",
                  text: { it: "Qualche volta", en: "", es: "", ar: "" },
                },
                {
                  value: "raramente",
                  text: { it: "Raramente", en: "", es: "", ar: "" },
                },
              ],
            },
            {
              questionId: "s2_q5",
              text: {
                it: "Nelle vostre famiglie, c'è qualcuno che ha avuto difficoltà nel parlare?",
                en: "",
                es: "",
                ar: "",
              },
              type: "multiple-choice",
              required: true,
              options: [
                { value: "si", text: { it: "Sì", en: "", es: "", ar: "" } },
                { value: "no", text: { it: "No", en: "", es: "", ar: "" } },
              ],
            },
            {
              questionId: "s2_q6",
              text: {
                it: "Chi?",
                en: "",
                es: "",
                ar: "",
              },
              type: "text",
              required: false,
            },
            {
              questionId: "s2_q7",
              text: {
                it: "Al vostro bambino piace leggere libri o ascoltare qualcuno che li legge?",
                en: "",
                es: "",
                ar: "",
              },
              type: "multiple-choice",
              required: true,
              options: [
                { value: "si", text: { it: "Sì", en: "", es: "", ar: "" } },
                { value: "no", text: { it: "No", en: "", es: "", ar: "" } },
              ],
            },
          ],
        },
      ],
    }
  }
,
  answers: [
    // Sezione 1
    {
      answer_id: 1,
      question_identifier: "s1_q1",
      answer_value: { value: "2020-03-15" },
      saved_at: "2025-04-22T14:32:00",
    },
    {
      answer_id: 2,
      question_identifier: "s1_q2",
      answer_value: { value: "italia" },
      saved_at: "2025-04-22T14:32:30",
    },
    {
      answer_id: 3,
      question_identifier: "s1_q3",
      answer_value: { value: "" }, // Non applicabile
      saved_at: "2025-04-22T14:32:45",
    },
    {
      answer_id: 4,
      question_identifier: "s1_q4",
      answer_value: { value: "Milano" },
      saved_at: "2025-04-22T14:33:00",
    },
    {
      answer_id: 5,
      question_identifier: "s1_q5",
      answer_value: { value: "si" },
      saved_at: "2025-04-22T14:33:15",
    },
    {
      answer_id: 6,
      question_identifier: "s1_q6",
      answer_value: { value: "2" },
      saved_at: "2025-04-22T14:33:30",
    },
    {
      answer_id: 7,
      question_identifier: "s1_q7",
      answer_value: { value: "Italiano e Spagnolo" },
      saved_at: "2025-04-22T14:34:00",
    },
    {
      answer_id: 8,
      question_identifier: "s1_q8",
      answer_value: { value: "no" },
      saved_at: "2025-04-22T14:34:15",
    },
    {
      answer_id: 9,
      question_identifier: "s1_q9",
      answer_value: { value: "entrambi" },
      saved_at: "2025-04-22T14:34:30",
    },
    // Sezione 2
    {
      answer_id: 10,
      question_identifier: "s2_q1",
      answer_value: { value: "12-15" },
      saved_at: "2025-04-22T14:35:00",
    },
    {
      answer_id: 11,
      question_identifier: "s2_q2",
      answer_value: { value: "12-18" },
      saved_at: "2025-04-22T14:35:30",
    },
    {
      answer_id: 12,
      question_identifier: "s2_q3",
      answer_value: { value: "uguale" },
      saved_at: "2025-04-22T14:36:00",
    },
    {
      answer_id: 13,
      question_identifier: "s2_q4",
      answer_value: { value: "spesso" },
      saved_at: "2025-04-22T14:36:30",
    },
    {
      answer_id: 14,
      question_identifier: "s2_q5",
      answer_value: { value: "no" },
      saved_at: "2025-04-22T14:37:00",
    },
    {
      answer_id: 15,
      question_identifier: "s2_q6",
      answer_value: { value: "" }, // Non applicabile
      saved_at: "2025-04-22T14:37:15",
    },
    {
      answer_id: 16,
      question_identifier: "s2_q7",
      answer_value: { value: "si" },
      saved_at: "2025-04-22T14:37:30",
    },
    {
      answer_id: 17,
      question_identifier: "s2_q8",
      answer_value: { value: "molto" },
      saved_at: "2025-04-22T14:38:00",
    },
    {
      answer_id: 18,
      question_identifier: "s2_q9",
      answer_value: {
        value: "Giocare con i puzzle e guardare cartoni animati",
      },
      saved_at: "2025-04-22T14:38:30",
    },
    {
      answer_id: 19,
      question_identifier: "s2_q10",
      answer_value: { value: "si" },
      saved_at: "2025-04-22T14:39:00",
    },
    {
      answer_id: 20,
      question_identifier: "s2_q11",
      answer_value: { value: "si" },
      saved_at: "2025-04-22T14:39:30",
    },
    {
      answer_id: 21,
      question_identifier: "s2_q12",
      answer_value: { value: "12-24" },
      saved_at: "2025-04-22T14:40:00",
    },
    {
      answer_id: 22,
      question_identifier: "s2_q13",
      answer_value: { value: "si" },
      saved_at: "2025-04-22T14:40:30",
    },
    {
      answer_id: 23,
      question_identifier: "s2_q14",
      answer_value: { value: "Settembre 2023" },
      saved_at: "2025-04-22T14:41:00",
    },
    {
      answer_id: 24,
      question_identifier: "s2_q15",
      answer_value: { value: "si" },
      saved_at: "2025-04-22T14:41:30",
    },
  ],
  notes: [
    {
      note_id: "1",
      question_identifier: "s2_q2",
      note_text:
        "La madre riferisce che il bambino ha iniziato a combinare parole intorno ai 20 mesi, mostrando uno sviluppo del linguaggio nella norma per bambini bilingui.",
      created_at: "2025-04-22T16:00:00",
      operator_full_name: "Dr. Giovanni Rossi",
    },
    {
      note_id: "2",
      question_identifier: "s2_q3",
      note_text:
        "Durante il colloquio il bambino ha dimostrato competenze linguistiche appropriate all'età in entrambe le lingue.",
      created_at: "2025-04-22T16:05:00",
      operator_full_name: "Dr. Giovanni Rossi",
      
    },
    {
      note_id: "3",
      question_identifier: "s2_q10",
      note_text:
        "La famiglia esprime preoccupazione per il mantenimento dello spagnolo, soprattutto ora che il bambino frequenta principalmente ambienti italofoni.",
      created_at: "2025-04-22T16:10:00",
      operator_full_name: "Dr. Giovanni Rossi",
    },
  ],
};

// Puoi aggiungere altre submission mock qui
export const submissionTemplates: Record<string, SubmissionDetailDTO> = {
  sub_001: bilingualismSubmission,
  // Aggiungi altre submission qui
};
