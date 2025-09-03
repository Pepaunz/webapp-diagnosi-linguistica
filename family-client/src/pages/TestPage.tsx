import React, { useState } from 'react';
import { Button, Input, LoadingSpinner } from '../components/ui';
import LanguageSelector from '../components/ui/LanguageSelector';
import SimpleLayout from '../components/layout/SimpleLayout';
import { Info } from 'lucide-react';

const TestPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState('it');
  const [loading, setLoading] = useState(false);

  return (
    <SimpleLayout title="Test Components">
      <div className="max-w-sm mx-auto space-y-mobile-lg">
        
        <h1 className="text-mobile-xl font-bold text-family-text-primary text-center">
          Test Componenti
        </h1>
        
        {/* Test Button variants */}
        <div className="space-y-mobile-md">
          <h3 className="text-mobile-lg font-medium text-family-text-primary">Button Tests</h3>
          
          <Button size="sm" className="w-full">
            Button Small (44px)
          </Button>
          
          <Button size="md" className="w-full">
            Button Medium (48px)
          </Button>
          
          <Button size="lg" className="w-full">
            Avanti (52px) 
          </Button>
          
          <Button variant="secondary" size="md" className="w-full">
            Button Secondary
          </Button>
          
          <Button variant="outline" size="md" className="w-full">
            Button Outline
          </Button>
          
          <Button size="lg" className="w-full" loading={loading} onClick={() => setLoading(!loading)}>
            {loading ? 'Loading...' : 'Test Loading'}
          </Button>
        </div>
        
        {/* Test Input variants */}
        <div className="space-y-mobile-md">
          <h3 className="text-mobile-lg font-medium text-family-text-primary">Input Tests</h3>
          
          <Input
            label="Codice Fiscale"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            placeholder="ABCDEFG12345"
            className="text-center tracking-wider font-mono"
          />
          
          <Input
            label="Campo Normale"
            placeholder="Inserisci testo..."
          />
          
          <Input
            label="Campo con Errore"
            error="Questo campo è obbligatorio"
            value=""
          />
          
          <Input
            label="Campo con Helper"
            helperText="Testo di aiuto sotto il campo"
            placeholder="Esempio..."
          />
        </div>
        
        {/* Test Language Selector */}
        <div className="space-y-mobile-md">
          <h3 className="text-mobile-lg font-medium text-family-text-primary">Language Selector</h3>
          
        
        </div>
        
        {/* Privacy Link Test */}
        <div className="text-center pt-mobile-lg">
          <button 
            type="button"
            className="inline-flex items-center text-family-text-body hover:text-family-text-primary transition-colors"
          >
            <div className="w-5 h-5 border border-current rounded-full flex items-center justify-center mr-2">
              <Info className="w-3 h-3" />
            </div>
            <span className="text-mobile-sm underline">Info sulla privacy</span>
          </button>
        </div>
        
      </div>
    </SimpleLayout>
  );
};

export default TestPage;