import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../store";
import { useParams } from "react-router";
import styled from "@emotion/styled";
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getPost } from "../../features/post/postSlice";
import AppBackButton from "../../features/shared/AppBackButton";
import { CommentSortType } from "lemmy-js-client";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import CommentSort from "../../features/comment/CommentSort";
import MoreActions from "../../features/post/shared/MoreActions";
import PostDetail from "../../features/post/detail/PostDetail";
import FeedContent from "../shared/FeedContent";
import useClient from "../../helpers/useClient";
import { formatNumber } from "../../helpers/number";
import MoreModActions from "../../features/post/shared/MoreModAction";
import { useSetActivePage } from "../../features/auth/AppContext";
import { useRef } from "react";
import {
  chevronBackOutline,
  chevronForwardOutline,
  closeOutline,
} from "ionicons/icons";
import {
  CommentSearchContext,
  CommentSearchProvider,
} from "../../features/comment/CommentSearchContext";

export const CenteredSpinner = styled(IonSpinner)`
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

export const AnnouncementIcon = styled(IonIcon)`
  font-size: 1.1rem;
  margin-right: 5px;
  vertical-align: middle;
  color: var(--ion-color-success);
`;

const StyledIonToolbar = styled(IonToolbar)`
  ion-searchbar {
    padding-bottom: 1px;
  }

  ion-buttons {
    align-self: center;
  }
`;

interface PostPageParams {
  id: string;
  commentPath?: string;
  community: string;
  threadCommentId?: string; // For continuing threads
}

export default function PostPage() {
  const { id, commentPath, community, threadCommentId } =
    useParams<PostPageParams>();

  return (
    <CommentSearchProvider>
      <PostPageContent
        id={id}
        commentPath={commentPath}
        community={community}
        threadCommentId={threadCommentId}
      />
    </CommentSearchProvider>
  );
}

const PostPageContent = memo(function PostPageContent({
  id,
  commentPath,
  community,
  threadCommentId,
}: PostPageParams) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const post = useAppSelector((state) => state.post.postById[id]);
  const client = useClient();
  const dispatch = useAppDispatch();
  const defaultSort = useAppSelector(
    (state) => state.settings.general.comments.sort,
  );
  const [sort, setSort] = useState<CommentSortType>(defaultSort);
  const postDeletedById = useAppSelector((state) => state.post.postDeletedById);
  const [searchOpen, setSearchOpen] = useState(false);
  const {
    query,
    setQuery,
    matches,
    setMatches,
    currentMatch,
    setCurrentMatch,
  } = useContext(CommentSearchContext);
  // eslint-disable-next-line no-undef
  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

  const postIfFound = typeof post === "object" ? post : undefined;

  const pageRef = useRef<HTMLElement>(null);
  const virtualEnabled = postDetailPageHasVirtualScrollEnabled(
    commentPath,
    threadCommentId,
  );

  // TODO This is gets quite hacky when dynamically using virtual scroll view.
  // pageRef should probably be refactored
  useSetActivePage(pageRef, !virtualEnabled);
  const Content = virtualEnabled ? FeedContent : IonContent;

  useEffect(() => {
    if (post) return;

    dispatch(getPost(+id));
  }, [post, client, dispatch, id]);

  const refresh = useCallback(
    async (event: RefresherCustomEvent) => {
      try {
        await dispatch(getPost(+id));
      } finally {
        event.detail.complete();
      }
    },
    [dispatch, id],
  );

  const buildWithRefresher = useCallback(
    (content: React.ReactNode) => {
      return (
        <>
          <IonRefresher slot="fixed" onIonRefresh={refresh}>
            <IonRefresherContent />
          </IonRefresher>
          {content}
        </>
      );
    },
    [refresh],
  );

  function renderPost() {
    if (!post) return <CenteredSpinner />;
    if (
      post === "not-found" || // 404 from lemmy
      post.post.deleted || // post marked deleted from lemmy
      postDeletedById[post.post.id] // deleted by user recently
    )
      return buildWithRefresher(
        <div className="ion-padding ion-text-center">Post not found</div>,
      );

    return (
      <PostDetail
        post={post}
        sort={sort}
        commentPath={commentPath}
        threadCommentId={threadCommentId}
      />
    );
  }

  const presentSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchbarRef.current?.setFocus(), 100);
  }, [searchbarRef]);

  const updateSearchQuery = (query: string) => {
    setQuery(query);
    setCurrentMatch(0);
  };

  const dismissSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setMatches([]);
  };

  const title = (() => {
    if (threadCommentId) return "Thread";

    return (
      <>
        {postIfFound ? formatNumber(postIfFound.counts.comments) : ""} Comments
      </>
    );
  })();

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <AppBackButton
              defaultHref={buildGeneralBrowseLink(`/c/${community}`)}
              defaultText={postIfFound?.community.name}
            />
          </IonButtons>
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="end">
            {postIfFound && <MoreModActions post={postIfFound} />}
            <CommentSort sort={sort} setSort={setSort} />
            {postIfFound && (
              <MoreActions
                post={postIfFound}
                onDidDismiss={(e) => {
                  if (e.detail.data === "search") presentSearch();
                }}
              />
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <Content>{renderPost()}</Content>
      <IonFooter>
        {searchOpen && (
          <StyledIonToolbar>
            <IonSearchbar
              placeholder="Search comments"
              showClearButton="focus"
              onIonInput={(e) => updateSearchQuery(e.detail.value ?? "")}
              value={query}
              enterkeyhint="search"
              ref={searchbarRef}
            />
            <IonButtons slot="end">
              <IonButton
                disabled={currentMatch === 0}
                onClick={() => setCurrentMatch((i) => i - 1)}
              >
                <IonIcon icon={chevronBackOutline} />
              </IonButton>
              <IonButton
                disabled={currentMatch >= matches.length - 1}
                onClick={() => setCurrentMatch((i) => i + 1)}
              >
                <IonIcon icon={chevronForwardOutline} />
              </IonButton>
              <IonButton onClick={dismissSearch}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </StyledIonToolbar>
        )}
      </IonFooter>
    </IonPage>
  );
});

export function postDetailPageHasVirtualScrollEnabled(
  commentPath: string | undefined,
  threadCommentId: string | undefined,
): boolean {
  return !commentPath && !threadCommentId;
}
