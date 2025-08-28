// src/pages/CFLoginPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimpleLayout from '../components/layout/SimpleLayout';
import { Button, Input, LoadingSpinner } from '../components/ui';
import LanguageSelector from '../components/ui/LanguageSelector';
import { Info } from 'lucide-react';

const CFLoginPage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [fiscalCode, setFiscalCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('it');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validazione base Codice Fiscale
  const validateFiscalCode = (cf: string): boolean => {
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockSubmissionId = 'sub_' + Date.now();
      navigate(`/questionnaire/${templateId}/${mockSubmissionId}`);
    } catch (err) {
      setError('Errore durante l\'accesso. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SimpleLayout>
        <div className="max-w-sm mx-auto text-center py-mobile-xl">
          <LoadingSpinner size="lg" text="Accesso in corso..." />
        </div>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout>
      <div className="max-w-sm mx-auto px-mobile-md">
        <div className="text-center mb-mobile-xl">
          <h1 className="text-mobile-2xl font-bold text-family-text-primary mb-mobile-md">
            Benvenuto/a
          </h1>
          <p className="text-mobile-md text-family-text-body leading-relaxed px-2">
            Per iniziare o riprendere il questionario inserisci il codice fiscale del bambino/a
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-mobile-lg">
          <Input
            label="Codice Fiscale"
            value={fiscalCode}
            onChange={(e) => setFiscalCode(e.target.value.toUpperCase())}
            placeholder="ABCDEFG12345"
            maxLength={16}
            error={error}
            required
            autoFocus
            inputMode="text"
            autoCapitalize="characters"
            className="text-center tracking-wider font-mono text-mobile-md"
          />
          
          <LanguageSelector
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            label="Scegli lingua"
          />
          
          {/* Button Avanti - stile scuro dal Figma */}
          <div className="pt-mobile-md">
            <Button 
              type="submit" 
              size="lg"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              Avanti
            </Button>
          </div>
          
        </form>
        
        {/* Privacy Link - come nel Figma */}
        <div className="mt-mobile-xl text-center">
          <button 
            type="button"
            className="inline-flex items-center text-family-text-body hover:text-family-text-primary transition-colors group"
          >   <Info className="w-5 h-5" />
            <span className="text-mobile-sm underline">Info sulla privacy</span>
          </button>
        </div>
        
      </div>
    </SimpleLayout>
  );
};

export default CFLoginPage;

