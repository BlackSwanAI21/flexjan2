import React from 'react';

export type ModerationLevel = 'light' | 'medium' | 'compliant';

interface ModerationLevelSelectProps {
  value: ModerationLevel;
  onChange: (value: ModerationLevel) => void;
}

export function ModerationLevelSelect({ value, onChange }: ModerationLevelSelectProps) {
  const levels = [
    { 
      value: 'light', 
      topLabel: 'Light',
      bottomLabel: 'Moderation'
    },
    { 
      value: 'medium', 
      topLabel: 'Medium',
      bottomLabel: 'Moderation',
      subLabel: '(Recommended)'
    },
    { 
      value: 'compliant', 
      topLabel: 'Compliance',
      bottomLabel: 'Moderation'
    }
  ] as const;

  const selectedIndex = levels.findIndex(level => level.value === value);

  return (
    <div className="ml-7 mt-3 mb-4">
      <div className="relative pt-8 pb-16">
        {/* Track background */}
        <div className="absolute h-1 w-full bg-gray-200 rounded-full" />
        
        {/* Active track */}
        <div 
          className="absolute h-1 bg-indigo-600 rounded-full transition-all duration-200"
          style={{ 
            width: `${(selectedIndex / (levels.length - 1)) * 100}%`
          }}
        />

        {/* Slider points */}
        <div className="relative flex justify-between px-2">
          {levels.map((level, index) => (
            <button
              key={level.value}
              onClick={(e) => {
                e.preventDefault();
                onChange(level.value);
              }}
              type="button"
              className="relative group focus:outline-none"
            >
              {/* Point */}
              <div 
                className={`
                  h-5 w-5 -mt-2 rounded-full border-2 transition-all duration-200
                  ${value === level.value 
                    ? 'border-indigo-600 bg-white scale-125 shadow-md' 
                    : 'border-gray-300 bg-white hover:border-indigo-400'
                  }
                `}
              />
              
              {/* Labels */}
              <div className="absolute mt-4 -ml-10 w-20 text-center">
                <div className={`text-sm leading-tight ${
                  value === level.value ? 'text-indigo-600 font-medium' : 'text-gray-600'
                }`}>
                  <div>{level.topLabel}</div>
                  <div>{level.bottomLabel}</div>
                </div>
                {'subLabel' in level && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {level.subLabel}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 