import React, { useState } from 'react';
import { format } from 'date-fns';
import { getDaysInView } from '../utils/dateUtils';
import DateCell from './DateCell';

export default function CalendarGrid({ 
  currentDate, 
  selectionStart, 
  selectionEnd, 
  hoverDate,
  onDayClick,
  onDayHover,
  onMouseLeaveGrid,
  onPrevMonth,
  onNextMonth,
  animationClass,
  onRightClick,
  allNotes,
  eventsArr,
  onGotoDate,
  onJumpToday
}) {
  const daysInView = getDaysInView(currentDate);
  const [gotoVal, setGotoVal] = useState('');
  const [gotoError, setGotoError] = useState(false);

  const handleGoto = () => {
    const [m, y] = gotoVal.split('/');
    const mNum = Number(m);
    const yNum = Number(y);
    if (m && y && y.length === 4 && mNum >= 1 && mNum <= 12 && yNum > 1900) {
      onGotoDate(mNum, yNum);
      setGotoVal('');
      setGotoError(false);
    } else {
      setGotoError(true);
      setTimeout(() => setGotoError(false), 1500);
    }
  };

  const handleGotoInput = (e) => {
    let val = e.target.value.replace(/[^0-9/]/g, '');
    if (val.length === 2 && !val.includes('/') && gotoVal.length < 2) val += '/';
    if (val.length > 7) val = val.slice(0, 7);
    setGotoVal(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleGoto();
  };

  return (
    <>
      {/* Month Header */}
      <div className="calendar-header">
        <button className="nav-btn" onClick={onPrevMonth} aria-label="Previous Month">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h1 className="current-month-year">{format(currentDate, 'MMMM yyyy')}</h1>
        <button className="nav-btn" onClick={onNextMonth} aria-label="Next Month">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* Navigate / Today Controls */}
      <div className="calendar-controls">
        <button className="today-btn" onClick={onJumpToday}>Today</button>
        <div className={`date-input-wrapper ${gotoError ? 'goto-error' : ''}`}>
          <span className="goto-label">Go to</span>
          <input
            type="text"
            className="date-input"
            placeholder="mm/yyyy"
            maxLength="7"
            value={gotoVal}
            onChange={handleGotoInput}
            onKeyDown={handleKeyDown}
          />
          <button className="goto-btn" onClick={handleGoto} title="Press Enter or click">
            <span>↵</span> Enter
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className={`calendar-grid ${animationClass}`}>
        <div className="weekdays">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div className="days" onMouseLeave={onMouseLeaveGrid}>
          {daysInView.map((dayInfo, index) => (
            <DateCell 
              key={index}
              dayInfo={dayInfo}
              selectionStart={selectionStart}
              selectionEnd={selectionEnd}
              hoverDate={hoverDate}
              onClick={onDayClick}
              onHover={onDayHover}
              onRightClick={onRightClick}
              allNotes={allNotes}
              eventsArr={eventsArr}
            />
          ))}
        </div>
      </div>
    </>
  );
}
