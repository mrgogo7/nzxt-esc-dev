// TEMP DEBUG OVERLAY — REMOVE AFTER METRIC PIPELINE IS IMPLEMENTED
// TEMP debug overlay for NZXT monitoring data on Kraken LCD

import { useEffect, useState } from 'react';
import { getLatestMonitoringData, getLcdAttributes } from '../../../platform/nzxtApi';

interface OverlaySnapshot {
  hasData: boolean;
  textLines: string[];
}

const ENABLE_DEBUG_MONITORING_OVERLAY = true;

export function DebugMonitoringOverlay(): JSX.Element | null {
  const [snapshot, setSnapshot] = useState<OverlaySnapshot>({
    hasData: false,
    textLines: ['Waiting for NZXT monitoring data...'],
  });

  useEffect(() => {
    let active = true;

    const update = () => {
      if (!active) return;

      const raw = getLatestMonitoringData() as any;
      const lcd = getLcdAttributes({
        width: 640,
        height: 640,
        shape: 'circle',
      });

      if (!raw) {
        setSnapshot({
          hasData: false,
          textLines: ['Waiting for NZXT monitoring data...'],
        });
        return;
      }

      const cpu = Array.isArray(raw?.cpus) && raw.cpus.length > 0 ? raw.cpus[0] : undefined;
      const gpu = Array.isArray(raw?.gpus) && raw.gpus.length > 0 ? raw.gpus[0] : undefined;
      const ram = raw?.ram;
      const kraken = raw?.kraken;

      const cpuTemp =
        cpu && typeof cpu.temperature === 'number' ? `${cpu.temperature.toFixed(1)}°C` : 'n/a';
      const cpuLoad =
        cpu && typeof cpu.load === 'number'
          ? `${(cpu.load * 100).toFixed(1)}%`
          : 'n/a';

      const gpuTemp =
        gpu && typeof gpu.temperature === 'number' ? `${gpu.temperature.toFixed(1)}°C` : 'n/a';
      const gpuLoad =
        gpu && typeof gpu.load === 'number'
          ? `${(gpu.load * 100).toFixed(1)}%`
          : 'n/a';

      const liquidTemp =
        kraken && typeof kraken.liquidTemperature === 'number'
          ? `${kraken.liquidTemperature.toFixed(1)}°C`
          : 'n/a';

      const ramUsed =
        ram && typeof ram.inUse === 'number' ? `${ram.inUse} MB` : 'n/a';
      const ramTotal =
        ram && typeof ram.totalSize === 'number' ? `${ram.totalSize} MB` : 'n/a';

      const lcdRes = `${lcd.width}x${lcd.height}`;
      const lcdFps =
        typeof lcd.targetFps === 'number' ? `${lcd.targetFps} FPS` : 'n/a';

      const lines: string[] = [
        `CPU TEMP: ${cpuTemp}`,
        `CPU LOAD: ${cpuLoad}`,
        `GPU TEMP: ${gpuTemp}`,
        `GPU LOAD: ${gpuLoad}`,
        `LIQUID TEMP: ${liquidTemp}`,
        `RAM: ${ramUsed} / ${ramTotal}`,
        `LCD: ${lcdRes} @ ${lcdFps}`,
      ];

      setSnapshot({
        hasData: true,
        textLines: lines,
      });
    };

    update();
    const id = window.setInterval(update, 500);

    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  if (!ENABLE_DEBUG_MONITORING_OVERLAY) {
    return null;
  }

  return (
    <div className="kraken-debug-monitoring">
      {snapshot.textLines.join('\n')}
    </div>
  );
}


