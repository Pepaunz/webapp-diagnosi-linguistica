import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { Plus, Save, Eye, Edit2 } from "lucide-react";
import { Button } from "../components/shared/Filters";
import {
  QuestionnaireData,
  Section,
  Question,
  Template
} from "@bilinguismo/shared";
import { Language } from "@bilinguismo/shared";
import SectionEditor from "../components/questionnaire/SectionEditor";
import LanguageSelector from "../components/questionnaire/LanguageSelector";
import { useError } from "../context/ErrorContext";
import { useValidation } from "../hooks/useValidation";
import { structureDefinitionSchema } from "../../../shared/src/schemas";
import {z} from 'zod';
import { debounce } from "../utils";
import { sectionSchema,questionSchema } from "../../../shared/src/schemas";
import { templateApi } from "../services/templateApi";


const QuestionnaireEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("it");
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>({
    questionnaireTitle: { it: "", en: "", es: "", ar: "" },
    description: { it: "", en: "", es: "", ar: "" },
    version: "1.0",
    defaultLanguage: "it",
    sections: [],
  });
  const [loading, setLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const sectionsEndRef = useRef<HTMLDivElement>(null);
  const [hasUserAddedSection, setHasUserAddedSection] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { showError, showSuccess, clearAllErrors } = useError();
    const validation = useValidation({ 
    schema: structureDefinitionSchema,
    debounceMs: 300,
    validateOnChange: true 
});

  // Scroll intelligente per mantenere la nuova sezione al centro della viewport
  useEffect(() => {
    if (hasUserAddedSection && sectionsEndRef.current) {
      const element = sectionsEndRef.current;
      const elementRect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const elementTop = elementRect.top;
      const elementMiddle = elementTop + elementRect.height / 2;
      const viewportMiddle = viewportHeight / 2;

      // Se l'elemento è sotto la metà della viewport, scrolla per metterlo al centro
      if (elementMiddle > viewportMiddle) {
        const scrollTop =
          window.scrollY + elementTop - viewportMiddle + elementRect.height / 2;
        window.scrollTo({
          top: scrollTop,
          behavior: "smooth",
        });
      }

      setHasUserAddedSection(false);
    }
  }, [hasUserAddedSection]);

  useEffect(() => {
    if (id) {
      setIsPreviewMode(true); 
      loadQuestionnaire();
    }
  }, [id]);

  const loadQuestionnaire = async () => {
    setLoading(true);
    try {
      const templateId = decodeURIComponent(id || "");
      const response = await templateApi.getTemplateById(templateId);
      setQuestionnaire(response.structure_definition);

    } catch (error) {
      handleLoadError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadError = (error: any) => {
    console.error("Error loading questionnaire:", error);
    showError("Errore nel caricamento del questionario", 'server');
  };

  

  const handleAddSection = () => {
    const newSection: Section = {
      sectionId: `s${questionnaire.sections.length + 1}`,
      title: { it: "", en: "", es: "", ar: "" },
      description: { it: "", en: "", es: "", ar: "" },
      questions: [],
    };

    setQuestionnaire({
      ...questionnaire,
      sections: [...questionnaire.sections, newSection],
    });

    
    setHasUserAddedSection(true);
  };

  const handleUpdateSection = (index: number, updatedSection: Section) => {
    const updatedSections = [...questionnaire.sections];
    updatedSections[index] = updatedSection;
    setQuestionnaire({
      ...questionnaire,
      sections: updatedSections,
    });
  };

  const handleDeleteSection = (index: number) => {
    if (confirm("Sei sicuro di voler eliminare questa sezione?")) {
      const updatedSections = questionnaire.sections.filter(
        (_, i) => i !== index
      );
      setQuestionnaire({
        ...questionnaire,
        sections: updatedSections,
      });
    }
  };

  const handleSave = async () => {
    // Pulisci errori precedenti
    clearAllErrors();
    validation.clearAllErrors();

    if (!questionnaire.questionnaireTitle[selectedLanguage]?.trim()) {
      showError(`Il titolo in ${selectedLanguage.toUpperCase()} è obbligatorio`, 'validation');
      return; // BLOCCA QUI
    }

//     const hasAtLeastOneLanguage = Object.values(questionnaire.questionnaireTitle).some(title => title?.trim());
// if (!hasAtLeastOneLanguage) {
//   showError("Il questionario deve avere un titolo in almeno una lingua", 'validation');
//   return;
// }

// Controlla che ogni sezione abbia almeno una domanda
const emptySections = questionnaire.sections.filter(section => section.questions.length === 0);
if (emptySections.length > 0) {
  showError("Tutte le sezioni devono contenere almeno una domanda", 'validation');
  return;
}

// Controlla che le domande multiple-choice abbiano almeno 2 opzioni
const invalidQuestions = questionnaire.sections.flatMap(section => 
  section.questions.filter(question => 
    question.type === 'multiple-choice' && 
    (!question.options || question.options.length < 2)
    )
);
if (invalidQuestions.length > 0) {
  showError("Le domande a scelta multipla devono avere almeno 2 opzioni", 'validation');
  return;
}
  
    // Validazione completa prima del submit
    if (!validation.validateForm(questionnaire)) {
      console.log("errore validzione form");
      showError("Correggi gli errori nel questionario prima di salvare", 'validation');
      return;
    }
  
    // Validazione business logic aggiuntiva
    if (!questionnaire.questionnaireTitle.it?.trim()) {
      showError("Il titolo in italiano è obbligatorio", 'validation');
      return;
    }
  
    // if (questionnaire.sections.length === 0) {
    //   showError("Il questionario deve contenere almeno una sezione", 'validation');
    //   return;
    // }
  
    setLoading(true);
    
    try {
      console.log("Saving questionnaire:", questionnaire);

      const templateData = {
        name: questionnaire.questionnaireTitle.it || '',
        description: questionnaire.description.it || null,
        structure_definition: questionnaire,
        available_languages: getAvailableLanguages(),
        is_active: true,
      };
      
      let result;
      
      if (id) {
        // CASO UPDATE: abbiamo un ID dal parametro URL
        console.log("Updating existing template with ID:", id);
        result = await templateApi.updateTemplate(id, templateData);
        showSuccess("Template aggiornato con successo!");
      } else {
        // CASO CREATE: nessun ID, creazione nuovo template  
        console.log("Creating new template");
        result = await templateApi.createTemplate(templateData);
        showSuccess("Template creato con successo!");
        
        // Naviga alla pagina di edit del nuovo template
        navigate(`/templates/editor/${result.template_id}`);
      }
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      showError(error, 'server');
    } finally {
      setLoading(false);
    }
  };


const validateSectionComplete = (section: Section): boolean => {
  try {
    sectionSchema.parse(section);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(issue => issue.message).join(', ');
      showError(`Errori nella sezione: ${errorMessages}`, 'validation');
    }
    return false;
  }
};

const validateQuestionComplete = (question: Question): boolean => {
  try {
    questionSchema.parse(question);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(issue => issue.message).join(', ');
      showError(`Errori nella domanda: ${errorMessages}`, 'validation');
    }
    return false;
  }
};

 /*
 =================================================================
 */

 // Validatori semplici per singoli campi
const titleValidator = z.string()
.min(1, "Il titolo è obbligatorio")
.max(255, "Il titolo è troppo lungo (max 255 caratteri)");

const descriptionValidator = z.string()
.max(1000, "La descrizione è troppa lunga (max 1000 caratteri)");

// Debounced validation functions
const validateTitleDebounced = debounce((value: string, setFieldErrors: any) => {
try {
  titleValidator.parse(value);
  // Se valido, rimuovi errore
  setFieldErrors((prev: any) => {
    const newErrors = { ...prev };
    delete newErrors.title;
    return newErrors;
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    setFieldErrors((prev: any) => ({
      ...prev,
      title: error.issues[0].message
    }));
  }
}
}, 300);

const validateDescriptionDebounced = debounce((value: string, setFieldErrors: any) => {
  try {
    descriptionValidator.parse(value);
    setFieldErrors((prev: any) => {
      const newErrors = { ...prev };
      delete newErrors.description;
      return newErrors;
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      setFieldErrors((prev: any) => ({
        ...prev,
        description: error.issues[0].message
      }));
    }
  }
}, 300);
  
const handleTitleChange = (value: string) => {
  setQuestionnaire({
    ...questionnaire,
    questionnaireTitle: {
      ...questionnaire.questionnaireTitle,
      [selectedLanguage]: value,
    },
  });
  
  // Validazione real-time con debounce
  validateTitleDebounced(value, setFieldErrors);
};

const handleDescriptionChange = (value: string) => {
  setQuestionnaire({
    ...questionnaire,
    description: {
      ...questionnaire.description,
      [selectedLanguage]: value,
    },
  });

 
  
  // Validazione real-time con debounce
  validateDescriptionDebounced(value, setFieldErrors);
};

const handleLanguageChange = (newLanguage: Language) => {
  setSelectedLanguage(newLanguage);
  
//   // Valida che ci sia contenuto nella nuova lingua
//   if (!questionnaire.questionnaireTitle[newLanguage]?.trim()) {
//     showError(`Manca il titolo in ${newLanguage.toUpperCase()}`, 'validation');
//   }
const titleValue = questionnaire.questionnaireTitle[newLanguage] || "";
  validateTitleDebounced(titleValue, setFieldErrors);
 };

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  // Funzione per determinare quali lingue sono disponibili nel questionario
  const getAvailableLanguages = (): Language[] => {
    const languages: Language[] = ["it", "en", "es", "ar"];
    const available: Language[] = [];

    languages.forEach((lang) => {
      // Controlla se almeno il titolo del questionario è presente per questa lingua
      if (questionnaire.questionnaireTitle[lang]) {
        available.push(lang);
      }
    });

    // Se nessuna lingua è disponibile, ritorna almeno quella di default
    return available.length > 0
      ? available
      : [questionnaire.defaultLanguage as Language];
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <p>Caricamento questionario...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {id ? "Modifica Questionario" : "Crea Nuovo Questionario"}
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={handlePreview}
              variant={isPreviewMode ? "edit" : "secondary"}
              icon={isPreviewMode ? <Edit2 size={16} /> : <Eye size={16} />}
            >
              {isPreviewMode ? "Modifica" : "Anteprima"}
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              icon={<Save size={16} />}
            >
              Salva
            </Button>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mb-6">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            availableLanguages={getAvailableLanguages()}
            isEditMode={!isPreviewMode}
          />
          {!getAvailableLanguages().includes(selectedLanguage) &&
            !isPreviewMode && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Stai aggiungendo contenuti per la lingua{" "}
                  <strong>{selectedLanguage.toUpperCase()}</strong>. Completa
                  almeno il titolo del questionario per rendere disponibile
                  questa lingua.
                </p>
              </div>
            )}
        </div>

        {/* Title and Description */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titolo Questionario
            </label>
            <input
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.title ? 'border-red-500 focus:ring-red-500' : ''
              }`}
              type="text"
              value={questionnaire.questionnaireTitle[selectedLanguage] || ""}
              onChange={(e) => handleTitleChange(e.target.value)}
              disabled={isPreviewMode}
              placeholder={`Inserisci il titolo in ${selectedLanguage.toUpperCase()}`}
            />
            {fieldErrors.title && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione
            </label>
            <textarea
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.description ? 'border-red-500 focus:ring-red-500' : ''
              }`}
              rows={3}
              value={questionnaire.description[selectedLanguage] || ""}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              disabled={isPreviewMode}
              placeholder={`Inserisci la descrizione in ${selectedLanguage.toUpperCase()}`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {questionnaire.sections.map((section, index) => {
            // Calcola il numero di domande nelle sezioni precedenti
            const previousQuestionsCount = questionnaire.sections
              .slice(0, index)
              .reduce((count, sect) => count + sect.questions.length, 0);

            return (
              <SectionEditor
                key={section.sectionId}
                section={section}
                sectionIndex={index}
                selectedLanguage={selectedLanguage}
                isPreviewMode={isPreviewMode}
                startingQuestionNumber={previousQuestionsCount + 1}
                validateSectionComplete={validateSectionComplete}
                validateQuestionComplete={validateQuestionComplete}
                onUpdate={(updatedSection) =>
                  handleUpdateSection(index, updatedSection)
                }
                onDelete={() => handleDeleteSection(index)}
              />
            );
          })}
          <div ref={sectionsEndRef} />
        </div>

        {/* Add Section Button */}
        {!isPreviewMode && (
          <div className="mt-6 text-center">
            <Button
              onClick={handleAddSection}
              variant="primary"
              icon={<Plus size={16} />}
            >
              Aggiungi Sezione
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default QuestionnaireEditorPage;
