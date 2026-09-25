import React from 'react';
import { NotificationItem } from '../types';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Calendar, 
  Sparkles, 
  FileCheck, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (link: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'recommendation':
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
      case 'application':
        return <FileCheck className="w-4 h-4 text-emerald-600" />;
      case 'opportunity':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Notifications Center</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onMarkAllRead}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-600">
              <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-700">No notifications at this time</p>
              <p className="text-[11px] text-slate-600">You will be alerted when new high-match scholarships appear or deadlines approach.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.isRead) onMarkRead(n.id);
                  if (n.link) {
                    onNavigate(n.link);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  n.isRead
                    ? 'bg-white border-slate-200/70 hover:bg-slate-50'
                    : 'bg-indigo-50/40 border-indigo-200 hover:bg-indigo-50/70'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className={`text-xs font-bold ${n.isRead ? 'text-slate-800' : 'text-slate-900'}`}>
                      {n.title}
                    </h4>
                    <span className="font-mono text-[10px] text-slate-600 tabular-nums shrink-0">
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {n.message}
                  </p>
                </div>

                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" title="Unread"></span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-600">
          Showing automated scholarship alerts, deadlines, and milestone updates.
        </div>
      </div>
    </div>
  );
};
