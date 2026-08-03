export const premiumEase = [0.16, 1, 0.3, 1];
export const premiumDuration = 1.2;

export const pageTransition = {
  initial: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -100 },
  transition: { duration: premiumDuration, ease: premiumEase },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: premiumDuration, ease: premiumEase },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -100 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: premiumDuration, ease: premiumEase },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: premiumDuration, ease: premiumEase },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: premiumDuration, ease: premiumEase },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: premiumDuration, ease: premiumEase },
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: premiumDuration, ease: premiumEase },
  },
};

export const hoverLift = {
  whileHover: { y: -4, scale: 1.02, transition: { duration: 0.4, ease: premiumEase } },
  whileTap: { scale: 0.98 },
};

export const cardHover = {
  whileHover: {
    y: -8,
    boxShadow: "0 24px 48px -8px rgba(1, 71, 46, 0.20)",
  },
  transition: { duration: 0.4, ease: premiumEase },
};
