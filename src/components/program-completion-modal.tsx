
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProgramCompletionModalProps {
  isOpen: boolean;
  onClose: (satisfactionScore?: number) => void; // Updated to pass score
  programTitle: string;
}

export function ProgramCompletionModal({ isOpen, onClose, programTitle }: ProgramCompletionModalProps) {
  const [showStamp, setShowStamp] = useState(false);
  const [satisfactionScore, setSatisfactionScore] = useState<number | undefined>(undefined);
  const [hoverScore, setHoverScore] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShowStamp(true);
      }, 300);
      // Reset score when modal opens for a new completion
      setSatisfactionScore(undefined);
      setHoverScore(undefined);
      return () => clearTimeout(timer);
    } else {
      setShowStamp(false);
    }
  }, [isOpen]);

  const handleRating = (score: number) => {
    setSatisfactionScore(score);
  };

  const handleSubmit = () => {
    onClose(satisfactionScore);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(satisfactionScore); }}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="items-center">
          <Award className="h-16 w-16 text-accent mb-4" />
          <DialogTitle className="text-2xl font-bold text-primary">Congratulations!</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            You have successfully completed the program:
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-6 p-6 bg-secondary/20 rounded-lg border border-primary/30 relative overflow-hidden">
          <h2 className="text-xl font-semibold text-primary mb-2">Certificate of Completion</h2>
          <p className="text-foreground">This certifies that you have completed all requirements for the</p>
          <p className="text-lg font-medium text-accent my-1">"{programTitle}"</p>
          <p className="text-foreground">program on {new Date().toLocaleDateString()}.</p>

          {showStamp && (
            <div className="stamp-animation absolute bottom-4 right-4 md:bottom-6 md:right-6">
              <div className="stamp-visual bg-green-600 text-white font-bold rounded-full w-24 h-24 md:w-28 md:h-28 flex items-center justify-center transform -rotate-12 shadow-lg">
                <div className="border-2 border-dashed border-white rounded-full w-[90%] h-[90%] flex flex-col items-center justify-center">
                  <CheckCircle size={24} className="mb-1"/>
                  <span className="text-xs">COMPLETED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="my-6 space-y-3">
            <p className="text-sm font-medium text-foreground">How satisfied are you with this program?</p>
            <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setHoverScore(star)}
                        onMouseLeave={() => setHoverScore(undefined)}
                        aria-label={`Rate ${star} out of 5 stars`}
                        className="focus:outline-none"
                    >
                        <Star
                            className={cn(
                                "h-8 w-8 cursor-pointer transition-colors",
                                (hoverScore ?? satisfactionScore ?? 0) >= star
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-muted-foreground/50"
                            )}
                        />
                    </button>
                ))}
            </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={satisfactionScore === undefined}>
            Submit Rating & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
