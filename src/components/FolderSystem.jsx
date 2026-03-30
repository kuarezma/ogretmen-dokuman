import React from 'react';
import { Folder, ChevronRight, ChevronLeft, Home as HomeIcon } from 'lucide-react';
import './FolderSystem.css';

const FolderSystem = ({ 
  folderLevel, 
  currentPath, 
  onGradeClick, 
  onLessonClick, 
  onCategoryClick, 
  onGoBack, 
  onReset,
  gradeLessons,
  docCategories
}) => {

  const renderBreadcrumb = () => (
    <div className="breadcrumb">
      <button onClick={onGoBack} className="breadcrumb-back">
        <ChevronLeft size={18} /> Geri
      </button>
      
      <button onClick={onReset} className="breadcrumb-home">
        <HomeIcon size={16} /> Ana Sayfa
      </button>
      
      {currentPath.grade && (
        <>
          <ChevronRight size={16} className="breadcrumb-sep" />
          <button 
            onClick={() => onGradeClick(currentPath.grade)} 
            className={`breadcrumb-item ${folderLevel === 1 ? 'active' : ''}`}
          >
            {currentPath.grade}
          </button>
        </>
      )}

      {currentPath.lesson && (
        <>
          <ChevronRight size={16} className="breadcrumb-sep" />
          <button 
            onClick={() => onLessonClick(currentPath.lesson)} 
            className={`breadcrumb-item ${folderLevel === 2 ? 'active' : ''}`}
          >
            {currentPath.lesson}
          </button>
        </>
      )}

      {currentPath.category && (
        <>
          <ChevronRight size={16} className="breadcrumb-sep" />
          <span className="breadcrumb-last">{currentPath.category}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="folder-system-container animate-fade-in">
      {folderLevel > 0 && renderBreadcrumb()}

      {/* LEVEL 1: Ders Klasörleri */}
      {folderLevel === 1 && currentPath.grade && (
        <section className="folder-level-section">
           <div className="folder-grid">
              {gradeLessons[currentPath.grade]?.map((lesson) => (
                <div 
                  key={lesson} 
                  onClick={() => onLessonClick(lesson)}
                  className="folder-card glass-panel hover-effect compact"
                >
                  <Folder size={32} className="folder-icon yellow" />
                  <h4>{lesson}</h4>
                </div>
              ))}
           </div>
        </section>
      )}

      {/* LEVEL 2: Belge Türleri Klasörleri */}
      {folderLevel === 2 && currentPath.lesson && (
        <section className="folder-level-section">
           <div className="folder-grid">
              {docCategories.map((cat) => (
                <div 
                  key={cat} 
                  onClick={() => onCategoryClick(cat)}
                  className="folder-card glass-panel hover-effect compact"
                >
                  <Folder size={32} className="folder-icon green" />
                  <h4>{cat}</h4>
                </div>
              ))}
           </div>
        </section>
      )}
    </div>
  );
};

export default React.memo(FolderSystem);
