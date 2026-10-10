import React from 'react';

export interface LinkToken {
  type: 'text' | 'hashtag' | 'mention' | 'url';
  raw: string;
  href?: string;
  display?: string;
}

// Regex matching URLs, @mentions, and #hashtags
const TOKEN_REGEX = /(https?:\/\/[^\s<>()]+)|(@[a-zA-Z0-9_]{1,30})|(#[a-zA-Z0-9_\u00C0-\u024F]+)/g;

export function tokenizeText(input: string): LinkToken[] {
  if (!input) return [];
  const tokens: LinkToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_REGEX.exec(input)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        raw: input.slice(lastIndex, match.index),
      });
    }

    const [fullMatch, urlMatch, mentionMatch, hashtagMatch] = match;

    if (urlMatch) {
      // Clean trailing punctuation if accidentally captured
      const cleanUrl = urlMatch.replace(/[.,;!?)]+$/, '');
      const trailing = urlMatch.slice(cleanUrl.length);

      tokens.push({
        type: 'url',
        raw: cleanUrl,
        href: cleanUrl,
        display: cleanUrl.replace(/^https?:\/\/(www\.)?/, ''),
      });

      if (trailing) {
        tokens.push({
          type: 'text',
          raw: trailing,
        });
      }
    } else if (mentionMatch) {
      const handle = mentionMatch.slice(1);
      tokens.push({
        type: 'mention',
        raw: mentionMatch,
        href: `/u/${handle}`,
        display: mentionMatch,
      });
    } else if (hashtagMatch) {
      const tag = hashtagMatch.slice(1);
      tokens.push({
        type: 'hashtag',
        raw: hashtagMatch,
        href: `/search?q=%23${encodeURIComponent(tag)}`,
        display: hashtagMatch,
      });
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < input.length) {
    tokens.push({
      type: 'text',
      raw: input.slice(lastIndex),
    });
  }

  return tokens;
}

export function renderLinkifiedContent(
  text: string,
  onNavigate?: (href: string) => void
): React.ReactNode[] {
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    const tokens = tokenizeText(line);
    const lineNodes = tokens.map((tok, tokIdx) => {
      const key = `${lineIdx}-${tokIdx}`;
      if (tok.type === 'text') {
        return <React.Fragment key={key}>{tok.raw}</React.Fragment>;
      }
      if (tok.type === 'url') {
        return (
          <a
            key={key}
            href={tok.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[var(--accent)] hover:underline break-all"
          >
            {tok.display}
          </a>
        );
      }
      return (
        <a
          key={key}
          href={tok.href}
          onClick={(e) => {
            e.stopPropagation();
            if (onNavigate && tok.href) {
              e.preventDefault();
              onNavigate(tok.href);
            }
          }}
          className="text-[var(--accent)] hover:underline font-medium"
        >
          {tok.display}
        </a>
      );
    });

    return (
      <React.Fragment key={`line-${lineIdx}`}>
        {lineNodes}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}
