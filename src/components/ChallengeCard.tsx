import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { CheckCircle2, XCircle, Timer } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
}

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

export function ChallengeCard({
  challenge,
  onComplete,
  onCancel,
}: ChallengeCardProps) {
  const [timeLeft, setTimeLeft] = useState(challenge.duration);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const progress =
    ((challenge.duration - timeLeft) / challenge.duration) *
    100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleComplete = () => {
    setIsActive(false);
    // Vibration feedback
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    onComplete(true);
  };

  const handleSkip = () => {
    setIsActive(false);
    onComplete(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="default" className="bg-green-600">
            Eco Challenge
          </Badge>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer className="w-4 h-4" />
            <span>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>
        </div>
        <CardTitle className="mt-4">
          {challenge.title}
        </CardTitle>
        <CardDescription>
          {challenge.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="h-2" />
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button
          onClick={handleComplete}
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={!isActive}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Complete
        </Button>
        <Button
          onClick={handleSkip}
          variant="outline"
          className="flex-1"
          disabled={!isActive}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Skip
        </Button>
      </CardFooter>
    </Card>
  );
}