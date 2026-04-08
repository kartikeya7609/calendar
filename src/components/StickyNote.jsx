import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { format } from 'date-fns';

export default function StickyNote({ date, x, y, onClose, refreshNotes }) {
  const [note, setNote] = useState('');
  const [animClass, setAnimClass] = useState('sticky-anim-enter');
  const stickyRef = useRef(null);
  const [pos, setPos] = useState({ x, y });

  const notesKey = `date_${format(date, 'yyyy-MM-dd')}`;

  // Load existing note
  useEffect(() => {
    const savedNotesJSON = localStorage.getItem('calendar_notes');
    const calendarNotes = savedNotesJSON ? JSON.parse(savedNotesJSON) : {};
    setNote(calendarNotes[notesKey] || '');
  }, [date, notesKey]);

  // Adjust for bounds collision on open
  useLayoutEffect(() => {
    if (stickyRef.current) {
      const stickyRect = stickyRef.current.getBoundingClientRect();
      const containerRect = document.querySelector('.calendar-bottom').getBoundingClientRect();
      
      let newX = x;
      let newY = y;
      const margin = 15;
      
      const containerMiddleX = containerRect.left + (containerRect.width / 2);
      
      // Flip left/right depending on click position
      if (x > containerMiddleX) {
        // Clicked right side -> show on left
        newX = x - stickyRect.width - margin;
      } else {
        // Clicked left side -> show on right
        newX = x + margin;
      }

      // Constrain strictly within calendar container X bounds
      if (newX < containerRect.left + margin) {
        newX = containerRect.left + margin;
      } else if (newX + stickyRect.width > containerRect.right - margin) {
        newX = containerRect.right - stickyRect.width - margin;
      }

      // Constrain strictly within calendar container Y bounds
      if (newY + stickyRect.height > containerRect.bottom - margin) {
        newY = containerRect.bottom - stickyRect.height - margin;
      }
      if (newY < containerRect.top + margin) {
        newY = containerRect.top + margin;
      }
      
      setPos({ x: newX, y: newY });
      
      // Let animation play
      setTimeout(() => setAnimClass('sticky-anim-stable'), 200);
    }
  }, [x, y]);

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setNote(newNote);
    
    const savedNotesJSON = localStorage.getItem('calendar_notes');
    const calendarNotes = savedNotesJSON ? JSON.parse(savedNotesJSON) : {};
    calendarNotes[notesKey] = newNote;
    localStorage.setItem('calendar_notes', JSON.stringify(calendarNotes));
    if (refreshNotes) refreshNotes();
  };

  const handleClose = () => {
    setAnimClass('sticky-anim-exit');
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <>
      <div className="sticky-overlay" onMouseDown={handleClose} onContextMenu={(e) => { e.preventDefault(); handleClose(); }} />
      <div 
        ref={stickyRef}
        className={`sticky-note-popup ${animClass}`} 
        style={{ left: pos.x, top: pos.y }}
      >
        <div className="pushpin"></div>
        <button className="sticky-close" onClick={handleClose} aria-label="Close Note">×</button>
        <div className="sticky-header">{format(date, 'MMM d, yyyy')}</div>
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
