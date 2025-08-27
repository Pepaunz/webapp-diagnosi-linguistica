// src/pages/CFLoginPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimpleLayout from '../components/layout/SimpleLayout';
import { Button, Input, Card, LoadingSpinner } from '../components/ui';
import { User } from 'lucide-react';

const CFLoginPage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [fiscalCode, setFiscalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validazione base Codice Fiscale
  const validateFiscalCode = (cf: string): boolean => {
    // Regex base per CF italiano (16 caratteri alfanumerici)
    const cfRegex = /^[A-Za-z]{6}[0-9]{2}[A-Za-z][0-9]{2}[A-Za-z][0-9]{3}[A-Za-z]$/;
    return cfRegex.test(cf.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!fiscalCode.trim()) {
      setError('Il codice fiscale è obbligatorio');
      return;
    }
    
    if (!validateFiscalCode(fiscalCode)) {
      setError('Codice fiscale non valido. Deve essere di 16 caratteri.');
      return;
    }
    
    setLoading(true);
    
    try {
      // TODO: Chiamata API reale
      // const response = await api.startOrResumeSubmission(templateId!, fiscalCode);
      
      // Simulazione per ora
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulazione risposta API
      const mockSubmissionId = 'sub_' + Date.now();
      
      // Redirect al questionario
      navigate(`/questionnaire/${templateId}/${mockSubmissionId}`);
      
    } catch (err) {
      setError('Errore durante l\'accesso. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SimpleLayout showHeader={false}>
        <Card className="p-8 text-center">
          <LoadingSpinner size="lg" text="Accesso in corso..." />
        </Card>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout showHeader={false}>
      <Card className="p-6 mx-4 rounded-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Accesso Questionario</h2>
          <p className="text-gray-600 text-base leading-relaxed">
            Inserisci il codice fiscale del bambino per iniziare
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Codice Fiscale del Bambino"
            value={fiscalCode}
            onChange={(e) => setFiscalCode(e.target.value.toUpperCase())}
            placeholder="RSSMRA01A01H501X"
            maxLength={16}
            error={error}
            helperText="Il codice fiscale deve essere di 16 caratteri"
            required
            autoFocus
            inputMode="text"
            autoCapitalize="characters"
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={loading}
          >
            Inizia Questionario
          </Button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 leading-relaxed">
            I tuoi dati sono protetti e utilizzati solo per scopi sanitari
          </p>
        </div>
      </Card>
    </SimpleLayout>
  );
};

export default CFLoginPage;