import React from 'react';
import { FolderTree, FileCode } from 'lucide-react';

/**
 * 프로젝트 구조 아이템 컴포넌트
 */
const DirectoryItem = ({ name, description, details }) => (
  <div className="group p-6 border-b border-theme-border last:border-0 hover:bg-theme-card transition-all duration-300 bg-theme-card shadow-sm">
    <div className="flex items-start gap-4 mb-3">
      <div className="mt-1 p-2 rounded-lg bg-theme-accent/5 text-theme-accent group-hover:bg-theme-accent group-hover:text-theme-bg transition-colors">
        <FolderTree className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-theme-text-primary text-base tracking-tight">{name}</h4>
        <p className="text-theme-text-secondary text-sm font-medium mt-1">{description}</p>
      </div>
    </div>
    {details && (
      <div className="ml-13 grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
        {details.map((detail, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[11px] text-theme-text-secondary font-semibold bg-theme-bg border border-theme-border px-3 py-1.5 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
            {detail}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default DirectoryItem;
