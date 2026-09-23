import React, { useEffect, useState } from "react";

interface IconifyIconProps {
  icon: string; // e.g. 'lucide:laptop', 'mdi:shoe-sneaker', 'ri:shirt-line'
  className?: string;
  size?: number;
  color?: string;
}

export const IconifyIcon: React.FC<IconifyIconProps> = ({
  icon,
  className = "w-5 h-5",
  size = 20,
  color = "currentColor",
}) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    if (!icon) return;
    let isMounted = true;
    const parts = icon.includes(":") ? icon.split(":") : ["lucide", icon];
    const prefix = parts[0];
    const name = parts[1];

    fetch(
      `https://api.iconify.design/${prefix}/${name}.svg?color=${encodeURIComponent(color)}`,
    )
      .then((res) => {
        if (!res.ok) throw new Error("Icon not found");
        return res.text();
      })
      .then((svg) => {
        if (isMounted) {
          // ensure svg scales nicely
          const cleanSvg = svg.replace(
            /<svg /,
            `<svg width="${size}" height="${size}" class="${className}" fill="currentColor" `,
          );
          setSvgContent(cleanSvg);
        }
      })
      .catch(() => {
        if (isMounted) {
          // Fallback simple circle icon if fetch fails or offline
          setSvgContent(
            `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>`,
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [icon, color, size, className]);

  if (!svgContent) {
    return (
      <span
        style={{ width: size, height: size }}
        className={`inline-block animate-pulse bg-current opacity-20 rounded ${className}`}
      />
    );
  }

  return (
    <span
      dangerouslySetInnerHTML={{ __html: svgContent }}
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size, color }}
    />
  );
};
