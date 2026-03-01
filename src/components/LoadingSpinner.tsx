interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  message = 'Cargando...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-[#F8FAFC]'
    : 'flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-[#E30613] mx-auto ${message ? 'mb-4' : ''}`}></div>
        {message && (
          <p className={`text-[#94A3B8] ${textSizeClasses[size]}`}>{message}</p>
        )}
      </div>
    </div>
  );
}
