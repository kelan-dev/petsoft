"use client";

import React, { createContext, useContext, useState } from "react";

type TSearchContext = {
  searchTerm: string;
  handleSetSearchTerm: (term: string) => void;
};

type SearchContextProviderProps = {
  children: React.ReactNode;
};

export const SearchContext = createContext<TSearchContext | null>(null);

export default function SearchContextProvider({
  children,
}: SearchContextProviderProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  function handleSetSearchTerm(term: string) {
    setSearchTerm(term);
  }

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        handleSetSearchTerm,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
