import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

const RevealOnScroll = ({
  children,
  className = "",
  delay = 0,
  distance = 24,
  duration = 700,
  threshold = 0.14,
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${isVisible ? "is-visible" : ""} ${className}`.trim()}
      style={{
        "--reveal-delay": `${delay}ms`,
        "--reveal-distance": `${distance}px`,
        "--reveal-duration": `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

RevealOnScroll.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
  distance: PropTypes.number,
  duration: PropTypes.number,
  threshold: PropTypes.number,
};

export default RevealOnScroll;
