
import { PanelLeft, PanelLeftClose, SquarePen } from 'lucide-react';

type TopMenuBarProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  profileInitials?: string;
  title?: string;
};

export default function TopMenuBar({
  sidebarOpen,
  onToggleSidebar,
  onNewChat,
  profileInitials = 'DP',
  title = 'SciAnno Chat',
}: TopMenuBarProps) {
  return (
    <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-between bg-gray-900 text-white h-14 px-4 shadow">
      {/* Left: Sidebar Toggle & New Chat */}
      <div className="flex items-center gap-2">
        {/* Sidebar Toggle Icon with Tooltip */}
        <div className="relative group">
          <button
            onClick={onToggleSidebar}
            className="bg-gray-800 text-white p-2 rounded hover:bg-[#bfa93a]"
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeft size={24} />}
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 mt-10 px-2 py-1 rounded bg-black text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
            Toggle Sidebar
          </span>
        </div>
        {/* New Chat Icon with Tooltip */}
        <div className="relative group">
          <button
            onClick={onNewChat}
            className="bg-gray-800 text-white p-2 rounded hover:bg-[#bfa93a] flex items-center"
            aria-label="New Chat"
          >
            <SquarePen size={20} />
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
            New Chat
          </span>
        </div>
      </div>

      {/* Center: App Title */}
      <span className="font-bold text-lg select-none">{title}</span>

      {/* Right: Profile Button */}
      <button
        className="bg-gray-800 rounded-full w-9 h-9 flex items-center justify-center hover:bg-gray-700"
        aria-label="Profile"
      >
        <span className="font-semibold">{profileInitials}</span>
      </button>
    </div>
  );
}