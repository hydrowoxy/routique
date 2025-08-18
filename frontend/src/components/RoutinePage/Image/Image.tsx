import Image from "next/image";
import { supabase } from "@/lib/supabase";
import styles from "./Image.module.scss";

type Props = {
  image_path: string;
  alt?: string;
  variant?: "thumb" | "hero";
};

export default async function RoutineImage({ image_path, alt, variant = "thumb" }: Props) {
  if (!image_path) return null;
  const { data } = supabase.storage.from("routines").getPublicUrl(image_path);
  const url = data?.publicUrl;
  if (!url) return null;

  if (variant === "hero") {
    return (
      <figure className={styles.wrap}>
        <Image
          src={url}
          alt={alt ?? "Routine image"}
          fill
          sizes="(max-width: 480px) 92vw, (max-width: 1024px) 640px, 720px"
          className={styles.img}
          priority
          unoptimized
        />
      </figure>
    );
  }

  return (
    <figure className={styles.thumb}>
      <Image
        src={url}
        alt={alt ?? "Routine image"}
        fill
        sizes="(max-width: 480px) 72px, (max-width: 1024px) 96px, 120px"
        className={styles.img}
        priority
        unoptimized
      />
    </figure>
  );
}
