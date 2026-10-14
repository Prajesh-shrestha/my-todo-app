'use client';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

export default function Home() {
  const [tasks, setTasks] = useState<{ id: string; text: string }[]>([]);
  const [input, setInput] = useState('');

  // This listens to the database and updates the screen in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const taskList = snapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().text,
      }));
      setTasks(taskList);
    });
    return () => unsubscribe();
  }, []);

  // This saves a new task to the database
  const addTask = async () => {
    if (input.trim() === '') return;
    await addDoc(collection(db, 'tasks'), {
      text: input,
    });
    setInput('');
  };

  return (
    <div className="min-h-screen p-10 font-sans">
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
      <ul className="list-disc pl-5 text-lg">
        {tasks.map((task) => (
          <li key={task.id} className="mb-2">{task.text}</li>
        ))}
      </ul>
    </div>
  );
}
