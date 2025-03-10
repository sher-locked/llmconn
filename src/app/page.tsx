'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UploadIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

type ReasoningModel = 'oai-o1' | 'grok3' | 'claude-3.7' | 'deepseek-r1';

export default function Home() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ReasoningModel>('oai-o1');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [textHeight, setTextHeight] = useState(100);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    // Adjust height based on content
    const scrollHeight = e.target.scrollHeight;
    const newHeight = Math.min(Math.max(100, scrollHeight), 400); // Min 100px, Max 400px
    setTextHeight(newHeight);

    // URL detection
    const urlMatch = value.match(/https?:\/\/[^\s]+/);
    setUrlPreview(urlMatch ? urlMatch[0] : null);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // TODO: Send analysis request to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call
      
      // Navigate to analysis page
      router.push('/analysis');
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  const models: { id: ReasoningModel; name: string; disabled?: boolean }[] = [
    { id: 'oai-o1', name: 'OAI o1' },
    { id: 'grok3', name: 'Grok3' },
    { id: 'claude-3.7', name: 'Claude 3.7' },
    { id: 'deepseek-r1', name: 'Deepseek R1', disabled: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Hero Section */}
        <section className="text-center mb-16 relative">
          <div className="absolute inset-0 -top-20 bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent blur-3xl" />
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 relative">
            Fuzziness to Clarity
          </h1>
          <p className="text-xl text-foreground/80 mb-6 max-w-2xl mx-auto">
            Declutter articles, documents, or any text to extract key recommendations, reasoning, and evidence.
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our reasoning tool helps you understand the strength of arguments and detect logical fallacies.
          </p>
        </section>

        {/* Input Section */}
        <Card className="card p-8">
          <div className="space-y-8">
            {/* Model Selection */}
            <div className="flex flex-wrap gap-3">
              {models.map((model) => (
                <TooltipProvider key={model.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedModel === model.id ? 'default' : 'outline'}
                        onClick={() => !model.disabled && setSelectedModel(model.id)}
                        disabled={model.disabled}
                        className={cn(
                          'transition-all rounded-full px-6',
                          selectedModel === model.id 
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-transparent'
                            : 'border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30',
                          model.disabled && 'opacity-40 cursor-not-allowed'
                        )}
                      >
                        {model.name}
                      </Button>
                    </TooltipTrigger>
                    {model.disabled && (
                      <TooltipContent className="bg-card border-border/20">
                        <p className="text-foreground/80">Coming Soon</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            {/* Text Input */}
            <div className="space-y-4">
              <div 
                className={cn(
                  "relative transition-all duration-300 ease-spring",
                  "rounded-2xl bg-gradient-to-br",
                  isFocused 
                    ? "from-primary/10 via-primary/5 to-transparent p-[1px]"
                    : "p-0"
                )}
              >
                <Textarea
                  placeholder="Paste text, articles, documents here."
                  className={cn(
                    "min-h-[100px] w-full resize-none transition-all duration-300 ease-spring",
                    "rounded-2xl bg-muted/30 border-primary/10 text-foreground",
                    "placeholder:text-muted-foreground relative z-10",
                    "focus:outline-none focus:ring-0 focus:border-transparent",
                    isFocused && "min-h-[160px] bg-card shadow-lg shadow-primary/10"
                  )}
                  value={text}
                  onChange={handleTextChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => !text && setIsFocused(false)}
                />
                {isFocused && (
                  <div className="absolute inset-0 -z-10 animate-in fade-in duration-500 rounded-2xl">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent blur-xl" />
                  </div>
                )}
              </div>
              
              {/* URL Preview */}
              <div className={cn(
                "transition-all duration-300",
                urlPreview ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              )}>
                {urlPreview && (
                  <div className="p-4 bg-muted/40 rounded-2xl border border-primary/10">
                    <p className="text-muted-foreground text-sm mb-1">URL detected:</p>
                    <a
                      href={urlPreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/90 hover:underline break-all text-sm"
                    >
                      {urlPreview}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "rounded-full w-12 h-12 transition-all duration-300",
                  "border-primary/20 text-primary",
                  "hover:bg-primary/5 hover:border-primary/30 hover:scale-105",
                  "active:scale-95"
                )}
                onClick={() => console.log('Upload clicked')}
              >
                <UploadIcon className="h-5 w-5" />
              </Button>

              <Button
                onClick={handleAnalyze}
                disabled={!text.trim() || isAnalyzing}
                className={cn(
                  "px-8 py-6 rounded-full bg-primary text-primary-foreground",
                  "transition-all duration-300",
                  "hover:bg-primary/90 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20",
                  "active:scale-[0.98]",
                  "shadow-lg shadow-primary/25",
                  "text-base font-medium",
                  (isAnalyzing || !text.trim()) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyse'}
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
