import { useState, useEffect, useCallback } from 'react';
import { ChallengeCard } from './components/ChallengeCard';
import { HistoryList, ChallengeHistory } from './components/HistoryList';
import { TreeGrowth } from './components/TreeGrowth';
import { Button } from './components/ui/button';
import { Alert, AlertDescription } from './components/ui/alert';
import { Smartphone, Sparkles, Info, Dices } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: number;
}

const CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Sort Desktop Recyclables',
    description: 'Check your desk and sort all recyclable items (paper, plastic bottles, etc.) into the recycling bin',
    duration: 60,
  },
  {
    id: '2',
    title: 'Photo Your Water Bottle Usage',
    description: 'Take out your water bottle, photograph and record current water consumption to remind yourself to drink more and avoid disposable cups',
    duration: 60,
  },
  {
    id: '3',
    title: 'Unplug Unnecessary Outlets',
    description: 'Check all outlets in the room and unplug unused appliances to save standby power',
    duration: 60,
  },
  {
    id: '4',
    title: 'Turn Off Unnecessary Lights',
    description: 'Walk through your space and turn off lights in unoccupied areas, use natural light during the day',
    duration: 60,
  },
  {
    id: '5',
    title: 'Count Daily Disposable Items',
    description: 'Recall and record how many disposable items you used today (utensils, cups, bags, etc.)',
    duration: 60,
  },
  {
    id: '6',
    title: 'Use Your Own Cup for Water',
    description: 'Fill your reusable cup with water now, refuse to use disposable paper cups',
    duration: 60,
  },
  {
    id: '7',
    title: 'Check for Double-Sided Paper',
    description: 'Organize desk papers and find sheets that can be used double-sided for next printing',
    duration: 60,
  },
  {
    id: '8',
    title: 'Unplug Unused Chargers',
    description: 'Check all chargers and unplug fully charged or unused device chargers',
    duration: 60,
  },
  {
    id: '9',
    title: 'Sort & Donate Unused Items',
    description: 'Quickly check around and find one item you can donate or share with others',
    duration: 60,
  },
  {
    id: '10',
    title: 'Record Your Carbon Footprint',
    description: 'Review your transportation today and record time spent walking, biking, taking transit, or driving',
    duration: 60,
  },
];

const STORAGE_KEY = 'shake-challenge-history';

export default function App() {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [history, setHistory] = useState<ChallengeHistory[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [lastShakeTime, setLastShakeTime] = useState(0);
  const [justWatered, setJustWatered] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  // Play sound effect
  const playSound = useCallback((frequency: number, duration: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
      console.error('Failed to play sound', e);
    }
  }, []);

  // Get random challenge
  const getRandomChallenge = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * CHALLENGES.length);
    return CHALLENGES[randomIndex];
  }, []);

  // Trigger a new challenge
  const triggerChallenge = useCallback(() => {
    if (currentChallenge) return;

    // Vibration feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }

    // Sound feedback
    playSound(800, 100);
    setTimeout(() => playSound(1000, 100), 150);

    // Show challenge
    const challenge = getRandomChallenge();
    setCurrentChallenge(challenge);

    toast.success('Challenge Triggered!', {
      description: challenge.title,
      duration: 2000,
    });
  }, [currentChallenge, playSound, getRandomChallenge]);

  // Handle shake detection
  const handleMotion = useCallback(
    (event: DeviceMotionEvent) => {
      if (!shakeEnabled || currentChallenge) return;

      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const { x, y, z } = acceleration;
      const totalAcceleration = Math.sqrt((x || 0) ** 2 + (y || 0) ** 2 + (z || 0) ** 2);

      const now = Date.now();
      // Detect shake: high acceleration and at least 1 second since last shake
      if (totalAcceleration > 25 && now - lastShakeTime > 1000) {
        setLastShakeTime(now);
        triggerChallenge();
      }
    },
    [shakeEnabled, currentChallenge, lastShakeTime, triggerChallenge]
  );

  // Request permission and enable shake detection
  const requestPermission = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          setShakeEnabled(true);
          toast.success('Shake enabled! Start shaking your phone');
        } else {
          toast.error('Motion sensor permission required for shake functionality');
        }
      } catch (error) {
        console.error('Permission request failed', error);
        toast.error('Permission request failed');
      }
    } else {
      // Non-iOS devices don't need permission
      setPermissionGranted(true);
      setShakeEnabled(true);
      toast.success('Shake enabled! Start shaking your phone');
    }
  };

  // Add/remove event listener
  useEffect(() => {
    if (shakeEnabled) {
      window.addEventListener('devicemotion', handleMotion);
      return () => window.removeEventListener('devicemotion', handleMotion);
    }
  }, [shakeEnabled, handleMotion]);

  // Handle challenge completion
  const handleChallengeComplete = (success: boolean) => {
    if (!currentChallenge) return;

    const historyItem: ChallengeHistory = {
      id: currentChallenge.id,
      title: currentChallenge.title,
      completed: success,
      timestamp: Date.now(),
    };

    setHistory((prev) => [...prev, historyItem]);

    if (success) {
      // Trigger watering animation
      setJustWatered(true);
      setTimeout(() => setJustWatered(false), 2000);

      // Celebration feedback
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
      playSound(600, 100);
      setTimeout(() => playSound(800, 100), 100);
      setTimeout(() => playSound(1000, 200), 200);

      toast.success('Awesome! Challenge Completed! 🎉', {
        description: 'Your tree has been watered',
        duration: 3000,
      });
    } else {
      toast.info('No worries, try again next time', {
        duration: 2000,
      });
    }

    setCurrentChallenge(null);
  };

  const handleCancel = () => {
    setCurrentChallenge(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4 pb-8">
      <Toaster />
      
      <div className="max-w-md mx-auto space-y-6 pt-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-green-600" />
            <h1 className="text-green-800">Shake-to-Challenge</h1>
          </div>
          <p className="text-muted-foreground">
            Shake your phone to start a 60-second eco challenge
          </p>
        </div>

        {/* Permission/Enable Button */}
        {!shakeEnabled && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p>Click the button below to enable shake detection, then shake your phone to trigger random eco challenges</p>
                <Button onClick={requestPermission} className="w-full bg-green-600 hover:bg-green-700">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Enable Shake
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Shake Indicator */}
        {shakeEnabled && !currentChallenge && (
          <div className="text-center p-8 bg-white rounded-lg border-2 border-dashed border-green-300 space-y-4">
            <Smartphone className="w-16 h-16 mx-auto text-green-600 animate-bounce" />
            <p className="text-green-800">Shake to trigger a challenge</p>
            <p className="text-sm text-muted-foreground">
              {history.filter((h) => h.completed).length} challenges completed
            </p>
            <div className="pt-2">
              <Button 
                onClick={triggerChallenge}
                className="bg-green-600 hover:bg-green-700"
              >
                <Dices className="w-4 h-4 mr-2" />
                Random Challenge
              </Button>
            </div>
          </div>
        )}

        {/* Current Challenge */}
        {currentChallenge && (
          <ChallengeCard
            challenge={currentChallenge}
            onComplete={handleChallengeComplete}
            onCancel={handleCancel}
          />
        )}

        {/* Tree Growth */}
        {!currentChallenge && (
          <TreeGrowth 
            completedChallenges={history.filter((h) => h.completed).length}
            justCompleted={justWatered}
          />
        )}

        {/* History */}
        {!currentChallenge && <HistoryList history={history} />}

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>💚 Every small action makes a difference</p>
        </div>
      </div>
    </div>
  );
}
