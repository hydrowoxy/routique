"use client";

import { useRef } from 'react';
import styles from "./Categories.module.scss";

interface CategoriesProps {
  tabs: string[];
  selectedTab: string;
  onTabSelect: (tab: string) => void;
}

export default function Categories({ tabs, selectedTab, onTabSelect }: CategoriesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.arrow} onClick={scrollLeft}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 9L4.5 6L7.5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <div ref={scrollRef} className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${selectedTab === tab ? styles.active : ""}`}
            onClick={() => onTabSelect(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <button className={styles.arrow} onClick={scrollRight}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
