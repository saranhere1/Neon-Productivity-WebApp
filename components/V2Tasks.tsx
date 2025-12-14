import React from 'react';
import { useApp } from '../context/AppContext';
import { TaskBlock } from './TaskBlock';

export const V2Tasks: React.FC = () => {
  const { state } = useApp();
  const activeTasks = state.tasks.filter(t => !t.archived);

  return (
    <div className="h-full bg-gray-950 p-6 overflow-y-auto">
      {activeTasks.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-20">
              <h1 className="text-9xl font-black text-gray-800 select-none">VOID</h1>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
            {activeTasks.map(task => (
                <TaskBlock key={task.id} task={task} />
            ))}
          </div>
      )}
    </div>
  );
};
