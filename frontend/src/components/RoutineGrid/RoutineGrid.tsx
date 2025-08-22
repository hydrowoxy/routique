"use client";

import styles from "./RoutineGrid.module.scss";
import RoutineCard from "@/components/RoutineCard/RoutineCard";
import CategoryCard from "@/components/CategoryCard/CategoryCard";
import NothingHere from "@/components/NothingHere/NothingHere";
import { CATEGORIES } from "@/lib/categories";
import type { Category } from "@/lib/categories";

type RoutineWithProfile = {
  id: string;
  title: string;
  description: string;
  image_path: string;
  favourite_count: number;
  view_count: number;
  user_id: string;
  category: string;
  profiles?: { username: string } | null;
};

export default function RoutineGrid({
  routines,
  showUsernames = true,
  showCategoryCards = false,
  currentCategory = null,
  onCategorySelect,
}: {
  routines: RoutineWithProfile[];
  showUsernames?: boolean;
  showCategoryCards?: boolean;
  currentCategory?: string | null;
  onCategorySelect?: (category: Category) => void;
}) {
  if (routines.length === 0) {
    return <NothingHere message="Oops! Empty shelf…" />;
  }

  // DEFAULT BEHAVIOR: Simple grid (used everywhere except explore)
  if (!showCategoryCards) {
    return (
      <div className={styles.grid}>
        {routines.map((routine) => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            username={routine.profiles?.username ?? undefined} 
            showUsername={showUsernames}                       
          />
        ))}
      </div>
    );
  }

  // EXPLORE-ONLY BEHAVIOR: Mixed grid with category cards
  const availableCategories = CATEGORIES.filter(cat => 
    currentCategory === "All" || cat !== currentCategory
  );

  const routinesByCategory = routines.reduce((acc, routine) => {
    const category = routine.category || 'All';
    if (!acc[category]) acc[category] = [];
    acc[category].push(routine);
    return acc;
  }, {} as Record<string, RoutineWithProfile[]>);

  const gridItems = [];
  let categoryIndex = 0;
  let nextCategoryPosition = Math.floor(Math.random() * 3) + 3; // Random between 3-5
  
  for (let i = 0; i < routines.length; i++) {
    gridItems.push(
      <RoutineCard
        key={routines[i].id}
        routine={routines[i]}
        username={routines[i].profiles?.username ?? undefined}
        showUsername={showUsernames}
      />
    );

    // Check if we should add a category card at this position
    const shouldAddCategory = (i + 1) === nextCategoryPosition && 
                             categoryIndex < availableCategories.length;

    if (shouldAddCategory) {
      const category = availableCategories[categoryIndex] as Category;
      const categoryRoutines = routinesByCategory[category] || routines.slice(0, 3);
      
      gridItems.push(
        <CategoryCard
          key={`category-${category}-${i}`}
          category={category}
          routines={categoryRoutines}
          onCategorySelect={onCategorySelect}
        />
      );
      
      categoryIndex++;
      // Set next random position (4-7 items from current position)
      nextCategoryPosition = (i + 1) + Math.floor(Math.random() * 4) + 4;
    }
  }

  return <div className={styles.grid}>{gridItems}</div>;
}
