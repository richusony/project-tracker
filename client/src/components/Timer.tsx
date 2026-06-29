import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Timer as TimerIcon } from 'lucide-react';
import { startTimer, pauseTimer, stopTimer } from '../api';
import { IProject } from '../types';
import { useDialog } from './DialogProvider';

interface Props {
  project: IProject;
  onUpdate: (project: IProject) => void;
}

function getLiveSeconds(project: IProject): number {
  let total = project.timer.totalSeconds;
  if (project.timer.isRunning && project.timer.lastStarted) {
    total += Math.floor((Date.now() - new Date(project.timer.lastStarted).getTime()) / 1000);
  }
  return total;
}

function formatTime(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export default function Timer({ project, onUpdate }: Props) {
  const [seconds, setSeconds] = useState(() => getLiveSeconds(project));
  const [loading, setLoading] = useState(false);
  const { confirm } = useDialog();

  useEffect(() => {
    setSeconds(getLiveSeconds(project));
    if (!project.timer.isRunning) return;
    const interval = setInterval(() => setSeconds(getLiveSeconds(project)), 1000);
    return () => clearInterval(interval);
  }, [project]);

  const handle = useCallback(
    async (action: 'start' | 'pause' | 'stop') => {
      setLoading(true);
      try {
        let updated: IProject;
        if (action === 'start') updated = await startTimer(project._id);
        else if (action === 'pause') updated = await pauseTimer(project._id);
        else updated = await stopTimer(project._id);
        onUpdate(updated);
      } finally {
        setLoading(false);
      }
    },
    [project._id, onUpdate]
  );

  const { days, hours, minutes, seconds: secs } = formatTime(seconds);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <TimerIcon className="w-5 h-5 text-brand-500" />
        <h3 className="font-semibold text-white">Time Tracker</h3>
        {project.timer.isRunning && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Running
          </span>
        )}
      </div>

      <div className="flex gap-3 mb-5 justify-center">
        {[
          { label: 'Days', value: days },
          { label: 'Hours', value: hours },
          { label: 'Min', value: minutes },
          { label: 'Sec', value: secs },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center bg-slate-800 rounded-xl px-4 py-3 min-w-[64px]">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-500 mt-1">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {!project.timer.isRunning ? (
          <button onClick={() => handle('start')} disabled={loading} className="btn-primary flex items-center gap-2 flex-1 justify-center">
            <Play className="w-4 h-4" />
            {seconds > 0 ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button onClick={() => handle('pause')} disabled={loading} className="btn-secondary flex items-center gap-2 flex-1 justify-center">
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}
        <button
          onClick={async () => {
            const ok = await confirm({ title: 'Reset Timer', message: 'Stop and reset the timer? This cannot be undone.', confirmLabel: 'Reset', variant: 'danger' });
            if (ok) handle('stop');
          }}
          disabled={loading || seconds === 0}
          className="btn-danger flex items-center gap-2 px-3"
          title="Stop & Reset"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
