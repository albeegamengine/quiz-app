import { Progress } from "@/components/ui/progress";

interface QuestionProgressProps {
  current: number;
  total: number;
}

/**
 * クイズの進捗を表示するコンポーネント
 * 現在の質問番号と総質問数、進捗バーを表示する
 */
export function QuestionProgress({ current, total }: QuestionProgressProps) {
  // 進捗率を計算（0-100の範囲）
  const progressPercentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full space-y-2">
      {/* 質問番号表示 */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>質問 {current} / {total}</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      
      {/* 進捗バー */}
      <Progress 
        value={progressPercentage} 
        className="w-full h-2"
        aria-label={`質問 ${current} / ${total}の進捗`}
      />
    </div>
  );
}