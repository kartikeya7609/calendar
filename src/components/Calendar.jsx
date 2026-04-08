import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import CalendarGrid from './CalendarGrid';
import NotesPanel from './NotesPanel';
import StickyNote from './StickyNote';
import { useCalendar } from '../hooks/useCalendar';

const _imgModules = import.meta.glob('../assets/*.jpg', {
  eager: true,
  import: 'default'
});

const MONTH_IMAGES = Object.entries(_imgModules)
  .sort(([a], [b]) => {
    const numA = parseInt(a.match(/(\d+)/)?.[1] ?? '0', 10);
    const numB = parseInt(b.match(/(\d+)/)?.[1] ?? '0', 10);
    return numA - numB;
  })
  .map(([, mod]) => mod);

export default function Calendar() {
  const {
    currentDate,
    selectionStart,
    selectionEnd,
    hoverDate,
    isDark,
    toggleTheme,
    changeMonth,
    handleDayClick,
    handleDayHover,
    clearHover,
    animationClass,
    notesKey,
    notesTitle,
    stickyState,
    openSticky,
    closeSticky,
    allNotes,
    refreshNotes,
    eventsArr,
    addEvent,
    deleteEvent,
    jumpToToday,
    gotoDate
  } = useCalendar();

  const [isImageLoading, setIsImageLoading] = useState(true);

  // Reset loading state when the month changes
  useEffect(() => {
    setIsImageLoading(true);
  }, [currentDate]);

  const monthImage =
    MONTH_IMAGES[currentDate.getMonth() % (MONTH_IMAGES.length || 1)];

  console.log("Found Images:", MONTH_IMAGES.length);
  console.log("Current Path:", monthImage);

  return (
    <div className="calendar-wrapper">
      <div className="calendar-container">
        <div className="calendar-top">
          <div className="spirals">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="spiral"></div>
            ))}
          </div>

          <div className="image-inset">
            {/* 1. Texture Overlay: Adds a physical "paper/grain" feel over the JPG */}
            <div className="image-overlay"></div>

            {/* 2. Loading Spinner: Subtle and skeuomorphic */}
            {isImageLoading && <div className="image-loader-sheen"></div>}

            <div
              className={`hero-image ${animationClass} ${isImageLoading ? 'image-blur' : 'image-clear'}`}
              id="heroImage"
              style={{
                backgroundImage: monthImage ? `url(${monthImage})` : 'none',
                opacity: isImageLoading ? 0.8 : 1,
                transition: 'background-image 0.5s ease-in-out,  0.3s ease-in-out'
              }}
            >
              {/* TRUTH SERUM: If the background above fails, this standard img tag proves if the path is valid */}
              {!isImageLoading && monthImage && (
                <img
                  src={monthImage}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 1 }}
                />
              )}

              {/* Hidden img tag to trigger the onLoad event for the background image */}
              <img
                src={monthImage}
                style={{ display: 'none' }}
                onLoad={() => setIsImageLoading(false)}
                alt=""
              />
            </div>

            <div className={`month-hero-title ${animationClass}`}>
              {format(currentDate, 'MMMM')}
            </div>
          </div>
        </div>

        <div className="calendar-bottom">
          <CalendarGrid
            currentDate={currentDate}
            selectionStart={selectionStart}
            selectionEnd={selectionEnd}
            hoverDate={hoverDate}
            onDayClick={handleDayClick}
            onDayHover={handleDayHover}
            onRightClick={openSticky}
            onMouseLeaveGrid={clearHover}
            onPrevMonth={() => changeMonth('prev')}
            onNextMonth={() => changeMonth('next')}
            animationClass={animationClass}
            allNotes={allNotes}
            eventsArr={eventsArr}
            onGotoDate={gotoDate}
            onJumpToday={jumpToToday}
          />
          <NotesPanel
            activeDate={selectionStart || currentDate}
            eventsArr={eventsArr}
            onAddEvent={addEvent}
            onDeleteEvent={deleteEvent}
            refreshNotes={refreshNotes}
          />
        </div>
      </div>

      {stickyState.date && (
        <StickyNote
          date={stickyState.date}
          rangeEnd={stickyState.rangeEnd}
          x={stickyState.x}
          y={stickyState.y}
          onClose={closeSticky}
          refreshNotes={refreshNotes}
        />
      )}

      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
        {isDark ? (
          <svg className="moon-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
        ) : (
          <svg className="sun-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
        )}
      </button>
    </div>
  );
}
