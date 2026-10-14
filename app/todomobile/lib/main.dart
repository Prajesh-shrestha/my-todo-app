import 'dart:async';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My Cloud To-Do App',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.dark,
        ),
      ),
      home: const TodoScreen(),
    );
  }
}

class TodoScreen extends StatefulWidget {
  const TodoScreen({super.key});

  @override
  State<TodoScreen> createState() => _TodoScreenState();
}

class _TodoScreenState extends State<TodoScreen> {
  final TextEditingController _controller = TextEditingController();
  late Timer _timer;

  @override
  void initState() {
    super.initState();
    // Refresh UI every second for live countdown timer
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _addTask() {
    if (_controller.text.trim().isEmpty) return;
    FirebaseFirestore.instance.collection('tasks').add({
      'text': _controller.text,
      'completed': false,
      'completedAt': null,
      'createdAt': FieldValue.serverTimestamp(),
    });
    _controller.clear();
  }

  void _toggleTask(String docId, bool currentStatus) {
    FirebaseFirestore.instance.collection('tasks').doc(docId).update({
      'completed': !currentStatus,
      'completedAt': !currentStatus ? FieldValue.serverTimestamp() : null,
    });
  }

  String _getRemainingTime(Timestamp? completedAt) {
    if (completedAt == null) return '';
    final completedMs = completedAt.millisecondsSinceEpoch;
    final expiryMs = completedMs + (24 * 60 * 60 * 1000);
    final diffMs = expiryMs - DateTime.now().millisecondsSinceEpoch;

    if (diffMs <= 0) return 'Expired';

    final duration = Duration(milliseconds: diffMs);
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    final seconds = duration.inSeconds.remainder(60);

    return '${hours}h ${minutes}m ${seconds}s left';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Cloud To-Do List', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: 'What needs to be done?',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: _addTask,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Add Task', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Expanded(
              child: StreamBuilder<QuerySnapshot>(
                stream: FirebaseFirestore.instance.collection('tasks').snapshots(),
                builder: (context, snapshot) {
                  if (!snapshot.hasData) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  final nowMs = DateTime.now().millisecondsSinceEpoch;
                  final docs = snapshot.data!.docs;

                  // Filter out tasks checked more than 24 hours ago
                  final visibleDocs = docs.where((doc) {
                    final data = doc.data() as Map<String, dynamic>;
                    final completed = data['completed'] ?? false;
                    final completedAt = data['completedAt'] as Timestamp?;
                    if (!completed || completedAt == null) return true;

                    final expiryMs = completedAt.millisecondsSinceEpoch + (24 * 60 * 60 * 1000);
                    return expiryMs > nowMs;
                  }).toList();

                  return ListView.builder(
                    itemCount: visibleDocs.length,
                    itemBuilder: (context, index) {
                      final docData = visibleDocs[index].data() as Map<String, dynamic>;
                      final docId = visibleDocs[index].id;
                      final text = docData['text'] ?? '';
                      final completed = docData['completed'] ?? false;
                      final completedAt = docData['completedAt'] as Timestamp?;

                      return CheckboxListTile(
                        value: completed,
                        onChanged: (_) => _toggleTask(docId, completed),
                        title: Text(
                          text,
                          style: TextStyle(
                            fontSize: 18,
                            decoration: completed ? TextDecoration.lineThrough : TextDecoration.none,
                            color: completed ? Colors.grey : Colors.white,
                          ),
                        ),
                        subtitle: completed
                            ? Text(
                                '⏱️ ${_getRemainingTime(completedAt)}',
                                style: const TextStyle(color: Colors.redAccent),
                              )
                            : null,
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

