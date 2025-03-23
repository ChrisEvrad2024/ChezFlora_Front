
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { availableLanguages, getDefaultLanguage, setLanguage } from '@/lib/language';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const [currentLanguage, setCurrentLanguage] = useState(getDefaultLanguage());
  
  useEffect(() => {
    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setCurrentLanguage(customEvent.detail);
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);
  
  const handleLanguageSelect = (language: typeof availableLanguages[0]) => {
    setLanguage(language);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="flex items-center gap-2 px-3">
          <Globe size={16} />
          <span className="hidden md:inline">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageSelect(language)}
            className={`gap-2 ${currentLanguage.code === language.code ? 'font-medium bg-muted' : ''}`}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
