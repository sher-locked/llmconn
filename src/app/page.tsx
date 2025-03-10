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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
            Fuzziness to Clarity
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Declutter articles, documents, or any text to extract key recommendations, reasoning, and evidence.
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Our reasoning tool helps you understand the strength of arguments and detect logical fallacies.
          </p>
        </section>

        {/* Input Section */}
        <Card className="p-6 shadow-lg">
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
                          'transition-all',
                          selectedModel === model.id && 'ring-2 ring-blue-500'
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
                className="min-h-[200px] resize-y"
                value={text}
                onChange={handleTextChange}
              />
              
              {/* URL Preview */}
              {urlPreview && (
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-sm text-gray-500">URL detected:</p>
                  <a
                    href={urlPreview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
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
                className="rounded-full"
                onClick={() => console.log('Upload clicked')}
              >
                <UploadIcon className="h-4 w-4" />
              </Button>

              <Button
                onClick={handleAnalyze}
                disabled={!text.trim() || isAnalyzing}
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white"
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
