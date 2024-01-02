import React, { SetStateAction, createContext, useState } from "react";
import { CommentView } from "lemmy-js-client";

type CommentSearchContext = {
  query: string;
  setQuery: React.Dispatch<SetStateAction<string>>;
  matches: CommentView[];
  setMatches: React.Dispatch<SetStateAction<CommentView[]>>;
  currentMatch: number;
  setCurrentMatch: React.Dispatch<SetStateAction<number>>;
};

export const CommentSearchContext = createContext<CommentSearchContext>({
  query: "",
  setQuery: () => {},
  matches: [],
  setMatches: () => {},
  currentMatch: 0,
  setCurrentMatch: () => {},
});

interface CommentSearchProviderProps {
  children: React.ReactNode;
}

export function CommentSearchProvider({
  children,
}: CommentSearchProviderProps) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<CommentView[]>([]);
  const [currentMatch, setCurrentMatch] = useState(0);

  return (
    <CommentSearchContext.Provider
      value={{
        query,
        setQuery,
        matches,
        setMatches,
        currentMatch,
        setCurrentMatch,
      }}
    >
      {children}
    </CommentSearchContext.Provider>
  );
}
