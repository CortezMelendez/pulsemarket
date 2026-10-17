'use client';

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { getInventoryTasks, updateTaskStatus } from '@/app/actions';
import { Layout, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
}

const COLUMNS = [
  { id: 'PENDING', title: 'Pendientes', icon: Clock, color: 'border-amber-500/20 bg-amber-500/5 text-amber-600' },
  { id: 'IN_PROGRESS', title: 'En Proceso', icon: AlertCircle, color: 'border-blue-500/20 bg-blue-500/5 text-blue-600' },
  { id: 'COMPLETED', title: 'Completadas', icon: CheckCircle2, color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600' },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      const data = await getInventoryTasks();
      setTasks(data);
      setLoading(false);
    }
    loadTasks();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;

    // Actualización optimista
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === draggableId ? { ...task, status: newStatus } : task))
    );

    // Persistencia en backend
    try {
      await updateTaskStatus(draggableId, newStatus);
    } catch (error) {
      console.error('Error al guardar el nuevo estado:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-medium">Cargando tablero Kanban...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <Layout className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Gestor de Tareas PulseMarket</h1>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map((column) => {
              const ColumnIcon = column.icon;
              const columnTasks = tasks.filter((task) => task.status === column.id);

              return (
                <div key={column.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${column.color} mb-4`}>
                    <div className="flex items-center gap-2 font-semibold">
                      <ColumnIcon className="h-5 w-5" />
                      <span>{column.title}</span>
                    </div>
                    <span className="bg-white/80 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
                      {columnTasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="min-h-[400px] flex flex-col gap-3"
                      >
                        {columnTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all ${
                                  snapshot.isDragging ? 'opacity-70 scale-105 shadow-xl border-indigo-500' : ''
                                }`}
                              >
                                <p className="text-sm font-medium text-gray-800">{task.title}</p>
                                <div className="mt-3 flex justify-between items-center">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                    task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {task.priority}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}