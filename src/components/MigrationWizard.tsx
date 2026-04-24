import React, { useState, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { ArrowRight, Check, X, Clock,  } from 'lucide-react';
import * as db from '../lib/db';
import { Block } from '../lib/db';

const MigrationWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state, updateBlock } = useJournal();
  const [pastTasks, setPastTasks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function findPastTasks() {
      const all = await db.getAllBlocks();
      const past = all.filter(b => 
        b.type === 'task' && 
        b.status === 'todo' && 
        b.logId < state.selectedDate &&
        !b.logId.includes('-') === false // Ensure it's a date string
      );
      setPastTasks(past);
      setLoading(false);
    }
    findPastTasks();
  }, [state.selectedDate]);

  const migrateTask = async (task: Block) => {
    // 1. Mark old task as migrated
    await updateBlock({ ...task, status: 'migrated' });
    
    // 2. Create new task on current date
    const newTask: Block = {
      ...task,
      id: crypto.randomUUID(),
      logId: state.selectedDate,
      status: 'todo',
    };
    await db.saveBlock(newTask);
    
    // 3. Update local state
    setPastTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const cancelTask = async (task: Block) => {
    await updateBlock({ ...task, status: 'cancelled' });
    setPastTasks(prev => prev.filter(t => t.id !== task.id));
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <header className="p-8 border-b border-gray-100 bg-blue-600 text-white">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-widest text-blue-100">Migration Wizard</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight">Migrate Incomplete Tasks</h2>
          <p className="mt-2 text-blue-100 text-sm">
            {pastTasks.length === 0 
              ? "Your history is clear! No tasks need migration." 
              : `You have ${pastTasks.length} tasks from previous days that are still open.`}
          </p>
        </header>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {pastTasks.map(task => (
            <div key={task.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4 group hover:bg-white hover:shadow-lg hover:shadow-gray-100 transition-all">
              <div className="flex-1">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{task.logId}</div>
                <div className="text-sm font-bold text-gray-700">{task.content}</div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => cancelTask(task)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Cancel Task"
                >
                  <X className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => migrateTask(task)}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
                >
                  Migrate <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {pastTasks.length === 0 && (
            <div className="text-center py-12">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="font-bold text-gray-900">All caught up!</p>
              <button 
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-gray-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all"
              >
                Close Wizard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MigrationWizard;
