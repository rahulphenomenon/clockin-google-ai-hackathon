import React from 'react';

interface BrowserFrameProps {
  url?: string;
  children: React.ReactNode;
}

export const BrowserFrame: React.FC<BrowserFrameProps> = ({ url = "clockin.ai/app", children }) => {
  return (
    <div className="w-full rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
      {/* Browser Toolbar */}
      <div className="bg-zinc-50 border-b border-border h-10 flex items-center px-4 gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
          <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
          <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
        </div>
        
        {/* URL Bar */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className="bg-white border border-zinc-200 rounded-md px-3 py-1 text-xs text-zinc-500 flex items-center justify-center font-mono">
            <span className="opacity-50 mr-1">https://</span>
            {url}
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="bg-white min-h-[400px] md:min-h-[500px] relative">
        {children}
      </div>
    </div>
  );
};