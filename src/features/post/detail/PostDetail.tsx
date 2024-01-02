import { useIonViewDidEnter } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../store";
import Comments, { CommentsHandle } from "../../comment/Comments";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { CommentSortType, CommentView, PostView } from "lemmy-js-client";
import ViewAllComments from "./ViewAllComments";
import JumpFab from "../../comment/JumpFab";
import PostHeader from "./PostHeader";
import { setPostRead } from "../postSlice";

interface PostDetailProps {
  post: PostView;
  sort: CommentSortType;

  commentPath: string | undefined;
  threadCommentId: string | undefined;
  commentMatch?: CommentView;
}

export default forwardRef<CommentsHandle, PostDetailProps>(function PostDetail(
  { post, sort, commentPath, threadCommentId, commentMatch },
  commentsRef,
) {
  const dispatch = useAppDispatch();
  const { showJumpButton, jumpButtonPosition } = useAppSelector(
    (state) => state.settings.general.comments,
  );
  const [ionViewEntered, setIonViewEntered] = useState(false);
  // const commentsRef = useRef<CommentsHandle>(null);

  const [viewAllCommentsSpace, setViewAllCommentsSpace] = useState(70); // px

  // Avoid rerender from marking a post as read until the page
  // has fully transitioned in.
  // This keeps the page transition as performant as possible
  useEffect(() => {
    if (!post || !ionViewEntered) return;

    dispatch(setPostRead(post.post.id));
  }, [post, ionViewEntered, dispatch]);

  useIonViewDidEnter(() => {
    setIonViewEntered(true);
  });

  const onHeight = useCallback(
    (height: number) => setViewAllCommentsSpace(height),
    [],
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
        header={
          <PostHeader
            post={post}
            onPrependComment={(comment) =>
              commentsRef &&
              "current" in commentsRef &&
              commentsRef.current?.prependComments([comment])
            }
          />
        }
        postId={post.post.id}
        commentPath={commentPath}
        commentMatch={commentMatch}
        threadCommentId={threadCommentId}
        sort={sort}
        bottomPadding={bottomPadding}
      />
      {commentPath && <ViewAllComments onHeight={onHeight} />}
      {!commentPath && showJumpButton && <JumpFab />}
    </>
  );
});
