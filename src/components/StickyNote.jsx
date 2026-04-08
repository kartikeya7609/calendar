import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { format, addDays } from 'date-fns';

export default function StickyNote({ date, rangeEnd, x, y, onClose, refreshNotes }) {
  const [note, setNote] = useState('');
  const [animClass, setAnimClass] = useState('sticky-anim-enter');
  const stickyRef = useRef(null);
  const [pos, setPos] = useState({ x, y });

  const isRange = rangeEnd && rangeEnd.getTime() !== date.getTime();

  // Build list of all dates in range (or just single date)
  const getAllDates = () => {
    if (!isRange) return [date];
    const dates = [];
    let cur = date;
    while (cur.getTime() <= rangeEnd.getTime()) {
      dates.push(cur);
      cur = addDays(cur, 1);
    }
    return dates;
  };

  // For loading: use start date's key (shared note for the range)
  const primaryKey = isRange
    ? `range_${format(date, 'yyyy-MM-dd')}_${format(rangeEnd, 'yyyy-MM-dd')}`
    : `date_${format(date, 'yyyy-MM-dd')}`;

  useEffect(() => {
    const saved = localStorage.getItem('calendar_notes');
    const all = saved ? JSON.parse(saved) : {};
    setNote(all[primaryKey] || '');
  }, [primaryKey]);

  useLayoutEffect(() => {
    if (stickyRef.current) {
      const stickyRect = stickyRef.current.getBoundingClientRect();
      const containerRect = document.querySelector('.calendar-bottom').getBoundingClientRect();

      let newX = x;
      let newY = y;
      const margin = 15;
      const containerMiddleX = containerRect.left + containerRect.width / 2;

      newX = x > containerMiddleX
        ? x - stickyRect.width - margin
        : x + margin;

      if (newX < containerRect.left + margin) newX = containerRect.left + margin;
      else if (newX + stickyRect.width > containerRect.right - margin)
        newX = containerRect.right - stickyRect.width - margin;

      if (newY + stickyRect.height > containerRect.bottom - margin)
        newY = containerRect.bottom - stickyRect.height - margin;
      if (newY < containerRect.top + margin) newY = containerRect.top + margin;

      setPos({ x: newX, y: newY });
      setTimeout(() => setAnimClass('sticky-anim-stable'), 200);
    }
  }, [x, y]);

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setNote(newNote);

    const saved = localStorage.getItem('calendar_notes');
    const all = saved ? JSON.parse(saved) : {};

    if (isRange) {
      // Write note to the range key AND to each individual date
      all[primaryKey] = newNote;
      getAllDates().forEach(d => {
        all[`date_${format(d, 'yyyy-MM-dd')}`] = newNote;
      });
    } else {
      all[primaryKey] = newNote;
    }

    localStorage.setItem('calendar_notes', JSON.stringify(all));
    if (refreshNotes) refreshNotes();
  };

  const handleClose = () => {
    setAnimClass('sticky-anim-exit');
    setTimeout(() => onClose(), 200);
  };

  const headerLabel = isRange
    ? `${format(date, 'MMM d')} – ${format(rangeEnd, 'MMM d, yyyy')}`
    : format(date, 'MMM d, yyyy');

  const subLabel = isRange
    ? `Applies to ${getAllDates().length} days`
    : null;

  return (
    <>
      <div
        className="sticky-overlay"
        onMouseDown={handleClose}
        onContextMenu={(e) => { e.preventDefault(); handleClose(); }}
      />
      <div
        ref={stickyRef}
        className={`sticky-note-popup ${animClass}`}
        style={{ left: pos.x, top: pos.y }}
      >
        <div className="pushpin"></div>
        <button className="sticky-close" onClick={handleClose} aria-label="Close Note">×</button>
        <div className="sticky-header">{headerLabel}</div>
        {subLabel && <div className="sticky-sublabel">{subLabel}</div>}
        <textarea
          className="sticky-textarea"
          value={note}
          onChange={handleNoteChange}
          placeholder="Write your note..."
          autoFocus
        />
      </div>
    </>
  );
}
