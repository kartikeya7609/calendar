import React, { useState } from 'react';
import { format } from 'date-fns';

export default function NotesPanel({ activeDate, eventsArr, onAddEvent, onDeleteEvent, refreshNotes }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');

  // Extract events for activeDate
  const d = activeDate.getDate();
  const m = activeDate.getMonth() + 1;
  const y = activeDate.getFullYear();
  const activeEvData = (eventsArr || []).find(e => e.day === d && e.month === m && e.year === y);
  const todaysEvents = activeEvData ? activeEvData.events : [];

  const handleTimeFormat = (val) => {
    let clean = val.replace(/[^0-9:]/g, "");
    if (clean.length === 2 && !clean.includes(':')) clean += ':';
    if (clean.length > 5) clean = clean.slice(0, 5);
    return clean;
  };

  const submitEvent = () => {
    if(!title || !timeFrom || !timeTo) {
      alert("Please fill all fields");
      return;
    }
    const [hF, mF] = timeFrom.split(':');
    const [hT, mT] = timeTo.split(':');
    if (!hF || !mF || !hT || !mT || Number(hF)>23 || Number(mF)>59 || Number(hT)>23 || Number(mT)>59) {
      alert("Invalid Time Format (HH:MM 24h)");
      return;
    }

    const convertTime = (time) => {
      let [timeHour, timeMin] = time.split(":");
      let timeFormat = Number(timeHour) >= 12 ? "PM" : "AM";
      timeHour = Number(timeHour) % 12 || 12;
      return `${timeHour}:${timeMin} ${timeFormat}`;
    };

    onAddEvent(activeDate, {
      title,
      time: `${convertTime(timeFrom)} - ${convertTime(timeTo)}`
    });
    
    setIsAdding(false);
    setTitle('');
    setTimeFrom('');
    setTimeTo('');
  };

  return (
    <div className="calendar-notes">
      <h3 className="notes-title">Agenda: {format(activeDate, 'MMMM d, yyyy')}</h3>
      
      <div className="events-list">
        {todaysEvents.length === 0 ? (
          <div className="no-event">Relax, nothing scheduled today ✦</div>
        ) : (
          todaysEvents.map((ev, idx) => (
            <div key={idx} className="event-item" onClick={() => {
              if (window.confirm("Delete this event?")) onDeleteEvent(activeDate, ev.title);
            }}>
              <div className="event-item-body">
                <div className="event-item-title">📌 {ev.title}</div>
                <div className="event-item-time">🕐 {ev.time}</div>
              </div>
              <span className="event-delete-hint">× delete</span>
            </div>
          ))
        )}
      </div>

      {!isAdding ? (
        <button className="add-event-btn-trigger" onClick={() => setIsAdding(true)}>+ Add Event</button>
      ) : (
        <div className="add-event-form">
           <input type="text" placeholder="Event Name" maxLength="60" value={title} onChange={e => setTitle(e.target.value)} className="event-input full" />
           <div className="time-inputs">
             <input type="text" placeholder="From (HH:MM)" value={timeFrom} onChange={e => setTimeFrom(handleTimeFormat(e.target.value))} className="event-input half" />
             <input type="text" placeholder="To (HH:MM)" value={timeTo} onChange={e => setTimeTo(handleTimeFormat(e.target.value))} className="event-input half" />
           </div>
           <div className="form-actions">
             <button onClick={submitEvent} className="submit-btn">Save Event</button>
             <button onClick={() => setIsAdding(false)} className="cancel-btn">Discard</button>
           </div>
        </div>
      )}
    </div>
  );
}
