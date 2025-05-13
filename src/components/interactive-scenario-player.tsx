
"use client";

import type { InteractiveScenario, ScenarioNode, ScenarioOption } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot, User, CornerDownLeft, Send } from 'lucide-react';
import Image from 'next/image';

interface InteractiveScenarioPlayerProps {
  scenario: InteractiveScenario;
  onScenarioComplete?: (scenarioId: string, userResponses: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface ChatMessage {
  id: string;
  nodeId: string; // Store nodeId separately for easier checks
  nodeText: string;
  nodeImageUrl?: string;
  nodeCharacter?: 'user' | 'guide';
  userResponse?: string | string[]; // For user's text input or choice(s)
}

export function InteractiveScenarioPlayer({ scenario, onScenarioComplete }: InteractiveScenarioPlayerProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string>(scenario.startNodeId);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [userResponses, setUserResponses] = useState<Record<string, string | string[]>>({});
  const [currentTextResponse, setCurrentTextResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentNode = scenario.nodes.find(n => n.id === currentNodeId);

  useEffect(() => {
    if (currentNode) {
      const lastHistoryEntry = history.length > 0 ? history[history.length - 1] : null;
      // Only add new node to history if it's different from the last one's nodeId,
      // or if the last one was a user response entry (which doesn't have nodeText for the *new* node).
      // This prevents adding duplicate node messages if only userResponse part of history changes.
      if (!lastHistoryEntry || lastHistoryEntry.nodeId !== currentNode.id) {
         setHistory(prev => [
          ...prev,
          {
            id: `${Date.now()}-${currentNode.id}`, // Unique ID for the history entry
            nodeId: currentNode.id, // ID of the scenario node this message originates from
            nodeText: currentNode.text,
            nodeImageUrl: currentNode.imageUrl,
            nodeCharacter: currentNode.character,
            // userResponse is added when the user actually responds
          },
        ]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNodeId]); // Rerun when currentNodeId changes to fetch new node content

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);


  const handleOptionSelect = (option: ScenarioOption) => {
    if (!currentNode) return;
    const newResponses = { ...userResponses, [currentNode.id]: option.text };
    setUserResponses(newResponses);

    setHistory(prev =>
      prev.map(h =>
        h.nodeId === currentNode.id && h.id === history[history.length-1].id 
          ? { ...h, userResponse: option.text }
          : h
      )
    );
    
    if (option.endsScenario) {
      if (onScenarioComplete) onScenarioComplete(scenario.id, newResponses);
      return;
    }

    if (option.feedback) {
        const feedbackNodeId = `temp-feedback-${Date.now()}`;
        // Add feedback as a new history entry directly
        setHistory(prev => [
          ...prev,
          {
            id: feedbackNodeId,
            nodeId: feedbackNodeId, // Treat feedback as its own "node" in history
            nodeText: option.feedback!,
            nodeCharacter: 'guide', // Feedback is from the guide
          },
        ]);
        // Then proceed to the actual next node if it exists
        if (option.nextNodeId) {
            setCurrentNodeId(option.nextNodeId);
        } else if (onScenarioComplete) { // If feedback is the end
            onScenarioComplete(scenario.id, newResponses);
        }
    } else if (option.nextNodeId) {
        setCurrentNodeId(option.nextNodeId);
    } else if (onScenarioComplete) {
        onScenarioComplete(scenario.id, newResponses);
    }
  };

  const handleTextSubmit = () => {
    if (!currentNode) return;
    let currentResponses = { ...userResponses }; // Use a mutable copy for this submission

    // For 'message' type with a "Continue" button
    if (currentNode.type === 'message') {
      if (currentNode.nextNodeId) {
        setCurrentNodeId(currentNode.nextNodeId);
      } else if (currentNode.type === 'summary' && onScenarioComplete) { // Check if it's actually a summary node
        onScenarioComplete(scenario.id, currentResponses);
      }
      return;
    }

    // For 'reflection_prompt'
    if (currentNode.type === 'reflection_prompt') {
      if (!currentTextResponse.trim() && !(currentNode.options && currentNode.options.length > 0)) { // Allow empty if options exist (e.g. "skip")
        return;
      }
      currentResponses = { ...userResponses, [currentNode.id]: currentTextResponse };
      setUserResponses(currentResponses);

      setHistory(prev =>
        prev.map(h =>
          h.nodeId === currentNode.id && h.id === history[history.length-1].id
            ? { ...h, userResponse: currentTextResponse }
            : h
        )
      );
      setCurrentTextResponse(''); // Clear input after submission

      if (currentNode.nextNodeId) {
        setCurrentNodeId(currentNode.nextNodeId);
      } else if (onScenarioComplete) {
        onScenarioComplete(scenario.id, currentResponses);
      }
    }
  };

  if (!currentNode) {
    return <Card><CardContent className="p-6"><p className="text-muted-foreground">Scenario ended or error loading current step.</p></CardContent></Card>;
  }

  const lastHistoryEntry = history.length > 0 ? history[history.length - 1] : null;
  // Check if the *absolute last* history entry *is* the current node and *has a user response already*.
  // This means the user has already submitted their answer for the currently displayed node.
  const hasRespondedToCurrentNode = lastHistoryEntry?.nodeId === currentNode.id && lastHistoryEntry?.userResponse !== undefined;
  // Check if the *absolute last* history entry is a feedback message (which means we should show continue for actual next node).
  const lastEntryIsFeedback = lastHistoryEntry?.nodeId.startsWith('temp-feedback-');


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl flex flex-col" style={{height: 'calc(100vh - 200px)'}}>
      <CardHeader className="bg-primary/10">
        <CardTitle className="text-primary text-xl">{scenario.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 bg-secondary/10">
        {history.map((entry) => (
          <div key={entry.id}>
            {/* Display Node Text (Bot/Guide) */}
            <div className={`flex items-start space-x-3 mb-2 ${entry.nodeCharacter === 'user' ? 'justify-end' : ''}`}>
              {entry.nodeCharacter !== 'user' && <Bot className="h-8 w-8 text-primary bg-primary/20 p-1.5 rounded-full shrink-0 mt-1" />}
              <div className={`p-3 rounded-lg max-w-[85%] text-sm ${
                entry.nodeCharacter === 'user'
                  ? 'bg-accent text-accent-foreground self-end' 
                  : 'bg-card text-card-foreground shadow-sm'
              }`}>
                <p className="whitespace-pre-wrap">{entry.nodeText}</p>
                {entry.nodeImageUrl && (
                  <Image src={entry.nodeImageUrl} alt="Scenario image" width={200} height={150} className="mt-2 rounded-md" data-ai-hint="scenario illustration" />
                )}
              </div>
            </div>

            {/* Display User Response if exists for this history entry node */}
            {entry.userResponse && (
                 <div className="flex items-start space-x-3 justify-end mb-2 mt-2">
                    <div className="p-3 rounded-lg max-w-[85%] bg-accent text-accent-foreground self-end">
                        <p className="text-xs font-medium text-accent-foreground/80 mb-0.5">Your response:</p>
                        <p className="text-sm whitespace-pre-wrap">{Array.isArray(entry.userResponse) ? entry.userResponse.join(', ') : entry.userResponse}</p>
                    </div>
                    <User className="h-8 w-8 text-accent bg-accent/20 p-1.5 rounded-full shrink-0 mt-1" />
                 </div>
            )}
          </div>
        ))}
         <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="p-4 border-t bg-card">
        {/* Show options if current node is single choice AND user hasn't responded to THIS display of the node yet */}
        {currentNode.type === 'question_single_choice' && currentNode.options && !hasRespondedToCurrentNode && !lastEntryIsFeedback && (
          <RadioGroup
            onValueChange={(value) => {
                const selectedOption = currentNode.options?.find(opt => opt.text === value);
                if(selectedOption) handleOptionSelect(selectedOption);
            }}
            className="space-y-2 w-full"
          >
            {currentNode.options.map((option, index) => (
              <div key={option.id || option.text} className="flex items-center space-x-2">
                <RadioGroupItem value={option.text} id={`${currentNode.id}-opt-${index}`} />
                <Label htmlFor={`${currentNode.id}-opt-${index}`} className="cursor-pointer hover:text-accent">{option.text}</Label>
              </div>
            ))}
          </RadioGroup>
        )}
        
        {/* Show text input if current node is reflection prompt AND user hasn't responded to THIS display of the node yet */}
        {currentNode.type === 'reflection_prompt' && !hasRespondedToCurrentNode && !lastEntryIsFeedback && (
           <div className="w-full flex gap-2">
            <Textarea
                placeholder="Your thoughts..."
                value={currentTextResponse}
                onChange={(e) => setCurrentTextResponse(e.target.value)}
                className="flex-grow"
                rows={2}
            />
            <Button
                onClick={handleTextSubmit}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={!currentTextResponse.trim() && !(currentNode.options && currentNode.options.length > 0)}
            >
              <Send className="h-4 w-4 mr-2"/> Submit
            </Button>
           </div>
        )}

        {/* Show "Continue" for message nodes that have a nextNodeId and are not feedback nodes (or if it's feedback for the actual next node) */}
        {currentNode.type === 'message' && currentNode.nextNodeId && !currentNode.id.startsWith('temp-feedback-') && (
           <div className="w-full">
            <Button
                onClick={handleTextSubmit}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <CornerDownLeft className="h-4 w-4 mr-2"/> Continue
            </Button>
           </div>
        )}
        
        {/* If last entry was feedback AND current node has a nextNodeId, show Continue for THAT nextNodeId */}
        {lastEntryIsFeedback && currentNode.nextNodeId && (
             <Button
                onClick={() => setCurrentNodeId(currentNode.nextNodeId!)}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <CornerDownLeft className="h-4 w-4 mr-2"/> Continue
            </Button>
        )}


        {/* Show "Finish Scenario" for summary nodes */}
        {currentNode.type === 'summary' && (
          <Button onClick={() => onScenarioComplete?.(scenario.id, userResponses)} className="w-full bg-primary hover:bg-primary/80">
            Finish Scenario
          </Button>
        )}

        {/* If user HAS responded to the current node, and it's not feedback, and there's a nextNodeId, show Continue. */}
        {hasRespondedToCurrentNode && !lastEntryIsFeedback && currentNode.nextNodeId && (currentNode.type === 'question_single_choice' || currentNode.type === 'reflection_prompt') && (
             <Button
                onClick={() => setCurrentNodeId(currentNode.nextNodeId!)}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <CornerDownLeft className="h-4 w-4 mr-2"/> Continue
            </Button>
        )}
        
        {/* If user HAS responded, and it's not feedback, and there's NO nextNodeId, and it's a question/reflection, it's an implicit end. */}
        {hasRespondedToCurrentNode && !lastEntryIsFeedback && !currentNode.nextNodeId && (currentNode.type === 'question_single_choice' || currentNode.type === 'reflection_prompt') && onScenarioComplete && (
             <Button onClick={() => onScenarioComplete(scenario.id, userResponses)} className="w-full bg-primary hover:bg-primary/80">
                Finish Scenario
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}

