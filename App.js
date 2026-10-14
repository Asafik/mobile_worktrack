import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Animated,
  Text,
  View,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, DEFAULT_API_HOST } from './src/api';
import { Feather, Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['Semua', 'Revision', 'Idea', 'Meeting', 'Technical', 'General'];

// =================================================================
// SKELETON SHIMMER COMPONENTS (OPSI 2: INSTANT LOADING)
// =================================================================
function SkeletonBlock({ width = '100%', height = 16, borderRadius = 8, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.82,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#e2e8f0',
          opacity,
        },
        style,
      ]}
    />
  );
}

function DashboardSkeleton() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.dashboardScrollContent} showsVerticalScrollIndicator={false}>
      {/* Hero card skeleton */}
      <View style={styles.heroCard}>
        <SkeletonBlock width={140} height={14} style={{ marginBottom: 12 }} />
        <SkeletonBlock width="75%" height={24} style={{ marginBottom: 10 }} />
        <SkeletonBlock width="90%" height={14} />
      </View>

      {/* Grid 4 Cards */}
      <View style={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.statCard}>
            <SkeletonBlock width="60%" height={12} style={{ marginBottom: 12 }} />
            <SkeletonBlock width={50} height={32} style={{ marginBottom: 10 }} />
            <SkeletonBlock width="40%" height={10} />
          </View>
        ))}
      </View>

      {/* Progress card skeleton */}
      <View style={styles.progressCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <SkeletonBlock width="50%" height={16} />
          <SkeletonBlock width={40} height={16} />
        </View>
        <SkeletonBlock width="100%" height={10} borderRadius={5} style={{ marginBottom: 10 }} />
        <SkeletonBlock width="40%" height={12} />
      </View>

      {/* Action buttons skeleton */}
      <View style={styles.quickActionsRow}>
        <SkeletonBlock width="48%" height={48} borderRadius={10} />
        <SkeletonBlock width="48%" height={48} borderRadius={10} />
      </View>

      {/* Recent Notes Skeleton */}
      <SkeletonBlock width={140} height={18} style={{ marginBottom: 12, marginTop: 10 }} />
      <View style={styles.emptyCard}>
        <SkeletonBlock width="80%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="50%" height={14} />
      </View>

      {/* Pending Tasks Skeleton */}
      <SkeletonBlock width={180} height={18} style={{ marginBottom: 12, marginTop: 14 }} />
      <View style={styles.emptyCard}>
        <SkeletonBlock width="70%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="45%" height={14} />
      </View>
    </ScrollView>
  );
}

