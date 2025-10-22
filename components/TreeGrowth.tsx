import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Droplet, Sprout, TreeDeciduous, Trees, Apple } from 'lucide-react';
import { motion } from 'motion/react';

interface TreeGrowthProps {
  completedChallenges: number;
  justCompleted?: boolean;
}

interface GrowthStage {
  name: string;
  icon: React.ReactNode;
  minChallenges: number;
  maxChallenges: number;
  description: string;
  color: string;
}

const GROWTH_STAGES: GrowthStage[] = [
  {
    name: 'Seed',
    icon: <div className="text-6xl">🌰</div>,
    minChallenges: 0,
    maxChallenges: 2,
    description: 'Just planted an eco seed',
    color: 'text-amber-700',
  },
  {
    name: 'Seedling',
    icon: <Sprout className="w-16 h-16 text-green-500" />,
    minChallenges: 3,
    maxChallenges: 5,
    description: 'Growing strong',
    color: 'text-green-500',
  },
  {
    name: 'Young Tree',
    icon: <TreeDeciduous className="w-20 h-20 text-green-600" />,
    minChallenges: 6,
    maxChallenges: 9,
    description: 'Growing into a tree',
    color: 'text-green-600',
  },
  {
    name: 'Mature Tree',
    icon: <Trees className="w-24 h-24 text-green-700" />,
    minChallenges: 10,
    maxChallenges: 14,
    description: 'Thriving and strong',
    color: 'text-green-700',
  },
  {
    name: 'Fruit Tree',
    icon: (
      <div className="relative">
        <Trees className="w-24 h-24 text-green-700" />
        <Apple className="w-8 h-8 text-red-500 absolute top-2 right-2" />
        <Apple className="w-6 h-6 text-red-500 absolute bottom-4 left-4" />
      </div>
    ),
    minChallenges: 15,
    maxChallenges: Infinity,
    description: 'Eco champion!',
    color: 'text-green-800',
  },
];

export function TreeGrowth({ completedChallenges, justCompleted = false }: TreeGrowthProps) {
  const [showWater, setShowWater] = useState(false);

  const currentStage = GROWTH_STAGES.find(
    (stage) => completedChallenges >= stage.minChallenges && completedChallenges <= stage.maxChallenges
  ) || GROWTH_STAGES[0];

  const currentStageIndex = GROWTH_STAGES.indexOf(currentStage);
  const nextStage = GROWTH_STAGES[currentStageIndex + 1];
  
  const challengesUntilNextStage = nextStage 
    ? nextStage.minChallenges - completedChallenges 
    : 0;

  useEffect(() => {
    if (justCompleted) {
      setShowWater(true);
      const timer = setTimeout(() => setShowWater(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [justCompleted]);

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Eco Tree</CardTitle>
          <Badge variant="secondary" className={currentStage.color}>
            {currentStage.name}
          </Badge>
        </div>
        <CardDescription>{currentStage.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative flex flex-col items-center">
          {/* Tree Icon with Animation */}
          <motion.div
            className="relative"
            animate={justCompleted ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {currentStage.icon}
            
            {/* Watering Animation */}
            {showWater && (
              <motion.div
                className="absolute -top-8 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: [0, 1, 1, 0], y: [0, 10, 20, 30] }}
                transition={{ duration: 2 }}
              >
                <Droplet className="w-8 h-8 text-blue-400 fill-blue-400" />
              </motion.div>
            )}
          </motion.div>

          {/* Progress Info */}
          <div className="mt-6 text-center space-y-2 w-full">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Droplet className="w-4 h-4 text-blue-500" />
              <span>Watered {completedChallenges} times</span>
            </div>
            
            {nextStage && (
              <div className="space-y-2">
                <div className="w-full bg-green-100 rounded-full h-2">
                  <motion.div
                    className="bg-green-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${((completedChallenges - currentStage.minChallenges) / (nextStage.minChallenges - currentStage.minChallenges)) * 100}%` 
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {challengesUntilNextStage} more to reach {nextStage.name}
                </p>
              </div>
            )}

            {!nextStage && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                <span className="text-2xl">🎉</span>
                <span>Max level reached!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
