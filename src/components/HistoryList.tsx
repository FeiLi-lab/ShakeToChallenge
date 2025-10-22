import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';

export interface ChallengeHistory {
  id: string;
  title: string;
  completed: boolean;
  timestamp: number;
}

interface HistoryListProps {
  history: ChallengeHistory[];
}

export function HistoryList({ history }: HistoryListProps) {
  const completedCount = history.filter((h) => h.completed).length;
  const totalCount = history.length;

  if (history.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Challenge History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No challenges yet. Shake to start your first challenge!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Challenge History
          </span>
          <Badge variant="secondary">
            {completedCount}/{totalCount} Completed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {history
              .slice()
              .reverse()
              .map((item) => (
                <div
                  key={`${item.id}-${item.timestamp}`}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={item.completed ? 'text-foreground' : 'text-muted-foreground line-through'}>
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