function NotesSkeleton() {
  return (
    <View style={styles.container}>
      {/* Category Chips row */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
        <SkeletonBlock width={70} height={32} borderRadius={16} />
        <SkeletonBlock width={80} height={32} borderRadius={16} />
        <SkeletonBlock width={65} height={32} borderRadius={16} />
        <SkeletonBlock width={75} height={32} borderRadius={16} />
      </View>

      {/* Note cards */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.noteCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <SkeletonBlock width={70} height={20} borderRadius={10} />
              <SkeletonBlock width={40} height={20} borderRadius={10} />
            </View>
            <SkeletonBlock width="85%" height={18} style={{ marginBottom: 10 }} />
            <SkeletonBlock width="100%" height={14} style={{ marginBottom: 6 }} />
            <SkeletonBlock width="60%" height={14} style={{ marginBottom: 14 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <SkeletonBlock width={90} height={12} />
              <SkeletonBlock width={50} height={12} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function TasksSkeleton() {
  return (
    <View style={styles.container}>
      {/* Status filter bar */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
        <SkeletonBlock width={65} height={32} borderRadius={16} />
        <SkeletonBlock width={80} height={32} borderRadius={16} />
        <SkeletonBlock width={95} height={32} borderRadius={16} />
        <SkeletonBlock width={70} height={32} borderRadius={16} />
      </View>

      {/* Task cards */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.taskCard}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <SkeletonBlock width={22} height={22} borderRadius={6} />
              <View style={{ flex: 1 }}>
                <SkeletonBlock width="80%" height={16} style={{ marginBottom: 8 }} />
                <SkeletonBlock width="95%" height={12} style={{ marginBottom: 10 }} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <SkeletonBlock width={60} height={18} borderRadius={9} />
                  <SkeletonBlock width={80} height={18} borderRadius={9} />
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// =================================================================
// PARSE NOTE TO TASKS HELPER
// =================================================================
function parseNoteToTasks(rawContent) {
  if (!rawContent || !rawContent.trim()) return [];
  const lines = rawContent.split('\n');
  const items = [];
  let currentItem = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const numMatch = line.match(/^(\d+)\.\s*(.*)/);
    const boldMatch = line.match(/^\*\*(.*?)\*\*(.*)/);

    if (numMatch) {
      if (currentItem) items.push(finalizeTaskItem(currentItem, items.length + 1));
      let titlePart = numMatch[2].trim();
      let descPart = '';
      const innerBold = titlePart.match(/^\*\*(.*?)\*\*(.*)/);
      if (innerBold) {
        titlePart = innerBold[1].trim();
        descPart = innerBold[2].trim();
      }
      currentItem = {
        title: titlePart,
        rawDesc: descPart ? [descPart] : [],
      };
    } else if (boldMatch && !line.startsWith('* ')) {
      if (currentItem) items.push(finalizeTaskItem(currentItem, items.length + 1));
      currentItem = {
        title: boldMatch[1].trim(),
        rawDesc: boldMatch[2].trim() ? [boldMatch[2].trim()] : [],
      };
    } else if (currentItem) {
      currentItem.rawDesc.push(line);
    } else {
      currentItem = {
        title: line.replace(/^[-*•]\s*/, ''),
        rawDesc: [],
      };
    }
  }

  if (currentItem) {
    items.push(finalizeTaskItem(currentItem, items.length + 1));
  }

  return items.filter((it) => it.title && it.title.trim().length > 0);
}

function finalizeTaskItem(item, index) {
  let cleanTitle = item.title
    .replace(/\[Masuk Tasks\]|\(Masuk Tasks\)/gi, '')
    .replace(/^[*_#\s]+|[*_#\s]+$/g, '')
    .trim();
  if (!cleanTitle) cleanTitle = `Poin Tugas ${index}`;

  let cleanDesc = item.rawDesc
    .map((d) => d.replace(/\[Masuk Tasks\]|\(Masuk Tasks\)/gi, '').trim())
    .filter(Boolean)
    .join('\n')
    .trim();

  return {
    id: `item-${index}-${Date.now()}`,
    title: cleanTitle,
    description: cleanDesc,
    selected: true,
  };
}

// =================================================================
// NOTE PREVIEW COMPONENT
// =================================================================
function NotePreviewContent({ content, title, category, projectName, onSwitchToEdit }) {
  if (!content || !content.trim()) {
    return (
      <View style={styles.previewEmptyContainer}>
        <Feather name="eye" size={36} color="#94a3b8" style={{ marginBottom: 10 }} />
        <Text style={styles.previewEmptyTitle}>Belum Ada Isi Catatan</Text>
        <Text style={styles.previewEmptySub}>
          Ketik teks catatan Anda di tab "Tulis" untuk melihat hasil pratinjau format rapi di sini.
        </Text>
      </View>
    );
  }

  const lines = content.split('\n');

  return (
    <View style={styles.previewScroll}>
      {/* Title & Badges in Preview */}
      <View style={styles.previewHeaderCard}>
        <Text style={styles.previewTitleText}>{title || 'Catatan Baru'}</Text>
        <View style={styles.previewBadgeRow}>
          <View style={styles.noteCategoryBadge}>
            <Text style={styles.noteCategoryText}>{category || 'General'}</Text>
          </View>
          {projectName ? (
            <View style={styles.noteProjectBadge}>
              <Feather name="folder" size={10} color="#6366f1" />
              <Text style={styles.noteProjectText}>{projectName}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.previewContentCard}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <View key={idx} style={{ height: 8 }} />;
          }

          const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
          if (numMatch) {
            const num = numMatch[1];
            const textPart = numMatch[2];
            return (
              <View key={idx} style={styles.previewPointBox}>
                <View style={styles.previewPointNumberBadge}>
                  <Text style={styles.previewPointNumberText}>{num}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <FormattedLineText text={textPart} isHeading={true} />
                </View>
              </View>
            );
          }

          if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            const bulletText = trimmed.replace(/^[-*•]\s*/, '');
            return (
              <View key={idx} style={styles.previewBulletRow}>
                <View style={styles.previewBulletDot} />
                <View style={{ flex: 1 }}>
                  <FormattedLineText text={bulletText} />
                </View>
              </View>
            );
          }

          return (
            <View key={idx} style={{ marginBottom: 6 }}>
              <FormattedLineText text={line} />
            </View>
          );
        })}
      </View>

      {/* Tombol Klik untuk Mulai Edit */}
      {onSwitchToEdit && (
        <TouchableOpacity
          onPress={onSwitchToEdit}
          style={styles.previewEditCtaBtn}
          activeOpacity={0.8}
        >
          <Feather name="edit-2" size={15} color="#2563eb" />
          <Text style={styles.previewEditCtaText}>Klik di Sini untuk Mulai Mengedit / Mengetik</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function FormattedLineText({ text, isHeading = false }) {
  if (!text.includes('**')) {
    return (
      <Text style={[styles.previewLineText, isHeading && styles.previewHeadingText]}>
        {text}
      </Text>
    );
  }

  const parts = text.split('**');
  return (
    <Text style={[styles.previewLineText, isHeading && styles.previewHeadingText]}>
      {parts.map((part, i) => (
        <Text key={i} style={i % 2 === 1 ? styles.previewBoldText : undefined}>
          {part}
        </Text>
      ))}
    </Text>
  );
}



function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates ? e.endCoordinates.height : 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return keyboardHeight;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

function MainApp() {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const noteScrollRef = useRef(null);
  const taskScrollRef = useRef(null);

  // Load saved Custom Host on start
  useEffect(() => {
    AsyncStorage.getItem('worktrack_custom_host').then((val) => {
      if (val) setCustomHost(val);
    }).catch(() => {});
  }, []);

  const topInset = Math.max(insets.top, Platform.OS === 'android' ? (RNStatusBar.currentHeight || 42) : 0);
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 48 : 16);
  const [activeTab, setActiveTab] = useState('beranda'); // 'beranda' | 'notes' | 'tasks'

  // Data states
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Opsi 3: Splash Screen Branding 850ms lalu transisi ke Dashboard (dengan Skeleton Shimmer)
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 850);
    return () => clearTimeout(splashTimer);
  }, []);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all'); // 'all' | projectId | 'none'
  const [taskFilter, setTaskFilter] = useState('pending'); // 'all' | 'pending' | 'done'

  // Dynamic Hosting API state (Bisa otomatis dari database / diketik manual di HP)
  const [customHost, setCustomHost] = useState('');
  const [hostModalVisible, setHostModalVisible] = useState(false);
  const [hostInput, setHostInput] = useState('');

  // Note Modal state
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('General');
  const [noteProjectId, setNoteProjectId] = useState(null);
  const [noteIsPinned, setNoteIsPinned] = useState(false);
  const [isRefiningAi, setIsRefiningAi] = useState(false);
  const [noteEditorMode, setNoteEditorMode] = useState('edit'); // 'edit' | 'preview'

  // Send to Tasks states
  const [sendTasksModalVisible, setSendTasksModalVisible] = useState(false);
  const [parsedTasks, setParsedTasks] = useState([]);
  const [sendTasksProjectId, setSendTasksProjectId] = useState(null);
  const [sendTasksPriority, setSendTasksPriority] = useState('Medium');
  const [sendTasksType, setSendTasksType] = useState('revision');
  const [isSendingTasks, setIsSendingTasks] = useState(false);

  // Quick Task states
  
  // Dynamic Greeting & Date
  const liveGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  }, []);

  const liveDateString = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const completedTasksCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'completed' || t.status === 'done').length;
  }, [tasks]);

  const taskCompletionPercent = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTasksCount / tasks.length) * 100);
  }, [tasks, completedTasksCount]);

  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskPriority, setQuickTaskPriority] = useState('Medium');
  const [taskProjectId, setTaskProjectId] = useState(null);

  // Task Modal state (Bisa buat tugas baru dengan modal lengkap atau edit tugas)
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormTitle, setTaskFormTitle] = useState('');
  const [taskFormDescription, setTaskFormDescription] = useState('');
  const [taskFormProjectId, setTaskFormProjectId] = useState(null);
  const [taskFormPriority, setTaskFormPriority] = useState('Medium');
  const [taskFormType, setTaskFormType] = useState('general');
  const [taskFormStatus, setTaskFormStatus] = useState('todo');

  // =========================================================================
  // LIVE SEARCH PROJECT PICKER STATE (SAMA & TERINTEGRASI NOTES + TASKS)
  // =========================================================================
  const [projectPickerVisible, setProjectPickerVisible] = useState(false);
  const [projectPickerMode, setProjectPickerMode] = useState('note'); // 'note' | 'task' | 'filter'
  const [projectSearchQuery, setProjectSearchQuery] = useState('');

  const openProjectPicker = (mode) => {
    setProjectPickerMode(mode);
    setProjectSearchQuery('');
    setProjectPickerVisible(true);
  };

  const filteredProjectsList = useMemo(() => {
    if (!projectSearchQuery.trim()) return projects;
    const q = projectSearchQuery.toLowerCase().trim();
    return projects.filter((p) => p.name && p.name.toLowerCase().includes(q));
  }, [projects, projectSearchQuery]);

  const getCurrentSelectedProjectId = () => {
    if (projectPickerMode === 'note') return noteProjectId;
    if (projectPickerMode === 'task_quick') return taskProjectId;
    if (projectPickerMode === 'task_modal') return taskFormProjectId;
    if (projectPickerMode === 'filter') return selectedProjectFilter === 'all' ? 'all' : selectedProjectFilter;
    return null;
  };

  const handleSelectProject = (id) => {
    if (projectPickerMode === 'note') {
      setNoteProjectId(id);
    } else if (projectPickerMode === 'sendTasks') {
      setSendTasksProjectId(id);
    } else if (projectPickerMode === 'task_quick') {
      setTaskProjectId(id);
    } else if (projectPickerMode === 'task_modal') {
      setTaskFormProjectId(id);
    } else if (projectPickerMode === 'filter') {
      setSelectedProjectFilter(id === null ? 'none' : id);
    }
    setProjectPickerVisible(false);
  };

  // Deteksi otomatis URL hosting dari data projects di Supabase
  const autoDetectedHost = useMemo(() => {
    const projWithUrl = projects.find((p) => p.live_url && p.live_url.trim().length > 0);
    if (projWithUrl && projWithUrl.live_url) {
      return projWithUrl.live_url.trim().replace(/\/$/, '');
    }
    return 'https://biustechno.vercel.app';
  }, [projects]);

  // URL hosting yang aktif digunakan (Prioritas: Diketik Manual > Auto Database)
  const activeApiHost = useMemo(() => {
    if (customHost && customHost.trim()) {
      let h = customHost.trim();
      if (!h.startsWith('http://') && !h.startsWith('https://')) h = 'https://' + h;
      return h.replace(/\/$/, '');
    }
    return autoDetectedHost;
  }, [customHost, autoDetectedHost]);

  // =========================================================================
  // DATA FETCHING VIA PURE WEB REST API (ZERO TOKENS IN MOBILE)
  // =========================================================================
  const fetchAllData = useCallback(async () => {
    try {
      const [notesData, tasksData, projectsData] = await Promise.all([
        api.getNotes(activeApiHost).catch(() => []),
        api.getTasks(activeApiHost).catch(() => []),
        api.getProjects(activeApiHost).catch(() => []),
      ]);
      setNotes(notesData || []);
      setTasks(tasksData || []);
      setProjects(projectsData || []);
    } catch (e) {
      console.warn('Fetch API error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeApiHost]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Biustechno';
    }
    fetchAllData();

    // Auto-sync polling every 15 detik
    const timer = setInterval(() => {
      fetchAllData();
    }, 15000);

    return () => clearInterval(timer);
  }, [fetchAllData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  // =========================================================================
  // AI REFINE WITH GOOGLE GEMINI / CLOUD ENDPOINT
  // =========================================================================
  const handleAiRefine = async () => {
    if (!noteContent.trim()) {
      Alert.alert('Perhatian', 'Isi konten catatan terlebih dahulu sebelum dirapikan oleh AI.');
      return;
    }

    Keyboard.dismiss();
    setIsRefiningAi(true);
    try {
      const parsed = await api.refineAi(activeApiHost, noteTitle, noteContent);
      if (parsed.refined_content) setNoteContent(parsed.refined_content);
      if (parsed.title) setNoteTitle(parsed.title);
      if (parsed.category) setNoteCategory(parsed.category);
      setNoteEditorMode('preview'); // Hasil rapi langsung tampil di Mode Preview!
      Alert.alert('Sukses', '✨ Catatan berhasil dirapikan secara profesional oleh AI!');
    } catch (err) {
      Alert.alert('Gagal AI', err.message || 'Tidak dapat menghubungi layanan AI.');
    } finally {
      setIsRefiningAi(false);
    }
  };

  // =========================================================================
  // NOTES CRUD
  // =========================================================================
  const openNewNoteModal = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory('General');
    // Jika sedang memfilter proyek tertentu, otomatis pakai proyek tersebut
    setNoteProjectId(selectedProjectFilter !== 'all' && selectedProjectFilter !== 'none' ? Number(selectedProjectFilter) : null);
    setNoteIsPinned(false);
    setNoteModalVisible(true);
  };

  const openEditNoteModal = (note) => {
    setNoteEditorMode('preview'); // Buka di Preview agar bisa di-scroll baca leluasa tanpa keyboard!
    setEditingNote(note);
    setNoteTitle(note.title || '');
    setNoteContent(note.content || '');
    setNoteCategory(note.category || 'General');
    setNoteProjectId(note.project_id || null);
    setNoteIsPinned(Boolean(note.is_pinned));
    setNoteModalVisible(true);
  };

  const saveNote = async () => {
    if (!noteTitle.trim() && !noteContent.trim()) {
      Alert.alert('Perhatian', 'Judul atau isi catatan tidak boleh kosong.');
      return;
    }

    const payload = {
      title: noteTitle.trim() || 'Catatan Tanpa Judul',
      content: noteContent.trim(),
      category: noteCategory,
      project_id: noteProjectId ? Number(noteProjectId) : null,
      is_pinned: noteIsPinned,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingNote) {
        await api.updateNote(activeApiHost, editingNote.id, payload);
        setNotes((prev) =>
          prev.map((n) => (n.id === editingNote.id ? { ...n, ...payload, project: projects.find((p) => p.id === payload.project_id) } : n))
        );
      } else {
        payload.created_at = new Date().toISOString();
        const created = await api.createNote(activeApiHost, payload);
        if (created) {
          setNotes((prev) => [created, ...prev]);
        }
      }
      setNoteModalVisible(false);
    } catch (err) {
      Alert.alert('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan catatan.');
    }
  };


  // OPEN SEND TO TASKS MODAL
  const openSendTasksFromNote = (title, contentText, projectId, category) => {
    if (!contentText || !contentText.trim()) {
      Alert.alert('Perhatian', 'Isi catatan masih kosong. Tulis catatan terlebih dahulu.');
      return;
    }
    const items = parseNoteToTasks(contentText);
    if (items.length === 0) {
      Alert.alert('Perhatian', 'Tidak ditemukan poin tugas. Pastikan catatan memiliki poin bernomor atau baris teks.');
      return;
    }
    setParsedTasks(items);
    setSendTasksProjectId(projectId || null);
    if (category === 'Idea') setSendTasksType('feature');
    else if (category === 'Technical') setSendTasksType('technical');
    else setSendTasksType('revision');
    setSendTasksPriority('Medium');
    setSendTasksModalVisible(true);
  };

  const toggleParsedTaskSelection = (index) => {
    setParsedTasks((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectAllParsedTasks = (select) => {
    setParsedTasks((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const executeSendTasks = async () => {
    const selected = parsedTasks.filter((t) => t.selected);
    if (selected.length === 0) {
      Alert.alert('Peringatan', 'Pilih minimal satu poin tugas yang ingin dikirim.');
      return;
    }

    setIsSendingTasks(true);
    try {
      const payloadTasks = selected.map((t) => ({
        title: t.title,
        description: t.description || '',
        project_id: sendTasksProjectId ? Number(sendTasksProjectId) : null,
        priority: sendTasksPriority,
        type: sendTasksType,
        status: 'todo',
      }));

      const created = await api.createTasksBulk(activeApiHost, payloadTasks);
      if (created && Array.isArray(created) && created.length > 0) {
        setTasks((prev) => [...created, ...prev]);
      } else {
        const refreshedTasks = await api.getTasks(activeApiHost);
        setTasks(refreshedTasks || []);
      }
      setSendTasksModalVisible(false);
      Alert.alert('Sukses', `✅ Berhasil mengirim ${selected.length} tugas ke halaman Tasks!`);
    } catch (err) {
      Alert.alert('Gagal', err.message || 'Gagal mengirim tugas.');
    } finally {
      setIsSendingTasks(false);
    }
  };

  const deleteNote = (id) => {
    Alert.alert('Hapus Catatan', 'Apakah Anda yakin ingin menghapus catatan ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setNotes((prev) => prev.filter((n) => n.id !== id));
          try {
            await api.deleteNote(activeApiHost, id);
          } catch (e) {
            console.warn('Delete error:', e);
          }
        },
      },
    ]);
  };

  const togglePinNote = async (note) => {
    const nextPin = !note.is_pinned;
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, is_pinned: nextPin } : n))
    );
    try {
      await api.updateNote(activeApiHost, note.id, { is_pinned: nextPin });
    } catch (e) {
      console.warn('Pin error:', e);
    }
  };

  // =========================================================================
  // TASKS MODAL & CRUD
  // =========================================================================
  const openNewTaskModal = () => {
    setEditingTask(null);
    setTaskFormTitle(quickTaskTitle.trim());
    setTaskFormDescription('');
    // Otomatis pakai pilihan proyek task cepat atau filter aktif
    const defaultProj = taskProjectId || (selectedProjectFilter !== 'all' && selectedProjectFilter !== 'none' ? Number(selectedProjectFilter) : null);
    setTaskFormProjectId(defaultProj);
    setTaskFormPriority(quickTaskPriority || 'Medium');
    setTaskFormType('general');
    setTaskFormStatus('todo');
    setTaskModalVisible(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setTaskFormTitle(task.title || '');
    setTaskFormDescription(task.description || '');
    setTaskFormProjectId(task.project_id || null);
    setTaskFormPriority(task.priority || 'Medium');
    setTaskFormType(task.type || 'general');
    setTaskFormStatus(task.status || 'todo');
    setTaskModalVisible(true);
  };

  const saveTask = async () => {
    if (!taskFormTitle.trim()) {
      Alert.alert('Perhatian', 'Judul tugas tidak boleh kosong.');
      return;
    }

    const payload = {
      title: taskFormTitle.trim(),
      description: taskFormDescription.trim(),
      project_id: taskFormProjectId ? Number(taskFormProjectId) : null,
      priority: taskFormPriority,
      type: taskFormType,
      status: taskFormStatus,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingTask) {
        await api.updateTask(activeApiHost, editingTask.id, payload);
        setTasks((prev) =>
          prev.map((t) =>
            t.id === editingTask.id
              ? { ...t, ...payload, project: projects.find((p) => p.id === payload.project_id) }
              : t
          )
        );
      } else {
        payload.created_at = new Date().toISOString();
        const created = await api.createTask(activeApiHost, payload);
        if (created) {
          setTasks((prev) => [created, ...prev]);
        }
      }
      setTaskModalVisible(false);
    } catch (err) {
      Alert.alert('Gagal Menyimpan Tugas', err.message || 'Terjadi kesalahan saat menyimpan tugas.');
    }
  };

  const toggleTaskStatus = async (task) => {
    const isDone = task.status === 'completed' || task.status === 'done';
    const nextStatus = isDone ? 'todo' : 'completed';

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await api.updateTask(activeApiHost, task.id, { status: nextStatus });
    } catch (err) {
      console.warn('Error updating task:', err);
    }
  };

  const deleteTask = (id) => {
    Alert.alert('Hapus Tugas', 'Apakah Anda yakin ingin menghapus tugas ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setTasks((prev) => prev.filter((t) => t.id !== id));
          try {
            await api.deleteTask(activeApiHost, id);
          } catch (e) {
            console.warn('Delete error:', e);
          }
        },
      },
    ]);
  };

  // =========================================================================
  // FILTERED DATA (DENGAN LIVE PROJECT FILTER UNTUK NOTES & TASKS)
  // =========================================================================
  const filteredNotes = useMemo(() => {
    return notes.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat =
        selectedCategory === 'Semua' ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();

      // Project filter
      let matchProject = true;
      if (selectedProjectFilter === 'none') {
        matchProject = !item.project_id;
      } else if (selectedProjectFilter !== 'all') {
        matchProject = Number(item.project_id) === Number(selectedProjectFilter);
      }

      return matchSearch && matchCat && matchProject;
    });
  }, [notes, searchQuery, selectedCategory, selectedProjectFilter]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((item) => {
      const isDone = item.status === 'completed' || item.status === 'done';
      if (taskFilter === 'pending' && isDone) return false;
      if (taskFilter === 'done' && !isDone) return false;

      // Project filter
      let matchProject = true;
      if (selectedProjectFilter === 'none') {
        matchProject = !item.project_id;
      } else if (selectedProjectFilter !== 'all') {
        matchProject = Number(item.project_id) === Number(selectedProjectFilter);
      }

      return matchProject;
    });
  }, [tasks, taskFilter, selectedProjectFilter]);

  const pendingTasksCount = useMemo(() => {
    return tasks.filter((t) => t.status !== 'completed' && t.status !== 'done').length;
  }, [tasks]);

  const activeProjectFilterName = useMemo(() => {
    if (selectedProjectFilter === 'all') return 'Semua Proyek';
    if (selectedProjectFilter === 'none') return 'Tanpa Proyek';
    const found = projects.find((p) => Number(p.id) === Number(selectedProjectFilter));
    return found ? found.name : 'Proyek';
  }, [selectedProjectFilter, projects]);



  if (showSplash) {
    return (
      <View style={[styles.safeArea, styles.loadingSplashContainer, { paddingTop: topInset, paddingBottom: bottomInset }]}>
        <StatusBar style="dark" backgroundColor="#ffffff" translucent={true} />
        <View style={styles.loadingSplashCenter}>
          <Image
            source={require('./Biustechno.png')}
            style={styles.loadingLogoImage}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { paddingTop: topInset }]}>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={true} />

      {/* TOP HEADER (BIUSTECHNO_LOGO + TULISAN SENDIRI DI POJOK KIRI) */}
      <View style={styles.header}>
        <View style={styles.headerBrandRow}>
          <Image
            source={require('./Biustechno_logo.png')}
            style={styles.headerLogoEmblem}
            resizeMode="contain"
          />
          <View style={styles.headerBrandTextWrap}>
            <Text style={styles.headerBrandTitle}>BIUSTECHNO</Text>
            <Text style={styles.headerBrandSubtitle}>INNOVATION IN HEALTH TECHNOLOGY</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onRefresh}
          style={styles.refreshButton}
          activeOpacity={0.7}
        >
          <Feather name="refresh-cw" size={18} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT AREA */}
      <View style={styles.container}>
        {activeTab === 'beranda' ? (
          loading ? (
            <DashboardSkeleton />
          ) : (
          /* ================================================================= */
          /* TAB 0: BERANDA (DASHBOARD - IDENTIK DENGAN WEB) */
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.dashboardScrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
            }
          >
            {/* HERO GREETING (PERSIS SEPERTI WEB) */}
            <View style={styles.heroCard}>
              <Text style={styles.heroDateText}>{liveDateString}</Text>
              <Text style={styles.heroGreetingText}>{liveGreeting}, Asafik! 👋</Text>
              <Text style={styles.heroSubText}>
                Semua proyek, tugas, dan catatan tersinkronisasi secara real-time.
              </Text>
            </View>

            {/* TOP 4 METRIC STAT CARDS (COMPACT & TANPA ICON SESUAI REQUEST) */}
            <View style={styles.statsGrid}>
              {/* Card 1: Total Proyek */}
              <TouchableOpacity
                style={styles.statBox}
                onPress={() => openProjectPicker('filter')}
                activeOpacity={0.7}
              >
                <Text style={styles.statLabel}>Total Proyek</Text>
                <Text style={styles.statNumber}>{projects.length}</Text>
                <Text style={styles.statSubtextPositive}>
                  ↑ {projects.length} aktif
                </Text>
              </TouchableOpacity>

              {/* Card 2: Tugas Selesai */}
              <TouchableOpacity
                style={styles.statBox}
                onPress={() => setActiveTab('tasks')}
                activeOpacity={0.7}
              >
                <Text style={styles.statLabel}>Tugas Selesai</Text>
                <Text style={styles.statNumber}>{completedTasksCount}</Text>
                <Text style={styles.statSubtextPositive}>
                  ↑ {taskCompletionPercent}% ({completedTasksCount}/{tasks.length})
                </Text>
              </TouchableOpacity>

              {/* Card 3: Tugas Tertunda */}
              <TouchableOpacity
                style={styles.statBox}
                onPress={() => setActiveTab('tasks')}
                activeOpacity={0.7}
              >
                <Text style={styles.statLabel}>Tugas Tertunda</Text>
                <Text style={styles.statNumber}>{pendingTasksCount}</Text>
                <Text style={styles.statSubtextNeutral}>
                  {pendingTasksCount > 0 ? 'Perlu diselesaikan' : 'Semua beres'}
                </Text>
              </TouchableOpacity>

              {/* Card 4: Total Catatan */}
              <TouchableOpacity
                style={styles.statBox}
                onPress={() => setActiveTab('notes')}
                activeOpacity={0.7}
              >
                <Text style={styles.statLabel}>Total Catatan</Text>
                <Text style={styles.statNumber}>{notes.length}</Text>
                <Text style={styles.statSubtextNeutral}>
                  {notes.filter((n) => n.is_pinned).length} disematkan
                </Text>
              </TouchableOpacity>
            </View>

            {/* PROGRESS CARD */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="activity" size={18} color="#2563eb" />
                  <Text style={styles.progressTitle}>Progres Penyelesaian Tugas</Text>
                </View>
                <Text style={styles.progressPercentText}>{taskCompletionPercent}%</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.max(taskCompletionPercent, 4)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressSubtext}>
                {completedTasksCount} dari {tasks.length} tugas selesai dikerjakan
              </Text>
            </View>

            {/* ACTION BUTTONS (QUICK SHORTCUTS) */}
            <View style={styles.dashboardActionRow}>
              <TouchableOpacity
                style={styles.dashActionBtnNote}
                onPress={openNewNoteModal}
                activeOpacity={0.8}
              >
                <Feather name="plus" size={16} color="#ffffff" />
                <Text style={styles.dashActionBtnText}>Tulis Catatan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dashActionBtnTask}
                onPress={openNewTaskModal}
                activeOpacity={0.8}
              >
                <Feather name="check-square" size={16} color="#2563eb" />
                <Text style={styles.dashActionBtnTextTask}>Tambah Tugas</Text>
              </TouchableOpacity>
            </View>

            {/* SECTION: CATATAN TERBARU */}
            <View style={styles.dashSectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="file-text" size={16} color="#0f172a" />
                <Text style={styles.dashSectionTitle}>Catatan Terbaru</Text>
              </View>
              
            </View>

            {notes.slice(0, 3).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.dashNoteCard}
                onPress={() => openEditNoteModal(item)}
                activeOpacity={0.75}
              >
                <View style={styles.dashNoteHeader}>
                  <View style={styles.noteCategoryBadge}>
                    <Text style={styles.noteCategoryText}>{item.category || 'General'}</Text>
                  </View>
                  {item.is_pinned && (
                    <Ionicons name="pin" size={14} color="#2563eb" />
                  )}
                </View>
                <Text style={styles.dashNoteTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.content ? (
                  <Text style={styles.dashNoteContent} numberOfLines={2}>
                    {item.content}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}

            {notes.length === 0 && (
              <View style={styles.dashEmptyBox}>
                <Text style={styles.dashEmptyText}>Belum ada catatan.</Text>
              </View>
            )}

            {/* SECTION: TUGAS BELUM SELESAI */}
            <View style={[styles.dashSectionHeader, { marginTop: 20 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="clock" size={16} color="#0f172a" />
                <Text style={styles.dashSectionTitle}>Tugas Perlu Dikerjakan</Text>
              </View>
              
            </View>

            {tasks.filter((t) => t.status !== 'completed' && t.status !== 'done').slice(0, 4).map((task) => (
              <View key={task.id} style={styles.dashTaskCard}>
                <TouchableOpacity
                  onPress={() => toggleTaskStatus(task)}
                  style={{ padding: 2 }}
                >
                  <Feather name="circle" size={20} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => openEditTaskModal(task)}
                >
                  <Text style={styles.dashTaskTitle} numberOfLines={1}>
                    {task.title}
                  </Text>
                  {task.project?.name ? (
                    <Text style={styles.dashTaskProject}>📁 {task.project.name}</Text>
                  ) : null}
                </TouchableOpacity>
                {task.priority && (
                  <View style={[styles.priorityBadge, task.priority === 'Urgent' && styles.priorityUrgent]}>
                    <Text style={styles.priorityText}>{task.priority}</Text>
                  </View>
                )}
              </View>
            ))}

            {tasks.filter((t) => t.status !== 'completed' && t.status !== 'done').length === 0 && (
              <View style={styles.dashEmptyBox}>
                <Feather name="check-circle" size={22} color="#16a34a" />
                <Text style={styles.dashEmptyText}>Hebat! Semua tugas telah selesai.</Text>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
          )
        ) : activeTab === 'notes' ? (
          loading ? (
            <NotesSkeleton />
          ) : (
          /* ================================================================= */
          /* TAB 1: NOTES (FOKUS UTAMA) */
          /* ================================================================= */
          <View style={{ flex: 1, minHeight: 0 }}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Feather name="search" size={18} color="#94a3b8" />
              <TextInput
                placeholder="Cari catatan, ide, memo..."
                placeholderTextColor="#94a3b8"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Feather name="x" size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Chips Scroll */}
            <View style={{ height: 42 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat && styles.categoryChipActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Note List */}
            <FlatList
              data={filteredNotes}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Feather name="file-text" size={48} color="#cbd5e1" />
                  <Text style={styles.emptyTitle}>Belum Ada Catatan</Text>
                  <Text style={styles.emptySubtitle}>
                    {selectedProjectFilter !== 'all'
                      ? `Tidak ada catatan pada filter proyek "${activeProjectFilterName}".`
                      : 'Tekan tombol "+" di bawah untuk menulis catatan ide atau memo baru.'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const projectName = item.project?.name || (item.project_id && projects.find((p) => p.id === item.project_id)?.name);
                return (
                  <TouchableOpacity
                    style={[
                      styles.noteCard,
                      item.is_pinned && styles.noteCardPinned,
                    ]}
                    onPress={() => openEditNoteModal(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.noteCardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                        <View style={styles.noteCategoryBadge}>
                          <Text style={styles.noteCategoryText}>
                            {item.category || 'General'}
                          </Text>
                        </View>

                        {/* Project Tag */}
                        {projectName ? (
                          <View style={styles.noteProjectBadge}>
                            <Feather name="folder" size={10} color="#6366f1" />
                            <Text style={styles.noteProjectText} numberOfLines={1}>
                              {projectName}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.noteActionRow}>
                        <TouchableOpacity
                          onPress={() => togglePinNote(item)}
                          style={styles.iconBtn}
                        >
                          <Ionicons
                            name="pin"
                            size={16}
                            color={item.is_pinned ? '#2563eb' : '#94a3b8'}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => deleteNote(item.id)}
                          style={styles.iconBtn}
                        >
                          <Feather name="trash-2" size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={styles.noteCardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    {item.content ? (
                      <Text style={styles.noteCardContent} numberOfLines={4}>
                        {item.content}
                      </Text>
                    ) : null}

                    <View style={styles.noteCardFooter}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Feather name="clock" size={12} color="#94a3b8" />
                        <Text style={styles.noteDateText}>
                          {item.updated_at
                            ? new Date(item.updated_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Baru saja'}
                        </Text>
                      </View>

                      {/* QUICK SEND TO TASKS BUTTON */}
                      <TouchableOpacity
                        style={styles.cardSendTasksBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          openSendTasksFromNote(item.title, item.content, item.project_id, item.category);
                        }}
                        activeOpacity={0.7}
                      >
                        <Feather name="list" size={12} color="#2563eb" />
                        <Text style={styles.cardSendTasksText}>Kirim ke Tasks</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />

            {/* FLOATING ACTION BUTTON */}
            <TouchableOpacity
              style={styles.fab}
              onPress={openNewNoteModal}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          )
        ) : (
          loading ? (
            <TasksSkeleton />
          ) : (
          /* ================================================================= */
          /* TAB 2: TASKS */
          /* ================================================================= */
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, minHeight: 0 }}
          >
            {/* Task Filter Tab */}
            <View style={styles.taskFilterRow}>
              {[
                { key: 'pending', label: `Belum Selesai (${pendingTasksCount})` },
                { key: 'done', label: 'Selesai' },
                { key: 'all', label: 'Semua' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setTaskFilter(f.key)}
                  style={[
                    styles.taskFilterBtn,
                    taskFilter === f.key && styles.taskFilterBtnActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.taskFilterText,
                      taskFilter === f.key && styles.taskFilterTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Task List */}
            <FlatList
              data={filteredTasks}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Feather name="check-circle" size={48} color="#cbd5e1" />
                  <Text style={styles.emptyTitle}>Semua Tugas Beres!</Text>
                  <Text style={styles.emptySubtitle}>
                    {selectedProjectFilter !== 'all'
                      ? `Tidak ada tugas pada filter proyek "${activeProjectFilterName}".`
                      : 'Tidak ada tugas yang tertunda untuk saat ini.'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const isDone = item.status === 'completed' || item.status === 'done';
                const projectName = item.project?.name || (item.project_id && projects.find((p) => p.id === item.project_id)?.name);

                return (
                  <View style={[styles.taskCard, isDone && styles.taskCardDone]}>
                    <TouchableOpacity
                      onPress={() => toggleTaskStatus(item)}
                      style={styles.taskCheckboxBtn}
                      activeOpacity={0.7}
                    >
                      {isDone ? (
                        <Feather name="check-circle" size={24} color="#16a34a" />
                      ) : (
                        <Feather name="circle" size={24} color="#94a3b8" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.taskInfo}
                      onPress={() => openEditTaskModal(item)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[styles.taskTitle, isDone && styles.taskTitleDone]}
                      >
                        {item.title}
                      </Text>

                      <View style={styles.taskMetaRow}>
                        {/* Project Tag */}
                        {projectName ? (
                          <View style={styles.taskProjectBadge}>
                            <Feather name="folder" size={10} color="#6366f1" />
                            <Text style={styles.taskProjectBadgeText} numberOfLines={1}>
                              {projectName}
                            </Text>
                          </View>
                        ) : null}

                        {item.priority && (
                          <View
                            style={[
                              styles.priorityBadge,
                              item.priority === 'Urgent' && styles.priorityUrgent,
                              item.priority === 'High' && styles.priorityHigh,
                              item.priority === 'Medium' && styles.priorityMedium,
                              item.priority === 'Low' && styles.priorityLow,
                            ]}
                          >
                            <Text
                              style={[
                                styles.priorityText,
                                item.priority === 'Urgent' && styles.priorityTextUrgent,
                                item.priority === 'High' && styles.priorityTextHigh,
                                item.priority === 'Medium' && styles.priorityTextMedium,
                                item.priority === 'Low' && styles.priorityTextLow,
                              ]}
                            >
                              {item.priority}
                            </Text>
                          </View>
                        )}
                        {item.due_date ? (
                          <View style={styles.taskDateBadge}>
                            <Feather name="calendar" size={11} color="#64748b" />
                            <Text style={styles.taskDateText}>{item.due_date}</Text>
                          </View>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteTask(item.id)}
                      style={styles.iconBtn}
                    >
                      <Feather name="trash-2" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />

            {/* FLOATING ACTION BUTTON UNTUK TAMBAH TUGAS */}
            <TouchableOpacity
              style={styles.fab}
              onPress={openNewTaskModal}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={24} color="#ffffff" />
            </TouchableOpacity>
          </KeyboardAvoidingView>
          )
        )}
      </View>

      {/* BOTTOM NAVIGATION (BERANDA DI TENGAH: NOTES - BERANDA - TASKS) */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(bottomInset + 12, 48), minHeight: 68 + Math.max(bottomInset, 36) }]}>
        {/* TAB 1: NOTES */}
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'notes' && styles.navItemActive]}
          onPress={() => setActiveTab('notes')}
          activeOpacity={0.8}
        >
          <Feather
            name="file-text"
            size={20}
            color={activeTab === 'notes' ? '#2563eb' : '#64748b'}
          />
          <Text
            style={[styles.navLabel, activeTab === 'notes' && styles.navLabelActive]}
          >
            Notes
          </Text>
        </TouchableOpacity>

        {/* TAB 2: BERANDA (DI TENGAH) */}
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'beranda' && styles.navItemActive]}
          onPress={() => setActiveTab('beranda')}
          activeOpacity={0.8}
        >
          <Feather
            name="home"
            size={21}
            color={activeTab === 'beranda' ? '#2563eb' : '#64748b'}
          />
          <Text
            style={[styles.navLabel, activeTab === 'beranda' && styles.navLabelActive]}
          >
            Beranda
          </Text>
        </TouchableOpacity>

        {/* TAB 3: TASKS */}
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'tasks' && styles.navItemActive]}
          onPress={() => setActiveTab('tasks')}
          activeOpacity={0.8}
        >
          <View>
            <Feather
              name="check-circle"
              size={20}
              color={activeTab === 'tasks' ? '#2563eb' : '#64748b'}
            />
            {pendingTasksCount > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>
                  {pendingTasksCount > 9 ? '9+' : pendingTasksCount}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.navLabel, activeTab === 'tasks' && styles.navLabelActive]}
          >
            Tasks
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL NOTE (CREATE / EDIT) */}
      <Modal
        visible={noteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setNoteModalVisible(false)}
          />
          <View
            style={[
              styles.modalContainer,
              Platform.OS === 'ios' && keyboardHeight > 0 && { marginBottom: keyboardHeight },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingNote ? 'Edit Catatan' : 'Catatan Baru'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {keyboardHeight > 0 && (
                  <TouchableOpacity
                    onPress={() => Keyboard.dismiss()}
                    style={styles.keyboardDismissBtn}
                    activeOpacity={0.7}
                  >
                    <Feather name="chevron-down" size={14} color="#2563eb" />
                    <Text style={styles.keyboardDismissBtnText}>Tutup Keyboard</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setNoteModalVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="x" size={22} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              ref={noteScrollRef}
              style={styles.modalBody}
              contentContainerStyle={{ paddingBottom: 32 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={true}
            >
              {/* AI REFINE BUTTON (TERPUSAT DI VERCEL BACKEND) */}
              <TouchableOpacity
                onPress={handleAiRefine}
                disabled={isRefiningAi}
                style={[styles.aiButton, isRefiningAi && { opacity: 0.7 }]}
                activeOpacity={0.8}
              >
                {isRefiningAi ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Feather name="zap" size={15} color="#ffffff" />
                )}
                <Text style={styles.aiButtonText}>
                  ✨ Rapikan Otomatis dengan AI
                </Text>
              </TouchableOpacity>

              {/* Judul Catatan */}
              <Text style={styles.modalLabel}>Judul Catatan</Text>
              <TextInput
                placeholder="Contoh: Revisi Fitur SAKIP atau Hasil Rapat..."
                placeholderTextColor="#94a3b8"
                style={styles.modalInput}
                value={noteTitle}
                onChangeText={setNoteTitle}
              />

              {/* HUBUNGKAN KE PROYEK (LIVE SEARCH PICKER) */}
              <Text style={styles.modalLabel}>Proyek Terkait</Text>
              <TouchableOpacity
                style={styles.selectTriggerBtn}
                onPress={() => openProjectPicker('note')}
                activeOpacity={0.75}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Feather name="folder" size={16} color="#6366f1" />
                  <Text style={styles.selectTriggerText} numberOfLines={1}>
                    {noteProjectId
                      ? (projects.find((p) => p.id === noteProjectId)?.name || 'Proyek Terpilih')
                      : 'Tanpa Proyek (Catatan Umum)'}
                  </Text>
                </View>
                <View style={styles.selectTriggerRight}>
                  <Text style={styles.selectTriggerActionText}>Pilih / Cari</Text>
                  <Feather name="chevron-down" size={16} color="#64748b" />
                </View>
              </TouchableOpacity>

              {/* Kategori Chips */}
              <Text style={styles.modalLabel}>Kategori Catatan</Text>
              <View style={styles.modalCategoryRow}>
                {['Revision', 'Idea', 'Meeting', 'Technical', 'General'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setNoteCategory(cat)}
                    style={[
                      styles.modalCatChip,
                      noteCategory === cat && styles.modalCatChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalCatText,
                        noteCategory === cat && styles.modalCatTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Pin Switch */}
              <TouchableOpacity
                onPress={() => setNoteIsPinned(!noteIsPinned)}
                style={styles.pinToggleRow}
              >
                <Ionicons
                  name="pin"
                  size={18}
                  color={noteIsPinned ? '#2563eb' : '#94a3b8'}
                />
                <Text style={styles.pinToggleText}>
                  {noteIsPinned ? 'Catatan Disematkan (Pin di Atas)' : 'Sematkan Catatan ke Paling Atas'}
                </Text>
              </TouchableOpacity>

              {/* Toolbar Editor: Label, Kirim ke Tasks, & Segmented Tab (Tulis / Preview) */}
              <View style={styles.editorToolbarRow}>
                <Text style={styles.modalLabelNoMargin}>Isi Catatan / Poin Revisi</Text>
                <View style={styles.editorToolbarActions}>
                  {/* Kirim ke Tasks Action */}
                  <TouchableOpacity
                    style={styles.toolbarSendTasksBtn}
                    onPress={() => openSendTasksFromNote(noteTitle, noteContent, noteProjectId, noteCategory)}
                    activeOpacity={0.7}
                  >
                    <Feather name="list" size={11} color="#2563eb" />
                    <Text style={styles.toolbarSendTasksText}>Kirim ke Tasks</Text>
                  </TouchableOpacity>

                  {/* Segmented Switch: Tulis / Preview */}
                  <View style={styles.segmentedTabWrap}>
                    <TouchableOpacity
                      style={[styles.segmentedTabItem, noteEditorMode === 'edit' && styles.segmentedTabItemActive]}
                      onPress={() => setNoteEditorMode('edit')}
                    >
                      <Feather name="edit-2" size={11} color={noteEditorMode === 'edit' ? '#2563eb' : '#64748b'} />
                      <Text style={[styles.segmentedTabText, noteEditorMode === 'edit' && styles.segmentedTabTextActive]}>
                        Tulis
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.segmentedTabItem, noteEditorMode === 'preview' && styles.segmentedTabItemActive]}
                      onPress={() => setNoteEditorMode('preview')}
                    >
                      <Feather name="eye" size={11} color={noteEditorMode === 'preview' ? '#2563eb' : '#64748b'} />
                      <Text style={[styles.segmentedTabText, noteEditorMode === 'preview' && styles.segmentedTabTextActive]}>
                        Preview
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {isRefiningAi ? (
                <View style={styles.aiShimmerContainer}>
                  <View style={styles.aiShimmerCard}>
                    {/* Point 1 Shimmer */}
                    <View style={styles.aiShimmerPointRow}>
                      <SkeletonBlock width={26} height={26} borderRadius={13} />
                      <View style={{ flex: 1, gap: 6 }}>
                        <SkeletonBlock width="70%" height={15} />
                        <SkeletonBlock width="100%" height={12} />
                        <SkeletonBlock width="85%" height={12} />
                      </View>
                    </View>
                    {/* Point 2 Shimmer */}
                    <View style={styles.aiShimmerPointRow}>
                      <SkeletonBlock width={26} height={26} borderRadius={13} />
                      <View style={{ flex: 1, gap: 6 }}>
                        <SkeletonBlock width="60%" height={15} />
                        <SkeletonBlock width="95%" height={12} />
                        <SkeletonBlock width="75%" height={12} />
                      </View>
                    </View>
                    {/* Point 3 Shimmer */}
                    <View style={styles.aiShimmerPointRow}>
                      <SkeletonBlock width={26} height={26} borderRadius={13} />
                      <View style={{ flex: 1, gap: 6 }}>
                        <SkeletonBlock width="80%" height={15} />
                        <SkeletonBlock width="90%" height={12} />
                      </View>
                    </View>
                    {/* Point 4 Shimmer */}
                    <View style={styles.aiShimmerPointRow}>
                      <SkeletonBlock width={26} height={26} borderRadius={13} />
                      <View style={{ flex: 1, gap: 6 }}>
                        <SkeletonBlock width="55%" height={15} />
                        <SkeletonBlock width="88%" height={12} />
                      </View>
                    </View>
                  </View>
                </View>
              ) : noteEditorMode === 'edit' ? (
                <TextInput
                  placeholder="Tuliskan catatan, hasil meeting, atau daftar revisi mentah di sini... Lalu tekan tombol AI di atas untuk merapikan otomatis!"
                  placeholderTextColor="#94a3b8"
                  style={styles.modalContentInput}
                  value={noteContent}
                  onChangeText={setNoteContent}
                  multiline={true}
                  textAlignVertical="top"
                  scrollEnabled={false}
                  onFocus={() => {
                    setTimeout(() => {
                      noteScrollRef.current?.scrollToEnd({ animated: true });
                    }, 250);
                  }}
                />
              ) : (
                <View style={styles.previewContainerBox}>
                  <NotePreviewContent
                    content={noteContent}
                    title={noteTitle}
                    category={noteCategory}
                    projectName={noteProjectId ? projects.find((p) => p.id === noteProjectId)?.name : null}
                    onSwitchToEdit={() => setNoteEditorMode('edit')}
                  />
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setNoteModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveNote} style={styles.modalSaveBtn}>
                <Text style={styles.modalSaveText}>
                  {editingNote ? 'Simpan Perubahan' : 'Buat Catatan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ================================================================= */}
      {/* MODAL TASK (CREATE / EDIT TUGAS LENGKAP DENGAN LIVE SEARCH PROYEK)*/}
      {/* ================================================================= */}
      <Modal
        visible={taskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTaskModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setTaskModalVisible(false)}
          />
          <View
            style={[
              styles.modalContainer,
              Platform.OS === 'ios' && keyboardHeight > 0 && { marginBottom: keyboardHeight },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {keyboardHeight > 0 && (
                  <TouchableOpacity
                    onPress={() => Keyboard.dismiss()}
                    style={styles.keyboardDismissBtn}
                    activeOpacity={0.7}
                  >
                    <Feather name="chevron-down" size={14} color="#2563eb" />
                    <Text style={styles.keyboardDismissBtnText}>Tutup Keyboard</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setTaskModalVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="x" size={22} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              ref={taskScrollRef}
              style={styles.modalBody}
              contentContainerStyle={{ paddingBottom: 32 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={true}
            >
              {/* Judul Tugas */}
              <Text style={styles.modalLabel}>Judul Tugas *</Text>
              <TextInput
                placeholder="Contoh: Perbaiki validasi input pada form login..."
                placeholderTextColor="#94a3b8"
                style={styles.modalInput}
                value={taskFormTitle}
                onChangeText={setTaskFormTitle}
                autoFocus={true}
              />

              {/* Proyek Terkait (LIVE SEARCH) */}
              <Text style={styles.modalLabel}>Proyek Terkait</Text>
              <TouchableOpacity
                style={styles.selectTriggerBtn}
                onPress={() => openProjectPicker('task_modal')}
                activeOpacity={0.75}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Feather name="folder" size={16} color="#6366f1" />
                  <Text style={styles.selectTriggerText} numberOfLines={1}>
                    {taskFormProjectId
                      ? (projects.find((p) => p.id === taskFormProjectId)?.name || 'Proyek Terpilih')
                      : 'Tanpa Proyek (Tugas Umum)'}
                  </Text>
                </View>
                <View style={styles.selectTriggerRight}>
                  <Text style={styles.selectTriggerActionText}>Pilih / Cari</Text>
                  <Feather name="chevron-down" size={16} color="#64748b" />
                </View>
              </TouchableOpacity>

              {/* Tingkat Prioritas */}
              <Text style={styles.modalLabel}>Prioritas Tugas</Text>
              <View style={styles.modalCategoryRow}>
                {['Low', 'Medium', 'High', 'Urgent'].map((pri) => (
                  <TouchableOpacity
                    key={pri}
                    onPress={() => setTaskFormPriority(pri)}
                    style={[
                      styles.modalCatChip,
                      taskFormPriority === pri && styles.modalCatChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalCatText,
                        taskFormPriority === pri && styles.modalCatTextActive,
                      ]}
                    >
                      {pri}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Status Tugas (jika sedang edit) */}
              {editingTask && (
                <>
                  <Text style={styles.modalLabel}>Status Pengerjaan</Text>
                  <View style={styles.modalCategoryRow}>
                    {[
                      { key: 'todo', label: 'Antrean (To Do)' },
                      { key: 'in_progress', label: 'Dikerjakan' },
                      { key: 'completed', label: 'Selesai' },
                    ].map((st) => (
                      <TouchableOpacity
                        key={st.key}
                        onPress={() => setTaskFormStatus(st.key)}
                        style={[
                          styles.modalCatChip,
                          taskFormStatus === st.key && styles.modalCatChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalCatText,
                            taskFormStatus === st.key && styles.modalCatTextActive,
                          ]}
                        >
                          {st.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Deskripsi Tambahan */}
              <Text style={styles.modalLabel}>Catatan / Deskripsi Tambahan (Opsional)</Text>
              <TextInput
                placeholder="Rincian sub-poin tugas atau keterangan tambahan..."
                placeholderTextColor="#94a3b8"
                style={styles.modalContentInput}
                value={taskFormDescription}
                onChangeText={setTaskFormDescription}
                multiline={true}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setTaskModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveTask} style={styles.modalSaveBtn}>
                <Text style={styles.modalSaveText}>
                  {editingTask ? 'Simpan Perubahan' : 'Tambah Tugas'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>


      {/* ================================================================= */}
      {/* MODAL KIRIM KE TASKS (PARSED CHECKLIST ITEMS DENGAN SELEKSI)      */}
      {/* ================================================================= */}
      <Modal
        visible={sendTasksModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSendTasksModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setSendTasksModalVisible(false)}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.modalTitle}>Kirim Poin ke Tasks</Text>
                <Text style={styles.modalSubtitle}>Pilih poin revisi yang ingin dijadikan tugas resmi</Text>
              </View>
              <TouchableOpacity onPress={() => setSendTasksModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={{ paddingBottom: 32 }}
              showsVerticalScrollIndicator={true}
            >
              {/* TARGET PROYEK */}
              <Text style={styles.modalLabel}>Proyek Tujuan</Text>
              <TouchableOpacity
                style={styles.selectTriggerBtn}
                onPress={() => openProjectPicker('sendTasks')}
                activeOpacity={0.75}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Feather name="folder" size={16} color="#6366f1" />
                  <Text style={styles.selectTriggerText} numberOfLines={1}>
                    {sendTasksProjectId
                      ? (projects.find((p) => p.id === sendTasksProjectId)?.name || 'Proyek Terpilih')
                      : 'Tanpa Proyek (Tugas Umum)'}
                  </Text>
                </View>
                <View style={styles.selectTriggerRight}>
                  <Text style={styles.selectTriggerActionText}>Ubah Proyek</Text>
                  <Feather name="chevron-down" size={16} color="#64748b" />
                </View>
              </TouchableOpacity>

              {/* TIPE & PRIORITAS TUGAS */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Tipe Tugas</Text>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {[
                      { key: 'revision', label: 'Revisi' },
                      { key: 'feature', label: 'Fitur' },
                      { key: 'technical', label: 'Teknis' },
                    ].map((t) => (
                      <TouchableOpacity
                        key={t.key}
                        onPress={() => setSendTasksType(t.key)}
                        style={[
                          styles.sendTasksOptionChip,
                          sendTasksType === t.key && styles.sendTasksOptionChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.sendTasksOptionText,
                            sendTasksType === t.key && styles.sendTasksOptionTextActive,
                          ]}
                        >
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Prioritas</Text>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {['Low', 'Medium', 'High'].map((p) => (
                      <TouchableOpacity
                        key={p}
                        onPress={() => setSendTasksPriority(p)}
                        style={[
                          styles.sendTasksOptionChip,
                          sendTasksPriority === p && styles.sendTasksOptionChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.sendTasksOptionText,
                            sendTasksPriority === p && styles.sendTasksOptionTextActive,
                          ]}
                        >
                          {p}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* SELECTION ACTION BAR (PILIH SEMUA / BATAL PILIH) */}
              <View style={styles.sendTasksBarRow}>
                <Text style={styles.sendTasksBarCountText}>
                  Terpilih: <Text style={{ color: '#2563eb', fontWeight: '800' }}>{parsedTasks.filter((t) => t.selected).length}</Text> dari {parsedTasks.length} poin
                </Text>

                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity
                    onPress={() => selectAllParsedTasks(true)}
                    style={styles.sendTasksSelectAllBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sendTasksSelectAllText}>Pilih Semua</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => selectAllParsedTasks(false)}
                    style={styles.sendTasksDeselectBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sendTasksDeselectText}>Batal Pilih</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* LIST CHECKBOX TUGAS */}
              <View style={{ gap: 10 }}>
                {parsedTasks.map((item, idx) => (
                  <TouchableOpacity
                    key={item.id || idx}
                    onPress={() => toggleParsedTaskSelection(idx)}
                    style={[
                      styles.sendTaskCardItem,
                      item.selected && styles.sendTaskCardItemActive,
                    ]}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.sendTaskCheckbox,
                        item.selected && styles.sendTaskCheckboxChecked,
                      ]}
                    >
                      {item.selected && (
                        <Feather name="check" size={13} color="#ffffff" />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.sendTaskItemTitle,
                          item.selected && styles.sendTaskItemTitleActive,
                        ]}
                      >
                        {item.title}
                      </Text>
                      {item.description ? (
                        <Text style={styles.sendTaskItemDesc} numberOfLines={3}>
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setSendTasksModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={executeSendTasks}
                disabled={isSendingTasks || parsedTasks.filter((t) => t.selected).length === 0}
                style={[
                  styles.modalSaveBtn,
                  (isSendingTasks || parsedTasks.filter((t) => t.selected).length === 0) && { opacity: 0.6 },
                ]}
              >
                {isSendingTasks ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Feather name="send" size={15} color="#ffffff" />
                )}
                <Text style={styles.modalSaveText}>
                  {isSendingTasks
                    ? 'Mengirim...'
                    : `Kirim (${parsedTasks.filter((t) => t.selected).length}) ke Tasks`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ================================================================= */}
      {/* MODAL LIVE SEARCH PILIH PROYEK (SAMA PERSIS UNTUK NOTES & TASKS)  */}
      {/* ================================================================= */}
      <Modal
        visible={projectPickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProjectPickerVisible(false)}
      >
        <SafeAreaView style={styles.pickerOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setProjectPickerVisible(false)}
          />
          <View
            style={[
              styles.pickerContainer,
              Platform.OS === 'ios' && keyboardHeight > 0 && { marginBottom: keyboardHeight },
            ]}
          >
            <View style={styles.pickerHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="folder" size={20} color="#2563eb" />
                <Text style={styles.pickerTitle}>
                  {projectPickerMode === 'filter'
                    ? 'Filter Berdasarkan Proyek'
                    : projectPickerMode === 'task'
                    ? 'Pilih Proyek untuk Tugas'
                    : 'Pilih Proyek Catatan'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setProjectPickerVisible(false)}
                style={styles.iconBtn}
              >
                <Feather name="x" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* LIVE SEARCH INPUT BAR */}
            <View style={styles.pickerSearchBar}>
              <Feather name="search" size={18} color="#2563eb" />
              <TextInput
                placeholder="Ketik nama proyek (live search)..."
                placeholderTextColor="#94a3b8"
                value={projectSearchQuery}
                onChangeText={setProjectSearchQuery}
                style={styles.pickerSearchInput}
                autoFocus={true}
                clearButtonMode="while-editing"
              />
              {projectSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setProjectSearchQuery('')}>
                  <Feather name="x-circle" size={18} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* LIST DAFTAR PROYEK */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* OPSI "SEMUA PROYEK" (HANYA MUNCUL DI MODE FILTER) */}
              {projectPickerMode === 'filter' && (
                <TouchableOpacity
                  style={[
                    styles.pickerOptionCard,
                    selectedProjectFilter === 'all' && styles.pickerOptionCardActive,
                  ]}
                  onPress={() => handleSelectProject('all')}
                  activeOpacity={0.7}
                >
                  <View style={styles.pickerOptionIconBox}>
                    <Feather
                      name="layers"
                      size={18}
                      color={selectedProjectFilter === 'all' ? '#2563eb' : '#64748b'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.pickerOptionTitle,
                        selectedProjectFilter === 'all' && styles.pickerOptionTitleActive,
                      ]}
                    >
                      Semua Proyek
                    </Text>
                    <Text style={styles.pickerOptionSubtitle}>
                      Tampilkan seluruh catatan & tugas
                    </Text>
                  </View>
                  {selectedProjectFilter === 'all' && (
                    <Feather name="check" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              )}

              {/* OPSI "TANPA PROYEK" */}
              <TouchableOpacity
                style={[
                  styles.pickerOptionCard,
                  getCurrentSelectedProjectId() === null && styles.pickerOptionCardActive,
                ]}
                onPress={() => handleSelectProject(null)}
                activeOpacity={0.7}
              >
                <View style={styles.pickerOptionIconBox}>
                  <Feather
                    name="file"
                    size={18}
                    color={getCurrentSelectedProjectId() === null ? '#2563eb' : '#64748b'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.pickerOptionTitle,
                      getCurrentSelectedProjectId() === null && styles.pickerOptionTitleActive,
                    ]}
                  >
                    Tanpa Proyek (Umum)
                  </Text>
                  <Text style={styles.pickerOptionSubtitle}>
                    Tidak terkait dengan proyek manapun
                  </Text>
                </View>
                {getCurrentSelectedProjectId() === null && (
                  <Feather name="check" size={20} color="#2563eb" />
                )}
              </TouchableOpacity>

              <View style={styles.pickerDividerRow}>
                <Text style={styles.pickerDividerText}>
                  PROYEK ({filteredProjectsList.length})
                </Text>
              </View>

              {filteredProjectsList.length === 0 ? (
                <View style={styles.pickerEmptyContainer}>
                  <Feather name="search" size={32} color="#cbd5e1" />
                  <Text style={styles.pickerEmptyTitle}>Proyek Tidak Ditemukan</Text>
                  <Text style={styles.pickerEmptySubtitle}>
                    Tidak ada proyek dengan kata kunci "{projectSearchQuery}".
                  </Text>
                </View>
              ) : (
                filteredProjectsList.map((proj) => {
                  const isSelected = Number(getCurrentSelectedProjectId()) === Number(proj.id);
                  return (
                    <TouchableOpacity
                      key={proj.id}
                      style={[
                        styles.pickerOptionCard,
                        isSelected && styles.pickerOptionCardActive,
                      ]}
                      onPress={() => handleSelectProject(proj.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.pickerOptionIconBox,
                          isSelected && { backgroundColor: '#dbeafe' },
                        ]}
                      >
                        <Feather
                          name="folder"
                          size={18}
                          color={isSelected ? '#2563eb' : '#4f46e5'}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.pickerOptionTitle,
                            isSelected && styles.pickerOptionTitleActive,
                          ]}
                        >
                          {proj.name}
                        </Text>
                        {proj.live_url ? (
                          <Text style={styles.pickerOptionSubtitle} numberOfLines={1}>
                            🌐 {proj.live_url}
                          </Text>
                        ) : null}
                      </View>
                      {isSelected && (
                        <Feather name="check" size={20} color="#2563eb" />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* MODAL URL HOSTING DINAMIS */}
      <Modal
        visible={hostModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setHostModalVisible(false)}
      >
        <View style={styles.hostModalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setHostModalVisible(false)}
          />
          <View style={styles.hostModalCard}>
            <View style={styles.hostModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="globe" size={18} color="#2563eb" />
                <Text style={styles.hostModalTitle}>URL Hosting API (Dinamis)</Text>
              </View>
              <TouchableOpacity onPress={() => setHostModalVisible(false)}>
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.hostModalDesc}>
              URL ini dipakai untuk memanggil fitur AI dan sinkronisasi web. Otomatis mengikuti perubahan di database/hosting ({autoDetectedHost}). Anda juga bisa mengetik URL hosting baru di bawah:
            </Text>

            <TextInput
              style={styles.hostInput}
              value={hostInput}
              onChangeText={setHostInput}
              placeholder="Contoh: https://biustechno.vercel.app"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              autoCorrect={false}
            />

            

            <View style={styles.hostModalActions}>
              <TouchableOpacity
                style={styles.hostResetBtn}
                onPress={() => {
                  setCustomHost('');
                  setHostInput('');
                  setHostModalVisible(false);
                  Alert.alert('Direset', `Kembali otomatis ke URL database: ${autoDetectedHost}`);
                }}
              >
                <Text style={styles.hostResetText}>Reset ke Database</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.hostSaveBtn}
                onPress={() => {
                  if (hostInput.trim()) {
                    let cleaned = hostInput.trim();
                    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
                      cleaned = 'https://' + cleaned;
                    }
                    cleaned = cleaned.replace(/\/$/, '');
                    setCustomHost(cleaned);
                    setHostModalVisible(false);
                    Alert.alert('Tersimpan', `URL Hosting AI aktif: ${cleaned}`);
                  } else {
                    setCustomHost('');
                    setHostModalVisible(false);
                  }
                }}
              >
                <Text style={styles.hostSaveText}>Terapkan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      

    </View>
  );
}

const styles = StyleSheet.create({
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  sendTasksOptionChip: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendTasksOptionChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  sendTasksOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  sendTasksOptionTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sendTasksBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendTasksBarCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  sendTasksSelectAllBtn: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  sendTasksSelectAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  sendTasksDeselectBtn: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendTasksDeselectText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  sendTaskCardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  sendTaskCardItemActive: {
    borderColor: '#93c5fd',
    backgroundColor: '#f0f7ff',
  },
  sendTaskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  sendTaskCheckboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  sendTaskItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  sendTaskItemTitleActive: {
    color: '#1d4ed8',
  },
  sendTaskItemDesc: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },

  // AI REFINE SHIMMER SKELETON STYLES
  aiShimmerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    minHeight: 240,
  },
  aiShimmerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  aiShimmerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  aiShimmerCard: {
    gap: 12,
  },
  aiShimmerPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },

  keyboardDismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  keyboardDismissBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563eb',
  },


  // TOOLBAR & PREVIEW STYLES
  modalLabelNoMargin: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  editorToolbarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 8,
  },
  editorToolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolbarSendTasksBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  toolbarSendTasksText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  segmentedTabWrap: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  segmentedTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  segmentedTabItemActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentedTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  segmentedTabTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },

  // PREVIEW CONTAINER STYLES
  previewContainerBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    minHeight: 220,
    paddingBottom: 6,
  },
  previewEditCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#93c5fd',
    borderStyle: 'dashed',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 14,
  },
  previewEditCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
  },
  previewScroll: {
    padding: 12,
  },
  previewHeaderCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  previewTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  previewBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  previewContentCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewPointBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  previewPointNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  previewPointNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  previewBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 6,
    marginBottom: 6,
  },
  previewBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
    marginTop: 7,
  },
  previewLineText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
  },
  previewHeadingText: {
    fontWeight: '700',
    color: '#0f172a',
  },
  previewBoldText: {
    fontWeight: '700',
    color: '#0f172a',
  },
  previewEmptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  previewEmptySub: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },

  // CARD QUICK SEND BUTTON
  cardSendTasksBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  cardSendTasksText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563eb',
  },

  // SEND TASKS MODAL STYLES
  miniOptionRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  miniChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  miniChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  miniChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  miniChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  tasksHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  tasksHeaderBarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  selectToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563eb',
  },
  parsedTaskItemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  parsedTaskItemCardSelected: {
    borderColor: '#93c5fd',
    backgroundColor: '#eff6ff',
  },
  parsedTaskCheckbox: {
    marginTop: 1,
  },
  parsedTaskTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 2,
  },
  parsedTaskTitleSelected: {
    color: '#1e3a8a',
    fontWeight: '700',
  },
  parsedTaskDesc: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },

  safeArea: {
    flex: 1,
    height: Platform.OS === 'web' ? '100vh' : '100%',
    maxHeight: Platform.OS === 'web' ? '100vh' : '100%',
    backgroundColor: '#ffffff',
    paddingTop: 0,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  loadingSplashContainer: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSplashCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  splashBrandTagline: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 22,
    letterSpacing: 0.3,
  },
  loadingLogoImage: {
    width: 295,
    height: 125,
  },
  loadingSpinnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  loadingSpinnerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  loadingSplashFooter: {
    paddingBottom: 20,
  },
  loadingFooterBrand: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoEmblem: {
    width: 56,
    height: 38,
  },
  headerBrandTextWrap: {
    justifyContent: 'center',
  },
  headerBrandTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0e6d8e',
    letterSpacing: 0.5,
    lineHeight: 21,
  },
  headerBrandSubtitle: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.7,
    marginTop: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 4,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  globalProjectFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 8,
  },
  globalProjectFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 6,
    maxWidth: '85%',
  },
  globalProjectFilterBtnActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  globalProjectFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  globalProjectFilterTextActive: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  clearFilterBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    minHeight: 0,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    padding: 0,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 150 : 110,
    gap: 12,
  },
  noteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  noteCardPinned: {
    borderColor: '#93c5fd',
    backgroundColor: '#f0f7ff',
  },
  noteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteCategoryBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  noteCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338ca',
  },
  noteProjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  noteProjectText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    maxWidth: 120,
  },
  noteActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 5,
  },
  noteCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    lineHeight: 22,
  },
  noteCardContent: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 10,
  },
  noteCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  noteDateText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  quickTaskContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
  },
  quickTaskBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickTaskInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    paddingVertical: 4,
  },
  quickTaskBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  taskProjectSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 5,
    maxWidth: '45%',
  },
  taskProjectSelectorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  taskPriChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  taskPriChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  taskPriChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  taskPriChipTextActive: {
    color: '#ffffff',
  },
  taskFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  taskFilterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  taskFilterBtnActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  taskFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  taskFilterTextActive: {
    color: '#ffffff',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  taskCardDone: {
    backgroundColor: '#f8fafc',
    borderColor: '#f1f5f9',
    opacity: 0.75,
  },
  taskCheckboxBtn: {
    padding: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  taskProjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  taskProjectBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    maxWidth: 110,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  priorityUrgent: { backgroundColor: '#fee2e2' },
  priorityHigh: { backgroundColor: '#fee2e2' },
  priorityMedium: { backgroundColor: '#fef3c7' },
  priorityLow: { backgroundColor: '#f1f5f9' },
  priorityText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  priorityTextUrgent: { color: '#b91c1c' },
  priorityTextHigh: { color: '#b91c1c' },
  priorityTextMedium: { color: '#b45309' },
  priorityTextLow: { color: '#64748b' },
  taskDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  taskDateText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  dashboardScrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 140 : 100,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  heroDateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 3,
  },
  heroGreetingText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  heroSubText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 1,
  },
  statSubtextPositive: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
    marginTop: 2,
  },
  statSubtextNeutral: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  progressPercentText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563eb',
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  progressSubtext: {
    fontSize: 11,
    color: '#64748b',
  },
  dashboardActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  dashActionBtnNote: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  dashActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  dashActionBtnTask: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 6,
  },
  dashActionBtnTextTask: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  dashSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  dashSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  dashSectionLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  dashNoteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  dashNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dashNoteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  dashNoteContent: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
  },
  dashTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
    gap: 10,
  },
  dashTaskTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  dashTaskProject: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  dashEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 6,
  },
  dashEmptyText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 36 : 12,
    minHeight: Platform.OS === 'android' ? 84 : 64,
    zIndex: 99,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navItemActive: {},
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  navLabelActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  badgeCount: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  modalContainer: {
    zIndex: 2,
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  aiButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  selectTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
  },
  selectTriggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  selectTriggerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectTriggerActionText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  modalCategoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  modalCatChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalCatChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  modalCatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  modalCatTextActive: {
    color: '#ffffff',
  },
  pinToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 8,
    gap: 8,
  },
  pinToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  modalContentInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
    minHeight: 180,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  modalSaveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    zIndex: 2,
    height: '75%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  pickerSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 10,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    padding: 0,
  },
  pickerOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginBottom: 8,
    gap: 12,
  },
  pickerOptionCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  pickerOptionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  pickerOptionTitleActive: {
    color: '#1d4ed8',
  },
  pickerOptionSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  pickerDividerRow: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  pickerDividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  pickerEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  pickerEmptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  pickerEmptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  hostModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  hostModalCard: {
    zIndex: 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  hostModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hostModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  hostModalDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 14,
  },
  hostInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 16,
  },
  hostModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  hostResetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  hostResetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  hostSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  hostSaveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  masukTasksPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#d1fae5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  masukTasksPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065f46',
  },
  noteTasksBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  noteTasksBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  editorTasksNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  editorTasksNoticeIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorTasksNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065f46',
  },
  editorTasksNoticeSub: {
    fontSize: 10,
    color: '#047857',
    marginTop: 1,
  },
  alreadyInTasksBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#d1fae5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  alreadyInTasksText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065f46',
  },
  notInTasksBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: '#f1f5f9',
  },
  notInTasksText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
});
