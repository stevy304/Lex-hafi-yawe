import React from 'react';
import { Translations } from '../i18n/strings';

interface NewAccountRowProps {
  t: Translations;
  onCreateAccount?: () => void;
  onApplyAdvocate?: () => void;
}

export const NewAccountRow: React.FC<NewAccountRowProps> = ({
  t,
  onCreateAccount,
  onApplyAdvocate,
}) => {
  const handleCreateAccount = () => {
    // TODO: connect auth
    if (onCreateAccount) {
      onCreateAccount();
    }
  };

  const handleApplyAdvocate = () => {
    // TODO: connect auth
    if (onApplyAdvocate) {
      onApplyAdvocate();
    }
  };

  return (
    <section className="new">
      <h2>{t.newh}</h2>
      <div className="row">
        <button
          type="button"
          className="ghost"
          onClick={handleCreateAccount}
        >
          {t.create}
        </button>
        <button
          type="button"
          className="ghost alt"
          onClick={handleApplyAdvocate}
        >
          {t.adv}
        </button>
      </div>
    </section>
  );
};
