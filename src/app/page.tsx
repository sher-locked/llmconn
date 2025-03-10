'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UploadIcon, LinkIcon, ExternalLinkIcon, XIcon, FileIcon, FileTextIcon, ImageIcon, FileType2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ReasoningModel = 'oai-o1' | 'grok3' | 'claude-3.7' | 'deepseek-r1';

// Define available models
const models = [
  { id: 'oai-o1', name: 'OpenAI o1', disabled: false },
  { id: 'claude-3.7', name: 'Claude 3.7', disabled: false },
  { id: 'grok3', name: 'Grok 3', disabled: true },
  { id: 'deepseek-r1', name: 'DeepSeek R1', disabled: true },
];

// Link preview interface
interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  isLoading: boolean;
}

// Document preview interface
interface DocumentPreview {
  file: File;
  name: string;
  size: string;
  type: string;
  icon: React.ReactNode;
  preview?: string;
  isLoading: boolean;
}

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ReasoningModel>('oai-o1');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [isDocumentMode, setIsDocumentMode] = useState(false);
  const [documentPreview, setDocumentPreview] = useState<DocumentPreview | null>(null);
  const [question, setQuestion] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    // URL detection
    const urlMatch = value.match(/https?:\/\/[^\s]+/);
    const detectedUrl = urlMatch ? urlMatch[0] : null;
    
    // Only update URL if it changed
    if (detectedUrl !== urlPreview) {
      setUrlPreview(detectedUrl);
      
      if (detectedUrl) {
        // If URL is detected, fetch preview and set link mode
        fetchLinkPreview(detectedUrl);
      } else {
        setLinkPreview(null);
        setIsLinkMode(false);
      }
    }
  };

  // Mock function to fetch link preview (would be replaced with actual API call)
  const fetchLinkPreview = async (url: string) => {
    setLinkPreview({
      url,
      isLoading: true,
    });
    
    try {
      // In a real implementation, you would call an API to get metadata
      // For now, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Extract domain for display
      const domain = new URL(url).hostname.replace('www.', '');
      
      setLinkPreview({
        url,
        title: `Content from ${domain}`,
        description: "Click analyze to extract key points and reasoning from this content.",
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        isLoading: false,
      });
      
      // Set link mode to true to collapse textbox
      setIsLinkMode(true);
    } catch (error) {
      console.error("Error fetching link preview:", error);
      setLinkPreview({
        url,
        isLoading: false,
      });
    }
  };

  const clearLink = () => {
    setText('');
    setUrlPreview(null);
    setLinkPreview(null);
    setIsLinkMode(false);
    setQuestion('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear any existing content
    setText('');
    setUrlPreview(null);
    setLinkPreview(null);
    setIsLinkMode(false);
    
    // Set loading state
    setIsDocumentMode(true);
    setDocumentPreview({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      icon: getFileIcon(file.type),
      isLoading: true,
    });

    // Process file
    processFile(file);
  };

  const processFile = async (file: File) => {
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate preview based on file type
      let preview: string | undefined;
      
      if (file.type.startsWith('image/')) {
        preview = await readFileAsDataURL(file);
      } else if (file.type === 'application/pdf' || file.type.includes('text') || file.type.includes('document')) {
        // For text-based files, we'd normally extract text content
        // Here we'll just show a placeholder
        preview = "Document content would be extracted here...";
      }
      
      // Update document preview
      setDocumentPreview(prev => prev ? {
        ...prev,
        preview,
        isLoading: false,
      } : null);
      
    } catch (error) {
      console.error("Error processing file:", error);
      setDocumentPreview(prev => prev ? {
        ...prev,
        isLoading: false,
      } : null);
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-6 w-6" />;
    } else if (fileType === 'application/pdf') {
      return <FileTextIcon className="h-6 w-6" />;
    } else if (fileType.includes('document') || fileType.includes('text')) {
      return <FileType2Icon className="h-6 w-6" />;
    } else {
      return <FileIcon className="h-6 w-6" />;
    }
  };

  const clearDocument = () => {
    setDocumentPreview(null);
    setIsDocumentMode(false);
    setText('');
    setQuestion('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to analysis page
      router.push('/analysis');
    } catch (error) {
      console.error('Error during analysis:', error);
      setIsAnalyzing(false);
    }
  };

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
                        onClick={() => !model.disabled && setSelectedModel(model.id as ReasoningModel)}
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

            {/* Text Input, Link Preview, or Document Preview */}
            <div className="space-y-4">
              {!isLinkMode && !isDocumentMode ? (
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
              ) : isLinkMode ? (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  {/* Link Preview Card */}
                  <div className="bg-card rounded-2xl border border-primary/10 shadow-lg shadow-primary/5 overflow-hidden">
                    {linkPreview?.isLoading ? (
                      <div className="p-8 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <span className="ml-3 text-muted-foreground">Loading preview...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {/* Link Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border/10 bg-muted/30">
                          <div className="flex items-center">
                            {linkPreview?.favicon && (
                              <img 
                                src={linkPreview.favicon} 
                                alt="Site icon" 
                                className="w-5 h-5 mr-2 rounded-sm"
                                onError={(e: React.SyntheticEvent<HTMLImageElement>) => (e.currentTarget.style.display = 'none')}
                              />
                            )}
                            <span className="text-sm font-medium text-foreground/80 truncate max-w-[300px]">
                              {new URL(linkPreview?.url || '').hostname}
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full hover:bg-muted/50"
                            onClick={clearLink}
                          >
                            <XIcon className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        
                        {/* Link Content */}
                        <div className="p-6">
                          <h3 className="text-lg font-medium mb-2">{linkPreview?.title || 'Analyze this link'}</h3>
                          <p className="text-muted-foreground text-sm mb-4">{linkPreview?.description || 'Extract key points and reasoning from this content.'}</p>
                          
                          <div className="flex items-center text-sm text-primary mb-6">
                            <LinkIcon className="h-4 w-4 mr-1.5" />
                            <a 
                              href={linkPreview?.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="truncate hover:underline flex-1"
                            >
                              {linkPreview?.url}
                            </a>
                            <ExternalLinkIcon className="h-3.5 w-3.5 ml-1.5 flex-shrink-0" />
                          </div>
                          
                          {/* Question Input */}
                          <div className="bg-muted/30 rounded-xl p-4 border border-primary/5">
                            <p className="text-sm font-medium mb-2 text-foreground/80">Ask a specific question about this content:</p>
                            <Textarea
                              placeholder="E.g., What are the main arguments? What evidence supports the claims?"
                              className="min-h-[80px] resize-none bg-card border-primary/10 text-foreground placeholder:text-muted-foreground focus:border-primary/20 focus:ring-primary/10 rounded-lg"
                              value={question}
                              onChange={(e) => setQuestion(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  {/* Document Preview Card */}
                  <div className="bg-card rounded-2xl border border-primary/10 shadow-lg shadow-primary/5 overflow-hidden">
                    {documentPreview?.isLoading ? (
                      <div className="p-8 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <span className="ml-3 text-muted-foreground">Processing document...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {/* Document Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border/10 bg-muted/30">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              {documentPreview?.icon}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground/80 truncate max-w-[300px]">
                                {documentPreview?.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {documentPreview?.size} • {documentPreview?.type.split('/')[1]}
                              </span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full hover:bg-muted/50"
                            onClick={clearDocument}
                          >
                            <XIcon className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        
                        {/* Document Content */}
                        <div className="p-6">
                          <h3 className="text-lg font-medium mb-2">Document Analysis</h3>
                          <p className="text-muted-foreground text-sm mb-4">
                            Extract key points and reasoning from this document.
                          </p>
                          
                          {/* Document Preview */}
                          <div className="mb-6 rounded-xl overflow-hidden border border-border/10">
                            {documentPreview?.preview && documentPreview.file.type.startsWith('image/') ? (
                              <div className="aspect-video bg-muted/30 relative">
                                <img 
                                  src={documentPreview.preview} 
                                  alt={documentPreview.name}
                                  className="object-contain w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="p-4 bg-muted/20 text-sm text-muted-foreground">
                                <p>{documentPreview?.preview || "Document content preview not available."}</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Question Input */}
                          <div className="bg-muted/30 rounded-xl p-4 border border-primary/5">
                            <p className="text-sm font-medium mb-2 text-foreground/80">Ask a specific question about this document:</p>
                            <Textarea
                              placeholder="E.g., What are the key points? What evidence is presented?"
                              className="min-h-[80px] resize-none bg-card border-primary/10 text-foreground placeholder:text-muted-foreground focus:border-primary/20 focus:ring-primary/10 rounded-lg"
                              value={question}
                              onChange={(e) => setQuestion(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* URL Preview (only shown when not in link or document mode) */}
              {!isLinkMode && !isDocumentMode && (
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
              )}
              
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,image/*"
              />
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
                onClick={triggerFileUpload}
              >
                <UploadIcon className="h-5 w-5" />
              </Button>

              <Button
                onClick={handleAnalyze}
                disabled={(isLinkMode || isDocumentMode) ? false : !text.trim() || isAnalyzing}
                className={cn(
                  "px-8 py-6 rounded-full bg-primary text-primary-foreground",
                  "transition-all duration-300",
                  "hover:bg-primary/90 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20",
                  "active:scale-[0.98]",
                  "shadow-lg shadow-primary/25",
                  "text-base font-medium",
                  (isAnalyzing || (!isLinkMode && !isDocumentMode && !text.trim())) && "opacity-50 cursor-not-allowed"
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
