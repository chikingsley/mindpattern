import './gradient-animations.css';

interface BackgroundGradientProps {
  variant?: 'subtle' | 'landing';
}

export function BackgroundGradient({ variant = 'subtle' }: BackgroundGradientProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/60 via-white to-blue-100/60 dark:from-gray-900 dark:via-gray-900/90 dark:to-purple-900/30" />
      
      {/* Animated gradient overlays */}
      <div 
        className={`absolute inset-0 opacity-70 ${variant === 'landing' ? 'animate-wave' : 'animate-subtle'} gradient-blur`}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.1), transparent 50%)'
        }}
      />
      <div 
        className={`absolute inset-0 opacity-70 ${variant === 'landing' ? 'animate-wave' : 'animate-subtle'} gradient-blur`}
        style={{
          background: 'radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.1), transparent 50%)',
          animationDelay: '-5s'
        }}
      />
      
      {/* Top and bottom gradients */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-200/20 to-transparent dark:from-purple-800/20" />
      <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-blue-200/20 to-transparent dark:from-blue-800/20" />
    </div>
  );
}
