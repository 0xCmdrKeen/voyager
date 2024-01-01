import { useAppSelector } from "../../store";
import InAppExternalLink from "../shared/InAppExternalLink";
import Markdown from "../shared/Markdown";
import MarkdownImg from "../shared/MarkdownImg";
import rehypeRaw from "rehype-raw";

interface CommentMarkdownProps {
  children: string;
}

export default function CommentMarkdown({ children }: CommentMarkdownProps) {
  const { showCommentImages } = useAppSelector(
    (state) => state.settings.general.comments,
  );

  return (
    <Markdown
      components={{
        img: (props) =>
          !showCommentImages ? (
            <InAppExternalLink
              href={props.src}
              target="_blank"
              rel="noopener noreferrer"
            >
              {props.alt || "Image"}
            </InAppExternalLink>
          ) : (
            <MarkdownImg
              small
              onClick={(e) => e.stopPropagation()}
              {...props}
            />
          ),
      }}
      rehypePlugins={[[rehypeRaw, { passThrough: ["mark"] }]]}
    >
      {children}
    </Markdown>
  );
}
