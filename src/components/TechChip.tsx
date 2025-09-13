import React from 'react';

export type TechName = 
  | 'go' | 'golang'
  | 'django' | 'python'
  | 'mongodb' | 'mongo'
  | 'nextjs' | 'next'
  | 'react'
  | 'svelte' | 'sveltekit'
  | 'typescript' | 'ts'
  | 'javascript' | 'js'
  | 'tailwind' | 'tailwindcss'
  | 'node' | 'nodejs'
  | 'bun'
  | 'postgres' | 'postgresql'
  | 'redis'
  | 'docker'
  | 'aws'
  | 'vercel'
  | 'fastapi'
  | 'rails' | 'ruby'
  | 'vue' | 'vuejs'
  | 'angular'
  | 'flutter'
  | 'dart'
  | 'rust'
  | 'kubernetes' | 'k8s'
  | 'git'
  | 'github'
  | 'gitlab'
  | 'mysql'
  | 'firebase'
  | 'supabase'
  | 'stripe'
  | 'openai'
  | 'anthropic';

export interface TechChipProps {
  tech: TechName;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const techColorMap: Record<TechName, string> = {
  // Go - Cyan/Turquoise (Go brand color)
  'go': 'bg-cyan-400 text-cyan-900 border-cyan-500',
  'golang': 'bg-cyan-400 text-cyan-900 border-cyan-500',
  
  // Django/Python - Deep Green
  'django': 'bg-green-700 text-white border-green-800',
  'python': 'bg-blue-500 text-white border-blue-600',
  
  // MongoDB - Light/Medium Green
  'mongodb': 'bg-green-500 text-white border-green-600',
  'mongo': 'bg-green-500 text-white border-green-600',
  
  // Next.js - Black/White (monochrome brand)
  'nextjs': 'bg-black text-white border-gray-700',
  'next': 'bg-black text-white border-gray-700',
  
  // React - Light Blue
  'react': 'bg-blue-400 text-blue-900 border-blue-500',
  
  // Svelte/SvelteKit - Orange/Red
  'svelte': 'bg-orange-500 text-white border-orange-600',
  'sveltekit': 'bg-orange-500 text-white border-orange-600',
  
  // TypeScript - Blue
  'typescript': 'bg-blue-600 text-white border-blue-700',
  'ts': 'bg-blue-600 text-white border-blue-700',
  
  // JavaScript - Yellow
  'javascript': 'bg-yellow-400 text-yellow-900 border-yellow-500',
  'js': 'bg-yellow-400 text-yellow-900 border-yellow-500',
  
  // Tailwind CSS - Teal/Cyan
  'tailwind': 'bg-teal-500 text-white border-teal-600',
  'tailwindcss': 'bg-teal-500 text-white border-teal-600',
  
  // Node.js - Green
  'node': 'bg-green-600 text-white border-green-700',
  'nodejs': 'bg-green-600 text-white border-green-700',
  
  // Bun - Peach/Beige (Bun brand color)
  'bun': 'bg-orange-200 text-orange-900 border-orange-300',
  
  // PostgreSQL - Blue
  'postgres': 'bg-blue-700 text-white border-blue-800',
  'postgresql': 'bg-blue-700 text-white border-blue-800',
  
  // Redis - Red
  'redis': 'bg-red-600 text-white border-red-700',
  
  // Docker - Blue
  'docker': 'bg-blue-500 text-white border-blue-600',
  
  // AWS - Orange/Yellow
  'aws': 'bg-orange-400 text-orange-900 border-orange-500',
  
  // Vercel - Black/White
  'vercel': 'bg-black text-white border-gray-700',
  
  // FastAPI - Teal/Green
  'fastapi': 'bg-teal-600 text-white border-teal-700',
  
  // Rails/Ruby - Red
  'rails': 'bg-red-700 text-white border-red-800',
  'ruby': 'bg-red-600 text-white border-red-700',
  
  // Vue.js - Green
  'vue': 'bg-emerald-500 text-white border-emerald-600',
  'vuejs': 'bg-emerald-500 text-white border-emerald-600',
  
  // Angular - Red
  'angular': 'bg-red-600 text-white border-red-700',
  
  // Flutter - Blue
  'flutter': 'bg-sky-500 text-white border-sky-600',
  
  // Dart - Blue/Teal
  'dart': 'bg-teal-600 text-white border-teal-700',
  
  // Rust - Orange/Brown
  'rust': 'bg-orange-700 text-white border-orange-800',
  
  // Kubernetes - Blue/Purple
  'kubernetes': 'bg-indigo-600 text-white border-indigo-700',
  'k8s': 'bg-indigo-600 text-white border-indigo-700',
  
  // Git - Orange/Red
  'git': 'bg-orange-600 text-white border-orange-700',
  
  // GitHub - Dark Gray/Black
  'github': 'bg-gray-800 text-white border-gray-900',
  
  // GitLab - Orange
  'gitlab': 'bg-orange-500 text-white border-orange-600',
  
  // MySQL - Blue/Orange
  'mysql': 'bg-blue-600 text-white border-blue-700',
  
  // Firebase - Yellow/Orange
  'firebase': 'bg-yellow-500 text-yellow-900 border-yellow-600',
  
  // Supabase - Green
  'supabase': 'bg-emerald-600 text-white border-emerald-700',
  
  // Stripe - Purple
  'stripe': 'bg-purple-600 text-white border-purple-700',
  
  // OpenAI - Green/Teal
  'openai': 'bg-emerald-500 text-white border-emerald-600',
  
  // Anthropic - Orange/Coral
  'anthropic': 'bg-orange-500 text-white border-orange-600',
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs rounded-md',
  md: 'px-3 py-1 text-sm rounded-lg',
  lg: 'px-4 py-2 text-base rounded-xl',
};

export const TechChip: React.FC<TechChipProps> = ({ 
  tech, 
  size = 'md',
  className = ''
}) => {
  const colorClasses = techColorMap[tech.toLowerCase() as TechName] || 'bg-gray-500 text-white border-gray-600';
  const sizeClass = sizeClasses[size];
  
  // Normalize tech name for display
  const displayName = tech === 'ts' ? 'TypeScript' :
                     tech === 'js' ? 'JavaScript' :
                     tech === 'k8s' ? 'Kubernetes' :
                     tech === 'golang' ? 'Go' :
                     tech === 'mongo' ? 'MongoDB' :
                     tech === 'next' ? 'Next.js' :
                     tech === 'nodejs' ? 'Node.js' :
                     tech === 'vuejs' ? 'Vue.js' :
                     tech === 'tailwindcss' ? 'Tailwind CSS' :
                     tech === 'postgresql' ? 'PostgreSQL' :
                     tech === 'sveltekit' ? 'SvelteKit' :
                     tech.charAt(0).toUpperCase() + tech.slice(1);
  
  return (
    <span className={`
      inline-flex items-center font-medium border transition-colors
      ${colorClasses}
      ${sizeClass}
      ${className}
    `}>
      {displayName}
    </span>
  );
};

export default TechChip;