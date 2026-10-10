import React, { useState } from 'react';
import { User, Post } from '../../types';
import { ComposerCollapsed } from './ComposerCollapsed';
import { ComposerExpanded } from './ComposerExpanded';

interface ComposerProps {
  currentUser: User | null;
  onPostSuccess: (newPost: Post) => void;
  isExpandedControlled?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  defaultTopic?: string;
}

export const Composer: React.FC<ComposerProps> = ({
  currentUser,
  onPostSuccess,
  isExpandedControlled,
  onExpandChange,
  defaultTopic,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);

  const isExpanded = isExpandedControlled !== undefined ? isExpandedControlled : internalExpanded;

  const handleExpand = () => {
    if (onExpandChange) onExpandChange(true);
    else setInternalExpanded(true);
  };

  const handleCollapse = () => {
    if (onExpandChange) onExpandChange(false);
    else setInternalExpanded(false);
  };

  const handleSuccess = (newPost: Post) => {
    onPostSuccess(newPost);
    handleCollapse();
  };

  if (isExpanded) {
    return (
      <ComposerExpanded
        currentUser={currentUser}
        onCollapse={handleCollapse}
        onPostSuccess={handleSuccess}
        initialTopic={defaultTopic}
      />
    );
  }

  return (
    <ComposerCollapsed
      currentUser={currentUser}
      onExpand={handleExpand}
    />
  );
};
