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
  const [selectedModel, setSelectedModel] = useState<ReasoningModel>('oai-o1');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [urlPreview, setUrlPreview] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    // Simple URL detection and preview
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
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
            Fuzziness to Clarity
          </h1>
          <p className="text-xl text-foreground/90 mb-4">
            Declutter articles, documents, or any text to extract key recommendations, reasoning, and evidence.
          </p>
          <p className="text-foreground/70">
            Our reasoning tool helps you understand the strength of arguments and detect logical fallacies.
          </p>
        </section>

        {/* Input Section */}
        <Card className="p-6 border-border bg-card">
          <div className="space-y-6">
            {/* Model Selection */}
            <div className="flex flex-wrap gap-2">
              {models.map((model) => (
                <TooltipProvider key={model.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedModel === model.id ? 'default' : 'outline'}
                        onClick={() => !model.disabled && setSelectedModel(model.id)}
                        disabled={model.disabled}
                        className={cn(
                          'transition-all border-primary text-primary hover:bg-primary/10',
                          selectedModel === model.id && 'bg-primary text-primary-foreground hover:bg-primary/90'
                        )}
                      >
                        {model.name}
                      </Button>
                    </TooltipTrigger>
                    {model.disabled && (
                      <TooltipContent>
                        <p>Coming Soon</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            {/* Text Input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Paste text, articles, documents here."
                className="min-h-[200px] resize-y bg-background border-border text-foreground placeholder:text-muted-foreground"
                value={text}
                onChange={handleTextChange}
              />
              
              {/* URL Preview */}
              {urlPreview && (
                <div className="mt-2 p-4 bg-muted rounded-md border border-border">
                  <p className="text-muted-foreground">URL detected:</p>
                  <a
                    href={urlPreview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/90 hover:underline break-all"
                  >
                    {urlPreview}
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-secondary text-secondary hover:bg-secondary/10"
                onClick={() => console.log('Upload clicked')}
              >
                <UploadIcon className="h-4 w-4" />
              </Button>

              <Button
                onClick={handleAnalyze}
                disabled={!text.trim() || isAnalyzing}
                className={cn(
                  "px-8 py-2 bg-primary text-primary-foreground hover:bg-primary/90",
                  isAnalyzing && "opacity-50 cursor-not-allowed"
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
