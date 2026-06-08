"use client";

import { createContext, useContext } from "react";

type NavContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const NavContext = createContext<NavContextType>({
  open: false,
  setOpen: () => {},
});

export function useNav() {
  return useContext(NavContext);
}
