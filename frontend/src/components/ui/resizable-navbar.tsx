"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Package } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";

import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";


interface NavbarProps {
  children: React.ReactNode;
  className?: string;
  isHomePage?: boolean;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
  activePath?: string;
  visible?: boolean;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
  isHomePage?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
  isHomePage?: boolean;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className, isHomePage }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    // Visibilité pour le mode "Floating Pill"
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }

    // Cache au scroll bas, montre au scroll haut
    if (latest > 300 && latest > previous) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={{
        y: isHidden ? -100 : 0,
        opacity: isHidden ? 0 : 1,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn("fixed inset-x-0 top-0 z-50 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && typeof child.type !== "string"
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean; isHomePage?: boolean }>,
              { visible, isHomePage },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible, isHomePage }: NavBodyProps & { isHomePage?: boolean }) => {
  return (
    <motion.div
      animate={{
        width: visible ? "fit-content" : "100%",
        y: visible ? 20 : 0,
        backgroundColor: visible
          ? "rgba(0, 0, 0, 0.65)"
          : "transparent",
        backdropFilter: visible ? "blur(24px)" : "blur(0px)",
        borderRadius: visible ? "9999px" : "0px",
        paddingLeft: visible ? "20px" : "0px",
        paddingRight: visible ? "20px" : "0px",
        paddingTop: visible ? "8px" : "24px",
        paddingBottom: visible ? "8px" : "24px",
        boxShadow: visible
          ? "0 20px 40px rgba(0, 0, 0, 0.4), 0 1px 1px rgba(255, 255, 255, 0.1)"
          : "0 0px 0px rgba(0, 0, 0, 0)",
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 30,
        mass: 1,
      }}
      className={cn(
        "group/nav relative z-60 mx-auto hidden lg:flex flex-row items-center",
        isHomePage ? "is-home" : "not-home",
        visible
          ? "border border-white/10 is-visible"
          : "border-b border-transparent not-visible",
        className,
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && typeof child.type !== "string"
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean; isHomePage?: boolean }>,
              { visible, isHomePage },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavItems = ({ items, activePath, visible, isHomePage }: NavItemsProps & { isHomePage?: boolean }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex-1 flex items-center justify-center gap-1 mx-8 relative">
      {items.map((item, idx) => {
        const isActive = activePath === item.link;
        // Logique de couleur intelligente
        const useDarkText = visible || !isHomePage;

        return (
          <Link
            key={idx}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
            to={item.link}
            className={cn(
              "relative px-5 py-2 text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300",
              isActive 
                ? (useDarkText ? "text-primary" : "text-white")
                : (useDarkText ? "text-muted-foreground hover:text-foreground" : "text-white/60 hover:text-white")
            )}
          >
            {hovered === idx && (
              <motion.div
                layoutId="nav-hover"
                className={cn(
                  "absolute inset-0 rounded-full -z-10",
                  useDarkText ? "bg-accent/50" : "bg-white/10"
                )}
              />
            )}
            <span className="relative z-10">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

export const MobileNav = ({ children, className, visible, isHomePage }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(16px)" : "none",
        boxShadow: visible
          ? "0 20px 40px rgba(0, 0, 0, 0.4), 0 1px 1px rgba(255, 255, 255, 0.1)"
          : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "2rem" : "0px",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
        visible && "bg-black/80 backdrop-blur-md border border-white/10 shadow-xl",
        className,
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && typeof child.type !== "string"
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean; isHomePage?: boolean }>,
              { visible, isHomePage },
            )
          : child,
      )}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
  visible,
  isHomePage,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && typeof child.type !== "string"
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean; isHomePage?: boolean }>,
              { visible, isHomePage },
            )
          : child,
      )}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-3xl text-white"
        >
          {/* Header interne pour garder le logo et le bouton fermer en haut */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <NavbarLogo />
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              <IconX size={20} stroke={1.5} />
            </button>
          </div>

          <div className="flex flex-col h-full overflow-y-auto px-8 py-12">
            {children}
            
            {/* Footer du menu mobile - Signature Lux */}
            <div className="mt-auto pt-10 pb-6 border-t border-white/10 text-center">
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/50 mb-4">
                EventNest
              </p>
              <p className="text-xs font-serif italic text-white/40">
                L'art de vivre des moments d'exception.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return isOpen ? (
    <IconX className="text-foreground" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-foreground" onClick={onClick} />
  );
};

export const NavbarLogo = ({ visible, isHomePage }: { visible?: boolean, isHomePage?: boolean }) => {
  return (
    <Link to="/" className="flex items-center gap-3 group/logo py-2 shrink-0">
      <div className="flex flex-col -gap-1">
        <span className={cn(
          "font-serif text-2xl font-light tracking-tight transition-colors leading-none",
          (visible || !isHomePage) ? "text-white" : "text-white"
        )}>
          EventNest
        </span>
        <span className={cn(
          "text-[7px] font-bold tracking-[0.4em] uppercase opacity-60 transition-colors pl-0.5",
          (visible || !isHomePage) ? "text-white/60" : "text-white/60"
        )}>
          Collection Privée
        </span>
      </div>
    </Link>
  );
};

export const NavbarButton = ({
  href,
  to,
  as: Tag,
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  to?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<typeof Link>
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-4 py-2 rounded-md text-sm font-semibold relative cursor-pointer hover:-translate-y-0.5 transition-all duration-200 inline-block text-center flex items-center justify-center gap-2";

  const variantStyles = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border-none",
    secondary: "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
    dark: "bg-foreground text-background shadow-sm hover:bg-foreground/90",
    gradient:
      "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm",
  };

  // Determine which tag to use if 'as' is not provided
  const Component = Tag || (to ? Link : href ? "a" : "button");
  const linkProps = to ? { to } : href ? { href } : {};

  // Filter out props that shouldn't be passed to DOM elements or Link
  const cleanProps = { ...props } as Record<string, unknown>;
  delete cleanProps.visible;
  delete cleanProps.isHomePage;

  return (
    <Component
      className={cn(baseStyles, variantStyles[variant], className)}
      {...linkProps}
      {...cleanProps}
    >
      {children}
    </Component>
  );
};
