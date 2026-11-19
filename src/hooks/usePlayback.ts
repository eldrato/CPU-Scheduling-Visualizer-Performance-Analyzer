import { useState, useEffect, useRef, useCallback } from 'react';
import { AlgorithmResult, TimelineSegment, StepLog } from '../algorithms/types';
import { Process } from '../types/process';

interface UsePlaybackProps {
  algorithmResult: AlgorithmResult | null;
  processes: Process[];
}

export function usePlayback({ algorithmResult, processes }: UsePlaybackProps) {
  const makespan = algorithmResult?.aggregateMetrics.makespan ?? 0;

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // 1x = 1000ms per time unit

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset playback if algorithmResult changes
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [algorithmResult]);

  // Step forward
  const stepForward = useCallback(() => {
    setCurrentTime((prev) => Math.min(makespan, prev + 1));
  }, [makespan]);

  // Step back
  const stepBack = useCallback(() => {
    setCurrentTime((prev) => Math.max(0, prev - 1));
  }, []);

  // Reset to time 0
  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  // Seek directly to time t
  const seekTo = useCallback(
    (time: number) => {
      setCurrentTime(Math.min(makespan, Math.max(0, time)));
    },
    [makespan]
  );

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (currentTime >= makespan && !isPlaying) {
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentTime, makespan, isPlaying]);

  // Timer loop for animated playback
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(100, Math.floor(1000 / speed));
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= makespan) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return makespan;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, makespan]);

  // Compute live state at currentTime
  const timeline = algorithmResult?.timeline ?? [];

  // Find currently active segment at currentTime
  // At time t, the active slice is segment where start <= t < end (or start === end === t at 0)
  const currentSegment: TimelineSegment | undefined = timeline.find((seg) => {
    if (currentTime === makespan && makespan > 0) {
      return seg.end === makespan;
    }
    return currentTime >= seg.start && currentTime < seg.end;
  });

  const activePid = currentSegment
    ? currentSegment.isIdle
      ? 'IDLE'
      : currentSegment.pid
    : null;

  // Compute remaining burst for each process at currentTime
  const remainingBursts: Record<string, number> = {};
  for (const p of processes) {
    let executedUnits = 0;
    for (const seg of timeline) {
      if (seg.pid === p.pid && !seg.isIdle) {
        if (currentTime >= seg.end) {
          executedUnits += seg.end - seg.start;
        } else if (currentTime > seg.start) {
          executedUnits += currentTime - seg.start;
        }
      }
    }
    remainingBursts[p.pid] = Math.max(0, p.burstTime - executedUnits);
  }

  // Find nearest step log at or before currentTime
  const stepLogs = algorithmResult?.stepLogs ?? [];
  const currentStepLog: StepLog | undefined = [...stepLogs]
    .reverse()
    .find((l) => l.time <= currentTime);

  // Compute ready queue at currentTime
  // Ready queue: processes that have arrived (AT <= currentTime) and have remainingBurst > 0 and are NOT the currently active process
  const readyQueue: string[] = processes
    .filter(
      (p) =>
        p.arrivalTime <= currentTime &&
        remainingBursts[p.pid] > 0 &&
        p.pid !== activePid
    )
    .sort((a, b) => a.arrivalTime - b.arrivalTime)
    .map((p) => p.pid);

  return {
    currentTime,
    makespan,
    isPlaying,
    speed,
    activePid,
    currentSegment,
    remainingBursts,
    readyQueue,
    currentStepLog,
    togglePlay,
    stepForward,
    stepBack,
    reset,
    seekTo,
    setSpeed,
  };
}
