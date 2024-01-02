import { Comment, Post } from "lemmy-js-client";
import { useContext, useMemo } from "react";
import CommentMarkdown from "./CommentMarkdown";
import CommentLinks from "./links/CommentLinks";
import { useAppSelector } from "../../store";
import { IonIcon } from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import styled from "@emotion/styled";
import { CommentSearchContext } from "./CommentSearchContext";

const TrashIconContainer = styled.span`
  padding-inline-start: 0.4em;
  vertical-align: middle;
`;

interface CommentContentProps {
  item: Comment | Post;
  showTouchFriendlyLinks?: boolean;
  isMod?: boolean;
}

export default function CommentContent({
  item,
  isMod,
  showTouchFriendlyLinks = true,
}: CommentContentProps) {
  const touchFriendlyLinks = useAppSelector(
    (state) => state.settings.general.comments.touchFriendlyLinks,
  );
  const { query } = useContext(CommentSearchContext);

  const content = useMemo(() => {
    if (item.deleted)
      return (
        <p>
          <i>deleted by creator</i>
          <TrashIconContainer>
            <IonIcon icon={trashOutline} />
          </TrashIconContainer>
        </p>
      );
    if (item.removed && !isMod)
      return (
        <p>
          <i>removed by moderator</i>
          <TrashIconContainer>
            <IonIcon icon={trashOutline} />
          </TrashIconContainer>
        </p>
      );

    const markdown = "content" in item ? item.content : item.body ?? item.name;

    return (
      <>
        <CommentMarkdown>
          {query
            ? markdown.replaceAll(new RegExp(query, "gi"), "<mark>$&</mark>")
            : markdown}
        </CommentMarkdown>
        {showTouchFriendlyLinks && touchFriendlyLinks && (
          <CommentLinks markdown={markdown} />
        )}
      </>
    );
  }, [item, showTouchFriendlyLinks, touchFriendlyLinks, isMod, query]);

  return content;
}
