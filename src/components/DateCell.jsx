import React from 'react';
import { format } from 'date-fns';
import { holidays } from '../utils/dateUtils';

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

  const handleContextMenu = (e) => {
    e.preventDefault();
    onRightClick(dateObj, e.clientX, e.clientY);
  };

  const notesKey = `date_${format(dateObj, 'yyyy-MM-dd')}`;
  const cellNote = allNotes?.[notesKey];

  // Daily Structured Events
  const cellDateStr = format(dateObj, 'yyyy-M-d');
  const d = dateObj.getDate();
  const m = dateObj.getMonth() + 1;
  const y = dateObj.getFullYear();
  
  const todaysEvObj = (eventsArr || []).find(e => e.day === d && e.month === m && e.year === y);
  const eventItems = todaysEvObj ? todaysEvObj.events : [];

  return (
    <div 
      className={classNames.join(' ')} 
      onClick={() => onClick(dateObj)}
      onMouseEnter={() => onHover(dateObj)}
      onContextMenu={handleContextMenu}
    >
      {holidayEmoji && <span className="holiday-marker">{holidayEmoji}</span>}
      <span className="date-num">{dayNum}</span>

      {/* Local Event Indicators & Notepads */}
      {(cellNote && cellNote.trim() !== '') || eventItems.length > 0 ? (
        <div className="remote-events">
            {cellNote && cellNote.trim() !== '' && (
              <span className="zoho-event" title={cellNote}>
                📝 {cellNote}
              </span>
            )}
            {eventItems.slice(0,2).map((evItem, idx) => (
              <span key={idx} className="zoho-event" title={evItem.title}>
                📌 {evItem.title}
              </span>
            ))}
            {eventItems.length > 2 && <span className="zoho-event-more">...</span>}
        </div>
      ) : null}
    </div>
  );
}
