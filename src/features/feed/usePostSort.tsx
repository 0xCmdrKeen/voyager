import { SortType } from "lemmy-js-client";
import { Dispatch, SetStateAction, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCommunitySort } from "../community/communitySlice";

export default function usePostSort(
  community?: string,
): [SortType, Dispatch<SetStateAction<SortType>>] {
  const dispatch = useAppDispatch();
  const defaultSort = useAppSelector(
    (state) => state.settings.general.posts.sort,
  );
  const sortByHandle = useAppSelector((state) => state.community.sortByHandle);
  const sortBy = useState<SortType>(defaultSort);

  if (!community) return sortBy;

  const sort = sortByHandle[community] || defaultSort;
  // overload is necessary for type compatibility with `useState`
  const setSort = (value: SortType | ((prevState: SortType) => SortType)) => {
    value = typeof value === "function" ? value(sort) : value;
    return dispatch(setCommunitySort(community, value));
  };

  return [sort, setSort];
}
