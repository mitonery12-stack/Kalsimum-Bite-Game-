import React, { useEffect, useRef, useState } from 'react';
import { soundEngine } from '../utils/sound';

interface SpinWheelProps {
  segmentCount: number;
  rotation: number;
  isSpinning: boolean;
  clapperTick: number;
  winningIndex: number | null;
}

// Alternating warm cocoa, cream, beige, and caramel slice palette
const SLICE_PALETTE = [
  { bg: '#FFF9F0', text: '#3B2314' }, // Warm Cream
  { bg: '#C68642', text: '#FFFFFF' }, // Rich Caramel
  { bg: '#EAD7BE', text: '#3B2314' }, // Soft Beige
  { bg: '#8C5832', text: '#FFFFFF' }, // Light Chocolate
  { bg: '#D9A05B', text: '#3B2314' }, // Golden Biscuit
];

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function createWedgePath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M',
    cx,
    cy,
    'L',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'Z',
  ].join(' ');
}

export function getWinningIndexFromRotation(rotation: number, segmentCount: number): number {
  const sliceAngle = 360 / segmentCount;
  // Pointer is fixed at 12 o'clock (0 deg).
  // Rotating the wheel clockwise by `rotation` puts original wheel angle `(-rotation) mod 360` at 12 o'clock.
  const pointerAngleOnWheel = ((-rotation % 360) + 360) % 360;
  return Math.floor(pointerAngleOnWheel / sliceAngle) % segmentCount;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  segmentCount,
  rotation,
  isSpinning,
  clapperTick,
  winningIndex,
}) => {
  const [clapperTilt, setClapperTilt] = useState(0);
  const tiltTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (clapperTick === 0) return;
    setClapperTilt(-20);
    if (tiltTimerRef.current) {
      window.clearTimeout(tiltTimerRef.current);
    }
    tiltTimerRef.current = window.setTimeout(() => {
      setClapperTilt(0);
    }, 75);

    return () => {
      if (tiltTimerRef.current) window.clearTimeout(tiltTimerRef.current);
    };
  }, [clapperTick]);

  const size = 440;
  const cx = size / 2;
  const cy = size / 2;
  const outerRimRadius = 206;
  const wheelRadius = 186;
  const pegRadius = 195;
  const sliceAngle = 360 / segmentCount;
  const textRadius = segmentCount > 12 ? 136 : 130;

  // Scalloped biscuit edge bumps around outer rim
  const scallopCount = 24;
  const scallops = Array.from({ length: scallopCount }, (_, i) => {
    const angle = (i * 360) / scallopCount;
    return polarToCartesian(cx, cy, outerRimRadius - 2, angle);
  });

  // Ensure last slice never has same color as first slice if divisible
  const getSliceColors = (idx: number) => {
    const paletteIndex = idx % SLICE_PALETTE.length;
    if (idx === segmentCount - 1 && paletteIndex === 0) {
      return SLICE_PALETTE[2];
    }
    return SLICE_PALETTE[paletteIndex];
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-[430px] mx-auto">
      {/* Top Pointer Clapper */}
      <div
        className="relative z-20 -mb-6 flex flex-col items-center pointer-events-none"
        style={{
          transform: `rotate(${clapperTilt}deg)`,
          transformOrigin: '50% 10px',
          transition: 'transform 85ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <svg width="46" height="54" viewBox="0 0 46 54" fill="none" aria-hidden="true">
          <circle cx="23" cy="13" r="10" fill="#4A2816" stroke="#FFFDF9" strokeWidth="2.5" />
          <path
            d="M11 16L23 50L35 16H11Z"
            fill="#C68642"
            stroke="#3B2314"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="23" cy="13" r="4" fill="#FDF8F2" />
        </svg>
      </div>

      {/* Main Circular Wheel */}
      <div className="relative w-full aspect-square drop-shadow-[0_14px_28px_rgba(59,35,20,0.16)]">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full overflow-visible"
          role="img"
          aria-label={`Roda putar berisi nomor 1 sampai ${segmentCount}`}
        >
          {/* Rotating Wheel Group */}
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
            }}
          >
            {/* Scalloped Biscuit Outer Crust */}
            {scallops.map((pos, idx) => (
              <circle
                key={`scallop-${idx}`}
                cx={pos.x}
                cy={pos.y}
                r={16}
                fill="#5A331C"
                stroke="#3B2314"
                strokeWidth="2"
              />
            ))}

            {/* Outer Chocolate Bezel */}
            <circle
              cx={cx}
              cy={cy}
              r={outerRimRadius - 4}
              fill="#4A2816"
              stroke="#3B2314"
              strokeWidth="3"
            />
            <circle
              cx={cx}
              cy={cy}
              r={wheelRadius + 4}
              fill="#6B3E26"
              stroke="#C68642"
              strokeWidth="2"
            />

            {/* Numbered Wedges (1 to N) */}
            {Array.from({ length: segmentCount }, (_, idx) => {
              const startAngle = idx * sliceAngle;
              const endAngle = (idx + 1) * sliceAngle;
              const midAngle = startAngle + sliceAngle / 2;
              const colors = getSliceColors(idx);
              const isWinner = !isSpinning && winningIndex === idx;
              const labelPos = polarToCartesian(cx, cy, textRadius, midAngle);

              return (
                <g key={`slice-${idx}`}>
                  <path
                    d={createWedgePath(cx, cy, wheelRadius, startAngle, endAngle)}
                    fill={colors.bg}
                    stroke="#4A2816"
                    strokeWidth={isWinner ? '3.5' : '2'}
                  />
                  {isWinner && (
                    <path
                      d={createWedgePath(cx, cy, wheelRadius - 3, startAngle, endAngle)}
                      fill="rgba(255, 215, 130, 0.25)"
                      stroke="#F59E0B"
                      strokeWidth="3"
                    />
                  )}
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill={colors.text}
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: segmentCount > 12 ? '20px' : '26px',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {idx + 1}
                  </text>
                </g>
              );
            })}

            {/* Caramel Peg Studs on Segment Dividers */}
            {Array.from({ length: segmentCount }, (_, idx) => {
              const pegPos = polarToCartesian(cx, cy, pegRadius, idx * sliceAngle);
              return (
                <g key={`peg-${idx}`}>
                  <circle
                    cx={pegPos.x}
                    cy={pegPos.y}
                    r="5.5"
                    fill="#F5D399"
                    stroke="#3B2314"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}

            {/* Center Butter Cookie Hub */}
            <circle cx={cx} cy={cy} r="42" fill="#D4924A" stroke="#4A2816" strokeWidth="4" />
            <circle
              cx={cx}
              cy={cy}
              r="34"
              fill="#E8B26E"
              stroke="#B06A2B"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            {/* Chocolate Chips on Center Cookie */}
            <circle cx={cx - 12} cy={cy - 10} r="3.6" fill="#4A2816" />
            <circle cx={cx + 13} cy={cy - 8} r="3.2" fill="#4A2816" />
            <circle cx={cx - 10} cy={cy + 13} r="3.4" fill="#4A2816" />
            <circle cx={cx + 10} cy={cy + 12} r="3.8" fill="#4A2816" />
            <circle cx={cx} cy={cy} r="4.2" fill="#3B2314" />
          </g>
        </svg>
      </div>
    </div>
  );
};

// Re-export unlock helper convenience if needed
export { soundEngine };
