'use client';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Timestamp | null;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [now, setNow] = useState<number>(0);

  // Update current time every second for accurate countdown timer
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const taskList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text || '',
          completed: data.completed || false,
          completedAt: data.completedAt || null,
        };
      });
      setTasks(taskList);
    });
    return () => unsubscribe();
  }, []);

  const addTask = async () => {
    if (input.trim() === '') return;
    await addDoc(collection(db, 'tasks'), {
      text: input,
      completed: false,
      completedAt: null,
      createdAt: serverTimestamp(),
    });
    setInput('');
  };

  const toggleTask = async (task: Task) => {
    const taskRef = doc(db, 'tasks', task.id);
    const newCompleted = !task.completed;
    await updateDoc(taskRef, {
      completed: newCompleted,
      completedAt: newCompleted ? serverTimestamp() : null,
    });
  };

  // Helper to calculate 24h remaining time string
  const getRemainingTime = (completedAt: Timestamp | null | undefined) => {
    if (!completedAt) return '';
    const completedMs = completedAt.toMillis();
    const expiryMs = completedMs + 24 * 60 * 60 * 1000;
    const diffMs = expiryMs - now;

    if (diffMs <= 0) return 'Expired (Hidden on Frontend)';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s left`;
  };

  // Filter out tasks checked more than 24 hours ago
  const visibleTasks = tasks.filter((task) => {
    if (!task.completed || !task.completedAt) return true;
    const expiryMs = task.completedAt.toMillis() + 24 * 60 * 60 * 1000;
    return expiryMs > now;
  });

  return (
    <div className="min-h-screen p-10 font-sans bg-white dark:bg-black text-black dark:text-white">
      <h1 className="text-3xl font-bold mb-6">My Cloud To-Do List</h1>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border border-gray-400 p-2 rounded w-64 bg-white text-black dark:bg-black dark:text-white"
          placeholder="What needs to be done?"
        />
        <button
          onClick={addTask}
          className="bg-blue-600 text-white px-4 py-2 rounded font-bold"
        >
          Add Task
        </button>
      </div>
      <ul className="pl-0 text-lg space-y-3">
        {visibleTasks.map((task) => (
          <li key={task.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task)}
              className="w-5 h-5 cursor-pointer"
            />
            <span className={task.completed ? 'line-through text-gray-500' : ''}>
              {task.text}
            </span>
            {task.completed && (
              <span className="text-sm bg-gray-200 dark:bg-gray-800 text-red-500 px-2 py-1 rounded">
                ⏱️ {getRemainingTime(task.completedAt)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
