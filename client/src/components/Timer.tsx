import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Timer as TimerIcon } from 'lucide-react';
import { startTimer, pauseTimer, stopTimer } from '../api';
import { IProject } from '../types';
import { useDialog } from './DialogProvider';

interface Props {
  project: IProject;
  onUpdate: (project: IProject) => void;
}

function getLiveSeconds(p: IProject): number {
  let total = p.timer.totalSeconds;
  if (p.timer.isRunning && p.timer.lastStarted) {
    total += Math.floor((Date.now() - new Date(p.timer.lastStarted).getTime()) / 1000);
  }
  return total;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function Timer({ project, onUpdate }: Props) {
  const { confirm } = useDialog();
  const [seconds, setSeconds] = useState(() => getLiveSeconds(project));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSeconds(getLiveSeconds(project));
    if (!project.timer.isRunning) return;
    const interval = setInterval(() => setSeconds(getLiveSeconds(project)), 1000);
    return () => clearInterval(interval);
  }, [project]);

  const handle = useCallback(async (action: 'start' | 'pause' | 'stop') => {
    setLoading(true);
    try {
      let updated: IProject;
      if (action === 'start')      updated = await startTimer(project._id);
      else if (action === 'pause') updated = await pauseTimer(project._id);
      else                         updated = await stopTimer(project._id);
      onUpdate(updated);
    } finally { setLoading(false); }
  }, [project._id, onUpdate]);

  const days    = Math.floor(seconds / 86400);
  const hours   = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs    = seconds % 60;

  const isRunning = project.timer.isRunning;

  return (
    <div className="card-p space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="section-title">
          <TimerIcon className="w-4 h-4 text-brand-500" />
          Time Tracker
        </div>
        {isRunning && (
          <span className="badge badge-green">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Running
          </span>
        )}
      </div>

      {/* Digit display */}
      <div className="flex items-end justify-center gap-2">
        {days > 0 && (
          <>
            <Digit value={days} label="Days" running={isRunning} />
            <Colon />
          </>
        )}
        <Digit value={hours} label="Hours" running={isRunning} />
        <Colon />
        <Digit value={minutes} label="Min" running={isRunning} />
        <Colon />
        <Digit value={secs} label="Sec" running={isRunning} dim />
      </div>

      {/* Controls */}
      <div className="flex gap-2.5">
        {!isRunning ? (
          <button
            onClick={() => handle('start')}
            disabled={loading}
            className="btn-primary flex-1 gap-2"
          >
            <Play className="w-4 h-4" />
            {seconds > 0 ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button
            onClick={() => handle('pause')}
            disabled={loading}
            className="btn-secondary flex-1 gap-2"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}
        <button
          onClick={async () => {
            const ok = await confirm({
              title: 'Reset Timer',
              message: 'Stop and reset the timer? All tracked time will be lost.',
              confirmLabel: 'Reset',
              variant: 'danger',
            });
            if (ok) handle('stop');
          }}
          disabled={loading || seconds === 0}
          className="btn-danger px-4 gap-2"
          title="Stop & Reset"
        >
          <Square className="w-4 h-4" />
          <span className="hidden sm:block">Reset</span>
        </button>
      </div>
    </div>
  );
}

function Digit({ value, label, running, dim }: { value: number; label: string; running: boolean; dim?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${dim ? 'opacity-60' : ''}`}>
      <div className={`
        relative overflow-hidden rounded-2xl px-4 py-3 min-w-[72px] text-center
        bg-surface-2 border border-stroke
        ${running ? 'border-brand-500/30 bg-brand-500/5' : ''}
        transition-all duration-300
      `}>
        <span className={`text-4xl font-mono font-bold tabular-nums tracking-tight ${running ? 'text-ink' : 'text-ink'}`}>
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-ink-3 mt-1.5 font-medium">{label}</span>
    </div>
  );
}

function Colon() {
  return <span className="text-3xl font-mono text-ink-3 pb-6 select-none">:</span>;
}
