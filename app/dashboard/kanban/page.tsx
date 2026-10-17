'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { getInventoryTasks, updateTaskStatus, deleteInventoryTask } from '@/app/actions';
import { Zap, LayoutDashboard, Kanban } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
}

const COLUMNS = [
  { id: 'PENDING', title: 'Pendientes', color: 'border-amber-200 bg-amber-50 text-amber-800' },
  { id: 'IN_PROGRESS', title: 'En Proceso', color: 'border-blue-200 bg-blue-50 text-blue-800' },
  { id: 'COMPLETED', title: 'Completadas', color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryDuration, setQueryDuration] = useState<number>(12);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    const data = await getInventoryTasks();
    
    if (data && 'tasks' in data) {
      setTasks(data.tasks);
      setQueryDuration(data.queryDuration);
    } else {
      setTasks(data as unknown as Task[]);
    }
    
    setLoading(false);
  }

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    setTasks((prev) =>
      prev.map((task) => (task.id === draggableId ? { ...task, status: newStatus } : task))
    );

    const startTime = Date.now();
    await updateTaskStatus(draggableId, newStatus);
    setQueryDuration(Date.now() - startTime || 10);
  }

  async function handleDelete(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    const startTime = Date.now();
    await deleteInventoryTask(taskId);
    setQueryDuration(Date.now() - startTime || 10);
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-medium">Cargando tablero Kanban de PulseMarket...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado con Navegación e Indicador de SLA */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestor de Tareas PulseMarket</h1>
            <p className="text-gray-500 text-sm mt-1">Gestor de Tareas & Operaciones en Tiempo Real</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Indicador SLA (<400ms) */}
            <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg text-emerald-700 text-sm font-semibold">
              <Zap className="h-4 w-4" />
              <span>Respuesta DB: {queryDuration}ms (SLA &lt; 400ms)</span>
            </div>

            {/* Navegación */}
            <nav className="flex gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium text-sm transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Métricas</span>
              </Link>
              <Link
                href="/dashboard/kanban"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-sm shadow hover:bg-indigo-700 transition"
              >
                <Kanban className="h-4 w-4" />
                <span>Kanban</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Tablero Drag & Drop */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map((col) => {
              const columnTasks = tasks.filter((t) => t.status === col.id);

              return (
                <div key={col.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
                  <div className={`flex justify-between items-center p-3 rounded-lg border mb-4 ${col.color}`}>
                    <h2 className="font-semibold text-sm">{col.title}</h2>
                    <span className="text-xs font-bold px-2 py-0.5 bg-white/80 rounded-full shadow-sm">
                      {columnTasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-1 space-y-3 min-h-[400px]"
                      >
                        {columnTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition group relative flex flex-col justify-between"
                              >
                                <p className="text-sm font-medium text-gray-800 mb-2 pr-6">{task.title}</p>
                                
                                <div className="flex justify-between items-center">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                      task.priority === 'HIGH'
                                        ? 'bg-rose-100 text-rose-700'
                                        : task.priority === 'MEDIUM'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {task.priority}
                                  </span>

                                  <button
                                    onClick={() => handleDelete(task.id)}
                                    className="text-gray-400 hover:text-rose-600 text-xs font-semibold px-1 py-0.5 rounded transition opacity-80 group-hover:opacity-100"
                                    title="Eliminar (Soft Delete)"
                                  >
                                    ✕
                                  </button>
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