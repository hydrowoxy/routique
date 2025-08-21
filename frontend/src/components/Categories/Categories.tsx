"use client";

import styles from "./Categories.module.scss";

type Props = {
  tabs: string[];
  selectedTab: string;
  onTabSelect: (tab: string) => void;
};

export default function Categories({ tabs, selectedTab, onTabSelect }: Props) {
  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabSelect(tab)}
          className={selectedTab === tab ? styles.activeTab : styles.tab}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
