
"use client";

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/context/language-context';

export function LanguageToggle() {
  const { setLocale } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9" aria-label="Change language">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale('en')}>
          English (EN)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('ha')}>
          Hausa (HA)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('ig')}>
          Igbo (IG)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('yo')}>
          Yoruba (YO)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
