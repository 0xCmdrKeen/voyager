import { IonIcon, IonItem, IonSpinner, useIonViewDidEnter } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../store";
import Stats from "./Stats";
import styled from "@emotion/styled";
import Embed from "../shared/Embed";
import Comments, { CommentsHandle } from "../../comment/Comments";
import Markdown from "../../shared/Markdown";
import PostActions from "../actions/PostActions";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { findLoneImage } from "../../../helpers/markdown";
import { setPostRead } from "../postSlice";
import { maxWidthCss } from "../../shared/AppContent";
import PersonLink from "../../labels/links/PersonLink";
import { CommentSortType, PostView } from "lemmy-js-client";
import ViewAllComments from "./ViewAllComments";
import InlineMarkdown from "../../shared/InlineMarkdown";
import { megaphone } from "ionicons/icons";
import CommunityLink from "../../labels/links/CommunityLink";
import { css } from "@emotion/react";
import Nsfw, { isNsfw } from "../../labels/Nsfw";
import { PageContext } from "../../auth/PageContext";
import PostMedia from "../../gallery/PostMedia";
import { scrollIntoView } from "../../../helpers/dom";
import JumpFab from "../../comment/JumpFab";
import { OTapToCollapseType } from "../../../services/db";
import Locked from "./Locked";
import useAppToast from "../../../helpers/useAppToast";
import { postLocked } from "../../../helpers/toastMessages";
import { isUrlMedia } from "../../../helpers/url";
import ModeratableItem, {
  ModeratableItemBannerOutlet,
} from "../../moderation/ModeratableItem";

const BorderlessIonItem = styled(IonItem)`
  --padding-start: 0;
  --inner-padding-end: 0;

  --inner-border-width: 0 0 1px 0;
  --background: none; // TODO is this OK?

  ${maxWidthCss}
`;

export const CenteredSpinner = styled(IonSpinner)`
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const Container = styled.div`
  width: 100%;
`;

const lightboxCss = css`
  width: 100%;
  max-height: 50vh;
  object-fit: contain;
  background: var(--lightroom-bg);
`;

const LightboxPostMedia = styled(PostMedia)`
  -webkit-touch-callout: default;

  ${lightboxCss}
`;

const StyledMarkdown = styled(Markdown)`
  margin: 12px 0;

  img {
    display: block;
    max-width: 100%;
    max-height: 50vh;
    object-fit: contain;
    object-position: 0%;
  }
`;

const StyledEmbed = styled(Embed)`
  margin: 12px 0;
`;

const PostDeets = styled.div`
  margin: 12px;
  font-size: 0.9375em;

  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Title = styled.div`
  font-size: 1.125rem;
  margin-bottom: 12px;
`;

const By = styled.div`
  font-size: 0.875em;

  margin-bottom: 5px;
  color: var(--ion-color-text-aside);

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const AnnouncementIcon = styled(IonIcon)`
  font-size: 1.1rem;
  margin-right: 5px;
  vertical-align: middle;
  color: var(--ion-color-success);
