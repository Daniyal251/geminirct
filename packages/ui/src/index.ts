/**
 * UI Components — Библиотека компонентов
 */

// Button component
export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: any) {
  const baseStyles = 'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors'
  const variants = {
    primary: 'bg-accent text-bg hover:bg-white',
    secondary: 'bg-bg3 text-text border border-border hover:border-accent',
    danger: 'bg-red-glow text-red hover:bg-red/25'
  }
  
  return (
    <button className={`${baseStyles} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// Card component
export function Card({ children, className = '', ...props }: any) {
  return (
    <div className={`bg-bg2 border border-border rounded-xl overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  )
}

// Input component
export function Input({ className = '', ...props }: any) {
  return (
    <input 
      className={`w-full px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:border-accent ${className}`} 
      {...props} 
    />
  )
}

// Textarea component
export function Textarea({ className = '', ...props }: any) {
  return (
    <textarea 
      className={`w-full px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:border-accent ${className}`} 
      {...props} 
    />
  )
}

// Select component
export function Select({ children, className = '', ...props }: any) {
  return (
    <select 
      className={`w-full px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:border-accent ${className}`} 
      {...props} 
    >
      {children}
    </select>
  )
}

// Badge component
export function Badge({ children, variant = 'default', className = '' }: any) {
  const variants = {
    default: 'bg-bg3 text-text3',
    success: 'bg-green-glow text-green',
    warning: 'bg-orange-glow text-orange',
    error: 'bg-red-glow text-red'
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </span>
  )
}
