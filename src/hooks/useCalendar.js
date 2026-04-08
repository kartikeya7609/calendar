import { useState, useEffect, useMemo, useCallback } from 'react';
import { addMonths, subMonths, format } from 'date-fns';

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  
  // Local Notes state
  const [allNotes, setAllNotes] = useState({});
  // Structured Events state
  const [eventsArr, setEventsArr] = useState([]);

  const loadLocalData = useCallback(() => {
    const savedNotes = localStorage.getItem('calendar_notes');
    if (savedNotes) {
      setAllNotes(JSON.parse(savedNotes));
    }
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      setEventsArr(JSON.parse(savedEvents));
    }
  }, []);

  useEffect(() => {
    loadLocalData();
  }, [loadLocalData]);

  // Sticky Note State
  const [stickyState, setStickyState] = useState({ date: null, rangeEnd: null, x: 0, y: 0 });
  
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(d => !d);

  const jumpToToday = () => {
    setCurrentDate(new Date());
    setSelectionStart(new Date()); // Make today active
    setSelectionEnd(null);
  };

  const gotoDate = (month, year) => {
    // month is 1-indexed here, so subtract 1
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
  };

  const addEvent = (activeDate, newEventObj) => {
    const day = activeDate.getDate();
    const month = activeDate.getMonth() + 1;
    const year = activeDate.getFullYear();
    
    let eventAdded = false;
    let updatedEvents = eventsArr.map(item => {
      if (item.day === day && item.month === month && item.year === year) {
        eventAdded = true;
        return { ...item, events: [...item.events, newEventObj] };
      }
      return item;
    });

    if (!eventAdded) {
      updatedEvents.push({ day, month, year, events: [newEventObj] });
    }
    
    setEventsArr(updatedEvents);
    localStorage.setItem("events", JSON.stringify(updatedEvents));
  };

  const deleteEvent = (activeDate, eventTitle) => {
    const day = activeDate.getDate();
    const month = activeDate.getMonth() + 1;
    const year = activeDate.getFullYear();

    let updatedEvents = eventsArr.map(item => {
      if (item.day === day && item.month === month && item.year === year) {
        const filtered = item.events.filter(e => e.title !== eventTitle);
        return { ...item, events: filtered };
      }
      return item;
    }).filter(item => item.events.length > 0);

    setEventsArr(updatedEvents);
    localStorage.setItem("events", JSON.stringify(updatedEvents));
  };

  const changeMonth = (direction) => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const outClass = direction === 'next' ? 'anim-slide-out-next' : 'anim-slide-out-prev';
    const inClass = direction === 'next' ? 'anim-slide-in-next' : 'anim-slide-in-prev';
    
    setAnimationClass(outClass);
    
    setTimeout(() => {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
      setAnimationClass(inClass);
      
      setTimeout(() => {
        setAnimationClass('');
        setIsAnimating(false);
      }, 300);
    }, 300);
  };

  const handleDayClick = (clickedDate) => {
    const time = clickedDate.getTime();
    if (selectionStart && !selectionEnd) {
      if (time < selectionStart.getTime()) {
        setSelectionEnd(selectionStart);
        setSelectionStart(clickedDate);
      } else {
        setSelectionEnd(clickedDate);
      }
      setHoverDate(null);
    } else {
      setSelectionStart(clickedDate);
      setSelectionEnd(null);
      setHoverDate(null);
    }
  };

  const handleDayHover = (date) => {
    if (selectionStart && !selectionEnd) {
      setHoverDate(date);
    }
  };

  const clearHover = () => {
    if (selectionStart && !selectionEnd) {
      setHoverDate(null);
    }
  };

  const openSticky = (date, x, y) => {
    // If a full range is selected, open a range-sticky for all those dates
    const rangeEnd = selectionStart && selectionEnd ? selectionEnd : null;
    const startDate = selectionStart && selectionEnd ? selectionStart : date;
    setStickyState({ date: startDate, rangeEnd, x, y });
  };

  const closeSticky = () => {
    setStickyState({ date: null, rangeEnd: null, x: 0, y: 0 });
  };

  const notesKey = useMemo(() => {
    if (selectionStart && selectionEnd) {
      return `range_${format(selectionStart, 'yyyy-MM-dd')}_${format(selectionEnd, 'yyyy-MM-dd')}`;
    } else if (selectionStart) {
      return `date_${format(selectionStart, 'yyyy-MM-dd')}`;
    } else {
      return `month_${format(currentDate, 'yyyy-MM')}`;
    }
  }, [selectionStart, selectionEnd, currentDate]);

  const notesTitle = useMemo(() => {
    if (selectionStart && selectionEnd) {
      return `Notes for Range (${format(selectionStart, 'MMM d')} - ${format(selectionEnd, 'MMM d')})`;
    } else if (selectionStart) {
      return `Notes for ${format(selectionStart, 'MMMM d, yyyy')}`;
    } else {
      return `${format(currentDate, 'MMMM yyyy')} General Notes`;
    }
  }, [selectionStart, selectionEnd, currentDate]);

  return {
    currentDate,
    selectionStart,
    selectionEnd,
    hoverDate,
    isAnimating,
    animationClass,
    isDark,
    toggleTheme,
    changeMonth,
    handleDayClick,
    handleDayHover,
    clearHover,
    notesKey,
    notesTitle,
    stickyState,
    openSticky,
    closeSticky,
    allNotes,
    refreshNotes: loadLocalData,
    eventsArr,
    addEvent,
    deleteEvent,
    jumpToToday,
    gotoDate
  };
}
