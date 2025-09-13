import React from 'react';
import { TechChip } from './TechChip';

export const TechChipExample: React.FC = () => {
  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">TechChip Component Examples</h1>
      
      {/* Size Variations */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Size Variations</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <TechChip tech="react" size="sm" />
          <TechChip tech="react" size="md" />
          <TechChip tech="react" size="lg" />
        </div>
      </section>

      {/* Backend Technologies */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Backend Technologies</h2>
        <div className="flex flex-wrap gap-3">
          <TechChip tech="go" />
          <TechChip tech="python" />
          <TechChip tech="nodejs" />
          <TechChip tech="django" />
          <TechChip tech="fastapi" />
          <TechChip tech="rails" />
          <TechChip tech="bun" />
        </div>
      </section>

      {/* Frontend Frameworks */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Frontend Frameworks</h2>
        <div className="flex flex-wrap gap-3">
          <TechChip tech="react" />
          <TechChip tech="vue" />
          <TechChip tech="angular" />
          <TechChip tech="svelte" />
          <TechChip tech="nextjs" />
          <TechChip tech="sveltekit" />
        </div>
      </section>

      {/* Languages */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Programming Languages</h2>
        <div className="flex flex-wrap gap-3">
          <TechChip tech="typescript" />
          <TechChip tech="javascript" />
          <TechChip tech="python" />
          <TechChip tech="rust" />
          <TechChip tech="dart" />
          <TechChip tech="ruby" />
        </div>
      </section>

      {/* Databases */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Databases</h2>
        <div className="flex flex-wrap gap-3">
          <TechChip tech="postgres" />
          <TechChip tech="mongodb" />
          <TechChip tech="redis" />
          <TechChip tech="mysql" />
        </div>
      </section>

      {/* Cloud & DevOps */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Cloud & DevOps</h2>
        <div className="flex flex-wrap gap-3">
          <TechChip tech="aws" />
          <TechChip tech="vercel" />
          <TechChip tech="docker" />
          <TechChip tech="kubernetes" />
          <TechChip tech="git" />
          <TechChip tech="github" />
        </div>
      </section>

      {/* Services */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Services & APIs</h2>
        <div className="flex flex-wrap gap-3">
          <TechChip tech="openai" />
          <TechChip tech="anthropic" />
          <TechChip tech="stripe" />
          <TechChip tech="firebase" />
          <TechChip tech="supabase" />
        </div>
      </section>

      {/* Custom styling example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Custom Styling</h2>
        <div className="flex flex-wrap gap-3">
          <TechChip tech="react" className="shadow-lg transform hover:scale-105" />
          <TechChip tech="typescript" className="ring-2 ring-blue-300" />
          <TechChip tech="tailwind" className="opacity-80" />
        </div>
      </section>

      {/* Stack showcase */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Full Stack Examples</h2>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Modern React Stack</h3>
          <div className="flex flex-wrap gap-2">
            <TechChip tech="react" size="sm" />
            <TechChip tech="typescript" size="sm" />
            <TechChip tech="nextjs" size="sm" />
            <TechChip tech="tailwind" size="sm" />
            <TechChip tech="vercel" size="sm" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Full Stack Python</h3>
          <div className="flex flex-wrap gap-2">
            <TechChip tech="python" size="sm" />
            <TechChip tech="fastapi" size="sm" />
            <TechChip tech="postgres" size="sm" />
            <TechChip tech="docker" size="sm" />
            <TechChip tech="aws" size="sm" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Svelte + Go Stack</h3>
          <div className="flex flex-wrap gap-2">
            <TechChip tech="sveltekit" size="sm" />
            <TechChip tech="go" size="sm" />
            <TechChip tech="postgres" size="sm" />
            <TechChip tech="redis" size="sm" />
            <TechChip tech="kubernetes" size="sm" />
          </div>
        </div>
      </section>

      {/* Aliases demonstration */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Alias Support</h2>
        <p className="text-gray-600 text-sm">These aliases will display with their full names:</p>
        <div className="flex flex-wrap gap-3">
          <TechChip tech="ts" />
          <TechChip tech="js" />
          <TechChip tech="k8s" />
          <TechChip tech="golang" />
          <TechChip tech="mongo" />
          <TechChip tech="next" />
          <TechChip tech="nodejs" />
        </div>
      </section>
    </div>
  );
};

export default TechChipExample;