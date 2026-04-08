import React, { useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { holidays } from '../utils/dateUtils';

const LONG_PRESS_MS = 500; // ms before long-press fires

export default function DateCell({ 
  dayInfo, 
  selectionStart, 
  selectionEnd, 
  hoverDate, 
  onClick, 
  onHover,
  onRightClick,
  allNotes,
  eventsArr
}) {
  const { dateObj, timestamp, dayNum, isToday, isCurrentMonth } = dayInfo;
  
  const monthIndex = dateObj.getMonth();
  const dayOfMonth = dateObj.getDate();
  const holidayEmoji = holidays[`${monthIndex}-${dayOfMonth}`];

  // ── Long-press / double-click tracking ──────────────────────
  const longPressTimer = useRef(null);
  const touchStartPos = useRef(null);
  const didLongPress = useRef(false);

  const triggerSticky = useCallback((clientX, clientY) => {
    // If a range is fully selected, the long-press/right-click represents the whole range
    // Pass the cell's date — the hook itself reads selectionStart/End to build the range
    onRightClick(dateObj, clientX, clientY);
  }, [dateObj, onRightClick]);

  // Touch start → begin long-press countdown
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    didLongPress.current = false;

    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      // Vibrate for tactile feedback (most Android devices)
      if (navigator.vibrate) navigator.vibrate(60);
      // Provide visual pulse feedback via class
      triggerSticky(touch.clientX, touch.clientY);
    }, LONG_PRESS_MS);
  };

  // If finger moves too much, cancel long press
  const handleTouchMove = (e) => {
    if (!touchStartPos.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);
    if (dx > 8 || dy > 8) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer.current);
    touchStartPos.current = null;
  };

  // Double-click (for mouse users on mobile emulators / trackpads)
  const lastClickTime = useRef(0);
  const handleClick = (e) => {
    if (didLongPress.current) {
      didLongPress.current = false;
      return; // don't also fire click after long press
    }
    const now = Date.now();
    if (now - lastClickTime.current < 300) {
      // Double-click — open sticky
      triggerSticky(e.clientX, e.clientY);
      lastClickTime.current = 0;
    } else {
      lastClickTime.current = now;
      onClick(dateObj);
    }
  };

  // Desktop right-click
  const handleContextMenu = (e) => {
    e.preventDefault();
    triggerSticky(e.clientX, e.clientY);
  };

  // ── Range class building ─────────────────────────────────────
  let classNames = ['day'];
  if (isToday) classNames.push('today');
  if (!isCurrentMonth) classNames.push('other-month');

  if (selectionStart) {
    const sTime = selectionStart.getTime();
    if (selectionEnd) {
      const eTime = selectionEnd.getTime();
      if (timestamp === sTime) classNames.push('range-start');
      if (timestamp === eTime) classNames.push('range-end');
      if (timestamp > sTime && timestamp < eTime) classNames.push('in-range');
    } else if (hoverDate) {
      const hTime = hoverDate.getTime();
      const minTime = Math.min(sTime, hTime);
      const maxTime = Math.max(sTime, hTime);
      if (timestamp === sTime) classNames.push(sTime === minTime ? 'range-start' : 'range-end');
      if (timestamp === hTime && timestamp !== sTime) classNames.push(hTime === maxTime ? 'range-hover-end' : 'range-hover-start');
      if (timestamp > minTime && timestamp < maxTime) classNames.push('in-hover-range');
    } else {
      if (timestamp === sTime) classNames.push('range-start');
    }
  }

  // ── Indicators ───────────────────────────────────────────────
  const notesKey = `date_${format(dateObj, 'yyyy-MM-dd')}`;
  const cellNote = allNotes?.[notesKey];
  const hasNote = cellNote && cellNote.trim() !== '';

  const d = dateObj.getDate();
  const m = dateObj.getMonth() + 1;
  const y = dateObj.getFullYear();
  const todaysEvObj = (eventsArr || []).find(e => e.day === d && e.month === m && e.year === y);
  const eventCount = todaysEvObj ? todaysEvObj.events.length : 0;
  const hasEvents = eventCount > 0;

  return (
    <div 
      className={classNames.join(' ')} 
      onClick={handleClick}
      onMouseEnter={() => onHover(dateObj)}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {holidayEmoji && <span className="holiday-marker">{holidayEmoji}</span>}
      <span className="date-num">{dayNum}</span>

      {/* Emoji-only indicators */}
      {(hasNote || hasEvents) && (
        <div className="cell-indicators">
          {hasNote && <span className="cell-emoji" title={cellNote}>📝</span>}
          {hasEvents && (
            <span className="cell-emoji" title={`${eventCount} event${eventCount > 1 ? 's' : ''}`}>
              📌{eventCount > 1 && <sup>{eventCount}</sup>}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
