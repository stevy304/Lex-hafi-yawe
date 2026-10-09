import React from 'react';
import { X, Feather } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PostComposer } from '../feed/PostComposer';

export const CreatePostModal: React.FC = () => {
  const { isCreatePostModalOpen, setIsCreatePostModalOpen } = useApp();

  if (!isCreatePostModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Create Legal Post
            </h2>
          </div>
          <button
            onClick={() => setIsCreatePostModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <PostComposer
            isModal={true}
            onPostCreated={() => setIsCreatePostModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};