`;

interface PostDetailProps {
  post: PostView;
  sort: CommentSortType;

  commentPath: string | undefined;
  threadCommentId: string | undefined;
}

export default function PostDetail({
  post,
  sort,
  commentPath,
  threadCommentId,
}: PostDetailProps) {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useAppDispatch();
  const markdownLoneImage = useMemo(
    () => (post?.post.body ? findLoneImage(post.post.body) : undefined),
    [post],
  );
  const { showJumpButton, jumpButtonPosition } = useAppSelector(
    (state) => state.settings.general.comments,
  );
  const titleRef = useRef<HTMLDivElement>(null);
  const { presentLoginIfNeeded, presentCommentReply } = useContext(PageContext);
  const [ionViewEntered, setIonViewEntered] = useState(false);
  const commentsRef = useRef<CommentsHandle>(null);
  const { tapToCollapse } = useAppSelector(
    (state) => state.settings.general.comments,
  );
  const presentToast = useAppToast();

  const [viewAllCommentsSpace, setViewAllCommentsSpace] = useState(70); // px

  // Avoid rerender from marking a post as read until the page
  // has fully transitioned in.
  // This keeps the page transition as performant as possible
  useEffect(() => {
    if (!post || !ionViewEntered) return;

    dispatch(setPostRead(+post.post.id));
  }, [post, ionViewEntered, dispatch]);

  useIonViewDidEnter(() => {
    setIonViewEntered(true);
  });

  useEffect(() => {
    if (!titleRef.current) return;

    scrollIntoView(titleRef.current);
  }, [collapsed]);

  const onHeight = useCallback(
    (height: number) => setViewAllCommentsSpace(height),
    [],
  );

  const renderMedia = useCallback(() => {
    if (!post) return;

    if ((post.post.url && isUrlMedia(post.post.url)) || markdownLoneImage) {
      return <LightboxPostMedia post={post} controls />;
    }
  }, [markdownLoneImage, post]);

  const renderText = useCallback(() => {
    if (!post) return;

    const usedLoneImage =
      markdownLoneImage && (!post.post.url || !isUrlMedia(post.post.url));

    if (post.post.body && !usedLoneImage) {
      return (
        <>
          {post.post.url && !isUrlMedia(post.post.url) && <Embed post={post} />}
          <StyledMarkdown>{post.post.body}</StyledMarkdown>
        </>
      );
    }

    if (post.post.url && !isUrlMedia(post.post.url)) {
      return <StyledEmbed post={post} />;
    }
  }, [markdownLoneImage, post]);

  const renderHeader = useCallback(
    (post: PostView) => {
      return (
        <ModeratableItem itemView={post}>
          <BorderlessIonItem
            onClick={(e) => {
              if (e.target instanceof HTMLElement && e.target.nodeName === "A")
                return;

              if (
                tapToCollapse === OTapToCollapseType.Neither ||
                tapToCollapse === OTapToCollapseType.OnlyComments
              )
                return;

              setCollapsed(!collapsed);
            }}
          >
            <Container>
              <div onClick={(e) => e.stopPropagation()}>{renderMedia()}</div>
              <PostDeets>
                <ModeratableItemBannerOutlet />
                <div>
                  <Title ref={titleRef}>
                    <InlineMarkdown>{post.post.name}</InlineMarkdown>{" "}
                    {isNsfw(post) && <Nsfw />}
                  </Title>
                  {!collapsed && renderText()}
                  <By>
                    {post.post.featured_community ||
                    post.post.featured_local ? (
                      <AnnouncementIcon icon={megaphone} />
                    ) : undefined}
                    <CommunityLink
                      community={post.community}
                      showInstanceWhenRemote
                      subscribed={post.subscribed}
                    />{" "}
                    <PersonLink person={post.creator} prefix="by" />
                  </By>
                  <Stats post={post} />
                  {post.post.locked && <Locked />}
                </div>
              </PostDeets>
            </Container>
          </BorderlessIonItem>
          <BorderlessIonItem>
            <PostActions
              post={post}
              onReply={async () => {
                if (presentLoginIfNeeded()) return;
                if (post.post.locked) {
                  presentToast(postLocked);
                  return;
                }

                const reply = await presentCommentReply(post);

                if (reply) commentsRef.current?.prependComments([reply]);
              }}
            />
          </BorderlessIonItem>
        </ModeratableItem>
      );
    },
    [
      collapsed,
      presentCommentReply,
      presentLoginIfNeeded,
      presentToast,
      renderMedia,
      renderText,
      tapToCollapse,
    ],
  );

  const bottomPadding: number = (() => {
    if (commentPath) return viewAllCommentsSpace + 12;

    if (
      showJumpButton &&
      (jumpButtonPosition === "left-bottom" ||
        jumpButtonPosition === "center" ||
        jumpButtonPosition === "right-bottom")
    )
      return 75;

    return 0;
  })();

  return (
    <>
      <Comments
        ref={commentsRef}
        header={renderHeader(post)}
        postId={post.post.id}
        commentPath={commentPath}
        threadCommentId={threadCommentId}
        sort={sort}
        bottomPadding={bottomPadding}
      />
      {commentPath && <ViewAllComments onHeight={onHeight} />}
      {!commentPath && showJumpButton && <JumpFab />}
    </>
  );
}
