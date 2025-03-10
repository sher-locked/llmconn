'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeftIcon, 
  BookmarkIcon, 
  Link2Icon, 
  FileTextIcon, 
  QuoteIcon,
  HeartFilledIcon,
  StarFilledIcon,
  ReaderIcon
} from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

export default function StoryView() {
  const router = useRouter();
  
  // Mock data for story content
  const [storyContent] = useState({
    title: "The Journey Through the Enchanted Forest",
    subtitle: "A tale of discovery, friendship, and unexpected magic",
    summary: "In this heartwarming story, a young traveler embarks on a journey through an ancient forest, encountering magical creatures and forming unexpected bonds. The narrative weaves together themes of courage, friendship, and the beauty of the natural world.",
    source: {
      type: "document", // or "link"
      url: "https://example.com/enchanted-forest-story.pdf",
      name: "enchanted-forest-story.pdf",
      date: "May 12, 2023"
    },
    mood: "whimsical", // could be: whimsical, dramatic, reflective, adventurous
    readingTime: "8 min read"
  });

  const handleBackToHome = () => {
    router.push('/');
  };

  // Get mood icon and color
  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'whimsical':
        return <StarFilledIcon className="h-5 w-5 text-amber-400" />;
      case 'dramatic':
        return <HeartFilledIcon className="h-5 w-5 text-rose-500" />;
      case 'reflective':
        return <BookmarkIcon className="h-5 w-5 text-emerald-500" />;
      case 'adventurous':
        return <ReaderIcon className="h-5 w-5 text-primary" />;
      default:
        return <StarFilledIcon className="h-5 w-5 text-amber-400" />;
    }
  };

  const getMoodGradient = (mood: string) => {
    switch (mood) {
      case 'whimsical':
        return 'from-amber-400/20 via-purple-400/10 to-transparent';
      case 'dramatic':
        return 'from-rose-500/20 via-orange-400/10 to-transparent';
      case 'reflective':
        return 'from-emerald-500/20 via-blue-400/10 to-transparent';
      case 'adventurous':
        return 'from-primary/20 via-secondary/10 to-transparent';
      default:
        return 'from-amber-400/20 via-purple-400/10 to-transparent';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Story Content Section */}
      <div className="mb-12">
        <div className="relative overflow-hidden rounded-xl border border-border/30 bg-card">
          {/* Subtle background pattern */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getMoodGradient(storyContent.mood)} opacity-70`}></div>
          
          {/* Content */}
          <div className="relative p-8">
            {/* Source indicator with back button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center text-sm text-muted-foreground">
                {storyContent.source.type === "document" ? (
                  <>
                    <FileTextIcon className="h-4 w-4 mr-2" />
                    <span className="mr-2">Document:</span>
                  </>
                ) : (
                  <>
                    <Link2Icon className="h-4 w-4 mr-2" />
                    <span className="mr-2">Web Page:</span>
                  </>
                )}
                <span className="font-medium text-foreground/80">{storyContent.source.name}</span>
                <span className="mx-2">•</span>
                <span>{storyContent.source.date}</span>
              </div>
              
              {/* Back button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleBackToHome}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            
            {/* Story badge */}
            <div className="mb-6 flex">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-sm font-medium">
                <ReaderIcon className="h-4 w-4 mr-2" />
                Story Detected
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-muted-foreground">{storyContent.readingTime}</span>
              </div>
            </div>
            
            {/* Title and subtitle */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-3 text-foreground">
                {storyContent.title}
              </h1>
              <p className="text-xl text-foreground/80 font-medium">
                {storyContent.subtitle}
              </p>
            </div>
            
            {/* Summary with quote styling */}
            <div className="flex">
              <QuoteIcon className="h-8 w-8 text-amber-400/60 flex-shrink-0 mr-4 mt-1" />
              <div className="bg-gradient-to-r from-amber-400/10 to-transparent p-5 rounded-r-lg border-l-4 border-amber-400/30">
                <p className="text-foreground/90 leading-relaxed italic">
                  {storyContent.summary}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Message */}
      <Card className="p-8 bg-card border-border/30 shadow-sm mb-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-amber-400/10 flex items-center justify-center mb-6">
            {getMoodIcon(storyContent.mood)}
          </div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">This appears to be a story!</h2>
          <p className="text-foreground/80 max-w-2xl mb-6">
            We've detected that this content is a narrative or story rather than an argument or analysis. 
            Stories are meant to be enjoyed for their creativity, emotional impact, and entertainment value.
          </p>
          <p className="text-foreground/70 max-w-2xl mb-8">
            Sit back, relax, and enjoy the journey this story takes you on. If you'd like to analyze an argument instead, 
            you can go back and paste different content.
          </p>
          <Button 
            onClick={handleBackToHome}
            className="px-6 py-2 rounded-full bg-amber-400 text-amber-950 hover:bg-amber-500 transition-colors"
          >
            Return Home
          </Button>
        </div>
      </Card>

      {/* Reading Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl p-5 border border-border/30 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center mr-3">
              <StarFilledIcon className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="font-medium text-foreground">Immerse Yourself</h3>
          </div>
          <p className="text-sm text-foreground/70">
            Find a comfortable spot, minimize distractions, and allow yourself to be fully transported into the story's world.
          </p>
        </div>
        
        <div className="bg-card rounded-xl p-5 border border-border/30 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center mr-3">
              <HeartFilledIcon className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="font-medium text-foreground">Connect Emotionally</h3>
          </div>
          <p className="text-sm text-foreground/70">
            Pay attention to how the story makes you feel. The best stories resonate with us on an emotional level.
          </p>
        </div>
        
        <div className="bg-card rounded-xl p-5 border border-border/30 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center mr-3">
              <BookmarkIcon className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="font-medium text-foreground">Reflect Afterward</h3>
          </div>
          <p className="text-sm text-foreground/70">
            After reading, take a moment to reflect on the story's themes, characters, and what insights it might offer.
          </p>
        </div>
      </div>
    </div>
  );
} 